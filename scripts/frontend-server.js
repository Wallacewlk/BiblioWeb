// Demonstração opcional do frontend em porta diferente para testar CORS.
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'public');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end(); }
  const filename = path.join(root, pathname === '/' ? 'index.html' : pathname);
  if (!filename.startsWith(root + path.sep) && filename !== path.join(root, 'index.html')) { res.writeHead(403); return res.end(); }
  fs.readFile(filename, (err, bytes) => {
    if (err) { res.writeHead(404); return res.end('Arquivo nao encontrado'); }
    res.writeHead(200, { 'Content-Type': `${types[path.extname(filename)] || 'application/octet-stream'}; charset=utf-8` });
    res.end(bytes);
  });
}).listen(5500, '127.0.0.1', () => console.log('Frontend separado em http://localhost:5500'));
