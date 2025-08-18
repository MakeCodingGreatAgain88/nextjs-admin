import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

/**
 * Turnstile Token 验证中间件
 * 验证 Cloudflare Turnstile 的响应 token
 */
export async function validateTurnstileToken(request: NextRequest): Promise<NextResponse | null> {
  try {
    const { env } = getRequestContext();
    const { TURNSTILE_SECRET_KEY_ADMIN_LOGIN } = env;
    
    // 开发模式跳过验证
    const isDev = request.headers.get('k-mode') === 'dev';
    if (isDev) {
      // 返回 null 表示继续执行下一个中间件
      return null;
    }

    // 获取 Turnstile 响应 token
    const token = request.headers.get('cf-turnstile-response');
    if (!token) {
      return NextResponse.json({
        code: 403,
        data: null,
        message: 'Turnstile token 是必需的'
      });
    }

    // 获取客户端 IP
    const ip = request.headers.get('CF-Connecting-IP') || '';

    // 验证 token
    const formData = new FormData();
    formData.append('secret', TURNSTILE_SECRET_KEY_ADMIN_LOGIN);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const result = await fetch(url, {
      body: formData,
      method: 'POST'
    });

    const outcome: any = await result.json();
    if (!outcome.success) {
      console.error('Turnstile validation failed:', outcome);
      return NextResponse.json({
        code: 500,
        data: null,
        message: 'Turnstile 验证失败'
      });
    }

    // 返回 null 表示继续执行下一个中间件
    return null;
  } catch (error: any) {
    console.error('Turnstile middleware error:', error);
    return NextResponse.json({
      code: 500,
      data: null,
      message: `Turnstile 验证错误: ${error.message}`
    });
  }
}
