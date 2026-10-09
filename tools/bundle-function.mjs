// Bundles one API function and its dependencies into a single CommonJS file for the Build Output API.
// Static receipt files (fonts, images, translated mail text) are inlined from api/_receipt/assets.js.
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Dependencies are resolved from this repository's node_modules, even when `root` is a copy.
const TOOL_MODULES = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'node_modules');

export async function bundleFunction({ root, source, outfile }) {
  const require = createRequire(path.join(root, 'package.json'));
  const assetsPath = path.join(root, 'api/_receipt/assets.js');
  const inlineAssets = {
    name: 'inline-receipt-assets',
    setup(b) {
      b.onLoad({ filter: /api[\\/]_receipt[\\/]assets\.js$/ }, () => {
        const real = require(assetsPath);
        const lines = Object.entries(real).map(([k, v]) => Buffer.isBuffer(v) ? `${k}: Buffer.from(${JSON.stringify(v.toString('base64'))}, 'base64')` : `${k}: ${JSON.stringify(v)}`);
        return { contents: `module.exports = { ${lines.join(',\n')} };`, loader: 'js' };
      });
    },
  };
  await build({ entryPoints: [path.join(root, source)], outfile, bundle: true, nodePaths: [TOOL_MODULES], platform: 'node', target: 'node22', format: 'cjs', plugins: [inlineAssets], logLevel: 'error', legalComments: 'none' });
}
