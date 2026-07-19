import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 8080);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function send(response, status, body, type = 'text/plain; charset=utf-8') {
  response.writeHead(status, {
    'content-type': type,
    'cache-control': status === 200 ? 'no-cache' : 'no-store',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'no-referrer',
    'cross-origin-resource-policy': 'same-origin'
  });
  response.end(body);
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || `${HOST}:${PORT}`}`);
  let relative = decodeURIComponent(url.pathname);
  if (relative === '/') relative = '/index.html';
  const absolute = path.resolve(ROOT, `.${relative}`);
  if (!absolute.startsWith(`${ROOT}${path.sep}`) && absolute !== ROOT) return send(response, 403, 'Forbidden');
  fs.stat(absolute, (statError, stat) => {
    if (statError || !stat.isFile()) return send(response, 404, 'Not found');
    const type = MIME[path.extname(absolute).toLowerCase()] || 'application/octet-stream';
    response.writeHead(200, {
      'content-type': type,
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'referrer-policy': 'no-referrer',
      'cross-origin-resource-policy': 'same-origin'
    });
    fs.createReadStream(absolute).pipe(response);
  });
});

server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
server.listen(PORT, HOST, () => console.log(`NeuroCanvas static server: http://${HOST}:${PORT}`));

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
