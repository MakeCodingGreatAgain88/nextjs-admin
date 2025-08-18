import { getD1 } from '@/lib/database';
import { eq, like, sql } from 'drizzle-orm';
import * as schema from '@/lib/database/schema';
import { to } from 'await-to-js';

/**
 * 根据手机号查询用户
 */
export async function findByPhone(phone: string) {
  const db = getD1();
  
  const [error, result] = await to(
    db.select().from(schema.users).where(eq(schema.users.phone, phone)).limit(1)
  );
  
  if (error) {
    console.error('UserDB findByPhone error:', error);
    throw new Error(`查询用户失败: ${error.message}`);
  }
  
  return (result as any[])[0] || null;
}

/**
 * 创建用户
 */
export async function createUser(userData: { phone: string; password: string; permissionGrouping: string }) {
  const db = getD1();
  
  const [error, result] = await to(
    db.insert(schema.users).values({
      ...userData
      // createdAt 和 updatedAt 由数据库默认值自动设置
    }).returning({ id: schema.users.id })
  );
  
  if (error) {
    console.error('UserDB create error:', error);
    throw new Error(`创建用户失败: ${error.message}`);
  }
  
  return (result as any[])[0]?.id;
}

/**
 * 根据ID查询用户
 */
export async function findById(id: number) {
  const db = getD1();
  
  const [error, result] = await to(
    db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1)
  );
  
  if (error) {
    console.error('UserDB findById error:', error);
    throw new Error(`查询用户失败: ${error.message}`);
  }
  
  return (result as any[])[0] || null;
}

/**
 * 分页查询用户列表
 */
export async function findUsers(params: { page: number; pageSize: number; phone?: string }) {
  const db = getD1();
  const { page, pageSize, phone } = params;
  const offset = (page - 1) * pageSize;
  
  try {
    // 如果有手机号搜索条件，先进行搜索查询
    if (phone && phone.trim()) {
      const searchPattern = `%${phone.trim()}%`;
      
      // 获取搜索结果的总数
      const [countError, countResult] = await to(
        db.select().from(schema.users).where(like(schema.users.phone, searchPattern))
      );
      
      if (countError) {
        throw new Error(`获取用户总数失败: ${countError.message}`);
      }
      
      const total = countResult.length;
      
      // 分页查询搜索结果
      const [error, result] = await to(
        db.select()
          .from(schema.users)
          .where(like(schema.users.phone, searchPattern))
          .limit(pageSize)
          .offset(offset)
      );
      
      if (error) {
        throw new Error(`查询用户列表失败: ${error.message}`);
      }
      
      return {
        list: result,
        pagination: {
          current: page,
          pageSize,
          total
        }
      };
    } else {
      // 没有搜索条件，查询所有用户
      const [countError, countResult] = await to(
        db.select().from(schema.users)
      );
      
      if (countError) {
        throw new Error(`获取用户总数失败: ${countError.message}`);
      }
      
      const total = countResult.length;
      
      const [error, result] = await to(
        db.select()
          .from(schema.users)
          .limit(pageSize)
          .offset(offset)
      );
      
      if (error) {
        throw new Error(`查询用户列表失败: ${error.message}`);
      }
      
      return {
        list: result,
        pagination: {
          current: page,
          pageSize,
          total
        }
      };
    }
  } catch (error: any) {
    console.error('UserDB findUsers error:', error);
    throw new Error(`查询用户列表失败: ${error.message}`);
  }
}
