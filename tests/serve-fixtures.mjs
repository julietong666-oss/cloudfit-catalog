// Local test harness: fixtures never enter catalog/products.json.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { products } from './fixtures.mjs';
const root = resolve(import.meta.dirname, '..');
createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/catalog/data.mjs') {
    res.writeHead(200, {'Content-Type': 'text/javascript', 'Cache-Control': 'no-store'});
    res.end(`import {validateCatalog} from './logic.mjs';
      export async function loadProducts() {
        const response = await fetch('/catalog/products.json');
        if (!response.ok) throw new Error('Vui lòng thử tải lại danh mục.');
        return validateCatalog(await response.json());
      }
      export async function loadDemoCustomers() { return []; }
    `);
    return;
  }
  if (url.pathname === '/catalog/products.json') {
    let mode = 'products';
    try { mode = (await readFile(new URL('./.test-mode', import.meta.url), 'utf8')).trim(); } catch {}
    res.writeHead(mode === 'error' ? 500 : 200, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
    res.end(JSON.stringify(mode === 'empty' ? [] : mode === 'invalid' ? [{...products[0], needTags: []}] : products)); return;
  }
  try {
    const path = resolve(root, '.' + (url.pathname === '/' ? '/code.html' : url.pathname));
    if (!path.startsWith(root + '/')) { res.writeHead(403).end(); return; }
    const body = await readFile(path);
    res.writeHead(200, {'Content-Type': {'.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css'}[extname(path)] || 'text/plain'});
    res.end(body);
  } catch { res.writeHead(404).end(); }
}).listen(4174, '127.0.0.1', () => console.log('TEST FIXTURES ONLY: http://127.0.0.1:4174'));
