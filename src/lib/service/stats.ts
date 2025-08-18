import { to } from 'await-to-js';
import * as statsDB from '@/lib/db/stats';

/**
 * 获取统计概览业务服务
 */
export async function getStatsOverview() {
    try {
        // 获取总用户数
        const [totalUsersError, totalUsers] = await to(statsDB.getTotalUsers());
        if (totalUsersError) {
            throw new Error('获取总用户数失败: ' + totalUsersError.message);
        }

        // 获取长期登录用户数（KV 中的 refresh token 数量）
        const [activeUsersError, activeUsers] = await to(statsDB.getActiveUsers());
        if (activeUsersError) {
            throw new Error('获取活跃用户数失败: ' + activeUsersError.message);
        }

        return {
            totalUsers,
            activeUsers,
            timestamp: new Date().toISOString()
        };
    } catch (error: any) {
        throw new Error('获取统计信息失败: ' + error.message);
    }
}
