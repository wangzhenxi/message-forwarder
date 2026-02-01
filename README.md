# message-forwarder

绿芽开发板推送消息接收与管理后台：接收设备推送、按分类存储与查询、向设备下发控制指令；带用户登录与 DDD 分层后端、Vue 3 管理界面。

## 功能

- **推送接入**：接收绿芽开发板 HTTP 推送（Form/JSON），按消息类型写入当日 JSONL（device-status / call / sms / other）
- **消息管理**：按分类、设备、时间筛选查询；可配置保留天数与定时清理
- **控制指令**：登录后向设备代理下发控制指令（通话、短信、WiFi、重启等），详见 `docs/lvyatech/控制指令`
- **用户与鉴权**：用户列表、登录态（Token），管理端接口需登录后访问

## 技术栈

| 层级     | 技术 |
|----------|------|
| 包管理   | pnpm workspace 单体仓库 |
| 后端     | Koa + TypeScript，DDD（domain / application / infrastructure） |
| 前端     | Vue 3 + Vite + Vue Router + Pinia + TypeScript |
| 协议解析 | `packages/lvyatech`：推送解析、模板展开、消息分类 |
| 生产部署 | Docker 单镜像：Nginx 托管前端并反代 `/api`，Node 仅 API |

## 环境要求

- **Node** ≥ 22（推荐 [nvm](https://github.com/nvm-sh/nvm) / [fnm](https://github.com/Schniz/fnm)，根目录有 `.nvmrc`）
- **pnpm** ≥ 9（`corepack enable` 后使用根目录 `packageManager` 版本）

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发：后端 3000 + 前端 5173（前端代理 /api -> 3000）
pnpm dev
```

- 后端：<http://localhost:3000>
- 前端：<http://localhost:5173>
- 单独启动：`pnpm dev:server` / `pnpm dev:web`

## 构建与运行

```bash
# 全量构建
pnpm build

# 生产运行（需先构建）
pnpm --filter @message-forwarder/server start
```

前端构建产物需由 Nginx 等托管并反代 `/api`，或使用下方 Docker 方式。

## Docker

单镜像：Nginx 托管前端并反代 `/api`，Node 仅提供 API。端口映射 `-p 8080:80`（本机 8080 访问）；网络默认 `bridge`，Linux 下需访问宿主机同网段设备时可使用 `--network host`。

- 默认使用国内镜像源（DaoCloud）拉取 `node:22-alpine`，避免直连 Docker Hub 失败。
- 若本机可访问 Docker Hub 且希望用官方源，可传：`docker build --build-arg NODE_IMAGE=node:22-alpine -t message-forwarder .`

```bash
docker build -t message-forwarder .
docker run -d -p 8080:80 --network bridge \
  -v /path/to/data:/app/packages/server/data \
  -e LVYATECH_DEVICE_URL=http://设备地址/ \
  -e LVYATECH_DEVICE_TOKEN=你的Token \
  --name message-forwarder message-forwarder
```

本地按 `.env` 传入环境变量时可使用 `--env-file .env`。

推送到 `main` 或打 `v*` 标签后，[GitHub Actions](.github/workflows/docker-publish.yml) 会自动构建并发布到 [GitHub Container Registry](https://docs.github.com/zh/packages/working-with-a-github-packages-registry/working-with-the-container-registry)，拉取示例（将 `OWNER/REPO` 换成本仓库）：`docker pull ghcr.io/OWNER/REPO:latest`。

- 不挂载 `data` 时，用户与推送数据仅在容器内，删除容器即丢失
- 环境变量见 [配置](#配置)，可用 `-e` 传入

## 配置

复制 `.env.example` 为 `.env` 后按需修改；或通过环境变量覆盖。

| 变量 | 说明 | 默认 |
|------|------|------|
| `PORT` | 服务端口 | 3000 |
| `DATA_CONFIG_PATH` | 统一配置（push_*、lvyatech_*） | server/data/config.json |
| `USER_DATA_FILE` | 用户数据文件 | server/data/users.json |
| `PUSH_MESSAGE_DATA_DIR` | 推送按日存储目录 | server/data/push-messages |
| `PUSH_MESSAGE_RETAIN_DAYS` | 推送保留天数 | 7 |
| `PUSH_MESSAGE_CLEANUP_ENABLED` | 是否定时清理 | false |
| `LVYATECH_DEVICE_URL` / `LVYATECH_DEVICE_TOKEN` | 控制指令设备地址与 Token | 可写在 data/config.json |

## 用户与鉴权

- 无默认用户；首次运行后 `packages/server/data/users.json` 为空数组，可手动按示例格式添加用户
- 管理端接口需在请求头携带 `Authorization: Bearer <token>`（登录接口返回 token）

## 项目结构

```
message-forwarder/
├── packages/
│   ├── server/          # 后端：Koa + DDD
│   │   └── src/
│   │       ├── domain/        # 实体、仓储接口
│   │       ├── application/  # 应用服务、DTO
│   │       └── infrastructure/  # 持久化、HTTP、鉴权
│   ├── lvyatech/        # 绿芽推送解析、模板展开、分类
│   └── web/             # 前端：Vue 3 + Vite
├── docker/               # Nginx 配置与容器启动脚本
├── docs/lvyatech/        # 绿芽协议、控制指令、推送消息说明
├── pnpm-workspace.yaml
└── package.json
```

## 绿芽接入说明

- **开发板推送**（无鉴权）：`POST /api/lvyatech/push`、`POST /api/lvyatech/expand`
- **管理端**（需登录）：`/api/admin/lvyatech` 下 categories、messages、settings、control 等
- 推送按日存储：`data/push-messages/{category}/YYYY-MM-DD.jsonl`
- 协议与控制指令详见：`docs/lvyatech/`（推送消息、控制指令、设备管理后台等）

## License

[MIT](LICENSE)。使用、修改与再分发须保留版权与许可声明。

## 免责声明

本项目仅供学习与参考。若您认为本仓库中的任何内容侵犯您的知识产权或其他权益，请通过仓库 Issue 或与维护者联系，我们将在核实后及时删除相关内容。
