import { to } from "await-to-js"
import * as jose from 'jose';
import { JwtPayload } from '@/types';
import { getRequestContext } from '@cloudflare/next-on-pages';

/**
 * 生成JWT Token
 */
export async function generateJWT(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  const { env } = getRequestContext();
  const secret = new TextEncoder().encode(env.JWT_ADMIN_SECRET);
  
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(env.JWT_ADMIN_ISSUER)
    .setAudience(env.JWT_ADMIN_AUDIENCE)
    .setExpirationTime('1m') // 15分钟过期
    .sign(secret);
}

/**
 * 验证JWT Token
 */
export async function verifyJWT(token: string): Promise<JwtPayload | null> {
  const { env } = getRequestContext();
  const secret = new TextEncoder().encode(env.JWT_ADMIN_SECRET);
  
  const [error, result] = await to(jose.jwtVerify(token, secret, {
    issuer: env.JWT_ADMIN_ISSUER,
    audience: env.JWT_ADMIN_AUDIENCE,
  }));
  
  if (error) {
    throw error;
  }
  
  return result.payload as any;
}

/**
 * 生成Refresh Token
 */
export async function generateRefreshToken(userId: number): Promise<string> {
  const { env } = getRequestContext();
  const secret = new TextEncoder().encode(env.JWT_ADMIN_SECRET);
  
  return await new jose.SignJWT({ userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7天过期
    .sign(secret);
}

/**
 * 验证Refresh Token
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: number } | null> {
  const { env } = getRequestContext();
  const secret = new TextEncoder().encode(env.JWT_ADMIN_SECRET);
  
  const [error, result] = await to(jose.jwtVerify(token, secret));
  
  if (error) {
    throw error;
  }
  
  const { payload } = result;
  
  if (payload.type !== 'refresh') {
    return null;
  }
  
  return { userId: Number(payload.userId) };
}

/**
 * 检查JWT Token是否过期
 * @param token JWT token字符串
 * @returns 如果token过期返回true，否则返回false
 */
export async function isTokenExpired(token: string): Promise<boolean> {
  const { env } = getRequestContext();
  const secret = new TextEncoder().encode(env.JWT_ADMIN_SECRET);
  
  const [error, result] = await to(jose.jwtVerify(token, secret, {
    issuer: env.JWT_ADMIN_ISSUER,
    audience: env.JWT_ADMIN_AUDIENCE,
  }));
  
  if (error) {
    // 检查是否是明确的过期错误
    const errorMessage = error.message || '';
    if (errorMessage.includes('exp') || 
        errorMessage.includes('expired') ||
        errorMessage.includes('timestamp check failed')) {
      return true; // 明确的过期
    }
    // 其他验证失败，不是过期
    throw error;
  }
  
  const { payload } = result;
  
  // 检查是否有过期时间
  if (!payload.exp) {
    return true; // 没有过期时间，认为已过期
  }
  
  // 获取当前时间戳（秒）
  const currentTime = Math.floor(Date.now() / 1000);
  
  // 比较过期时间
  return payload.exp < currentTime;
}

/**
 * 获取JWT Token的剩余有效期（秒）
 * @param token JWT token字符串
 * @returns 剩余有效期（秒），如果已过期或无效返回0
 */
export async function getTokenRemainingTime(token: string): Promise<number> {
  const { env } = getRequestContext();
  const secret = new TextEncoder().encode(env.JWT_ADMIN_SECRET);
  
  const [error, result] = await to(jose.jwtVerify(token, secret, {
    issuer: env.JWT_ADMIN_ISSUER,
    audience: env.JWT_ADMIN_AUDIENCE,
  }));
  
  if (error) {
    // 检查是否是明确的过期错误
    const errorMessage = error.message || '';
    if (errorMessage.includes('exp') || 
        errorMessage.includes('expired') ||
        errorMessage.includes('timestamp check failed')) {
      return 0; // 明确的过期，返回0
    }
    // 其他验证失败，抛出错误
    throw error;
  }
  
  const { payload } = result;
  
  // 检查是否有过期时间
  if (!payload.exp) {
    return 0;
  }
  
  // 获取当前时间戳（秒）
  const currentTime = Math.floor(Date.now() / 1000);
  
  // 计算剩余时间
  const remainingTime = payload.exp - currentTime;
  
  return remainingTime > 0 ? remainingTime : 0;
}
