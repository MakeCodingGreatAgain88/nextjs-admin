import { to } from 'await-to-js'
import { NextRequest } from 'next/server'
import * as userDB from '@/lib/db/user'
import * as authDB from '@/lib/db/auth'
import * as permissionDB from '@/lib/db/permission'
import { generateJWT, generateRefreshToken, verifyJWT } from '@/utils/jwt'
import { UserRegisterParams, UserLoginParams } from '@/lib/schemas/user'

/**
 * 生成密码哈希 (使用 Web Crypto API)
 */
async function generatePasswordHash(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
}

/**
 * 根据手机号获取用户信息
 */
export async function getUserByPhone(phone: string) {
    return await userDB.findByPhone(phone)
}

/**
 * 用户注册业务服务
 */
export async function userRegister(params: UserRegisterParams) {
    const {phone, password, smsCode} = params

    const hashedPassword = await generatePasswordHash(password)
    const [ createUserError, userId ] = await to(userDB.createUser({
        phone,
        password: hashedPassword,
        permissionGrouping: 'user' // 默认权限组
    }))

    if (createUserError) {
        console.error('Create user error:', createUserError)
        throw new Error(`创建用户失败: ${ createUserError.message }`)
    }

    if (!userId) {
        throw new Error('用户创建失败')
    }

    return true
}

/**
 * 用户登录业务服务
 */
export async function userLogin(params: UserLoginParams) {
    console.log('userLogin service -----> :', params)
    const {phone, password} = params

    // 1. 查找用户
    const [ findUserError, user ] = await to(userDB.findByPhone(phone))
    if (findUserError) {
        console.error('Find user error:', findUserError)
        throw new Error(`查询用户失败: ${ findUserError.message }`)
    }

    if (!user) {
        throw new Error('用户不存在')
    }

    // 2. 验证密码
    const hashedPassword = await generatePasswordHash(password)
    if (user.password !== hashedPassword) {
        throw new Error('密码错误')
    }

    // 3. 生成 JWT token
    const [ jwtError, accessToken ] = await to(generateJWT({userId: user.id, clientAccessIp: '127.0.0.1'}))
    if (jwtError) {
        console.error('Generate JWT error:', jwtError)
        throw new Error(`生成JWT失败: ${ jwtError.message }`)
    }

    const [ refreshTokenError, refreshToken ] = await to(generateRefreshToken(user.id))
    if (refreshTokenError) {
        console.error('Generate refresh token error:', refreshTokenError)
        throw new Error(`生成刷新Token失败: ${ refreshTokenError.message }`)
    }

    // 4. 存储 refresh token
    const [ storeTokenError ] = await to(authDB.storeRefreshToken(user.id, 7 * 24 * 60 * 60))
    if (storeTokenError) {
        console.error('Store refresh token error:', storeTokenError)
        throw new Error(`存储刷新Token失败: ${ storeTokenError.message }`)
    }

    return accessToken
}

/**
 * 获取用户信息业务服务
 */
export async function getUserInfo(request: NextRequest) {
    const Authorization = request.headers.get('Authorization')
    if (!Authorization) {
        throw new Error('Authorization 为必填项')
    }
    const accessToken = Authorization.replace('Bearer ', '')

    // 1. 解析accessToken中userid
    const [ verifyError, payload ] = await to(verifyJWT(accessToken))
    if (verifyError) {
        throw new Error('Access token 验证失败: ' + verifyError.message)
    }
    if (!payload) {
        throw new Error('Access token 无效')
    }

    // 2. 通过userid查询user信息
    const [ findUserError, user ] = await to(userDB.findById((payload as any).userId))
    if (findUserError) {
        throw new Error('查询用户失败: ' + findUserError.message)
    }
    if (!user) {
        throw new Error('用户不存在')
    }

    // 3. 通过user信息中的permissionGrouping关联查询权限表的数据
    // const permissionCodes = JSON.parse(user.permissionGrouping || '[]')
    // const [findPermissionsError, permissions] = await to(permissionDB.findByCodes(permissionCodes))
    // if (findPermissionsError) {
    //   throw new Error('查询权限失败: ' + findPermissionsError.message)
    // }

    // 4. 构建权限数据结构
    // const userPermissions = buildUserPermissions(permissions as any[] || [])

    return {
        id: user.id,
        phone: user.phone,
        // permissionGrouping: user.permissionGrouping,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
        // permissions: userPermissions
    }
}

/**
 * 获取用户列表业务服务
 */
export async function getUserList(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const phone = searchParams.get('phone') || ''

    // 调用数据库服务获取用户列表
    const [findUsersError, result] = await to(userDB.findUsers({
        page,
        pageSize,
        phone
    }))
    
    if (findUsersError) {
        throw new Error('查询用户列表失败: ' + findUsersError.message)
    }

    return result
}

/**
 * 构建用户权限数据结构
 */
function buildUserPermissions(permissions: any[]): any[] {
    const pageMap = new Map<string, any[]>()

    permissions.forEach(permission => {
        if (permission.page) {
            if (!pageMap.has(permission.page)) {
                pageMap.set(permission.page, [])
            }
            pageMap.get(permission.page)!.push({
                name: permission.name,
                action: permission.action || permission.code
            })
        }
    })

    return Array.from(pageMap.entries()).map(([ page, buttons ]) => ({
        page,
        buttons
    }))
}
