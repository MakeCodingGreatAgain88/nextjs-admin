/**
 * Token 管理工具
 */

/**
 * 获取访问令牌
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * 设置访问令牌
 */
export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', token);
}

/**
 * 清除所有令牌
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
}

/**
 * 清除用户信息
 */
export function clearUserInfo(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userInfo');
}

/**
 * 检查是否有访问令牌
 */
export function hasAccessToken(): boolean {
  return !!getAccessToken();
}


