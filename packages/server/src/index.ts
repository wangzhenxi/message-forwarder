import path from 'path';
import { config as loadEnv } from 'dotenv';

// 加载 .env：优先当前工作目录，再试 monorepo 根目录（pnpm dev 时 cwd 常为 packages/server）
loadEnv({ path: path.resolve(process.cwd(), '.env') });
loadEnv({ path: path.resolve(process.cwd(), '..', '.env') });
loadEnv({ path: path.resolve(process.cwd(), '..', '..', '.env') });

import { createApp } from './infrastructure/http/app';
import { config } from './config';

const app = createApp();
app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
