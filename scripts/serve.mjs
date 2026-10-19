import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, extname } from 'node:path';

const base = process.env.DAILY_BASE || '/daily/';
const portIndex = process.argv.indexOf('--port');
const port = portIndex < 0 ? 5173 : Number(process.argv[portIndex + 1]);
const root = resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.woff2': 'font/woff2' };

function filePath(url) {
  const path = decodeURIComponent(new URL(url, 'http://localhost').pathname);
  if (!path.startsWith(base)) return null;
  const target = resolve(root, path.slice(base.length) || 'index.html');
  return target.startsWith(`${root}/`) ? target : null;
}

const server = createServer((request, response) => {
  try {
    const file = filePath(request.url);
    if (!['GET', 'HEAD'].includes(request.method) || !file || !existsSync(file) || !statSync(file).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).pipe(response);
  } catch {
    response.writeHead(400).end('Bad request');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Daily: http://127.0.0.1:${port}${base}`));
