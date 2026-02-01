import path from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { config as loadEnv } from 'dotenv';

// 若无 .env 则从 .env.example 初始化（在 monorepo 根或当前目录查找）
function ensureEnvFile(): void {
  const cwd = process.cwd();
  const candidates = [cwd, path.resolve(cwd, '..'), path.resolve(cwd, '..', '..')];
  for (const root of candidates) {
    const envPath = path.join(root, '.env');
    const examplePath = path.join(root, '.env.example');
    if (!existsSync(envPath) && existsSync(examplePath)) {
      writeFileSync(envPath, readFileSync(examplePath, 'utf8'), 'utf8');
      console.log(`已根据 .env.example 初始化 ${envPath}`);
      break;
    }
  }
}
ensureEnvFile();

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
