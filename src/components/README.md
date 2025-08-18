# withAuth 高阶组件

`withAuth` 是一个用于保护需要登录才能访问的页面的高阶组件（HOC）。

## 功能特性

- ✅ **自动认证检查**: 自动检查用户是否已登录
- ✅ **自动重定向**: 未登录用户自动重定向到登录页
- ✅ **加载状态**: 可配置的加载状态显示
- ✅ **自定义配置**: 支持自定义重定向路径、提示消息等
- ✅ **TypeScript 支持**: 完整的类型定义
- ✅ **响应式设计**: 美观的加载界面

## 基本用法

### 1. 基本使用

```tsx
import { withAuth } from '@/components/withAuth'

function HomePage() {
  return <div>这是受保护的首页</div>
}

// 使用 withAuth 包裹组件
export default withAuth(HomePage)
```

### 2. 自定义配置

```tsx
export default withAuth(HomePage, {
  redirectTo: '/auth/login',        // 自定义重定向路径
  authMessage: '请先登录系统',       // 自定义提示消息
  showLoading: true,                // 显示加载状态
  LoadingComponent: CustomLoading   // 自定义加载组件
})
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `redirectTo` | `string` | `'/login'` | 认证失败时的重定向路径 |
| `LoadingComponent` | `React.ComponentType` | `undefined` | 自定义加载组件 |
| `authMessage` | `string` | `'请先登录'` | 认证失败时的提示消息 |
| `showLoading` | `boolean` | `true` | 是否显示加载状态 |

## 使用场景

### 1. 保护首页

```tsx
// src/app/page.tsx
function HomePage() {
  // 页面逻辑...
}

export default withAuth(HomePage)
```

### 2. 保护用户管理页面

```tsx
// src/app/admin/users/page.tsx
function UserManagementPage() {
  // 用户管理逻辑...
}

export default withAuth(UserManagementPage, {
  authMessage: '请先登录管理员账号'
})
```

### 3. 保护设置页面

```tsx
// src/app/settings/page.tsx
function SettingsPage() {
  // 设置页面逻辑...
}

export default withAuth(SettingsPage, {
  redirectTo: '/login',
  authMessage: '请先登录以访问设置页面'
})
```

### 4. 自定义加载组件

```tsx
function CustomLoading() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-bounce text-4xl mb-4">🚀</div>
        <p className="text-blue-600">正在验证身份...</p>
      </div>
    </div>
  )
}

export default withAuth(HomePage, {
  LoadingComponent: CustomLoading
})
```

### 5. 不显示加载状态

```tsx
export default withAuth(HomePage, {
  showLoading: false
})
```

## 工作原理

1. **组件挂载**: 高阶组件挂载时自动检查认证状态
2. **Token 检查**: 检查 localStorage 中是否存在 accessToken
3. **状态管理**: 管理认证状态和加载状态
4. **自动重定向**: 未认证用户自动重定向到指定页面
5. **渲染组件**: 认证通过后渲染被包裹的组件

## 注意事项

1. **依赖项**: 需要确保 `@/utils/token` 中的 `getAccessToken` 函数可用
2. **路由**: 需要确保重定向路径存在且可访问
3. **状态管理**: 组件内部状态由高阶组件管理，被包裹组件无需关心认证逻辑
4. **性能**: 每次路由变化都会重新检查认证状态

## 最佳实践

1. **统一使用**: 在所有需要保护的页面中统一使用 `withAuth`
2. **合理配置**: 根据页面特点合理配置重定向路径和提示消息
3. **加载状态**: 为重要页面提供自定义加载组件，提升用户体验
4. **错误处理**: 结合全局错误处理，提供更好的用户体验

## 示例文件

查看 `/src/app/page.tsx` 文件获取更多使用示例。
