import { getKV } from '@/lib/database';
import { to } from 'await-to-js';

/**
 * 存储短信验证码
 */
export async function storeSmsCode(phone: string, code: string, expiresIn: number = 300): Promise<void> {
  const kv = getKV();
  
  const [error] = await to(
    kv.put(`sms:${phone}`, JSON.stringify({ 
      code, 
      expiresAt: Date.now() + expiresIn * 1000 
    }), { expirationTtl: expiresIn })
  );
  
  if (error) {
    console.error('Store SMS code error:', error);
    throw new Error(`存储短信验证码失败: ${error.message}`);
  }
}

/**
 * 获取短信验证码
 */
export async function getSmsCode(phone: string): Promise<{ code: string; expiresAt: number } | null> {
  const kv = getKV();
  
  const [error, result] = await to(kv.get(`sms:${phone}`));
  
  if (error) {
    console.error('Get SMS code error:', error);
    throw new Error(`获取短信验证码失败: ${error.message}`);
  }
  
  if (!result) return null;
  
  try {
    const data = JSON.parse(result as string);
    if (data.expiresAt < Date.now()) {
      // 验证码已过期，删除
      await kv.delete(`sms:${phone}`);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Parse SMS code error:', error);
    return null;
  }
}

/**
 * 删除短信验证码
 */
export async function deleteSmsCode(phone: string): Promise<void> {
  const kv = getKV();
  
  const [error] = await to(kv.delete(`sms:${phone}`));
  
  if (error) {
    console.error('Delete SMS code error:', error);
    throw new Error(`删除短信验证码失败: ${error.message}`);
  }
}

/**
 * 获取IP限制
 */
export async function getIpLimit(ip: string): Promise<{ count: number; expiresAt: number } | null> {
  const kv = getKV();
  
  const [error, result] = await to(kv.get(`ip_limit:${ip}`));
  
  if (error) {
    console.error('Get IP limit error:', error);
    throw new Error(`获取IP限制失败: ${error.message}`);
  }
  
  if (!result) return null;
  
  try {
    const data = JSON.parse(result as string);
    if (data.expiresAt < Date.now()) {
      // 限制已过期，删除
      await kv.delete(`ip_limit:${ip}`);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Parse IP limit error:', error);
    return null;
  }
}

/**
 * 更新IP限制
 */
export async function updateIpLimit(ip: string, count: number, expiresIn: number = 86400): Promise<void> {
  const kv = getKV();
  
  const [error] = await to(
    kv.put(`ip_limit:${ip}`, JSON.stringify({ 
      count, 
      expiresAt: Date.now() + expiresIn * 1000 
    }), { expirationTtl: expiresIn })
  );
  
  if (error) {
    console.error('Update IP limit error:', error);
    throw new Error(`更新IP限制失败: ${error.message}`);
  }
}

/**
 * 获取手机号限制
 */
export async function getPhoneLimit(phone: string): Promise<{ count: number; lastSent: number; expiresAt: number } | null> {
  const kv = getKV();
  
  const [error, result] = await to(kv.get(`phone_limit:${phone}`));
  
  if (error) {
    console.error('Get phone limit error:', error);
    throw new Error(`获取手机号限制失败: ${error.message}`);
  }
  
  if (!result) return null;
  
  try {
    const data = JSON.parse(result as string);
    if (data.expiresAt < Date.now()) {
      // 限制已过期，删除
      await kv.delete(`phone_limit:${phone}`);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Parse phone limit error:', error);
    return null;
  }
}

/**
 * 更新手机号限制
 */
export async function updatePhoneLimit(phone: string, count: number, lastSent: number, expiresIn: number = 86400): Promise<void> {
  const kv = getKV();
  
  const [error] = await to(
    kv.put(`phone_limit:${phone}`, JSON.stringify({ 
      count, 
      lastSent, 
      expiresAt: Date.now() + expiresIn * 1000 
    }), { expirationTtl: expiresIn })
  );
  
  if (error) {
    console.error('Update phone limit error:', error);
    throw new Error(`更新手机号限制失败: ${error.message}`);
  }
}
