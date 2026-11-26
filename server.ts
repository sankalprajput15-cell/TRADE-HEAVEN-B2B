import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const distServerPath = path.join(process.cwd(), 'dist', 'server.cjs');
const isTsxRuntime =
  process.execArgv.some((arg) => arg.includes('tsx')) ||
  process.env.npm_lifecycle_event === 'dev';

function isCompiledServerFresh(): boolean {
  try {
    if (!fs.existsSync(distServerPath)) return false;
    const distMtime = fs.statSync(distServerPath).mtimeMs;
    const sourceDeps = [
      path.join(process.cwd(), 'serverApp.ts'),
      path.join(process.cwd(), 'src', 'services', 'smtpService.ts'),
      path.join(process.cwd(), 'src', 'services', 'tradeHeavenMediatorEngine.ts')
    ];
    for (const dep of sourceDeps) {
      if (fs.existsSync(dep) && fs.statSync(dep).mtimeMs > distMtime) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

async function bootstrapServer() {
  // In dev / tsx mode, always boot serverApp.ts directly to mount live Vite middlewares
  if (isTsxRuntime || process.env.NODE_ENV === 'development') {
    await import('./serverApp.ts');
    return;
  }

  if (isCompiledServerFresh()) {
    require(distServerPath);
    return;
  }

  if (fs.existsSync(distServerPath)) {
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
