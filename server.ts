import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const distServerPath = path.join(process.cwd(), 'dist', 'server.cjs');
const isTsxRuntime =
  process.execArgv.some((arg) => arg.includes('tsx')) ||
  process.env.npm_lifecycle_event === 'dev';

async function bootstrapServer() {
  if (!isTsxRuntime && fs.existsSync(distServerPath)) {
    require(distServerPath);
    return;
  }

  if (!isTsxRuntime) {
    try {
      const tsxApi = await import('tsx/esm/api');
      tsxApi.register();
    } catch (err) {
      console.warn('[Server Bootstrap] tsx/esm/api unavailable, attempting compiled fallback:', err);
      if (fs.existsSync(distServerPath)) {
        require(distServerPath);
        return;
      }
    }
  }

  await import('./serverApp.ts');
}

bootstrapServer().catch((err) => {
  console.error('[Server Bootstrap Error]', err);
  process.exit(1);
});
