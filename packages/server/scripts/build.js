// @ts-check
const esbuild = require('esbuild');
const pkg = require('../package.json');
const dotenv = require('dotenv-flow');

dotenv.config();

/** @type {Record<string, string>} */
const define = {};

for (const [name, value] of Object.entries(process.env)) {
  if (name.includes('(') || name.includes(')')) continue;

  define[`process.env.${name}`] = JSON.stringify(value);
}

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    platform: 'node',
    external: [
      ...Object.keys(pkg.dependencies),
      ...Object.keys(pkg.devDependencies),
    ],
    bundle: true,
    outdir: 'build',
    watch: true,
    minify: true,
    define,
  })
  .catch(() => process.exit(1));
