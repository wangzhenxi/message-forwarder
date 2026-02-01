import type { UserEntity } from './entity';

/**
 * 用户仓储接口（领域层定义，由基础设施层实现）
 */
export interface IUserRepository {
  findByUsername(username: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
}
