import { to } from "await-to-js"
import { message } from 'antd'
import { setAccessToken, clearUserInfo } from '@/utils/token'
import { refreshToken } from '@/lib/api/auth'
import httpClient from './client'

interface PendingRequest {
    config: any
    resolve: (value: any) => void
    reject: (reason?: any) => void
}

class TokenManager {
    private isRefreshing = false
    private pendingRequests: PendingRequest[] = []

    /**
     * 添加待处理的请求到队列
     */
    addPendingRequest(config: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            // 将请求添加到队列
            this.pendingRequests.push({config, resolve, reject})

            // 如果还没有开始刷新，则开始刷新
            if (!this.isRefreshing) await this.refreshToken()
        })
    }

    /**
     * 处理队列中的所有待处理请求
     */
    processPendingRequests(newToken: string) {
        this.pendingRequests.forEach(({config, resolve, reject}) => {
            // 更新请求头中的 Authorization
            if (config.headers) {
                config.headers.Authorization = `Bearer ${ newToken }`
            }

            // 重新发送请求
            try {
                // 使用 HTTP 客户端重新发送请求
                httpClient.request(config).then(resolve).catch(reject)
            }
            catch (error) {
                reject(error)
            }
        })

        // 清空队列
        this.pendingRequests = []
    }

    /**
     * 处理队列中的请求失败
     */
    processPendingRequestsError(error: any) {
        this.pendingRequests.forEach(({reject}) => {
            reject(error)
        })

        // 清空队列
        this.pendingRequests = []

        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
    }

    /**
     * 刷新 token
     */
    async refreshToken(): Promise<string | null> {
        this.isRefreshing = true

        try {
            // 调用 refresh token 接口
            const [ err, response ] = await to(refreshToken())

            if (err) {
                // 刷新 token 失败，清除本地信息并重定向到登录页
                this.processPendingRequestsError(err)
                return null
            }

            const newToken = response.data

            // 保存新的 token 到本地
            setAccessToken(newToken)

            // 处理队列中的请求
            this.processPendingRequests(newToken)

            this.isRefreshing = false

            return newToken
        }
        catch (error: any) {
            this.isRefreshing = false

            // 刷新失败，清除本地信息并重定向到登录页
            clearUserInfo()
            message.error('登录已过期，请重新登录')

            // 处理队列中的请求失败
            this.processPendingRequestsError(error)

            // 重定向到登录页
            if (typeof window !== 'undefined') {
                window.location.href = '/login'
            }

            return null
        }
    }

    /**
     * 检查是否正在刷新
     */
    getIsRefreshing(): boolean {
        return this.isRefreshing
    }
}

export const tokenManager = new TokenManager()
