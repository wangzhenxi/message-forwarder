# 外部接口对接说明

本服务通过 `server` 的 `ExternalApiClient` 与路由 `/api/external/*` 对接外部 HTTP 接口。

## 配置

- 环境变量 **`API_BASE_URL`**：外部接口基础地址。
- 在项目根目录或 `server` 目录下可建 `.env`，例如：
  ```env
  API_BASE_URL=https://api.example.com
  PORT=3000
  ```

## 接口列表（示例）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | /api/example/list   | 示例：获取列表 |
| POST | /api/example/submit | 示例：提交 |

在 `packages/server/src/infrastructure/http/routes/external-routes.ts` 中补充具体路径与 DTO，在 `external-api-client.ts` 中可增加带类型的封装方法。
