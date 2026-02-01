#!/bin/sh
set -e
# 后台启动 Node（仅 API，不托管静态）
node /app/packages/server/dist/index.js &
# 前台运行 Nginx（PID 1，接管信号）
exec nginx -g "daemon off;"
