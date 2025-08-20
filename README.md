# NextJs 用户管理系统

这是一个基于 Next.js 和 Cloudflare 的用户管理系统，采用 CMS 架构设计。
- [线上部署地址](https://nextjs.uuuui.com)
- [架构文档](https://freezing-shock-fea.notion.site/24fa16bc331a80858079dbbb0c34be8c)

## 功能特性

### 后端 API
- **用户注册**: Turnstile验证 → 手机号验证 → 短信验证码验证 → 密码加密存储
- **短信验证码**: 手机号验证 → IP限制 → 手机号限制 → 时间间隔限制
- **用户登录**: Turnstile验证 → 用户认证 → JWT Token生成
- **获取用户信息**: Token验证 → 用户信息查询 → 权限数据返回
- **Token刷新**: 自动Token刷新机制

### 前端功能
- **登录/注册页面**: 响应式设计，支持手机号+密码登录
- **权限管理**: 基于权限码的按钮级权限控制
- **Token管理**: 自动Token刷新，请求队列管理
- **路由保护**: 基于权限的页面访问控制

### 安全特性
- Turnstile 人机验证
- JWT Token 认证
- IP地址验证
- 密码MD5加密
- 短信验证码限制
- 请求频率限制

## 技术栈

- **前端**: Next.js 15, React 19, antd UI, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Cloudflare D1 (SQLite)
- **缓存数据库**: Cloudflare KV 
- **存储**: Cloudflare R2
- **认证**: JWT, Turnstile
- **部署**: Cloudflare Pages

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── auth/          # 认证相关API
│   │   ├── user/          # 用户相关API
│   │   └── sms/           # 短信相关API
│   ├── login/             # 登录页面
│   ├── register/          # 注册页面
│   └── page.tsx           # 主页面
├── components/             # React组件
├── lib/                    # 工具库
├── middleware/             # 中间件
├── types/                  # TypeScript类型定义
└── utils/                  # 工具函数
```

## 安装和运行

### 1. 安装依赖
```bash
npm install
```


## 🚀 部署

### 1. 构建项目
```bash
npm run build
```

### 2. 部署到 Cloudflare Pages
```bash
npm run deploy
```


## 中间件

### Turnstile验证中间件
- 验证Cloudflare Turnstile token
- 支持开发模式跳过验证

### JWT认证中间件
- 验证Access Token
- IP地址验证
- Token过期检查

### 验证中间件
- 手机号格式验证
- 密码强度验证
- 短信验证码验证

## 🔗 相关链接

- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Next.js 文档](https://nextjs.org/docs)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)

## 许可证

MIT License


### 生成 D1 数据库
```shell
npx drizzle-kit generate
```

### 应用 D1 数据库 
```shell
npx wrangler d1 migrations apply NEXTJS_DEMO_D1_DB
```

### 上传/应用到线上 D1
```shell
npx wrangler d1 migrations apply NEXTJS_DEMO_D1_DB --remote
```

### 重置本地 D1 数据库（注意：这会清空本地数据！运行失败手动删除/.wrangler/state/v3/d1）
```shell
npx wrangler d1 migrations reset NEXTJS_DEMO_D1_DB
```