// Static files used by the receipt. esbuild inlines them into the function bundle (loader: binary);
// in plain Node (tests, re-issue tool) they are read from disk.
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', '_assets');
const read = name => fs.readFileSync(path.join(dir, name));
module.exports = {
  noto400: read('noto-400.woff'),
  noto700: read('noto-700.woff'),
  notoExt400: read('noto-ext-400.woff'),
  notoExt700: read('noto-ext-700.woff'),
  logo: read('logo-light.png'),
  signature: read('signature-stamp.png'),
  mailStrings: JSON.parse(read('receipt-mail-strings.json').toString('utf8')).strings,
};
