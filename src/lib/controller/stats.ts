import { NextRequest, NextResponse } from 'next/server';
import { to } from 'await-to-js';
import * as statsService from '@/lib/service/stats';

/**
 * 获取统计概览控制器
 */
export async function getStatsOverviewController(request: NextRequest): Promise<NextResponse> {
  const [serviceError, serviceResult] = await to(
    statsService.getStatsOverview()
  );

  // 使用三元表达式简化返回结构
  return NextResponse.json({
    code: serviceError ? 500 : 200,
    data: serviceError ? null : serviceResult,
    message: serviceError ? (serviceError.message || '获取统计信息失败') : '获取统计信息成功'
  });
}
