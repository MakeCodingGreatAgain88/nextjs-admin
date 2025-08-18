import { getD1 } from '@/lib/database';
import { eq, inArray } from 'drizzle-orm';
import * as schema from '@/lib/database/schema';
import { to } from 'await-to-js';

/**
 * 根据权限代码数组查询权限
 */
export async function findByCodes(codes: string[]) {
  if (!codes || codes.length === 0) {
    return [];
  }
  
  const db = getD1();
  
  const [error, result] = await to(
    db.select().from(schema.permissions).where(inArray(schema.permissions.code, codes))
  );
  
  if (error) {
    console.error('PermissionDB findByCodes error:', error);
    throw new Error(`查询权限失败: ${error.message}`);
  }
  
  return result as any[];
}
