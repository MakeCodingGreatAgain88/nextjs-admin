import { getD1, getKV } from '@/lib/database';
import * as schema from '@/lib/database/schema';
import { to } from 'await-to-js';

/**
 * 获取总用户数
 */
export async function getTotalUsers(): Promise<number> {
    const db = getD1();
    
    try {
        const [error, result] = await to(
            db.select().from(schema.users)
        );
        
        if (error) {
            throw new Error(`查询用户总数失败: ${error.message}`);
        }
        
        return result.length;
    } catch (error: any) {
        console.error('StatsDB getTotalUsers error:', error);
        throw new Error(`获取总用户数失败: ${error.message}`);
    }
}

/**
 * 获取活跃用户数（KV 中的 refresh token 数量）
 */
export async function getActiveUsers(): Promise<number> {
    const kv = getKV();
    
    try {
        // 获取所有 refresh token 的数量
        // 这里我们通过列出所有以 'refresh_token:' 开头的 key 来统计
        const [error, keys] = await to(
            kv.list({ prefix: 'refresh_token:' })
        );
        
        if (error) {
            throw new Error(`查询活跃用户数失败: ${error.message}`);
        }
        
        // 返回 key 的数量，即活跃用户数
        return (keys as any).keys?.length || 0;
    } catch (error: any) {
        console.error('StatsDB getActiveUsers error:', error);
        throw new Error(`获取活跃用户数失败: ${error.message}`);
    }
}
