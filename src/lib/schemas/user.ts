import { z } from 'zod'

/**
 * 用户注册参数验证 schema
 */
export const userRegisterSchema = z.object({
    phone: z.string().min(1, '手机号不能为空').regex(/^1[3-9]\d{9}$/, '请输入正确的手机号格式'),
    password: z.string().min(6, '密码长度不能少于6位').max(50, '密码长度不能超过50位'),
    confirmPassword: z.string().min(1, '确认密码不能为空'),
    smsCode: z.string().min(1, '验证码不能为空').regex(/^\d{6}$/, '验证码长度应为6位数字')
}).refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: [ "confirmPassword" ]
})

/**
 * 用户登录参数验证 schema
 */
export const userLoginSchema = z.object({
    phone: z.string().min(1, '手机号不能为空').regex(/^1[3-9]\d{9}$/, '请输入正确的手机号格式'),
    password: z.string().min(1, '密码不能为空')
})

/**
 * 发送验证码参数验证 schema
 */
export const sendSmsSchema = z.object({
    phone: z.string().min(1, '手机号不能为空').regex(/^1[3-9]\d{9}$/, '请输入正确的手机号格式')
})

export type UserRegisterParams = z.infer<typeof userRegisterSchema>;
export type UserLoginParams = z.infer<typeof userLoginSchema>;
export type SendSmsParams = z.infer<typeof sendSmsSchema>;
