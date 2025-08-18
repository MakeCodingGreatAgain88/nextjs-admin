import { NextRequest } from 'next/server';
import { MiddlewareExecutor } from '@/lib/middleware/executor';
import { envMiddleware } from '@/lib/middleware/common';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { getStatsOverviewController } from '@/lib/controller/stats';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // 创建中间件执行器
  const executor = new MiddlewareExecutor()
    .add(envMiddleware) // 环境变量中间件
    .add(authMiddleware) // Access Token 验证中间件

  // 执行中间件链和控制器
  return await executor.execute(request, getStatsOverviewController);
}
