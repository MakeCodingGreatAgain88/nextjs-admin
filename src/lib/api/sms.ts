import httpClient from '@/lib/http/client'
import SMS_RPC from '@/lib/rpc/sms'

/**
 * 短信服务接口
 */
export interface SendSmsParams {
    phone: string;
}

/**
 * 发送短信验证码
 */
export function sendSmsCode(params: SendSmsParams, turnstileToken: string) {
    return httpClient.post(SMS_RPC.send, params, {
        headers: {
            'cf-turnstile-response': turnstileToken
        }
    })
}
