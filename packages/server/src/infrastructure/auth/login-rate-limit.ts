/**
 * 登录失败限流：按用户名记录失败次数
 * - 失败 3 次：锁定 1 分钟
 * - 失败 10 次：锁定 30 分钟
 */
const LOCK_1_MIN_AFTER = 3;
const LOCK_30_MIN_AFTER = 10;
const LOCK_1_MIN_MS = 60 * 1000;
const LOCK_30_MIN_MS = 30 * 60 * 1000;

interface Entry {
  count: number;
  lockUntil: number;
}

export class LoginRateLimit {
  private readonly store = new Map<string, Entry>();

  /**
   * 检查是否在锁定期内，若是返回错误文案，否则返回 null 表示可尝试登录
   */
  checkLock(username: string): string | null {
    const entry = this.store.get(username);
    if (!entry || entry.lockUntil <= Date.now()) return null;
    const minutes = Math.ceil((entry.lockUntil - Date.now()) / 60000);
    return `密码错误次数过多，请 ${minutes} 分钟后再试`;
  }

  /** 记录一次登录失败 */
  recordFailure(username: string): void {
    const now = Date.now();
    const entry = this.store.get(username) ?? { count: 0, lockUntil: 0 };
    entry.count += 1;
    if (entry.count >= LOCK_30_MIN_AFTER) {
      entry.lockUntil = now + LOCK_30_MIN_MS;
    } else if (entry.count >= LOCK_1_MIN_AFTER) {
      entry.lockUntil = now + LOCK_1_MIN_MS;
    }
    this.store.set(username, entry);
  }

  /** 登录成功，清除该用户的限流记录 */
  recordSuccess(username: string): void {
    this.store.delete(username);
  }
}
