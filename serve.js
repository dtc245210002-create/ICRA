const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 8080;
const FILE_PATH = path.join(__dirname, 'index.html');

http.createServer((req, res) => {
  fs.readFile(FILE_PATH, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Error loading index.html: ' + err.message);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log('ICRA Server running at http://127.0.0.1:' + PORT);
});
