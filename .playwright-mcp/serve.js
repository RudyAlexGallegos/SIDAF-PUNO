const http = require('http');
const fs = require('fs');
const path = require('path');
const root = 'D:\\SIDAF-PUNO\\.playwright-mcp';
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': 'application/pdf' });
    res.end(data);
  });
});
server.listen(8765, '127.0.0.1', () => console.log('listening'));
