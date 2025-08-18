import { NextRequest } from 'next/server';
import { MiddlewareExecutor } from '@/lib/middleware/executor';
import { envMiddleware } from '@/lib/middleware/common';
import { validateTurnstileToken } from '@/lib/middleware/turnstile';
import { userLoginValidationMiddleware } from '@/lib/middleware/user'
import { userLoginController } from '@/lib/controller/user';

/**
 * 🚨 安全提醒 🚨
 *
 * 当前API已重构为分层架构，使用 zod 进行参数验证
 * 架构：route -> middleware -> controller -> service -> dbService
 */

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  // 创建中间件执行器
  const executor = new MiddlewareExecutor()
    .add(envMiddleware)                   // 环境变量中间件
    .add(validateTurnstileToken)          // Turnstile token 验证中间件
    .add(userLoginValidationMiddleware)   // 用户登录参数验证中间件

  // 执行中间件链和控制器
  return await executor.execute(request, userLoginController);
}
