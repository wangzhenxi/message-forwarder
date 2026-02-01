import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { IUserRepository } from '../../domain/user/repository';
import type { UserEntity } from '../../domain/user/entity';
import { createUser } from '../../domain/user/entity';
import { config } from '../../config';

/** 文件中存储的格式（createdAt 为 ISO 字符串） */
interface UserRow {
  id: string;
  username: string;
  passwordHash: string;
  nickname: string;
  role: 'admin' | 'user';
  createdAt: string;
}

function rowToEntity(row: UserRow): UserEntity {
  return createUser(
    row.id,
    row.username,
    row.passwordHash,
    row.nickname,
    row.role,
    new Date(row.createdAt)
  );
}

function entityToRow(entity: UserEntity): UserRow {
  return {
    id: entity.id,
    username: entity.username,
    passwordHash: entity.passwordHash,
    nickname: entity.nickname,
    role: entity.role,
    createdAt: entity.createdAt.toISOString(),
  };
}

/**
 * 用户仓储的本地文件实现：读写 JSON 文件，无默认用户
 */
export class FileUserRepository implements IUserRepository {
  private store = new Map<string, UserEntity>();
  private readonly filePath: string;

  constructor(filePath: string = config.userDataFile) {
    this.filePath = filePath;
    this.load();
  }

  private load(): void {
    if (existsSync(this.filePath)) {
      try {
        const content = readFileSync(this.filePath, 'utf8');
        const rows: UserRow[] = JSON.parse(content);
        if (Array.isArray(rows)) {
          this.store.clear();
          rows.forEach((row) => {
            const entity = rowToEntity(row);
            this.store.set(entity.id, entity);
          });
          return;
        }
      } catch (e) {
        console.warn('读取用户数据文件失败，使用空数据:', (e as Error).message);
      }
    }
    // 文件不存在或解析失败：保持空并写入空数组
    this.store.clear();
    this.persist();
  }

  private persist(): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const rows: UserRow[] = Array.from(this.store.values()).map(entityToRow);
    writeFileSync(this.filePath, JSON.stringify(rows, null, 2), 'utf8');
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

  async save(user: UserEntity): Promise<void> {
    this.store.set(user.id, user);
    this.persist();
  }
}
