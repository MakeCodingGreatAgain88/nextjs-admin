import { to } from 'await-to-js'
import httpClient from '@/lib/http/client'
import AUTH_RPC from '@/lib/rpc/auth'
import { setAccessToken, clearUserInfo } from '@/utils/token'

/**
 * 用户登录接口
 */
export interface UserLoginParams {
    phone: string;
    password: string;
}

/**
 * 用户登录
 */
export async function login(params: UserLoginParams, turnstileToken: string) {
    try {
        const [ err, res ] = await to(httpClient.post(AUTH_RPC.login, params, {
            headers: {
                'cf-turnstile-response': turnstileToken
            }
        }))

        if (err) {
            throw new Error(err.message)
        }

        // 如果登录成功，处理 token 存储
        const token:any = res.data as any

        setAccessToken(token)

        return res
    }
    catch (error) {
        // 登录失败，清除本地存储
        clearUserInfo()
        throw error
    }
}

/**
 * 刷新Token
 */
export async function refreshToken() {
    const [ err, res ] = await to(httpClient.post(AUTH_RPC.refresh, {}, {
        headers: {
            'x-token-refresh': 'true' // 特殊标识，表明这是 token 刷新请求
        }
    }))

    if (err) {
        throw new Error(err.message)
    }

    // 如果刷新成功，处理 token 存储
    const token:any = res.data as any

    setAccessToken(token)

    return res
}
