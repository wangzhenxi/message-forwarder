# 构建
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY . .
RUN pnpm install --frozen-lockfile && pnpm build && pnpm prune --prod

# 运行：Nginx 托管前端并反代 /api，Node 仅 API
FROM node:22-alpine AS runner
RUN apk add --no-cache nginx
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app .
COPY docker/ /app/docker/
RUN cp -r /app/packages/web/dist/. /usr/share/nginx/html/ && \
    cp /app/docker/nginx/default.conf /etc/nginx/conf.d/default.conf && \
    chmod +x /app/docker/start.sh && \
    mkdir -p packages/server/data/push-messages/device-status \
      packages/server/data/push-messages/call \
      packages/server/data/push-messages/sms \
      packages/server/data/push-messages/other \
      packages/server/data/push-messages/raw
EXPOSE 80
CMD ["/app/docker/start.sh"]
