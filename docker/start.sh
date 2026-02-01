#!/bin/sh
set -e
# 挂载卷里没有 config.json / users.json 时，从镜像内 server/data 拷过去
DATA=/app/packages/server/data
for f in config.json users.json; do
  if [ ! -f "$DATA/$f" ]; then
    cp "/app/default-data/$f" "$DATA/$f"
  fi
done
# 后台启动 Node（仅 API，不托管静态）
node /app/packages/server/dist/index.js &
# 前台运行 Nginx（PID 1，接管信号）
exec nginx -g "daemon off;"
