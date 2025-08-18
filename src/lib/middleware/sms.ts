import { NextRequest, NextResponse } from 'next/server'
import { to } from 'await-to-js'
import { sendSmsSchema } from '@/lib/schemas/user'
import * as smsService from '@/lib/service/sms'

/**
 * 发送验证码参数验证中间件
 */
export async function sendSmsValidationMiddleware(request: NextRequest): Promise<NextResponse | null> {
    try {
        const clonedRequest = request.clone()
        const body = await clonedRequest.json() as any

        const [parseError, validatedData] = await to(sendSmsSchema.parseAsync(body))
        
        if (parseError) {
            console.error('Send SMS validation error:', parseError)
            const error = JSON.parse(parseError.message) as any
            return NextResponse.json({
                code: 400,
                data: null,
                message: error[0].message||'参数验证失败'
            })
        }

        // 返回 null 表示继续执行下一个中间件
        return null
    }
    catch (error) {
        console.error('Send SMS validation middleware error:', error)
        return NextResponse.json({
            code: 400,
            data: null,
            message: '请求参数解析失败'
        })
    }
}

/**
 * 频率限制中间件
 */
export async function rateLimitMiddleware(request: NextRequest): Promise<NextResponse | null> {
    try {
        console.log('Rate limit middleware started')

        // 使用 request.clone() 来避免 "Body has already been used" 错误
        const clonedRequest = request.clone()
        const body = await clonedRequest.json() as any
        const {phone} = body || {}
        console.log('Phone number from cloned request:', phone)

        // 获取客户端IP，支持多种头部
        const clientIp = request.headers.get('CF-Connecting-IP') || ''
        console.log('Client IP:', clientIp)

        // IP限制检查（单个IP每天最多10次）
        console.log('Checking IP limit for:', clientIp)
        const [ ipLimitError, ipLimit ] = await to(smsService.getIpLimit(clientIp))
        if (ipLimitError) {
            console.error('IP limit check error:', ipLimitError)
            return NextResponse.json({
                code: 500,
                data: null,
                message: '频率限制检查失败'
            })
        }
        console.log('IP limit check result:', ipLimit)

        if (ipLimit && ipLimit.count >= 10) {
            return NextResponse.json({
                code: 429,
                data: null,
                message: '今日发送次数已达上限，请明天再试'
            })
        }

        // 手机号限制检查（单个手机号每天最多4次）
        const [ phoneLimitError, phoneLimit ] = await to(smsService.getPhoneLimit(phone))
        if (phoneLimitError) {
            console.error('Phone limit check error:', phoneLimitError)
            return NextResponse.json({
                code: 500,
                data: null,
                message: '频率限制检查失败'
            })
        }

        if (phoneLimit && phoneLimit.count >= 4) {
            return NextResponse.json({
                code: 429,
                data: null,
                message: '该手机号今日发送次数已达上限，请明天再试'
            })
        }

        // 发送间隔检查（间隔60秒）
        const now = Date.now()
        if (phoneLimit && (now - phoneLimit.lastSent) < 60000) {
            const remainingTime = Math.ceil((60000 - (now - phoneLimit.lastSent)) / 1000)
            return NextResponse.json({
                code: 429,
                data: null,
                message: `发送过于频繁，请${ remainingTime }秒后再试`
            })
        }

        // 返回 null 表示继续执行下一个中间件
        return null
    }
    catch (error) {
        console.error('Rate limit middleware error:', error)
        return NextResponse.json({
            code: 500,
            data: null,
            message: '频率限制检查失败'
        })
    }
}


