/**
 * API 配置文件
 */

// API 白名单配置
export const API_WHITELIST = [
  '/api/auth/login',      // 用户登录
  '/api/user/register',   // 用户注册
  '/api/sms/send',        // 发送短信验证码
] as const

// API 路径前缀
export const API_PREFIX = '/api'

// 认证相关配置
export const AUTH_CONFIG = {
  // Token 前缀
  TOKEN_PREFIX: 'Bearer ',
  // 认证失败的状态码
  UNAUTHORIZED_STATUS: 401,
  // 认证失败的消息
  UNAUTHORIZED_MESSAGE: '缺少访问令牌，请先登录'
} as const

// 页面路由配置
export const PAGE_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/'
} as const
