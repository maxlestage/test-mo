// Serveur statique minimal pour Heroku (aucune dépendance).
// Sert le build Vite (dist/) avec repli SPA sur index.html.

import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist");
const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json",
};

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    // Neutralise les remontées de chemin (« .. ») avant résolution.
    const safePath = path.normalize(decodeURIComponent(url.pathname)).replace(
      /^(\.\.[/\\])+/,
      ""
    );
    let file = path.join(ROOT, safePath);

    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    if (!existsSync(file) || statSync(file).isDirectory()) {
      // Repli SPA : toute route inconnue renvoie l'application.
      file = path.join(ROOT, "index.html");
    }

    // Si le build est absent (dist/ non généré), on répond proprement
    // au lieu de laisser le flux planter le process.
    if (!existsSync(file)) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(
        "Build introuvable (dist/). Le script de build n'a pas été exécuté."
      );
      return;
    }

    const ext = path.extname(file).toLowerCase();
    const immutable = /\/assets\//.test(file);
    const stream = createReadStream(file);
    stream.on("error", () => {
      if (!res.headersSent) res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    });
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": immutable
        ? "public, max-age=31536000, immutable"
        : "no-cache",
    });
    stream.pipe(res);
  })
  .listen(PORT, () => {
    console.log(`Mo-Grid en écoute sur le port ${PORT} (dist/)`);
  });
