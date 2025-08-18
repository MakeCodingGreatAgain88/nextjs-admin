import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/utils/jwt'

/**
 * Access Token 验证中间件
 * 验证 access token 的有效性，如果过期返回 40001，成功则继续执行
 */
export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
    // 检查是否是 token 刷新请求
    const isTokenRefresh = request.headers.get('x-token-refresh') === 'true'
    
    // 如果是 token 刷新请求，跳过正常的 token 验证
    if (isTokenRefresh) {
        console.log('检测到 token 刷新请求，跳过正常验证')
        return null
    }
    
    const Authorization = request.headers.get('Authorization')
    
    if (!Authorization) {
        return NextResponse.json({
            code: 401,
            data: null,
            message: '缺少访问令牌，请先登录'
        })
    }

    const accessToken = Authorization.replace('Bearer ', '')
    if (!accessToken) {
        return NextResponse.json({
            code: 401,
            data: null,
            message: '访问令牌格式错误'
        })
    }

    try {
        // 使用 verifyJWT 验证 token
        const payload = await verifyJWT(accessToken)

        if (payload) {
            // 验证成功，继续执行
            return null
        }
        else {
            // verifyJWT 返回 null，表示 token 无效
            return NextResponse.json({
                code: 401,
                data: null,
                message: '访问令牌无效'
            })
        }
    }
    catch (error: any) {
        // 检查是否是过期错误
        const errorMessage = error.message || ''
        if (errorMessage.includes('exp') ||
            errorMessage.includes('expired') ||
            errorMessage.includes('timestamp check failed')) {
            // Token 过期，返回 40001
            return NextResponse.json({
                code: 40001,
                data: null,
                message: '访问令牌已过期，请刷新'
            })
        }

        // 其他验证失败，返回 401
        return NextResponse.json({
            code: 401,
            data: null,
            message: '访问令牌验证失败'
        })
    }
}
