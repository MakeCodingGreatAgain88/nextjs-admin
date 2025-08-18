import httpClient from '@/lib/http/client';
import USER_RPC from '@/lib/rpc/user';

/**
 * 用户注册接口
 */
export interface UserRegisterParams {
  phone: string;
  password: string;
  confirmPassword: string;
  smsCode: string;
}

/**
 * 用户注册
 */
export function register(params: UserRegisterParams, turnstileToken: string) {
  return httpClient.post(USER_RPC.register, params, {
    headers: {
      'cf-turnstile-response': turnstileToken,
    }
  });
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return httpClient.get(USER_RPC.info);
}

/**
 * 获取用户列表
 */
export function getUserList(params: { page: number; pageSize: number; phone?: string }) {
  const searchParams = new URLSearchParams();
  searchParams.append('page', params.page.toString());
  searchParams.append('pageSize', params.pageSize.toString());
  if (params.phone) {
    searchParams.append('phone', params.phone);
  }
  
  return httpClient.get(`${USER_RPC.list}?${searchParams.toString()}`);
}
