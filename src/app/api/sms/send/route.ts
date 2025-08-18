import { NextRequest } from 'next/server'
import { MiddlewareExecutor } from '@/lib/middleware/executor'
import { envMiddleware } from '@/lib/middleware/common'
import { sendSmsValidationMiddleware, rateLimitMiddleware } from '@/lib/middleware/sms'
import { userExistenceCheckMiddleware } from '@/lib/middleware/user'
import { smsController } from '@/lib/controller/sms'
import { validateTurnstileToken } from "@/lib/middleware/turnstile"

/**
 * 🚨 安全提醒 🚨
 *
 * 当前API在生产环境中会直接返回验证码，这存在安全风险！
 *
 * 生产环境部署前请执行以下操作：
 * 1. 将 data: smsCode 改为 data: undefined 或删除
 * 2. 或者添加环境变量控制：data: process.env.NODE_ENV === 'production' ? undefined : smsCode
 * 3. 确保验证码只通过短信服务商发送，不在API响应中暴露
 *
 * 当前状态：⚠️ 验证码直接暴露在API响应中
 */

export const runtime = 'edge'

export async function POST(request: NextRequest) {
    // 创建中间件执行器
    const executor = new MiddlewareExecutor()
        .add(envMiddleware)           // 环境变量中间件
        .add(validateTurnstileToken)  // Turnstile token 验证中间件
        .add(sendSmsValidationMiddleware) // 发送验证码参数验证中间件
        .add(userExistenceCheckMiddleware) // 手机号注册状态检查中间件
        .add(rateLimitMiddleware)    // 频率限制中间件

    // 执行中间件链和控制器
    return await executor.execute(request, smsController)
}
