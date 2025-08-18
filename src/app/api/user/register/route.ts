import { NextRequest } from 'next/server';
import { MiddlewareExecutor } from '@/lib/middleware/executor';
import { envMiddleware } from '@/lib/middleware/common';
import { validateTurnstileToken } from '@/lib/middleware/turnstile';
import { userRegisterValidationMiddleware, smsCodeValidationMiddleware, userExistenceCheckMiddleware } from '@/lib/middleware/user';
import { userRegisterController } from '@/lib/controller/user';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  // 创建中间件执行器
  const executor = new MiddlewareExecutor()
    .add(envMiddleware)                    // 环境变量中间件
    .add(validateTurnstileToken)           // Turnstile token 验证中间件
    .add(userRegisterValidationMiddleware) // 用户注册参数验证中间件
    .add(smsCodeValidationMiddleware)      // 短信验证码验证中间件
    .add(userExistenceCheckMiddleware)     // 用户存在性检查中间件

  // 执行中间件链和控制器
  return await executor.execute(request, userRegisterController);
}
