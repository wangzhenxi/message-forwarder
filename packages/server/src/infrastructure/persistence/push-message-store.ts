import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  statSync,
} from 'fs';
import { join } from 'path';
import type { LvyatechMessage } from '@message-forwarder/lvyatech';
import { typeToCategory, PUSH_MESSAGE_CATEGORIES } from '@message-forwarder/lvyatech';
import { config } from '../../config';

/** 存储的一条消息（含接收时间与分类） */
export interface StoredPushMessage extends LvyatechMessage {
  receivedAt: string;
  category: string;
}

/** 查询条件 */
export interface PushMessageQuery {
  category?: string; // device-status | call | sms | other
  devId?: string;
  type?: number;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  limit?: number;
}

const SETTINGS_FILE = 'settings.json';

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function todayFileName(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}.jsonl`;
}

function parseDateFromFileName(name: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})\.jsonl$/.exec(name);
  if (!match) return null;
  const d = new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
  return isNaN(d.getTime()) ? null : d;
}

function isCategoryDir(baseDir: string, name: string): boolean {
  if (name === SETTINGS_FILE) return false;
  const full = join(baseDir, name);
  try {
    return statSync(full).isDirectory() && (PUSH_MESSAGE_CATEGORIES as readonly string[]).includes(name);
  } catch {
    return false;
  }
}

export class PushMessageStore {
  private readonly dataDir: string;
  private readonly settingsPath: string;

  constructor(dataDir: string = config.pushMessageDataDir) {
    this.dataDir = dataDir;
    this.settingsPath = join(dataDir, SETTINGS_FILE);
    ensureDir(dataDir);
  }

  /** 按分类追加一条消息到当日文件 */
  save(msg: LvyatechMessage): void {
    const category = typeToCategory(msg.type);
    const categoryDir = join(this.dataDir, category);
    ensureDir(categoryDir);
    const file = join(categoryDir, todayFileName());
    const line = JSON.stringify({
      ...msg,
      receivedAt: new Date().toISOString(),
      category,
    } as StoredPushMessage) + '\n';
    writeFileSync(file, line, { flag: 'a' });
  }

  /** 读取配置：保留天数 */
  getRetainDays(): number {
    try {
      if (existsSync(this.settingsPath)) {
        const raw = readFileSync(this.settingsPath, 'utf8');
        const o = JSON.parse(raw) as { retainDays?: number };
        if (typeof o.retainDays === 'number' && o.retainDays > 0) {
          return o.retainDays;
        }
      }
    } catch {
      // ignore
    }
    return config.pushMessageRetainDaysDefault;
  }

  /** 设置保留天数 */
  setRetainDays(days: number): void {
    ensureDir(this.dataDir);
    if (days < 1) days = 1;
    writeFileSync(this.settingsPath, JSON.stringify({ retainDays: days }, null, 2), 'utf8');
  }

  /** 删除早于指定天数的按日数据文件（遍历各分类目录） */
  deleteFilesOlderThan(days: number): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    let deleted = 0;
    if (!existsSync(this.dataDir)) return 0;
    const entries = readdirSync(this.dataDir);
    for (const name of entries) {
      if (!isCategoryDir(this.dataDir, name)) continue;
      const categoryDir = join(this.dataDir, name);
      const files = readdirSync(categoryDir).filter((n) => n.endsWith('.jsonl'));
      for (const f of files) {
        const date = parseDateFromFileName(f);
        if (date && date < cutoff) {
          try {
            unlinkSync(join(categoryDir, f));
            deleted++;
          } catch {
            // ignore
          }
        }
      }
    }
    return deleted;
  }

  /** 执行一次清理：按当前配置的保留天数删除旧文件 */
  runCleanup(): number {
    return this.deleteFilesOlderThan(this.getRetainDays());
  }

  /** 按条件查询消息（支持按分类；按日期倒序，新消息在前） */
  findBy(query: PushMessageQuery): StoredPushMessage[] {
    const { category, devId, type, from, to, limit = 100 } = query;
    if (!existsSync(this.dataDir)) return [];
    const categoriesToRead = category && PUSH_MESSAGE_CATEGORIES.includes(category as typeof PUSH_MESSAGE_CATEGORIES[number])
      ? [category]
      : PUSH_MESSAGE_CATEGORIES.slice();
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    const result: StoredPushMessage[] = [];
    for (const cat of categoriesToRead) {
      const categoryDir = join(this.dataDir, cat);
      if (!existsSync(categoryDir)) continue;
      const files = readdirSync(categoryDir)
        .filter((n) => n.endsWith('.jsonl'))
        .sort()
        .reverse();
      for (const name of files) {
        const fileDate = parseDateFromFileName(name);
        if (!fileDate) continue;
        if (fromDate && fileDate < fromDate) continue;
        if (toDate && fileDate > toDate) continue;
        const filePath = join(categoryDir, name);
        try {
          const content = readFileSync(filePath, 'utf8');
          const lines = content.split('\n').filter(Boolean);
          for (let i = lines.length - 1; i >= 0; i--) {
            const row = JSON.parse(lines[i]) as StoredPushMessage;
            if (devId != null && row.devId !== devId) continue;
            if (type != null && row.type !== type) continue;
            result.push(row);
            if (result.length >= limit) return result;
          }
        } catch {
          // skip corrupt file
        }
      }
    }
    return result;
  }
}
