import { build } from 'esbuild';

await build({
  entryPoints: ['packages/simulation-engine/src/index.ts'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  outfile: 'hosting/simulation-engine.browser.js',
  sourcemap: false,
});
