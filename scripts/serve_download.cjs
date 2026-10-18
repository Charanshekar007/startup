const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const zipPath = path.resolve(__dirname, '..', 'startup_update.zip');

const server = http.createServer((req, res) => {
  if (req.url === '/startup_update.zip' || req.url === '/download') {
    if (!fs.existsSync(zipPath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('File not found');
    }
    const stat = fs.statSync(zipPath);
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="startup_update.zip"',
      'Content-Length': stat.size,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(zipPath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Download EZKORA Startup Update</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; border: 1px solid #334155; text-align: center; max-width: 440px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
          h1 { margin-top: 0; font-size: 1.5rem; color: #38bdf8; }
          p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
          .btn { display: inline-block; margin-top: 1.5rem; background: #22c55e; color: #000; font-weight: 700; padding: 0.85rem 1.75rem; border-radius: 0.5rem; text-decoration: none; font-size: 1.05rem; transition: background 0.2s; }
          .btn:hover { background: #16a34a; }
          .meta { margin-top: 1.25rem; font-size: 0.8rem; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>EZKORA Source Package</h1>
          <p>Click below to download the latest project source code archive.</p>
          <a href="/startup_update.zip" class="btn">⬇️ Download startup_update.zip</a>
          <div class="meta">Size: ~3.0 MB &bull; node_modules, .git & build folders excluded</div>
        </div>
      </body>
      </html>
    `);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening at http://localhost:${PORT}/`);
});
