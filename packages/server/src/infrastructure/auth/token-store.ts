/**
 * 内存 Token 存储：登录后生成的 token 在此校验，防止伪造
 */
export class TokenStore {
  private readonly store = new Map<string, { userId: string }>();

  set(token: string, userId: string): void {
    this.store.set(token, { userId });
  }

  get(token: string): string | null {
    const entry = this.store.get(token);
    return entry?.userId ?? null;
  }

  delete(token: string): boolean {
    return this.store.delete(token);
  }
}
