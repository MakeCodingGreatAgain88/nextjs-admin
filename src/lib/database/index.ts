import type { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from './schema'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { drizzle } from "drizzle-orm/d1"

/**
 * 获取 KV 存储实例
 */
export function getKV(): any {
    const {env} = getRequestContext()
    return env.NEXTJS_DEMO_KV_DB
}

/**
 * 获取 D1 数据库实例
 */
export function getD1(): DrizzleD1Database<typeof schema> {
    const {env} = getRequestContext()
    return drizzle(env.NEXTJS_DEMO_D1_DB, {schema})
}
