'use client'

import React, { useState, useEffect } from 'react'
import { Card, Input, Button, Divider, Typography, Space, message, Form } from 'antd'
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'
import { sendSmsCode } from '@/lib/api/sms'
import { register } from '@/lib/api/user'
import { useRouter } from 'next/navigation'
import { to } from 'await-to-js'
import TurnstileWidget from '@/components/TurnstileWidget'

export default function RegisterPage() {
    const [ form ] = Form.useForm()
    const [ loading, setLoading ] = useState(false)
    const [ sendingSms, setSendingSms ] = useState(false)
    const [ countdown, setCountdown ] = useState(0)
    const [ smsCode, setSmsCode ] = useState('')
    const [ turnstileToken, setTurnstileToken ] = useState<string>('')
    const router = useRouter()

    // 从 localStorage 恢复倒计时状态
    useEffect(() => {
        console.log('页面加载，检查 localStorage...')
        const savedCountdown = localStorage.getItem('sms_countdown')
        console.log('localStorage 中的倒计时数据:', savedCountdown)

        if (savedCountdown) {
            try {
                const {sendTime} = JSON.parse(savedCountdown)
                const now = Date.now()
                const elapsed = Math.floor((now - sendTime) / 1000)
                const remaining = Math.max(0, 60 - elapsed)

                console.log('解析倒计时数据:', {sendTime, now, elapsed, remaining})

                if (remaining > 0) {
                    // 直接恢复倒计时，无需检查手机号
                    setCountdown(remaining)
                    console.log('倒计时已恢复:', remaining)
                }
                else {
                    // 倒计时已过期，清除
                    localStorage.removeItem('sms_countdown')
                    setCountdown(0)
                    console.log('倒计时已过期，已清除')
                }
            }
            catch (error) {
                console.error('解析 localStorage 数据失败:', error)
                localStorage.removeItem('sms_countdown')
            }
        }
        else {
            console.log('localStorage 中没有倒计时数据')
        }
    }, []) // 移除 form 依赖，只在组件挂载时执行一次


    useEffect(() => {
        let timer: NodeJS.Timeout

        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        }
        else if (countdown === 0) {
            // 只有在倒计时真正结束时才清除 localStorage
            // 检查是否真的需要清除
            const savedCountdown = localStorage.getItem('sms_countdown')
            if (savedCountdown) {
                try {
                    const {sendTime} = JSON.parse(savedCountdown)
                    const now = Date.now()
                    const elapsed = Math.floor((now - sendTime) / 1000)
                    const remaining = Math.max(0, 60 - elapsed)

                    if (remaining <= 0) {
                        localStorage.removeItem('sms_countdown')
                        console.log('倒计时真正结束，已清除 localStorage')
                    }
                    else {
                        console.log('倒计时未真正结束，remaining:', remaining)
                    }
                }
                catch (error) {
                    console.error('检查倒计时状态失败:', error)
                }
            }
        }

        return () => clearTimeout(timer)
    }, [ countdown ])

    const handleTestSendSms = () => {
        const phone = form.getFieldValue('phone')
        if (!phone) {
            message.warning('请先输入手机号')
            return
        }

        sendSmsCode({phone}, turnstileToken)
    }

    const handleSendSms = async () => {
        const phone = form.getFieldValue('phone')
        if (!phone) {
            message.warning('请先输入手机号')
            return
        }

        setSendingSms(true)

        const [ error, response ] = await to(sendSmsCode({phone}, turnstileToken))

        if (error) {
            setSendingSms(false)
            return
        }

        setSmsCode(response.data as string)

        // 只处理成功状态
        setCountdown(60)
        // 立即保存倒计时状态到 localStorage
        const sendTime = Date.now()
        localStorage.setItem('sms_countdown', JSON.stringify({sendTime}))
        console.log('验证码发送成功，倒计时已保存:', {sendTime})
        setSendingSms(false)
    }

    const handleRegister = async (values: any) => {
        console.log('注册函数被调用，参数:', values)
        console.log('turnstileToken:', turnstileToken)

        if (!turnstileToken) {
            message.warning('请完成人机验证')
            return
        }

        if (loading) {
            console.log('注册请求正在进行中，忽略重复点击')
            return
        }

        setLoading(true)
        console.log('设置 loading 状态为 true')

        const [ error, response ] = await to(register({
            phone: values.phone,
            password: values.password,
            confirmPassword: values.confirmPassword,
            smsCode: values.smsCode
        }, turnstileToken))

        setLoading(false)

        if (error) return

        // 注册成功，跳转到登录页
        router.push('/login?registered=true')
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <div className="text-center mb-6">
                    <Typography.Title level={ 2 } className="!mb-2">
                        用户注册
                    </Typography.Title>
                    <Typography.Text type="secondary">
                        创建您的账号
                    </Typography.Text>
                </div>

                <div className="flex justify-end -mt-4 mb-2">
                    <div className="flex flex-col items-end">
                        <Typography.Link
                            href="https://freezing-shock-fea.notion.site/24fa16bc331a80858079dbbb0c34be8c"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            架构文档
                        </Typography.Link>
                        <Typography.Link
                            href="https://github.com/MakeCodingGreatAgain88/next-js-admin"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub 项目
                        </Typography.Link>
                    </div>
                </div>

                <Form
                    form={ form }
                    onFinish={ handleRegister }
                    layout="vertical"
                    className="space-y-4"
                >
                    <Form.Item
                        name="phone"
                        label="手机号"
                        rules={ [
                            {required: true, message: '请输入手机号'},
                            {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式'}
                        ] }
                    >
                        <Input
                            size="large"
                            prefix={ <UserOutlined/> }
                            type="tel"
                            placeholder="请输入手机号"
                        />
                    </Form.Item>

                    <Form.Item
                        name="smsCode"
                        label="验证码"
                        rules={ [
                            {required: true, message: '请输入验证码'},
                            {len: 6, message: '验证码长度应为6位'}
                        ] }
                        extra={ !turnstileToken ? '请先完成人机验证' : '' }
                    >
                        <Space.Compact className="w-full">
                            <Input
                                size="large"
                                prefix={ <SafetyOutlined/> }
                                placeholder="请输入验证码"
                            />
                            <Button
                                size="large"
                                onClick={ handleSendSms }
                                disabled={ sendingSms || countdown > 0 || !turnstileToken }
                                className="min-w-[120px]"
                            >
                                { countdown > 0 ? `${ countdown }s` : sendingSms ? '发送中...' : '发送验证码' }
                            </Button>
                            {smsCode &&  <Button
                                size="large"
                                onClick={ handleTestSendSms }
                                className="min-w-[120px]"
                            >
                                测试接口限制
                            </Button>}
                        </Space.Compact>
                    </Form.Item>
                    {smsCode &&  <Typography.Text type="secondary" className="block text-center mt-3">
                        短信验证码：{ smsCode }
                    </Typography.Text>}

                    <Form.Item
                        name="password"
                        label="密码"
                        rules={ [
                            {required: true, message: '请输入密码'},
                            {min: 6, message: '密码长度不能少于6位'}
                        ] }
                    >
                        <Input.Password
                            size="large"
                            prefix={ <LockOutlined/> }
                            placeholder="请输入密码"
                            iconRender={ (visible) => (visible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>) }
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="确认密码"
                        dependencies={ [ 'password' ] }
                        rules={ [
                            {required: true, message: '请再次输入密码'},
                            ({getFieldValue}) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve()
                                    }
                                    return Promise.reject(new Error('两次输入的密码不一致'))
                                }
                            })
                        ] }
                    >
                        <Input.Password
                            size="large"
                            prefix={ <LockOutlined/> }
                            placeholder="请再次输入密码"
                            iconRender={ (visible) => (visible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>) }
                        />
                    </Form.Item>

                    <Form.Item
                        label="人机验证"
                    >
                        <TurnstileWidget
                            onVerify={ setTurnstileToken }
                            language="zh-CN"
                        />
                    </Form.Item>

                    { turnstileToken && (
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                className="w-full"
                                loading={ loading }
                            >
                                { loading ? '注册中...' : '注册' }
                            </Button>
                        </Form.Item>
                    ) }
                </Form>

                <Divider className="my-6"/>

                <div className="text-center">
                    <Typography.Text type="secondary">
                        已有账号？{ ' ' }
                        <Button
                            type="link"
                            onClick={ () => router.push('/login') }
                            className="!p-0 !h-auto"
                        >
                            立即登录
                        </Button>
                    </Typography.Text>
                </div>
            </Card>
        </div>
    )
}
