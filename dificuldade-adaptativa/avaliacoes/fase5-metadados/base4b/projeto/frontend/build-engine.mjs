import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('.', import.meta.url));
const modulePath = process.env.GABARITEI_ESBUILD_MODULE;
const esbuild = modulePath ? await import(pathToFileURL(modulePath).href) : await import('esbuild');
await esbuild.build({
  entryPoints: [resolve(root, 'learning-engine.ts')],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  alias: { '@': resolve(root, 'legacy/src') },
  outfile: resolve(root, 'assets/learning-engine.js'),
  logLevel: 'info'
});
