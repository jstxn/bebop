const fs = require('fs');
const path = require('path');

const cliPath = path.join(__dirname, '..', 'dist', 'cli.js');
if (!fs.existsSync(cliPath)) {
  process.exit(0);
}

let content = fs.readFileSync(cliPath, 'utf8');
if (!content.startsWith('#!/usr/bin/env node')) {
  content = `#!/usr/bin/env node\n${content}`;
  fs.writeFileSync(cliPath, content, 'utf8');
}

try {
  fs.chmodSync(cliPath, 0o755);
} catch {
  // ignore chmod errors on systems that don't support it
}
