#!/usr/bin/env node
/**
 * Static file server for local development (no dependencies).
 * Usage: node server.js [port]
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.argv[2]) || Number(process.env.PORT) || 8080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".yml": "text/yaml; charset=utf-8",
  ".yaml": "text/yaml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, normalized);
  if (!filePath.startsWith(ROOT)) return null;
  return filePath;
}

const server = http.createServer((req, res) => {
  let urlPath = req.url === "/" ? "/index.html" : req.url;
  const filePath = safePath(urlPath);

  if (!filePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      if (urlPath !== "/index.html" && !path.extname(urlPath)) {
        const indexPath = path.join(ROOT, "index.html");
        return fs.readFile(indexPath, (readErr, data) => {
          if (readErr) {
            res.writeHead(404);
            res.end("Not found");
            return;
          }
          res.writeHead(200, { "Content-Type": MIME[".html"] });
          res.end(data);
        });
      }
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500);
        res.end("Server error");
        return;
      }
      res.writeHead(200, { "Content-Type": type });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Tarot dev server → http://localhost:${PORT}`);
});
