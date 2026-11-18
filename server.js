/**
 * SDN 4 KLAMBU — Server Admin Lokal
 * - Menyajikan website statis
 * - Menyimpan konten admin (data/content.json)
 * - Upload foto guru/kepsek (assets/img/)
 * - "Publish" = git commit + push -> GitHub -> Vercel auto-deploy
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ROOT = __dirname;
const PORT = 3000;
const AUTH = { user: 'admin', pass: 'zaed2026' }; // ubah di sini bila perlu

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'application/json; charset=utf-8' });
  res.end(body);
}
function readBody(req, cb) {
  let d = '';
  req.on('data', c => { d += c; if (d.length > 30e6) req.destroy(); });
  req.on('end', () => cb(d));
}
function safeName(n) {
  return String(n).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // ---------- API: login ----------
  if (url.pathname === '/api/login' && req.method === 'POST') {
    return readBody(req, b => {
      try {
        const { user, pass } = JSON.parse(b);
        if (user === AUTH.user && pass === AUTH.pass) return send(res, 200, '{"ok":true}');
        send(res, 401, '{"ok":false,"err":"Username atau password salah"}');
      } catch { send(res, 400, '{"ok":false,"err":"Bad request"}'); }
    });
  }

  // ---------- API: simpan konten ----------
  if (url.pathname === '/api/save' && req.method === 'POST') {
    return readBody(req, b => {
      try {
        const data = JSON.parse(b);
        const dir = path.join(ROOT, 'data');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        fs.writeFileSync(path.join(dir, 'content.json'), JSON.stringify(data, null, 2));
        send(res, 200, '{"ok":true,"msg":"Konten tersimpan"}');
      } catch (e) { send(res, 500, '{"ok":false,"err":"' + e.message + '"}'); }
    });
  }

  // ---------- API: muat konten ----------
  if (url.pathname === '/api/content') {
    const p = path.join(ROOT, 'data', 'content.json');
    if (fs.existsSync(p)) {
      return send(res, 200, fs.readFileSync(p, 'utf-8'));
    }
    return send(res, 200, '{}');
  }

  // ---------- API: upload foto ----------
  if (url.pathname === '/api/upload' && req.method === 'POST') {
    return readBody(req, b => {
      try {
        const { name, data, folder } = JSON.parse(b);
        const m = String(data).match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
        if (!m) throw new Error('Bukan gambar valid');
        const ext = m[1].split('/')[1].replace('jpeg', 'jpg');
        const dir = path.join(ROOT, 'assets', 'img', folder || 'guru');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const file = safeName(name.replace(/\.\w+$/, '')) + '-' + Date.now() + '.' + ext;
        fs.writeFileSync(path.join(dir, file), Buffer.from(m[2], 'base64'));
        send(res, 200, JSON.stringify({ ok: true, url: 'assets/img/' + (folder || 'guru') + '/' + file }));
      } catch (e) { send(res, 500, '{"ok":false,"err":"' + e.message + '"}'); }
    });
  }

  // ---------- API: publish (git push -> GitHub -> Vercel) ----------
  if (url.pathname === '/api/publish' && req.method === 'POST') {
    const cmd = 'git add -A && git commit -m "Update konten via panel admin %DATE%" && git push origin main'
      .replace('%DATE%', new Date().toISOString().slice(0, 16).replace('T', ' '));
    return exec(cmd, { cwd: ROOT, windowsHide: true }, (err, out, err2) => {
      if (err) {
        const msg = (err2 || out || '').toString();
        if (msg.includes('nothing to commit')) {
          return send(res, 200, '{"ok":true,"msg":"Tidak ada perubahan baru"}');
        }
        return send(res, 500, JSON.stringify({ ok: false, err: msg.slice(0, 500) }));
      }
      send(res, 200, '{"ok":true,"msg":"Terpublikasi! Vercel sedang membangun ulang situs."}');
    });
  }

  // ---------- Static files ----------
  let p = decodeURIComponent(url.pathname);
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT)) return send(res, 403, 'Forbidden', 'text/plain');
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, '<h1>404 — Halaman tidak ditemukan</h1><a href="/">Kembali</a>', 'text/html; charset=utf-8');
    send(res, 200, buf, MIME[path.extname(file).toLowerCase()] || 'application/octet-stream');
  });
});

server.listen(PORT, () => {
  console.log('==========================================');
  console.log('  SDN 4 KLAMBU — server admin berjalan');
  console.log('  Website : http://localhost:' + PORT);
  console.log('  Admin   : http://localhost:' + PORT + '/admin.html');
  console.log('  Login   : ' + AUTH.user + ' / ' + AUTH.pass);
  console.log('==========================================');
});
