import { createServer } from 'node:http';
import { createReadStream, statSync, watch } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.wasm': 'application/wasm'
};

const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || '127.0.0.1';

// Server-Sent Events client registry for zero-dependency live reload
const clients = new Set();
let reloadDebounce = 0;
function notifyClients() {
  clearTimeout(reloadDebounce);
  reloadDebounce = setTimeout(() => {
    for (const res of clients) {
      try { res.write('data: reload\n\n'); } catch { clients.delete(res); }
    }
  }, 100);
}

// Watch project directories for instant live reload
try {
  watch(root, { recursive: true }, (event, filename) => {
    if (filename && !filename.startsWith('.git') && !filename.startsWith('dist')) {
      notifyClients();
    }
  });
} catch {}

const reloadScript = `<script>
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  const es = new EventSource('/_reload_events');
  es.onmessage = (e) => { if (e.data === 'reload') window.location.reload(); };
}
</script>`;

createServer((req, res) => {
  if (req.url === '/_reload_events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let path = normalize(join(root, pathname === '/' ? 'index.html' : pathname.replace(/^\//, '')));
  if (!path.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    if (statSync(path).isDirectory()) path = join(path, 'index.html');
  } catch {}

  try {
    const stat = statSync(path);
    if (!stat.isFile()) throw new Error('Not a file');
    const ext = extname(path);
    const contentType = types[ext] || 'application/octet-stream';

    if (ext === '.html') {
      import('node:fs').then(({ readFileSync }) => {
        let content = readFileSync(path, 'utf8');
        content = content.replace('</body>', `${reloadScript}\n</body>`);
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': Buffer.byteLength(content),
          'Cache-Control': 'no-cache'
        });
        res.end(content);
      });
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache'
    });
    createReadStream(path).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}).listen(port, host, () => console.log(`Portfolio ready at http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`));
