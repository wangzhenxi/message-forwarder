import type { LvyatechContext, LvyatechMessage } from './types';

/**
 * 将消息转为模板展开用的上下文（键值统一为字符串）
 */
export function messageToContext(msg: LvyatechMessage): LvyatechContext {
  const ctx: LvyatechContext = {};
  for (const [k, v] of Object.entries(msg)) {
    ctx[k] = String(v);
  }
  // 文档：隐含系统参数，未在界面列出但可引用
  if (ctx.LN === undefined) ctx.LN = '\n';
  if (ctx.LR === undefined) ctx.LR = '\r';
  return ctx;
}

/**
 * 解析并替换单处引用
 * - {{param}} 系统参数
 * - {{{param}}} 用户参数（与文档一致：两层系统，三层用户；此处统一从 context 取）
 */
function replaceOne(template: string, ctx: LvyatechContext): string {
  // 三层大括号：{{{name}}}（文档：用户参数名可含字母、数字、#）
  let out = template.replace(/\{\{\{([\w#]+)\}\}\}/g, (_, name: string) => {
    return ctx[name] ?? '';
  });
  // 两层大括号：{{name}}
  out = out.replace(/\{\{([\w#]+)\}\}/g, (_, name: string) => {
    return ctx[name] ?? '';
  });
  return out;
}

/**
 * 对模板字符串进行参数引用替换（支持 {{系统参数}} 与 {{{用户参数}}}）
 * 文档：自定义接口消息、用户参数值等位置均可使用引用；此处不实现附加函数（如 $toUpper）
 */
export function expandTemplate(template: string, context: LvyatechContext): string {
  let prev = template;
  let next = replaceOne(prev, context);
  // 用户参数可能引用用户参数，多轮直到不变
  const maxRounds = 10;
  let round = 0;
  while (next !== prev && round < maxRounds) {
    prev = next;
    next = replaceOne(prev, context);
    round += 1;
  }
  return next;
}
