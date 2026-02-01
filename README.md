# 简易管理后台

基于 **pnpm + Koa + TypeScript + Vue 3**，按 **DDD（领域驱动设计）** 搭建的简易管理后台。

## 技术栈

- **包管理**: pnpm workspace 单体仓库
- **后端**: Koa + TypeScript，DDD 分层（domain / application / infrastructure）
- **前端**: Vue 3 + Vite + Vue Router + Pinia + TypeScript

## 项目结构

```
message-forwarder/
├── packages/
│   ├── server/             # 后端 (Koa + TS, DDD)
│   │   └── src/
│   │       ├── domain/         # 领域层：实体、仓储接口
│   │       │   └── user/
│   │       ├── application/    # 应用层：DTO、应用服务
│   │       │   └── user/
│   │       ├── infrastructure/ # 基础设施层：仓储实现、HTTP、中间件
│   │       │   ├── persistence/
│   │       │   └── http/
│   │       └── index.ts
│   └── web/                # 前端 (Vue 3 + Vite)
│       └── src/
│           ├── api/            # 请求封装
│           ├── layouts/        # 布局
│           ├── router/         # 路由与鉴权
│           ├── stores/         # Pinia 状态
│           └── views/          # 页面
├── pnpm-workspace.yaml
└── package.json
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 同时启动后端 + 前端（推荐）
pnpm dev

# 或分别启动
pnpm dev:server   # 后端 http://localhost:3000
pnpm dev:web      # 前端 http://localhost:5173，代理 /api -> 3000
```

## 用户数据

无默认用户。首次启动后用户数据文件为 `packages/server/data/users.json`（空数组）。可手动编辑该文件添加用户，格式示例：

```json
[
  { "id": "1", "username": "admin", "passwordHash": "admin123", "nickname": "管理员", "role": "admin", "createdAt": "2024-01-01T00:00:00.000Z" }
]
```

用户列表等接口需登录后访问（请求头带 `Authorization: Bearer <token>`）。

## 后端 DDD 说明

- **领域层**：定义 `User` 实体与 `IUserRepository` 接口，不依赖框架。
- **应用层**：`UserApplicationService` 编排登录、列表等用例，入参/出参为 DTO。
- **基础设施层**：实现 `FileUserRepository`（本地 JSON 文件持久化）、Koa 路由与认证中间件，在 `app.ts` 中组装并注入应用服务。

后续可替换为真实数据库仓储、增加更多领域与接口。
