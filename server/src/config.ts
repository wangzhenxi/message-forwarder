/**
 * 运行配置，优先从环境变量读取
 */
function env(key: string, defaultValue: string): string {
  const v = process.env[key];
  return v !== undefined && v !== '' ? v : defaultValue;
}

import path from 'path';

export const config = {
  /** 外部接口基础地址（见 docs/external-api.md） */
  externalApiBaseUrl: env('API_BASE_URL', ''),
  port: Number(env('PORT', '3000')),
  /** 用户数据文件路径（相对 server 目录或绝对路径） */
  userDataFile: env('USER_DATA_FILE', path.join(__dirname, '..', 'data', 'users.json')),
};
