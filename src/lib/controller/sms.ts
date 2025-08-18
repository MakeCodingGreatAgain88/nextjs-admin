// 第三方库导入
import { NextResponse, NextRequest } from 'next/server'
import { to } from 'await-to-js'

// 内部模块导入
import * as smsService from '@/lib/service/sms'

export async function smsController(request: NextRequest): Promise<NextResponse> {
    const clonedRequest = request.clone()
    const body = await clonedRequest.json() as any
    const {phone} = body || {}
    const clientIp = request.headers.get('CF-Connecting-IP') || ''

    // 调用短信业务服务
    const [ serviceError, serviceResult ] = await to(
        smsService.sendSmsCode({phone, clientIp})
    )

    // TODO: 🚨 生产环境部署前请注释掉验证码返回，避免安全风险
    // TODO: 将下面的 data: serviceResult 改为 data: undefined
    
    // 使用三元表达式简化返回结构
    return NextResponse.json({
        code: serviceError ? 500 : 200,
        data: serviceError ? null : serviceResult,
        message: serviceError ? (serviceError.message || '短信发送失败') : '验证码发送成功'
    })
}
