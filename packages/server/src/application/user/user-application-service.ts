import type { IUserRepository } from '../../domain/user/repository';
import type {
  LoginRequestDto,
  LoginResponseDto,
  UserDto,
  UserListResultDto,
} from './dto';
import type { UserEntity } from '../../domain/user/entity';
import type { TokenStore } from '../../infrastructure/auth/token-store';
import { randomBytes } from 'crypto';

/**
 * 用户应用服务：编排领域对象完成用例
 */
export class UserApplicationService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenStore: TokenStore
  ) {}

  async login(dto: LoginRequestDto): Promise<LoginResponseDto | null> {
    const user = await this.userRepository.findByUsername(dto.username);
    if (!user) return null;
    // 简易演示：明文比对（生产环境应使用 bcrypt 等）
    if (user.passwordHash !== dto.password) return null;
    const token = randomBytes(24).toString('hex');
    this.tokenStore.set(token, user.id);
    return {
      token,
      user: this.toUserDto(user),
    };
  }

  async getCurrentUser(userId: string): Promise<UserDto | null> {
    const user = await this.userRepository.findById(userId);
    return user ? this.toUserDto(user) : null;
  }

  async updateNickname(userId: string, nickname: string): Promise<UserDto | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;
    const updated = { ...user, nickname: nickname.trim() || user.nickname };
    await this.userRepository.save(updated);
    return this.toUserDto(updated);
  }

  async list(): Promise<UserListResultDto> {
    const users = await this.userRepository.findAll();
    return {
      list: users.map((u) => this.toUserDto(u)),
      total: users.length,
    };
  }

  private toUserDto(entity: UserEntity): UserDto {
    return {
      id: entity.id,
      username: entity.username,
      nickname: entity.nickname,
      role: entity.role,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
