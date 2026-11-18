/* ============================================================
   SDN 4 KLAMBU — API client + penerap konten admin
   Memuat konten dari Google Spreadsheet (via Apps Script)
   dan menerapkannya ke seluruh halaman.
   ============================================================ */

const API = {
  url: (typeof GAS_URL !== 'undefined' && GAS_URL && !GAS_URL.includes('TEMPLE'))
        ? GAS_URL : null,

  async get(action, params = {}) {
    if (!this.url) return null;
    const q = new URLSearchParams({ action, ...params });
    try {
      const r = await fetch(this.url + '?' + q);
      return await r.json();
    } catch (e) { console.warn('API get gagal:', e); return null; }
  },

  async post(payload) {
    if (!this.url) return { ok: false, err: 'Backend belum dikonfigurasi' };
    try {
      const r = await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // hindari preflight CORS
        body: JSON.stringify(payload)
      });
      return await r.json();
    } catch (e) { return { ok: false, err: 'Koneksi ke server gagal' }; }
  }
};

/* ---------- Terapkan konten admin ke halaman ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  const res = await API.get('content');
  if (!res || !res.ok) return;          // offline fallback: konten statis
  const d = res.data;

  // Teks hero
  const set = (id, v) => { const el = document.getElementById(id); if (el && v) el.innerHTML = v; };
  set('hero_t', d.hero_judul);
  set('hero_s', d.hero_sub && `<p class="lead">${d.hero_sub}</p>`);
  set('k_nm', d.hero_judul ? null : null);
  if (d.sambutan) {
    document.querySelectorAll('[data-bind="sambutan"]').forEach(el => el.textContent = d.sambutan);
  }
  // Nama kepsek: semua elemen ber-class .bind-kepsek
  if (d.nama_kepsek) {
    document.querySelectorAll('.bind-kepsek').forEach(el => el.textContent = d.nama_kepsek);
  }
  // Foto kepsek (URL Drive thumbnail)
  if (d.foto_kepsek) {
    document.querySelectorAll('.bind-foto-kepsek').forEach(el => {
      if (el.tagName === 'IMG') { el.src = d.foto_kepsek; el.style.display = 'block'; }
      else el.style.backgroundImage = `url(${d.foto_kepsek})`;
    });
    // sembunyikan avatar emoji fallback
    document.querySelectorAll('.avatar-kepsek, .ph-avatar').forEach(el => el.style.display = 'none');
  }
  // Foto guru: JSON {kunci: url}
  if (d.foto_guru) {
    try {
      const g = JSON.parse(d.foto_guru);
      for (const k in g) {
        document.querySelectorAll(`.bind-foto-${k}`).forEach(el => {
          if (el.tagName === 'IMG') el.src = g[k];
          else el.style.backgroundImage = `url(${g[k]})`;
        });
      }
    } catch (e) {}
  }
  // Berita dinamis
  if (d.berita) {
    try {
      const arr = JSON.parse(d.berita);
      const box = document.getElementById('news-box');
      if (box && arr.length) box.innerHTML = arr.map(b => `
        <article class="news-card card">
          <div class="news-thumb">${b.emoji || '📰'}</div>
          <div class="news-body">
            <div class="news-meta"><span class="cat">${b.kat || 'Berita'}</span> · <time>${b.tgl || ''}</time></div>
            <h3>${b.judul || ''}</h3>
            <p>${b.isi || ''}</p>
          </div>
        </article>`).join('');
    } catch (e) {}
  }
  // Jadwal dinamis (JSON: {kelas1:[["07.00","Upacara"],...], ...})
  if (d.jadwal) {
    try {
      const j = JSON.parse(d.jadwal);
      for (const k in j) {
        const el = document.getElementById('jadwal-' + k);
        if (el && Array.isArray(j[k])) {
          el.innerHTML = j[k].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
        }
      }
    } catch (e) {}
  }
  // Unduhan
  if (d.unduhan) {
    try {
      const arr = JSON.parse(d.unduhan);
      const box = document.getElementById('unduh-box');
      if (box && arr.length) box.innerHTML = arr.map(u => `
        <div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:14px">
          <div><h3>📄 ${u.judul}</h3><p>${u.ket || ''}</p></div>
          <a class="btn btn-green" href="${u.url}" target="_blank" rel="noopener">Unduh ⬇</a>
        </div>`).join('<div style="height:12px"></div>');
    } catch (e) {}
  }
  // Galeri dinamis
  if (d.galeri) {
    try {
      const arr = JSON.parse(d.galeri);
      const box = document.getElementById('gal-box');
      if (box && arr.length) box.innerHTML = arr.map(g => `
        <a href="${g.url}" data-caption="${g.ket || ''}" class="gal-item" style="background:#0d6b3f url(${g.url}) center/cover">
          ${g.url ? '' : (g.emoji || '🖼️')}
        </a>`).join('');
    } catch (e) {}
  }
  // PPDB ON/OFF
  const ppdbBtns = document.querySelectorAll('.bind-ppdb-status');
  const infoEl = document.getElementById('ppdb-info');
  if (String(d.ppdb_status).toUpperCase() === 'CLOSED') {
    ppdbBtns.forEach(el => {
      el.style.display = 'none';
    });
    if (infoEl) infoEl.innerHTML = '🔒 <b>Pendaftaran sedang ditutup.</b> ' + (d.ppdb_info || '');
  } else if (infoEl && d.ppdb_info) {
    infoEl.textContent = d.ppdb_info;
  }
  // WhatsApp tombol melayang
  if (String(d.wa_tampil).toUpperCase() === 'YA' && d.wa_nomor) {
    const wa = document.createElement('a');
    wa.href = 'https://wa.me/' + d.wa_nomor.replace(/\D/g, '');
    wa.target = '_blank'; wa.rel = 'noopener';
    wa.className = 'wa-float';
    wa.innerHTML = '💬';
    wa.title = 'Hubungi sekolah via WhatsApp';
    document.body.appendChild(wa);
  }
});
