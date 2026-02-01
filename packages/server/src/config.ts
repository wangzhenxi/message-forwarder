/**
 * 运行配置，优先从环境变量读取
 */
function env(key: string, defaultValue: string): string {
  const v = process.env[key];
  return v !== undefined && v !== '' ? v : defaultValue;
}

import path from 'path';

export const config = {
  port: Number(env('PORT', '3000')),
  /** 用户仓储数据文件路径（相对 server 目录或绝对路径） */
  userDataFile: env('USER_DATA_FILE', path.join(__dirname, '..', 'data', 'user', 'users.json')),
  /** 推送消息按日存储目录（每日一个 YYYY-MM-DD.jsonl） */
  pushMessageDataDir: env('PUSH_MESSAGE_DATA_DIR', path.join(__dirname, '..', 'data', 'push-messages')),
  /** 推送消息默认保留天数（超过则删除旧文件），可在后台配置覆盖 */
  pushMessageRetainDaysDefault: Number(env('PUSH_MESSAGE_RETAIN_DAYS', '7')) || 7,
};
