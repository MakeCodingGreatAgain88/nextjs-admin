// 从Drizzle schema导入类型
export type { User, NewUser, Permission, NewPermission } from '@/lib/database/schema';

export interface UserPermission {
  page: string;
  buttons: {
    name: string;
    action: string;
  }[];
}

export interface ApiResponse<T = any> {
  code: number;
  data: T | null;
  message: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
  turnstileToken: string;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  confirmPassword: string;
  smsCode: string;
  turnstileToken: string;
}

export interface SendSmsRequest {
  phone: string;
}

export interface JwtPayload {
  userId: number;
  clientAccessIp: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenData {
  refreshToken: string;
  userId: number;
  expiresAt: number;
}

export interface SmsRateLimit {
  count: number;
  lastSent: number;
  expiresAt: number;
}

export interface IpRateLimit {
  count: number;
  expiresAt: number;
}
