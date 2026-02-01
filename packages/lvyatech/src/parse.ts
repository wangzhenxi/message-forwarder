import type { LvyatechMessage } from './types';

/** TCP 报文常见结尾符（文档：TCP 接口收到 JSON 后带 \x11\x12） */
const TCP_TAIL = Buffer.from([0x11, 0x12]);

function toNumber(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function toString(v: unknown): string {
  if (v == null) return '';
  return String(v);
}

/**
 * 从键值对构造标准消息（统一 type 为数字、devId 为字符串）
 */
export function toMessage(raw: Record<string, unknown>): LvyatechMessage {
  const msg: LvyatechMessage = {
    devId: toString(raw.devId),
    type: toNumber(raw.type),
  };
  for (const [k, v] of Object.entries(raw)) {
    if (k === 'devId' || k === 'type') continue;
    if (v !== undefined && v !== null) {
      msg[k] = typeof v === 'number' ? v : toString(v);
    }
  }
  return msg;
}

/**
 * 解析 HTTP Form 表单体（application/x-www-form-urlencoded）
 * 文档：开发板模拟 FORM 提交，如 devId、type、ip、ssid、dbm
 */
export function parseFormBody(body: Record<string, string | undefined>): LvyatechMessage {
  const raw: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (v !== undefined && v !== '') raw[k] = v;
  }
  return toMessage(raw);
}

/**
 * 解析 HTTP JSON 体（application/json）
 * 文档：request 流中为完整 JSON，如 { devId, type, ip, ssid, dbm }
 */
export function parseJsonBody(body: unknown): LvyatechMessage {
  if (body !== null && typeof body === 'object' && !Array.isArray(body)) {
    return toMessage(body as Record<string, unknown>);
  }
  throw new Error('lvyatech: 无效的 JSON 消息体');
}

/**
 * 解析 TCP 收到的报文：JSON 可选带结尾符 \x11\x12
 * 文档：TCP Server 端收到格式如 {"devId":"...","type":100,...}\x11\x12
 */
export function parseTcpPayload(buffer: Buffer): LvyatechMessage {
  let data = buffer;
  if (buffer.length >= TCP_TAIL.length && buffer.subarray(-TCP_TAIL.length).equals(TCP_TAIL)) {
    data = buffer.subarray(0, buffer.length - TCP_TAIL.length);
  }
  const raw = JSON.parse(data.toString('utf8')) as Record<string, unknown>;
  return toMessage(raw);
}
