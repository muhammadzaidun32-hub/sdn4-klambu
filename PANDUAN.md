# 📖 PANDUAN WEBSITE SDN 4 KLAMBU
### Untuk Operator/Sekolah — Tanpa Perlu Bisa Coding

---

## 🎉 SITUAS ANDA SEKARANG

| Hal | Keterangan |
|---|---|
| 🌐 Website Online | **https://sdn4-klambu.vercel.app** |
| 💻 Kode tersimpan | GitHub: `muhammadzaidun32-hub/sdn4-klambu` |
| 🔐 Panel Admin | **https://sdn4-klambu.vercel.app/admin.html** |
| 💰 Biaya | **Gratis semua** (Vercel + GitHub + Google) |

---

# BAGIAN 1 — AKTIFKAN "OTAK" DATA (Google Spreadsheet + Drive)

Website bisa dibagikan online **sekarang juga**. Tapi agar fitur
**PPDB online, ubah konten, upload foto, ON/OFF** berfungsi penuh,
Anda perlu mengaktifkan backend Google **sekali saja** (±10 menit):

### Langkah 1 — Buka Google Apps Script
1. Buka browser, kunjungi **https://script.google.com**
2. Login dengan akun Google sekolah (Gmail)
3. Klik **"+ New project"** (Projek baru)

### Langkah 2 — Tempel Kode
1. Buka file **`gas/Code.gs`** di folder ini (buka dengan Notepad)
2. **Salin semua** isinya (Ctrl+A lalu Ctrl+C)
3. Di Apps Script, **hapus** semua kode bawaan, lalu **Tempel** (Ctrl+V)

### Langkah 3 — Ganti Password Admin
1. Di bagian atas kode, cari baris:
   ```
   var ADMIN_PASS = 'GantiPasswordAnda2026';
   ```
2. Ganti menjadi password pilihan Anda, contoh:
   ```
   var ADMIN_PASS = 'RahasiaKlambu123';
   ```
3. (Opsional) ganti juga `ADMIN_USER` jika ingin username lain.
4. **Simpan** (icon 💾 / Ctrl+S)

### Langkah 4 — Deploy
1. Klik tombol **Deploy** (kanan atas) → **New deployment**
2. Klik ikon roda gigi ⚙ → pilih **Web app**
3. Isi:
   - Description: `SDN4 API`
   - Execute as: **Me**
   - Who has access: **Anyone**  ← WAJIB pilih ini
4. Klik **Deploy**
5. Klik **Authorize access** → pilih akun → **Advanced** → **Go to ... (unsafe)** → **Allow**
   *(Peringatan ini normal — aplikasi buatan Anda sendiri)*
6. **Salin URL Web app** yang muncul — bentuknya:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

### Langkah 5 — Sambungkan ke Website
1. Buka file **`assets/js/config.js`** (di folder website, buka dengan Notepad)
2. Ganti isinya menjadi (tempel URL Anda):
   ```js
   const GAS_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```
3. Simpan.

✅ **SELESAI!** Sekarang:
- Data PPDB otomatis masuk ke Google Spreadsheet (sheet **PPDB**)
- Foto otomatis tersimpan di Google Drive (folder **SDN4-KLAMBU**)
- Semua konten tersimpan di sheet **KONTEN**

---

# BAGIAN 2 — MEMAKAI PANEL ADMIN (Sehari-hari)

### Masuk
1. Buka **https://sdn4-klambu.vercel.app/admin.html**
2. Isi username & password (yang Anda buat di Langkah 3 tadi)
3. Klik **Masuk**

### Yang Bisa Anda Lakukan (semua klik-klik saja!)

| Menu | Fungsi |
|---|---|
| 🏠 Dasbor | Saklar **ON/OFF Pendaftaran** & **ON/OFF tombol WhatsApp** |
| ✏️ Konten | Ubah judul beranda, nama & sambutan kepala sekolah |
| 📷 Foto | **Ganti foto kepala sekolah & guru** — klik, pilih foto dari HP/komputer |
| 📰 Berita | Tambah/hapus berita & pengumuman |
| 🗓️ Jadwal | Ubah jadwal pelajaran kelas 1–6 & kalender sekolah |
| 🖼️ Galeri | Upload banyak foto sekaligus (pengunjung bisa klik untuk memperbesar) |
| 📥 Unduhan | Tambah file/buku yang bisa diunduh pengunjung |
| 📝 PPDB | **Lihat semua pendaftar** (khusus Anda), klik *Terima/Tolak* |
| ⚙️ Pengaturan | Ganti nomor WhatsApp sekolah & info banner PPDB |

### Alur kerja tiap selesai mengedit:
1. Klik **💾 Simpan** → data tersimpan di Google Spreadsheet
2. Selesai! Website langsung menampilkan data terbaru (situs membaca langsung dari Google).

> 💡 Tombol **🚀 Publikasikan** hanya diperlukan bila Anda mengubah
> file kode/HTML — untuk penggunaan sehari-hari cukup **Simpan**.

### Cara ganti password admin:
1. Buka https://script.google.com → buka project Anda
2. Ubah `ADMIN_PASS` → Simpan → **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**

---

# BAGIAN 3 — ALUR PENDAFTARAN SISWA BARU (PPDB)

**Sisi orang tua:**
1. Buka website → menu **PPDB**
2. Isi formulir → klik Kirim
3. Dapat **nomor registrasi** (contoh: `PPDB-2027-0001`)
4. Cetak bukti pendaftaran (tombol 🖨️)
5. kapan saja bisa cek status di menu **Cek Status**

**Sisi sekolah (Anda):**
1. Buka admin.html → menu **📝 PPDB**
2. Semua pendaftar tampil → klik **Terima** atau **Tolak**
3. Status otomatis terlihat saat orang tua cek status
4. Tutup/buka pendaftaran kapan saja lewat saklar di Dasbor

---

# BAGIAN 4 — MENGUBAH TEKS LANGSUNG DI FILE (Opsional)

Jika perlu mengubah tulisan yang tidak ada di panel admin:
1. Buka folder website di komputer
2. Klik-kanan file yang diinginkan (mis. `kontak.html`) → Open with → **Notepad**
3. Cari teksnya (Ctrl+F), ubah, simpan
4. Untuk meneruskan ke internet, jalankan perintah di folder (atau minta bantuan):
   ```
   git add -A
   git commit -m "update isi"
   git push
   ```
5. Vercel otomatis membangun ulang situs ±1 menit.

---

# BAGIAN 5 — KEAMANAN

✅ **Password TIDAK ditulis di website** — tersimpan di Google Apps Script (server Google)
✅ **Data pendaftar hanya tampil di admin.html** setelah login
✅ Formulir publik hanya bisa **mengirim** data, tidak bisa membaca
✅ Login di panel tidak disimpan permanen (hilang saat tutup browser)
✅ Komunikasi terenkripsi (HTTPS otomatis dari Vercel & Google)

---

# BAGIAN 6 — JIKA TERJADI MASALAH

| Masalah | Solusi |
|---|---|
| Tombol PPDB bilang "Backend belum dikonfigurasi" | Selesaikan **Bagian 1** (tempel GAS_URL di config.js) |
| Upload foto gagal | Pastikan langkah 4 (Deploy) sudah dipilih **Anyone**; file < 5 MB |
| Lupa password | Buka Apps Script → lihat/ubah `ADMIN_PASS` → deploy versi baru |
| Website tidak berubah setelah simpan | Tunggu 1 menit + tekan Ctrl+F5 di browser (hapus cache) |
| Perubahan besar tidak muncul | Pastikan sudah klik **💾 Simpan** di panel admin |

---

## 📁 STRUKTUR FOLDER

```
SDN 4 KLAMBU/
├── index.html        ← Halaman beranda
├── profil.html       ← Profil + visi misi + kepsek
├── akademik.html     ← Jadwal kelas 1-6 + kalender + ekskul (pramuka, BTQ, karawitan)
├── ppdb.html         ← Formulir PPDB online + cek status + cetak bukti
├── berita.html       ← Berita & pengumuman (diatur dari admin)
├── galeri.html       ← Galeri foto (klik = membesar)
├── unduhan.html      ← Buku/formulir unduhan
├── kontak.html       ← Alamat + peta + form pesan
├── admin.html        ← PANEL ADMIN (password)
├── gas/Code.gs       ← Kode untuk Google Apps Script (Bagian 1)
├── assets/
│   ├── css/style.css ← Desain
│   ├── js/config.js  ← ⭐ SATU-SATUNYA file yang diisi URL Google
│   ├── js/site.js    ← Penghubung data Google → tampilan
│   └── img/          ← Gambar-gambar
└── PANDUAN.md        ← File yang sedang Anda baca
```

---
*Dibuat dengan ❤ oleh Kang Zaed — 2026*
