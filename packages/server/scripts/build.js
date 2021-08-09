// @ts-check
const esbuild = require('esbuild');
const pkg = require('../package.json');

const isProd = process.env.NODE_ENV === 'production';

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    platform: 'node',
    external: Object.keys(pkg.dependencies),
    bundle: true,
    outdir: 'build',
    watch: !isProd,
    minify: isProd,
    sourcemap: 'inline',
    target: 'node12',
  })
  .catch(() => process.exit(1));
