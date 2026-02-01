import type { IUserRepository } from '../../domain/user/repository';
import type { UserEntity } from '../../domain/user/entity';
import { createUser } from '../../domain/user/entity';

/**
 * 用户仓储的内存实现（演示用）
 */
export class InMemoryUserRepository implements IUserRepository {
  private readonly store = new Map<string, UserEntity>();

  constructor() {
    const admin = createUser(
      '1',
      'admin',
      'admin123',
      '管理员',
      'admin',
      new Date('2024-01-01')
    );
    const user1 = createUser(
      '2',
      'user1',
      '123456',
      '用户一',
      'user',
      new Date('2024-01-02')
    );
    this.store.set(admin.id, admin);
    this.store.set(user1.id, user1);
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    for (const u of this.store.values()) {
      if (u.username === username) return u;
    }
    return null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<UserEntity[]> {
    return Array.from(this.store.values());
  }
}
