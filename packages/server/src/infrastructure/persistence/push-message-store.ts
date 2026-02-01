import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
} from 'fs';
import { join } from 'path';
import type { LvyatechMessage } from '@message-forwarder/lvyatech';
import { config } from '../../config';

/** 存储的一条消息（含接收时间） */
export interface StoredPushMessage extends LvyatechMessage {
  receivedAt: string;
}

/** 查询条件 */
export interface PushMessageQuery {
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

export class PushMessageStore {
  private readonly dataDir: string;
  private readonly settingsPath: string;

  constructor(dataDir: string = config.pushMessageDataDir) {
    this.dataDir = dataDir;
    this.settingsPath = join(dataDir, SETTINGS_FILE);
    ensureDir(dataDir);
  }

  /** 追加一条消息到当日文件 */
  save(msg: LvyatechMessage): void {
    ensureDir(this.dataDir);
    const file = join(this.dataDir, todayFileName());
    const line = JSON.stringify({
      ...msg,
      receivedAt: new Date().toISOString(),
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

  /** 删除早于指定天数的数据文件 */
  deleteFilesOlderThan(days: number): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    let deleted = 0;
    if (!existsSync(this.dataDir)) return 0;
    const files = readdirSync(this.dataDir);
    for (const name of files) {
      if (name === SETTINGS_FILE) continue;
      const date = parseDateFromFileName(name);
      if (date && date < cutoff) {
        try {
          unlinkSync(join(this.dataDir, name));
          deleted++;
        } catch {
          // ignore
        }
      }
    }
    return deleted;
  }

  /** 执行一次清理：按当前配置的保留天数删除旧文件 */
  runCleanup(): number {
    return this.deleteFilesOlderThan(this.getRetainDays());
  }

  /** 按条件查询消息（按日期倒序，新消息在前） */
  findBy(query: PushMessageQuery): StoredPushMessage[] {
    const { devId, type, from, to, limit = 100 } = query;
    if (!existsSync(this.dataDir)) return [];
    const files = readdirSync(this.dataDir)
      .filter((n) => n.endsWith('.jsonl'))
      .sort()
      .reverse();
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    const result: StoredPushMessage[] = [];
    for (const name of files) {
      const fileDate = parseDateFromFileName(name);
      if (!fileDate) continue;
      if (fromDate && fileDate < fromDate) continue;
      if (toDate && fileDate > toDate) continue;
      const path = join(this.dataDir, name);
      try {
        const content = readFileSync(path, 'utf8');
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
    return result;
  }
}
