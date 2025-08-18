// 第三方库导入
import { NextRequest, NextResponse } from 'next/server'
import { to } from 'await-to-js'

// 内部模块导入
import { userRegisterSchema, userLoginSchema, sendSmsSchema } from '@/lib/schemas/user'
import * as userService from '@/lib/service/user'
import * as smsService from '@/lib/service/sms'

/**
 * 用户注册参数验证中间件
 */
export async function userRegisterValidationMiddleware(request: NextRequest): Promise<NextResponse | null> {
    try {
        const clonedRequest = request.clone()
        const body = await clonedRequest.json() as any

        const [ parseError, validatedData ] = await to(userRegisterSchema.parseAsync(body))

        if (parseError) {
            const error = JSON.parse(parseError.message) as any
            return NextResponse.json({
                code: 400,
                data: null,
                message: error[0].message || '参数验证失败'
            })
        }

        // 返回 null 表示继续执行下一个中间件
        return null
    }
    catch (error) {
        console.error('User register validation middleware error:', error)
        return NextResponse.json({
            code: 400,
            data: null,
            message: '请求参数解析失败'
        })
    }
}

/**
 * 用户登录参数验证中间件
 */
export async function userLoginValidationMiddleware(request: NextRequest): Promise<NextResponse | null> {
    try {
        const clonedRequest = request.clone()
        const body = await clonedRequest.json() as any

        const [ parseError, validatedData ] = await to(userLoginSchema.parseAsync(body))

        if (parseError) {
            console.log('User login validation error:', parseError)
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
        console.error('User login validation middleware error:', error)
        return NextResponse.json({
            code: 400,
            data: null,
            message: '请求参数解析失败'
        })
    }
}

/**
 * 发送验证码参数验证中间件
 */
export async function sendSmsValidationMiddleware(request: NextRequest): Promise<NextResponse | null> {
    try {
        const clonedRequest = request.clone()
        const body = await clonedRequest.json() as any

        const [ parseError, validatedData ] = await to(sendSmsSchema.parseAsync(body))

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
 * 短信验证码验证中间件
 */
export async function smsCodeValidationMiddleware(request: NextRequest): Promise<NextResponse | null> {
    try {
        const clonedRequest = request.clone()
        const body = await clonedRequest.json() as any
        const {phone, smsCode} = body || {}

        if (!phone || !smsCode) {
            return NextResponse.json({
                code: 400,
                data: null,
                message: '手机号和验证码不能为空'
            })
        }

        // 通过 service 层验证短信验证码
        const smsCodeData = await smsService.getSmsCode(phone)

        if (!smsCodeData || smsCodeData.code !== smsCode) {
            return NextResponse.json({
                code: 400,
                data: null,
                message: '验证码错误或已过期'
            })
        }

        // 返回 null 表示继续执行下一个中间件
        return null
    }
    catch (error) {
        console.error('SMS code validation middleware error:', error)
        return NextResponse.json({
            code: 400,
            data: null,
            message: '验证码验证失败'
        })
    }
}

/**
 * 用户存在性检查中间件
 */
export async function userExistenceCheckMiddleware(request: NextRequest): Promise<NextResponse | null> {
    try {
        const clonedRequest = request.clone()
        const body = await clonedRequest.json() as any
        const {phone} = body || {}

        if (!phone) {
            return NextResponse.json({
                code: 400,
                data: null,
                message: '手机号不能为空'
            })
        }

        // 通过 service 层检查用户是否存在
        const existingUser = await userService.getUserByPhone(phone)

        if (existingUser) {
            return NextResponse.json({
                code: 400,
                data: null,
                message: '该手机号已注册'
            })
        }

        // 返回 null 表示继续执行下一个中间件
        return null
    }
    catch (error) {
        console.error('User existence check middleware error:', error)
        return NextResponse.json({
            code: 500,
            data: null,
            message: '用户存在性检查失败'
        })
    }
}
