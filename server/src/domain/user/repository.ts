import type { UserEntity } from './entity';

/**
 * 用户仓储接口（领域层定义，由基础设施层实现）
 */
export interface IUserRepository {
  findByUsername(username: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  /** 保存用户（新增或覆盖），由实现方持久化 */
  save(user: UserEntity): Promise<void>;
}
