/**
 * 推送消息类型与分类映射（基于 docs/lvyatech/推送消息 目录结构）
 * 用于按分类存储与后台按分类查询
 */
export const PUSH_MESSAGE_CATEGORIES = [
  'device-status', // 设备状态消息：100,101,102,202,203,204,205,209,301
  'call',          // 通话消息：601-603,620-623,641,642
  'sms',           // 短信消息：501,502
  'other',         // 其它消息：998 等
] as const;

export type PushMessageCategory = (typeof PUSH_MESSAGE_CATEGORIES)[number];

const TYPE_TO_CATEGORY: Record<number, PushMessageCategory> = {
  // 设备状态消息
  100: 'device-status',
  101: 'device-status',
  102: 'device-status',
  202: 'device-status',
  203: 'device-status',
  204: 'device-status',
  205: 'device-status',
  209: 'device-status',
  301: 'device-status',
  // 短信消息
  501: 'sms',
  502: 'sms',
  // 通话消息
  601: 'call',
  602: 'call',
  603: 'call',
  620: 'call',
  621: 'call',
  622: 'call',
  623: 'call',
  641: 'call',
  642: 'call', // 通话远程按键
  // 其它
  998: 'other',
};

/** 根据消息 type 返回分类；未知 type 归为 other */
export function typeToCategory(type: number): PushMessageCategory {
  return TYPE_TO_CATEGORY[type] ?? 'other';
}
