import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'
import { tokenManager } from './tokenManager'
import { clearUserInfo } from '@/utils/token'

/**
 * HTTP客户端配置
 */

    // API基础URL配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

// 创建axios实例
const httpClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
httpClient.interceptors.request.use(
    async (config) => {
        // 可以在这里添加token等认证信息
        const token = localStorage.getItem('accessToken')
        config.headers.Authorization = `Bearer ${ token || '' }`

        // 检查是否正在刷新 token
        if (tokenManager.getIsRefreshing()) {
            // 如果是 refresh token 请求，不要挂起，让它正常执行
            if (config.url && config.url.includes('/api/auth/refresh')) {
                return config
            }

            // 其他请求挂起到队列
            return tokenManager.addPendingRequest(config)
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
httpClient.interceptors.response.use(
    (response: AxiosResponse) => {
        if (typeof window === 'undefined') {
            console.log('Running on SERVER')
        }
        else {
            console.log('Running on CLIENT')
        }

        // 统一处理响应数据
        const {data} = response
        console.log('Request success:', response.status, data)

        // 如果后端返回的是标准格式 { code, data, message }
        if (data && typeof data.code === 'number') {
            // 使用 switch 语句优化代码结构
            switch (data.code) {
                case 200:
                    return data

                case 401:
                    // 清除token，跳转到登录页
                    clearUserInfo()
                    message.error('登录已过期，请重新登录')
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login'
                    }
                    return Promise.reject(new Error(data.message || '未授权，请重新登录'))

                case 40001:
                    // token有效但过期，进行刷新
                    // 将当前请求添加到队列，等待刷新完成后重新发送
                    return tokenManager.addPendingRequest(response.config!)

                case 403:
                    // 删除客户端所有缓存信息，重定向到登录页
                    clearUserInfo()
                    message.error('访问被拒绝，请重新登录')
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login'
                    }
                    return Promise.reject(new Error(data.message || '访问被拒绝'))

                default:
                    // 业务错误，显示错误消息
                    message.error(data.message || '请求失败')
                    return Promise.reject(new Error(data.message || '请求失败'))
            }
        }

        return data
    },
    (error) => {
        // 统一处理错误
        let errorMessage = '网络请求失败'

        if (error.response) {
            // 服务器返回错误状态码
            const {status, data} = error.response

            console.error('Request failed with status:', status, data)
            switch (status) {
                case 400:
                    errorMessage = data?.message || '请求参数错误'
                    break
                case 401:
                    errorMessage = data?.message || '未授权，请重新登录'
                    break
                case 403:
                    errorMessage = '禁止访问'
                    break
                case 404:
                    errorMessage = '请求的资源不存在'
                    break
                case 429:
                    errorMessage = data?.message || '请求过于频繁，请稍后再试'
                    break
                case 500:
                    errorMessage = '服务器内部错误'
                    break
                default:
                    errorMessage = data?.message || `请求失败 (${ status })`
            }
        }
        else if (error.request) {
            // 请求已发出但没有收到响应
            errorMessage = '网络连接失败，请检查网络'
        }
        else {
            // 其他错误
            errorMessage = error.message || '请求失败'
        }

        // 显示错误消息
        console.error('HTTP Client Error:', errorMessage)
        message.error(errorMessage)

        return Promise.reject(error)
    }
)

export default httpClient
