/**
 * 用户相关 DTO
 */
export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  username: string;
  nickname: string;
  role: string;
  createdAt: string;
}

export interface UserListQueryDto {
  page?: number;
  pageSize?: number;
}

export interface UserListResultDto {
  list: UserDto[];
  total: number;
}
