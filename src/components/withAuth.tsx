'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAccessToken } from '@/utils/token'
import { message } from 'antd'

/**
 * withAuth 高阶组件的配置选项
 */
interface WithAuthOptions {
  /** 重定向路径，默认为 '/login' */
  redirectTo?: string
  /** 自定义加载组件 */
  LoadingComponent?: React.ComponentType
  /** 认证失败时的提示消息 */
  authMessage?: string
  /** 是否显示加载状态，默认为 true */
  showLoading?: boolean
}

/**
 * withAuth 高阶组件
 * 用于保护需要登录才能访问的页面
 * 
 * @param WrappedComponent 被包裹的组件
 * @param options 配置选项
 * @returns 带有认证检查的组件
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    redirectTo = '/login',
    LoadingComponent,
    authMessage = '请先登录',
    showLoading = true
  } = options

  return function AuthenticatedComponent(props: P) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
      const checkAuth = () => {
        const token = getAccessToken()
        
        if (!token) {
          // 没有 token，重定向到指定页面
          message.warning(authMessage)
          router.push(redirectTo)
          return
        }

        // 有 token，验证通过
        setIsAuthenticated(true)
        setIsLoading(false)
      }

      checkAuth()
    }, [router, redirectTo, authMessage])

    // 加载中状态
    if (isLoading && showLoading) {
      // 使用自定义加载组件或默认加载组件
      if (LoadingComponent) {
        return <LoadingComponent />
      }
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">验证中...</p>
          </div>
        </div>
      )
    }

    // 未认证状态（通常不会显示，因为会重定向）
    if (!isAuthenticated) {
      return null
    }

    // 认证通过，渲染被包裹的组件
    return <WrappedComponent {...props} />
  }
}