import { getKV } from '@/lib/database'
import { to } from 'await-to-js'

/**
 * 存储刷新Token
 */
export async function storeRefreshToken(userId: number | string, expiresIn: number = 604800): Promise<void> {
    const kv = getKV()

    const [ error ] = await to(
        kv.put(`refresh_token:${ userId }`, JSON.stringify({
            userId,
            expiresAt: Date.now() + expiresIn * 1000
        }), {expirationTtl: expiresIn})
    )

    if (error) {
        console.error('Store refresh token error:', error)
        throw new Error(`存储刷新Token失败: ${ error.message }`)
    }
}

/**
 * 获取刷新Token信息
 */
export async function getRefreshToken(userId: string | number): Promise<unknown> {
    const kv = getKV()

    const [ error, result ] = await to(kv.get(`refresh_token:${ userId }`))

    if (error) {
        console.error('Get refresh token error:', error)
        throw new Error(`获取刷新Token失败: ${ error.message }`)
    }

    return result || null
}

/**
 * 删除刷新Token
 */
export async function deleteRefreshToken(userId: string | number): Promise<void> {
    const kv = getKV()

    const [ error ] = await to(kv.delete(`refresh_token:${ userId }`))

    if (error) {
        console.error('Delete refresh token error:', error)
        throw new Error(`删除刷新Token失败: ${ error.message }`)
    }
}
