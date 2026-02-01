/**
 * 绿芽开发板推送协议解析与模板展开（基于 docs/lvyatech）
 * - 解析：HTTP Form / HTTP JSON / TCP 报文
 * - 消息结构：devId、type、以及系统/用户参数
 * - 模板：{{系统参数}}、{{{用户参数}}} 替换
 */
export type { LvyatechMessage, LvyatechContext } from './types';
export { parseFormBody, parseJsonBody, parseTcpPayload } from './parse';
export { messageToContext, expandTemplate } from './expand';
