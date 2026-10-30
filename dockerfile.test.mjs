import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// The image copies server files one by one, so a new module that is not added to the Dockerfile
// passes every test and then fails at startup in the container. Walk every relative import
// reachable from server.mjs, and every file it loads by URL, and check the Dockerfile copies it.
const root = dirname(fileURLToPath(import.meta.url));

function copiedPaths() {
  const text = readFileSync(join(root, 'Dockerfile'), 'utf8').replace(/\\\r?\n/g, ' ');
  return text.split(/\r?\n/)
    .filter((line) => /^\s*COPY\s/.test(line) && !/--from=/.test(line))
    .flatMap((line) => line.trim().split(/\s+/).slice(1, -1));
}

function reachableModules(entry) {
  const seen = new Set();
  const pending = [entry];
  const patterns = [/from\s+'(\.[^']+)'/g, /import\(\s*'(\.[^']+)'\s*\)/g, /new URL\(\s*'(\.[^']+)',\s*import\.meta\.url\s*\)/g];
  while (pending.length) {
    const file = pending.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    if (!/\.m?js$/.test(file) || !existsSync(join(root, file))) continue;
    const source = readFileSync(join(root, file), 'utf8');
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        pending.push(relative(root, normalize(join(root, dirname(file), match[1]))));
      }
    }
  }
  return [...seen];
}

test('the Dockerfile copies every file the server loads', () => {
  const copied = copiedPaths();
  const glob = (path) => new RegExp(`^${path.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')}$`);
  const covered = (file) => copied.some((path) => glob(path).test(file) || file.startsWith(`${path.replace(/\/$/, '')}/`));
  const modules = reachableModules('server.mjs');
  assert.ok(modules.includes('postgres-worker.mjs'), 'the walk follows worker URLs');
  for (const file of modules) assert.ok(existsSync(join(root, file)), `${file} is imported but missing`);
  assert.deepEqual(modules.filter((file) => !covered(file)), []);
});
