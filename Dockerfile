# 默认国内源；CI 可传 --build-arg NODE_IMAGE=node:22-alpine
ARG NODE_IMAGE=docker.m.daocloud.io/library/node:22-alpine

FROM ${NODE_IMAGE} AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY . .
RUN pnpm install --frozen-lockfile && pnpm build && pnpm prune --prod

FROM ${NODE_IMAGE} AS runner
RUN apk add --no-cache nginx
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app .
# 挂载卷内无 config/users 时，start.sh 从此处复制（内容来自 server/data）
COPY --from=builder /app/packages/server/data/config.json /app/packages/server/data/users.json /app/default-data/
RUN mkdir -p /etc/nginx/http.d \
  && cp -r /app/packages/web/dist/. /usr/share/nginx/html/ \
  && cp /app/docker/nginx/default.conf /etc/nginx/http.d/default.conf \
  && chmod +x /app/docker/start.sh \
  && mkdir -p packages/server/data/push-messages/device-status packages/server/data/push-messages/call packages/server/data/push-messages/sms packages/server/data/push-messages/other packages/server/data/push-messages/raw
EXPOSE 80
CMD ["/app/docker/start.sh"]
