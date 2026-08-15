const fs = require('fs');
const path = require('path');

const dist = path.resolve(__dirname, '../dist');
const from = path.join(dist, 'index.html');
const to = path.join(dist, '404.html');

if (!fs.existsSync(from)) {
  console.error('build output not found:', from);
  process.exit(1);
}

try {
  fs.copyFileSync(from, to);
  console.log('copied index.html -> 404.html');
} catch (err) {
  console.error('failed to copy index.html to 404.html', err);
  process.exit(1);
}
