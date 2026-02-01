/**
 * 用户领域实体
 */
export interface UserEntity {
  id: string;
  username: string;
  passwordHash: string;
  nickname: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export function createUser(
  id: string,
  username: string,
  passwordHash: string,
  nickname: string,
  role: UserEntity['role'] = 'user',
  createdAt = new Date()
): UserEntity {
  return { id, username, passwordHash, nickname, role, createdAt };
}
