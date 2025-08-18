import { NextResponse, NextRequest } from 'next/server'
import { to } from 'await-to-js'
import * as userService from '@/lib/service/user'

export async function userRegisterController(request: NextRequest): Promise<NextResponse> {
    const clonedRequest = request.clone()
    const body = await clonedRequest.json() as any

    const [ serviceError, serviceResult ] = await to(
        userService.userRegister(body)
    )

    // 使用三元表达式简化返回结构
    return NextResponse.json({
        code: serviceError ? 500 : 200,
        data: serviceError ? null : serviceResult,
        message: serviceError ? (serviceError.message || '用户注册失败') : '注册成功'
    })
}

export async function userLoginController(request: NextRequest): Promise<NextResponse> {
    console.log('userLogin controller -----> :');

    const clonedRequest = request.clone()
    const body = await clonedRequest.json() as any

    const [ serviceError, serviceResult ] = await to(userService.userLogin(body))

    // 使用三元表达式简化返回结构
    return NextResponse.json({
        code: serviceError ? 500 : 200,
        data: serviceError ? null : serviceResult,
        message: serviceError ? (serviceError.message || '用户登录失败') : '登录成功'
    })
}

/**
 * 获取用户信息控制器
 */
export async function getUserInfoController(request: NextRequest): Promise<NextResponse> {
  const [serviceError, serviceResult] = await to(
    userService.getUserInfo(request)
  );

  // 使用三元表达式简化返回结构
  return NextResponse.json({
    code: serviceError ? 500 : 200,
    data: serviceError ? null : serviceResult,
    message: serviceError ? (serviceError.message || '获取用户信息失败') : '获取用户信息成功'
  });
}

/**
 * 获取用户列表控制器
 */
export async function getUserListController(request: NextRequest): Promise<NextResponse> {
  const [serviceError, serviceResult] = await to(
    userService.getUserList(request)
  );

  // 使用三元表达式简化返回结构
  return NextResponse.json({
    code: serviceError ? 500 : 200,
    data: serviceError ? null : serviceResult,
    message: serviceError ? (serviceError.message || '获取用户列表失败') : '获取用户列表成功'
  });
}
