# SIM卡管理后台

基于 **pnpm + Koa + TypeScript + Vue 3**，按 **DDD（领域驱动设计）** 搭建的 SIM 卡管理后台。

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
│   ├── lvyatech/           # 绿芽开发板推送协议（解析 + 模板展开）
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

## 绿芽开发板推送（lvyatech）

基于 `docs/lvyatech` 文档，将开发板推送能力封装为独立包 `packages/lvyatech`，并在 server 中接入：

- **packages/lvyatech**：解析 HTTP Form/JSON、TCP 报文；消息结构 `devId`、`type` 及系统/用户参数；模板展开 `{{系统参数}}`、`{{{用户参数}}}`；消息类型与分类映射（device-status / call / sms / other）。
- **server 接入**（开发板与管理后台分离）：
  - **开发板调用**（无鉴权）`/api/lvyatech`：
    - `POST /api/lvyatech/push`：推送入口，支持 Form/JSON，按消息 type 写入对应分类的当日 JSONL
    - `POST /api/lvyatech/expand`：测试用模板展开
  - **管理后台调用**（需登录）`/api/admin/lvyatech`：
    - `GET /api/admin/lvyatech/categories`：推送消息分类列表（供筛选）
    - `GET /api/admin/lvyatech/messages`：查询推送消息，参数 `category`、`devId`、`type`、`from`、`to`、`limit`
    - `GET /api/admin/lvyatech/settings`：获取保留天数
    - `PUT /api/admin/lvyatech/settings`：设置保留天数
    - `POST /api/admin/lvyatech/control`：向开发板下发控制指令（代理到设备 `/ctrl`），body 仅需 `{ cmd, ...params }`；设备地址与 token 由 `data/config.json`（`lvyatech_deviceUrl`、`lvyatech_token`）或环境变量 `LVYATECH_DEVICE_URL`、`LVYATECH_DEVICE_TOKEN` 提供。

推送消息按分类按日存储为 `data/push-messages/{category}/YYYY-MM-DD.jsonl`（category：device-status / call / sms / other），保留天数等配置在 `data/config.json`（`push_retainDays`）或后台设置。控制指令格式见 `docs/lvyatech/控制指令`。下发控制指令前请编辑 `packages/server/data/config.json` 填写 `lvyatech_deviceUrl` 与 `lvyatech_token`（或配置上述环境变量）。
