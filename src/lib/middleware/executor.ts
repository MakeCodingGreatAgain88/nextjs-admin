import { NextRequest, NextResponse } from 'next/server'
import { to } from 'await-to-js'
import { Middleware, Controller } from '@/types/middleware'

export class MiddlewareExecutor {
    private middlewares: Middleware[] = []

    constructor(middlewares: Middleware[] = []) {
        this.middlewares = middlewares
    }

    /**
     * 添加中间件
     */
    add(middleware: Middleware): this {
        this.middlewares.push(middleware)
        return this
    }

    /**
     * 执行中间件链
     */
    async execute(request: NextRequest, controller: Controller): Promise<NextResponse> {
        // 执行所有中间件
        for (const middleware of this.middlewares) {
            const [ error, result ] = await to(middleware(request))

            if (error) {
                console.error('Middleware execution error:', error)
                return NextResponse.json({
                    code: 500,
                    data: null,
                    message: '中间件执行失败'
                })
            }

            // 如果中间件返回 NextResponse，说明有错误或需要中断
            if (result) {
                return result
            }

            // 如果返回 null，说明继续执行下一个中间件
        }

        // 所有中间件执行成功，执行控制器
        try {
            return await controller(request)
        }
        catch (error) {
            console.error('Controller execution error:', error)
            return NextResponse.json({
                code: 500,
                data: null,
                message: '控制器执行失败'
            })
        }
    }
}
