import { to } from 'await-to-js'
import * as smsDB from '@/lib/db/sms'

/**
 * 生成随机验证码
 */
function generateSmsCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * 短信业务服务接口
 */
export interface SendSmsParams {
    phone: string;
    clientIp: string;
}

/**
 * 获取短信验证码
 */
export async function getSmsCode(phone: string) {
    return await smsDB.getSmsCode(phone)
}

/**
 * 获取IP限制
 */
export async function getIpLimit(ip: string) {
    return await smsDB.getIpLimit(ip)
}

/**
 * 获取手机号限制
 */
export async function getPhoneLimit(phone: string) {
    return await smsDB.getPhoneLimit(phone)
}

/**
 * 发送短信验证码（完整的业务流程）
 */
export async function sendSmsCode(params: SendSmsParams): Promise<string> {
    const {phone, clientIp} = params
    const now = Date.now()

    // 1. 生成验证码
    const smsCode = generateSmsCode()

    // 2. 存储验证码到KV
    const [storeError] = await to(smsDB.storeSmsCode(phone, smsCode, 300))
    if (storeError) {
        console.error('Store SMS code error:', storeError)
        throw new Error(`存储短信验证码失败: ${storeError.message}`)
    }
    console.log(`验证码已存储到KV: ${phone} -> ${smsCode}`)

    // 3. 获取并更新IP限制计数
    const [ipLimitError, ipLimit] = await to(smsDB.getIpLimit(clientIp))
    if (ipLimitError) {
        console.error('Get IP limit error:', ipLimitError)
        throw new Error(`获取IP限制失败: ${ipLimitError.message}`)
    }
    
    const newIpCount = (ipLimit?.count || 0) + 1
    const [updateIpError] = await to(smsDB.updateIpLimit(clientIp, newIpCount, 86400))
    if (updateIpError) {
        console.error('Update IP limit error:', updateIpError)
        throw new Error(`更新IP限制失败: ${updateIpError.message}`)
    }

    // 4. 获取并更新手机号限制计数
    const [phoneLimitError, phoneLimit] = await to(smsDB.getPhoneLimit(phone))
    if (phoneLimitError) {
        console.error('Get phone limit error:', phoneLimitError)
        throw new Error(`获取手机号限制失败: ${phoneLimitError.message}`)
    }
    
    const newPhoneCount = (phoneLimit?.count || 0) + 1
    const [updatePhoneError] = await to(smsDB.updatePhoneLimit(phone, newPhoneCount, now, 86400))
    if (updatePhoneError) {
        console.error('Update phone limit error:', updatePhoneError)
        throw new Error(`更新手机号限制失败: ${updatePhoneError.message}`)
    }

    // 5. 模拟发送短信（实际项目中这里应该调用短信服务商API）
    console.log(`发送验证码到 ${phone}: ${smsCode}`)

    return smsCode
}
