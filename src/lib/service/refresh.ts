import { NextRequest } from "next/server"
import { to } from 'await-to-js'
import { generateJWT, verifyJWT } from '@/utils/jwt'
import { getRefreshToken } from '@/lib/db/auth'

/**
 * 刷新访问令牌
 */
export async function refreshAccessToken(request: NextRequest): Promise<string> {
    const Authorization = request.headers.get('Authorization')
    if (!Authorization) {
        throw new Error('Authorization 为必填项')
    }

    const accessToken = Authorization.replace('Bearer ', '')
    if (!accessToken) {
        throw new Error('Access token 为必填项')
    }

    // 1. 解析accessToken中userid（即使过期也要尝试解析，获取用户ID）
    const [verifyError, payload] = await to(verifyJWT(accessToken))
    if (verifyError) {
        // 检查是否是过期错误
        const errorMessage = verifyError.message || ''
        if (errorMessage.includes('exp') || 
            errorMessage.includes('expired') ||
            errorMessage.includes('timestamp check failed')) {
            // Token 过期，但我们仍然需要获取用户ID来刷新
            // 这里我们需要从过期的 token 中提取用户信息
            // 由于 jose 库在过期时会抛出错误，我们需要手动解析
            try {
                // 手动解析 JWT 获取 payload（不验证过期时间）
                const tokenParts = accessToken.split('.')
                if (tokenParts.length === 3) {
                    const payloadBase64 = tokenParts[1]
                    const payload = JSON.parse(atob(payloadBase64))
                    
                    // 2. 查询KV中refreshToken是否过期
                    const [refreshError, refreshTokenData] = await to(getRefreshToken(payload.userId))
                    if (refreshError) {
                        throw new Error('获取 refreshToken 失败: ' + refreshError.message)
                    }
                    if (!refreshTokenData) {
                        throw new Error('Refresh token 已经过期，请重新登录')
                    }

                    // 3. 生成新的accessToken
                    const clientIp = request.headers.get('CF-Connecting-IP') || ''
                    const [generateError, newAccessToken] = await to(generateJWT({
                        userId: payload.userId,
                        clientAccessIp: clientIp
                    }))
                    if (generateError) {
                        throw new Error('刷新access token失败: ' + generateError.message)
                    }

                    return newAccessToken
                } else {
                    throw new Error('Access token 格式错误')
                }
            } catch (parseError: any) {
                throw new Error('无法解析过期的 access token: ' + parseError.message)
            }
        } else {
            // 其他验证失败
            throw new Error('Access token 验证失败: ' + verifyError.message)
        }
    }
    
    if (!payload) {
        throw new Error('Access token 无效')
    }

    // 2. 查询KV中refreshToken是否过期
    const [refreshError, refreshTokenData] = await to(getRefreshToken((payload as any).userId))
    if (refreshError) {
        throw new Error('获取 refreshToken 失败: ' + refreshError.message)
    }
    if (!refreshTokenData) {
        throw new Error('Refresh token 已经过期，请重新登录')
    }

    // 3. 生成新的accessToken
    const clientIp = request.headers.get('CF-Connecting-IP') || ''
    const [generateError, newAccessToken] = await to(generateJWT({
        userId: (payload as any).userId,
        clientAccessIp: clientIp
    }))
    if (generateError) {
        throw new Error('刷新access token失败: ' + generateError.message)
    }

    return newAccessToken
}
