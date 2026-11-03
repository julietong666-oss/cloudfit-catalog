import { copyFile, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
// Publish an explicit app-only set. Documents, tests, SQL and backups stay out.
const assets = [
  'catalog/app.mjs',
  'catalog/chat.mjs',
  'catalog/chat-order.mjs',
  'catalog/demo-payment-qr.svg',
  'catalog/chat-ui.mjs',
  'catalog/chat.css',
  'catalog/design-ui.mjs',
  'catalog/purchase.mjs',
  'catalog/auth.mjs',
  'catalog/auth-ui.mjs',
  'catalog/catalog.css',
  'catalog/data.mjs',
  'catalog/logic.mjs',
  'catalog/supabase-config.mjs',
  'catalog/vendor/supabase-2.118.0.js',
  'catalog/vendor/supabase-LICENSE',
];
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const path of assets) {
  const destination = resolve(output, path);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(resolve(root, path), destination);
}
await copyFile(resolve(root, 'code.html'), resolve(output, 'index.html'));
await copyFile(resolve(root, 'code.html'), resolve(output, 'code.html'));
console.log(`Static build ready: dist/ (${assets.length + 2} files)`);
