'use client'

import React, { useState } from 'react'
import { Card, Input, Button, Divider, Typography, Form, message, Space } from 'antd'
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined } from '@ant-design/icons'
import { login, refreshToken } from '@/lib/api/auth'
import { getUserInfo } from '@/lib/api/user'
import { useRouter } from 'next/navigation'
import { to } from 'await-to-js'
import TurnstileWidget from '@/components/TurnstileWidget'
import { getAccessToken } from "@/utils/token"

export default function LoginPage() {
    const [ form ] = Form.useForm()
    const [ loading, setLoading ] = useState(false)
    const [ turnstileToken, setTurnstileToken ] = useState<string>('')
    const [ refreshLoading, setRefreshLoading ] = useState(false)
    const [ userInfoLoading, setUserInfoLoading ] = useState(false)
    const router = useRouter()

    const handleLogin = async (values: any) => {
        if (!turnstileToken) {
            message.warning('请完成人机验证')
            return
        }

        setLoading(true)

        const [ error, response ] = await to(login({
            phone: values.phone,
            password: values.password
        }, turnstileToken))
        setLoading(false)
        if (error) return
        
        // 跳转到首页
        router.push('/')
    }

    const handleGetUserInfo = async () => {
        const currentToken = getAccessToken()
        /*if (!currentToken) {
            message.error('没有找到访问令牌')
            return
        }*/

        setUserInfoLoading(true)

        const [ error, response ] = await to(getUserInfo())
        setUserInfoLoading(false)

        if (error) return

        message.success('获取用户信息成功！')
        console.log('用户信息:', response)
    }

    const handleTestRefresh = async () => {
        const currentToken = getAccessToken()
        /*if (!currentToken) {
            message.error('没有找到访问令牌')
            return
        }*/

        setRefreshLoading(true)

        const [ error, response ] = await to(refreshToken())
        setRefreshLoading(false)

        if (error) return

        message.success('刷新令牌成功！新的访问令牌已存储')
        console.log('新的访问令牌:', response)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <div className="text-center mb-6">
                    <Typography.Title level={ 2 } className="!mb-2">
                        用户登录
                    </Typography.Title>
                    <Typography.Text type="secondary">
                        请输入您的账号信息
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
                            href="https://github.com/MakeCodingGreatAgain88/nextjs-admin"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub 项目
                        </Typography.Link>
                    </div>
                </div>

                <Form
                    form={ form }
                    onFinish={ handleLogin }
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
                        name="password"
                        label="密码"
                        rules={ [
                            {required: true, message: '请输入密码'}
                        ] }
                        extra={ !turnstileToken ? '请先完成人机验证' : '' }
                    >
                        <Input.Password
                            size="large"
                            prefix={ <LockOutlined/> }
                            placeholder="请输入密码"
                            iconRender={ (visible) => (visible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>) }
                        />
                    </Form.Item>

                    <Form.Item label="人机验证">
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
                                disabled={ loading }
                            >
                                { loading ? '登录中...' : '登录' }
                            </Button>
                        </Form.Item>
                    ) }
                </Form>

                <Divider className="my-6"/>

                {/* 测试按钮区域 */}
                <div className="mb-4">
                    <Space direction="vertical" size="middle" className="w-full">
                        {/* 获取用户信息按钮 */}
                        <Button
                            type="default"
                            size="large"
                            className="w-full"
                            loading={ userInfoLoading }
                            onClick={ handleGetUserInfo }
                        >
                            { userInfoLoading ? '获取中...' : '👤 获取用户信息' }
                        </Button>
                        
                        {/* 测试刷新 Token 按钮
                        <Button
                            type="dashed"
                            size="large"
                            className="w-full"
                            loading={ refreshLoading }
                            onClick={ handleTestRefresh }
                        >
                            { refreshLoading ? '刷新中...' : '🔄 测试刷新 AccessToken' }
                        </Button>*/}
                    </Space>
                    
                    <Typography.Text type="secondary" className="block text-center mt-3">
                        这些按钮需要先登录获取 token 后才能使用
                    </Typography.Text>
                </div>

                <div className="text-center">
                    <Typography.Text type="secondary">
                        还没有账号？{ ' ' }
                        <Button
                            type="link"
                            onClick={ () => router.push('/register') }
                            className="!p-0 !h-auto"
                        >
                            立即注册
                        </Button>
                    </Typography.Text>
                </div>
            </Card>
        </div>
    )
}
