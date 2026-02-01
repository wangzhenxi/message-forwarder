/**
 * 绿亚开发板推送消息（基于 docs/lvyatech）
 * - devId: 设备唯一 ID
 * - type: 消息 ID（如 100=WIFI 已联网）
 * - 其余为系统/用户参数
 */
export interface LvyatechMessage {
  devId: string;
  type: number;
  [key: string]: string | number;
}

/**
 * 用于模板展开的上下文：参数名 -> 字符串值（展开时统一为字符串）
 */
export type LvyatechContext = Record<string, string>;
