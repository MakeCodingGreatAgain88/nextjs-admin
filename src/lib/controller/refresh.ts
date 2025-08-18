import { NextResponse, NextRequest } from 'next/server';
import { to } from 'await-to-js';
import * as refreshService from '@/lib/service/refresh';

/**
 * 刷新访问令牌控制器
 */
export async function refreshTokenController(request: NextRequest): Promise<NextResponse> {
  const [serviceError, serviceResult] = await to(
    refreshService.refreshAccessToken(request)
  );

  // 使用三元表达式简化返回结构
  return NextResponse.json({
    code: serviceError ? 500 : 200,
    data: serviceError ? null : serviceResult,
    message: serviceError ? (serviceError.message || '刷新令牌失败') : '刷新令牌成功'
  });
}
