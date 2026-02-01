import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { config } from '../../config';

/** 统一配置项（按模块前缀），与 data/config.json 对应 */
export interface DataConfig {
  /** 推送消息保留天数 */
  push_retainDays?: number;
  /** 绿芽设备地址 */
  lvyatech_deviceUrl?: string;
  /** 绿芽设备 token */
  lvyatech_token?: string;
}

const defaultConfig: DataConfig = {
  push_retainDays: 7,
  lvyatech_deviceUrl: '',
  lvyatech_token: '',
};

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/** 从旧路径迁移到 merged（仅当当前为默认值时用旧值覆盖，并写回 config.json） */
function migrateFromLegacy(dataDir: string, merged: DataConfig, configPath: string): void {
  let updated = false;
  const pushSettingsPath = join(dataDir, 'push-messages', 'settings.json');
  if (existsSync(pushSettingsPath) && merged.push_retainDays === defaultConfig.push_retainDays) {
    try {
      const o = JSON.parse(readFileSync(pushSettingsPath, 'utf8')) as { retainDays?: number };
      if (typeof o.retainDays === 'number' && o.retainDays > 0) {
        merged.push_retainDays = o.retainDays;
        updated = true;
      }
    } catch {
      // ignore
    }
  }
  const lvyatechPath = join(dataDir, 'lvyatech', 'control.json');
  if (existsSync(lvyatechPath)) {
    try {
      const o = JSON.parse(readFileSync(lvyatechPath, 'utf8')) as { deviceUrl?: string; token?: string };
      if (typeof o.deviceUrl === 'string' && o.deviceUrl.trim() && merged.lvyatech_deviceUrl === '') {
        merged.lvyatech_deviceUrl = o.deviceUrl.trim();
        updated = true;
      }
      if (typeof o.token === 'string' && merged.lvyatech_token === '') {
        merged.lvyatech_token = o.token.trim();
        updated = true;
      }
    } catch {
      // ignore
    }
  }
  if (updated) {
    ensureDir(dataDir);
    writeFileSync(configPath, JSON.stringify(merged, null, 2), 'utf8');
  }
}

/** 读取 data/config.json，缺失键用默认值；若文件不存在则从旧路径迁移后写入 */
export function readDataConfig(): DataConfig {
  const configPath = config.dataConfigPath;
  const dataDir = dirname(configPath);
  let merged: DataConfig;
  try {
    if (existsSync(configPath)) {
      const raw = readFileSync(configPath, 'utf8');
      const o = JSON.parse(raw) as Record<string, unknown>;
      merged = { ...defaultConfig, ...o };
      migrateFromLegacy(dataDir, merged, configPath);
      return merged;
    }
  } catch {
    // ignore
  }
  merged = { ...defaultConfig };
  const pushSettingsPath = join(dataDir, 'push-messages', 'settings.json');
  if (existsSync(pushSettingsPath)) {
    try {
      const o = JSON.parse(readFileSync(pushSettingsPath, 'utf8')) as { retainDays?: number };
      if (typeof o.retainDays === 'number' && o.retainDays > 0) merged.push_retainDays = o.retainDays;
    } catch {
      // ignore
    }
  }
  const lvyatechPath = join(dataDir, 'lvyatech', 'control.json');
  if (existsSync(lvyatechPath)) {
    try {
      const o = JSON.parse(readFileSync(lvyatechPath, 'utf8')) as { deviceUrl?: string; token?: string };
      if (typeof o.deviceUrl === 'string') merged.lvyatech_deviceUrl = o.deviceUrl.trim();
      if (typeof o.token === 'string') merged.lvyatech_token = o.token.trim();
    } catch {
      // ignore
    }
  }
  ensureDir(dataDir);
  writeFileSync(configPath, JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}

/** 合并写入部分配置，保留其它键 */
export function writeDataConfig(partial: Partial<DataConfig>): void {
  const path = config.dataConfigPath;
  const current = readDataConfig();
  const next = { ...current, ...partial };
  ensureDir(dirname(path));
  writeFileSync(path, JSON.stringify(next, null, 2), 'utf8');
}
