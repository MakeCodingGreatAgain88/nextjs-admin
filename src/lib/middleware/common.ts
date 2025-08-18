import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

/**
 * 环境变量中间件
 */
export async function envMiddleware(request: NextRequest): Promise<NextResponse | null> {
  try {
    const { env } = getRequestContext();

    if (!env) {
      return NextResponse.json({
        code: 500,
        data: null,
        message: '环境变量获取失败'
      });
    }

    // 返回 null 表示继续执行下一个中间件
    return null;
  } catch (error) {
    console.error('Environment middleware error:', error);
    return NextResponse.json({
      code: 500,
      data: null,
      message: '环境变量中间件执行失败'
    });
  }
}
