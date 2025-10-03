// Simple static file server for the front-end
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const root = __dirname; // serve from this directory
const port = process.env.PORT || 8080;

const MIME = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=UTF-8'
};

function send(res, status, headers, streamOrString) {
  res.writeHead(status, headers);
  if (streamOrString && streamOrString.pipe) {
    streamOrString.pipe(res);
  } else {
    res.end(streamOrString || '');
  }
}

const server = http.createServer((req, res) => {
  try {
    let pathname = url.parse(req.url).pathname || '/';
    if (pathname === '/') pathname = '/index.html';

    const filePath = path.join(root, pathname);

    // Prevent path traversal
    if (!filePath.startsWith(root)) {
      return send(res, 403, { 'Content-Type': 'text/plain' }, 'Forbidden');
    }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        return send(res, 404, { 'Content-Type': 'text/plain' }, 'Not found');
      }
      const ext = path.extname(filePath).toLowerCase();
      const type = MIME[ext] || 'application/octet-stream';
      send(res, 200, { 'Content-Type': type }, fs.createReadStream(filePath));
    });
  } catch (e) {
    send(res, 500, { 'Content-Type': 'text/plain' }, 'Internal Server Error');
  }
});

server.listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}/`);
});
