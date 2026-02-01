/**
 * 运行配置，优先从环境变量读取
 */
function env(key: string, defaultValue: string): string {
  const v = process.env[key];
  return v !== undefined && v !== '' ? v : defaultValue;
}

function envBool(key: string, defaultValue: boolean): boolean {
  const v = process.env[key];
  if (v === undefined || v === '') return defaultValue;
  return /^(1|true|yes)$/i.test(v.trim());
}

import path from 'path';

export const config = {
  port: Number(env('PORT', '3000')),
  /** 统一配置数据文件路径（push_*、lvyatech_* 等，按模块前缀） */
  dataConfigPath: env('DATA_CONFIG_PATH', path.join(__dirname, '..', 'data', 'config.json')),
  /** 用户仓储数据文件路径（相对 server 目录或绝对路径） */
  userDataFile: env('USER_DATA_FILE', path.join(__dirname, '..', 'data', 'users.json')),
  /** 推送消息按日存储目录（每日一个 YYYY-MM-DD.jsonl） */
  pushMessageDataDir: env('PUSH_MESSAGE_DATA_DIR', path.join(__dirname, '..', 'data', 'push-messages')),
  /** 推送消息默认保留天数（超过则删除旧文件），可在后台配置覆盖 */
  pushMessageRetainDaysDefault: Number(env('PUSH_MESSAGE_RETAIN_DAYS', '7')) || 7,
  /** 是否启用推送消息定时清理（默认关闭）；可通过 PUSH_MESSAGE_CLEANUP_ENABLED=true 开启 */
  pushMessageCleanupEnabled: envBool('PUSH_MESSAGE_CLEANUP_ENABLED', false),
  /** 推送消息清理任务执行间隔（毫秒），默认 24 小时；可通过 PUSH_MESSAGE_CLEANUP_INTERVAL_MS 覆盖 */
  pushMessageCleanupIntervalMs:
    Number(env('PUSH_MESSAGE_CLEANUP_INTERVAL_MS', String(24 * 60 * 60 * 1000))) || 24 * 60 * 60 * 1000,
};
