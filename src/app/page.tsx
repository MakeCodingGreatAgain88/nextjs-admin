'use client'

import React, { useState, useEffect } from 'react'
import { Card, Table, Input, Button, Space, Typography, message, Pagination, Avatar, Divider, Tag, Row, Col } from 'antd'
import { SearchOutlined, UserOutlined, PhoneOutlined, CalendarOutlined, SafetyOutlined, LogoutOutlined } from '@ant-design/icons'
import { getUserList, getUserInfo } from '@/lib/api/user'
import { getStatsOverview } from '@/lib/api/stats'
import { to } from 'await-to-js'
import { useRouter } from 'next/navigation'
import { withAuth } from '@/components/withAuth'

const {Search} = Input
const {Title, Text} = Typography

interface UserInfo {
    id: string;
    phone: string;
    permissionGrouping: string[];
    createdAt: string;
    updatedAt: string;
}

interface Permission {
    page: string;
    buttons: {
        name: string;
        action: string;
    }[];
}

function HomePage() {
    const [ users, setUsers ] = useState<any[]>([])
    const [ loading, setLoading ] = useState(false)
    const [ pagination, setPagination ] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    })
    const [ searchPhone, setSearchPhone ] = useState('')
    const [ userInfo, setUserInfo ] = useState<UserInfo | null>(null)
    const [ permissions, setPermissions ] = useState<Permission[]>([])
    const [ userInfoLoading, setUserInfoLoading ] = useState(false)
    const [ stats, setStats ] = useState<{
        totalUsers: number;
        activeUsers: number;
        timestamp: string
    } | null>(null)
    const [ statsLoading, setStatsLoading ] = useState(false)
    const router = useRouter()

    // 获取用户列表
    const fetchUsers = async (page: number = 1, phone?: string) => {
        setLoading(true)
        const [ error, response ] = await to(getUserList({
            page,
            pageSize: pagination.pageSize,
            phone: phone || searchPhone
        }))

        setLoading(false)

        if (error) return

        message.success('获取用户列表成功！')
        setUsers(response.data.list || [])
        setPagination({
            ...pagination,
            current: page,
            total: response.data.pagination.total
        })

    }

    // 获取当前用户信息
    const fetchUserInfo = async () => {
        setUserInfoLoading(true)
        try {
            const [ error, response ] = await to(getUserInfo())
            if (error) {
                message.error('获取用户信息失败: ' + error.message)
                return
            }
            setUserInfo(response.data)
            message.success('获取用户信息成功！')
        }
        catch (error: any) {
            message.error('获取用户信息失败: ' + error.message)
        }
        finally {
            setUserInfoLoading(false)
        }
    }

    // 获取统计信息
    const fetchStats = async () => {
        setStatsLoading(true)
        try {
            const [ error, response ] = await to(getStatsOverview())
            if (error) {
                message.error('获取统计信息失败: ' + error.message)
                return
            }
            setStats(response.data)
            message.success('获取统计信息成功！')
        }
        catch (error: any) {
            message.error('获取统计信息失败: ' + error.message)
        }
        finally {
            setStatsLoading(false)
        }
    }

    // 搜索用户
    const handleSearch = (value: string) => {
        setSearchPhone(value)
        fetchUsers(1, value)
    }

    // 分页变化
    const handlePageChange = (page: number) => {
        fetchUsers(page)
    }

    // 退出登录
    const handleLogout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userInfo')
        router.push('/login')
    }

    // 组件加载时获取用户列表和用户信息
    useEffect(() => {
        fetchUsers()
        fetchUserInfo()
        fetchStats()
    }, [])

    // 表格列定义
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            key: 'phone',
            width: 150
        },
        {
            title: '权限组',
            dataIndex: 'permissionGrouping',
            key: 'permissionGrouping',
            width: 120
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (text: string) => new Date(text).toLocaleString('zh-CN')
        },
        {
            title: '更新时间',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 180,
            render: (text: string) => new Date(text).toLocaleString('zh-CN')
        }
    ]

    if (!userInfo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">加载中...</p>
                </div>
            </div>
        )
    }

  return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */ }
            <header
                className="border-b"
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-3">
                        <Row align="middle" justify="space-between" wrap gutter={[16, 12]}>
                            {/* 左侧：系统标题 */}
                            <Col xs={24} md={12}>
                                <Space align="center" size={12} wrap>
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 8,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 100%)',
                                            border: '1px solid #e6f0ff'
                                        }}
                                    >
                                        <SafetyOutlined style={{ color: '#2563eb', fontSize: 18 }} />
                                    </div>
                                    <div>
                                        <Typography.Title level={3} className="!mb-0 text-xl md:text-2xl lg:text-3xl">NextJs 管理系统</Typography.Title>
                                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>轻量 · 安全 · 可扩展</Typography.Text>
                                    </div>
                                </Space>
                            </Col>

                            {/* 右侧：用户信息与操作 */}
                            <Col xs={24} md={12}>
                                <div className="flex flex-col sm:flex-row sm:justify-end items-center gap-3 sm:gap-4 w-full">
                                    <div className="flex items-center gap-3">
                                        <Avatar size={36} icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                                        <div className="text-sm text-center sm:text-left">
                                            <Typography.Text strong className="block">{ userInfo.phone }</Typography.Text>
                                            <Typography.Text type="secondary">欢迎回来</Typography.Text>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end">
                                            <Typography.Link
                                                href="https://freezing-shock-fea.notion.site/24fa16bc331a80858079dbbb0c34be8c"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="whitespace-nowrap"
                                            >
                                                架构文档
                                            </Typography.Link>
                                            <Typography.Link
                                                href="https://github.com/MakeCodingGreatAgain88/nextjs-admin"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="whitespace-nowrap"
                                            >
                                                GitHub 项目
                                            </Typography.Link>
                                        </div>
                                        <Button
                                            type="primary"
                                            danger
                                            icon={<LogoutOutlined />}
                                            onClick={ handleLogout }
                                            size="middle"
                                            className="w-full sm:w-auto"
                                        >
                                            退出登录
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
            </header>

            {/* Main Content */ }
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 测试说明模块 */}
                <Card className="mb-6" style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
                    <div className="text-center">
                        <Typography.Title level={4} className="!mb-3 text-blue-600">
                            🧪 Token 刷新测试说明
                        </Typography.Title>
                        <div className="space-y-2 text-sm text-blue-700">
                            
                            <div className="mt-3 flex flex-col lg:flex-row gap-4 text-left">
                                <div className="flex-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <Typography.Text strong className="text-blue-800">
                                        🔄 Token 刷新测试
                                    </Typography.Text>
                                    <div className="mt-2">
                                        <Typography.Text strong>测试步骤：</Typography.Text>
                                        <ol className="list-decimal list-inside mt-1 text-blue-700">
                                            <li>打开浏览器开发者工具（F12）</li>
                                            <li>切换到 <strong>Network</strong> 标签页</li>
                                            <li>等待 1 分钟（access token 有效期）</li>
                                            <li>刷新页面或执行任意操作</li>
                                            <li>观察 Network 面板中的请求情况</li>
                                        </ol>
                                    </div>
                                    <div className="mt-3">
                                        <Typography.Text strong>预期结果：</Typography.Text>
                                        <ul className="list-disc list-inside mt-1 text-blue-700">
                                            <li>首次请求返回 40001（token 过期）</li>
                                            <li>自动调用 refresh token 接口</li>
                                            <li>获取新 token 后重新发送待请求队列</li>
                                            <li>所有请求最终成功执行</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex-1 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                    <Typography.Text strong className="text-orange-800">
                                        🚫 速率限制测试：
                                    </Typography.Text>
                                    <ul className="list-disc list-inside mt-2 text-orange-700">
                                        <li>在 10 秒内进行快速操作（可点击任意刷新按钮或频繁刷新页面），请求次数超过 10 次</li>
                                        <li>触发边缘网关配置的接口请求频率限制，返回 429 状态码</li>
                                        <li>限制持续 10 秒，期间请求将被拒绝</li>
                                        <li>10 秒后自动恢复，可再次正常发送请求</li>
                                        <li>建议在「用户信息刷新」「统计刷新」或「列表分页」等任意按钮上测试</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-3 text-xs text-blue-600">
                                <Typography.Text>
                                    ⏰ Access Token 有效期：1分钟 | 
                                    🔄 自动刷新：启用 | 
                                    📋 请求队列：支持 | 
                                    🚫 速率限制：10次/10秒
                                </Typography.Text>
                            </div>
                        </div>
                    </div>
                </Card>

                <Row gutter={ [ 32, 32 ] } className="mt-6 mb-8">
                    {/* User Info Card */ }
                    <Col xs={ 24 } lg={ 8 }>
                        <Card
                            title={
                                <Space>
                                    <UserOutlined className="text-blue-600"/>
                                    <span>用户信息</span>
                                </Space>
                            }
                            extra={
                                <Button
                                    type="primary"
                                    size="small"
                                    loading={ userInfoLoading }
                                    onClick={ fetchUserInfo }
                                >
                                    刷新
                                </Button>
                            }
                        >
                            <Space direction="vertical" className="w-full" size="middle">
                                <div>
                                    <Typography.Text type="secondary">用户ID</Typography.Text>
                                    <br/>
                                    <Typography.Text>{ userInfo.id }</Typography.Text>
                                </div>
                                <div>
                                    <Typography.Text type="secondary">手机号</Typography.Text>
                                    <br/>
                                    <Typography.Text>{ userInfo.phone }</Typography.Text>
                                </div>
                                <div>
                                    <Typography.Text type="secondary">权限分组</Typography.Text>
                                    <div className="mt-2">
                                        { userInfo.permissionGrouping && Array.isArray(userInfo.permissionGrouping) ?
                                            userInfo.permissionGrouping.map((group, index) => (
                                                <Tag key={ index } color="blue" className="mb-1">
                                                    { group }
                                                </Tag>
                                            ))
                                            : <Tag color="blue">{ userInfo.permissionGrouping }</Tag>
                                        }
                                    </div>
                                </div>
                                <div>
                                    <Typography.Text type="secondary">注册时间</Typography.Text>
                                    <br/>
                                    <Typography.Text>
                                        { new Date(userInfo.createdAt).toLocaleDateString() }
                                    </Typography.Text>
                                </div>
                            </Space>
                        </Card>
                    </Col>

                    {/* Stats Card */ }
                    <Col xs={ 24 } lg={ 8 }>
                        <Card
                            title={
                                <Space>
                                    <CalendarOutlined className="text-green-600"/>
                                    <span>系统统计</span>
                                </Space>
                            }
                            extra={
                                <Button
                                    type="primary"
                                    size="small"
                                    loading={ statsLoading }
                                    onClick={ fetchStats }
                                >
                                    刷新
                                </Button>
                            }
                        >
                            <Space direction="vertical" className="w-full" size="middle">
                                <div>
                                    <Typography.Text type="secondary">总用户数</Typography.Text>
                                    <br/>
                                    <Typography.Text strong className="text-2xl text-blue-600">
                                        { stats?.totalUsers || 0 }
                                    </Typography.Text>
                                </div>
                                <div>
                                    <Typography.Text type="secondary">长期登录用户</Typography.Text>
                                    <br/>
                                    <Typography.Text strong className="text-2xl text-green-600">
                                        { stats?.activeUsers || 0 }
                                    </Typography.Text>
                                </div>
                                <div>
                                    <Typography.Text type="secondary">统计时间</Typography.Text>
                                    <br/>
                                    <Typography.Text>
                                        { stats?.timestamp ? new Date(stats.timestamp).toLocaleString('zh-CN') : '未获取' }
                                    </Typography.Text>
                                </div>
                            </Space>
                        </Card>
                    </Col>

                    {/* Permissions Card */ }
                    <Col xs={ 24 } lg={ 8 }>
                        <Card
                            title={
                                <Space>
                                    <SafetyOutlined className="text-green-600"/>
                                    <span>权限管理</span>
                                </Space>
                            }
                        >
                            <div className="space-y-6">
                                { permissions.map((permission, index) => (
                                    <div key={ index }>
                                        <Typography.Title level={ 5 } className="!mb-3">
                                            页面: { permission.page }
                                        </Typography.Title>
                                        <div className="flex flex-wrap gap-2">
                                            { permission.buttons.map((button, btnIndex) => (
                                                <Button key={ btnIndex } size="small">
                                                    { button.name }
                                                </Button>
                                            )) }
                                        </div>
                                        { index < permissions.length - 1 && <Divider className="my-4"/> }
                                    </div>
                                )) }

                                { permissions.length === 0 && (
                                    <div className="text-center py-8">
                                        <SafetyOutlined className="h-12 w-12 text-gray-300 mx-auto mb-4"/>
                                        <Typography.Text type="secondary">暂无权限信息</Typography.Text>
                                    </div>
                                ) }
        </div>
                        </Card>
                    </Col>
                </Row>

                {/* 用户列表区域 */ }
                <Card
                    title={
                        <Space>
                            <UserOutlined className="text-blue-600"/>
                            <span>用户列表</span>
                        </Space>
                    }
                >
                    {/* 搜索和操作区域 */ }
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <Search
                                placeholder="请输入手机号搜索"
                                allowClear
                                enterButton={ <SearchOutlined/> }
                                size="large"
                                style={ {width: 300} }
                                onSearch={ handleSearch }
                            />
                            <Text type="secondary">
                                共 { pagination.total } 条记录
                            </Text>
                        </div>
                    </div>

                    {/* 用户列表表格 */ }
                    <Table
                        columns={ columns }
                        dataSource={ users }
                        rowKey="id"
                        loading={ loading }
                        pagination={ false }
                        scroll={ {x: 800} }
                    />

                    {/* 分页器 */ }
                    <div className="mt-4 text-center">
                        <Pagination
                            current={ pagination.current }
                            pageSize={ pagination.pageSize }
                            total={ pagination.total }
                            onChange={ handlePageChange }
                            showSizeChanger={ false }
                            showQuickJumper
                            showTotal={ (total, range) =>
                                `第 ${ range[0] }-${ range[1] } 条，共 ${ total } 条`
                            }
                        />
                    </div>
                </Card>
            </main>
    </div>
    )
}

// 使用 withAuth 高阶组件包裹首页，确保只有登录用户才能访问
export default withAuth(HomePage)
