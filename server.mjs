import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');

const port = Number.parseInt(process.env.PORT || '4321', 10);
const host = '0.0.0.0';

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const safeJoin = (base, target) => {
  const resolved = path.resolve(base, target);
  if (!resolved.startsWith(base)) {
    return null;
  }
  return resolved;
};

const resolveFilePath = async (pathname) => {
  const decodedPath = decodeURIComponent(pathname);
  const normalizedPath = decodedPath.replace(/\/+$/, '') || '/';
  const candidate = normalizedPath === '/' ? '/index.html' : normalizedPath;
  const fullPath = safeJoin(distDir, `.${candidate}`);
  if (!fullPath) {
    return null;
  }

  try {
    const stat = await fs.stat(fullPath);
    if (stat.isFile()) {
      return fullPath;
    }
    if (stat.isDirectory()) {
      const indexPath = path.join(fullPath, 'index.html');
      await fs.access(indexPath);
      return indexPath;
    }
  } catch {
    // fallthrough to 404
  }

  return null;
};

createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  let pathname = '/';
  try {
    pathname = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;
  } catch {
    pathname = '/';
  }

  let filePath = null;
  try {
    filePath = await resolveFilePath(pathname);
  } catch {
    filePath = null;
  }

  if (!filePath) {
    const notFoundPath = safeJoin(distDir, './404.html');
    if (notFoundPath) {
      try {
        const data = await fs.readFile(notFoundPath);
        res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
        res.end(data);
        return;
      } catch {
        // fallthrough to plain 404
      }
    }
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'content-type': contentType });
    res.end(data);
  } catch {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Server error');
  }
}).listen(port, host, () => {
  console.log(`Static server listening on http://${host}:${port}`);
});
