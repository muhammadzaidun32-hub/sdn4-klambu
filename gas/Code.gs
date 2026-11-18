/**
 * ============================================================
 *  SDN 4 KLAMBU — BACKEND GOOGLE APPS SCRIPT
 * ============================================================
 *  PANDUAN SINGKAT (detail di file PANDUAN.md):
 *  1. Buka https://script.google.com -> New Project
 *  2. Hapus isi Code.gs, tempel seluruh kode ini
 *  3. Isi PASSWORD & ADMIN_USER di bawah (pilih sendiri!)
 *  4. Deploy > New deployment > Web app
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  5. Salin URL Web App, tempel ke file config.js website
 *
 *  Data tersimpan: Google Spreadsheet (dibuat otomatis)
 *  Foto tersimpan: Google Drive folder "SDN4-KLAMBU" (otomatis)
 * ============================================================
 */

// ======= PENGATURAN ADMIN (WAJIB DIISI / DIGANTI) =======
var ADMIN_USER = 'admin';
var ADMIN_PASS = 'GantiPasswordAnda2026'; // <-- GANTI INI!

var SPREADSHEET_NAME = 'DATA_SDN4_KLAMBU';
var DRIVE_FOLDER = 'SDN4-KLAMBU';

// ============== HELPER =================
function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet() ||
           SpreadsheetApp.openById(getProp_('SS_ID'));
  return ss;
}

function ensureSetup_() {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var props = PropertiesService.getScriptProperties();
    var ssId = props.getProperty('SS_ID');
    var ss;
    if (!ssId) {
      ss = SpreadsheetApp.create(SPREADSHEET_NAME);
      props.setProperty('SS_ID', ss.getId());
    } else {
      ss = SpreadsheetApp.openById(ssId);
    }
    // sheet PPDB
    var ppdb = ss.getSheetByName('PPDB') || ss.insertSheet('PPDB');
    if (ppdb.getLastRow() === 0) {
      ppdb.appendRow(['WAKTU', 'NO REGISTRASI', 'NAMA ANAK', 'JK', 'TGL LAHIR',
        'ASAL TK', 'NAMA ORANG TUA', 'ALAMAT', 'WHATSAPP', 'JALUR', 'STATUS']);
    }
    // sheet KONTEN
    var konten = ss.getSheetByName('KONTEN') || ss.insertSheet('KONTEN');
    if (konten.getLastRow() === 0) {
      konten.appendRow(['KEY', 'VALUE']);
      setDefault_(konten, 'ppdb_status', 'OPEN');
      setDefault_(konten, 'ppdb_info', 'PPDB Tahun Ajaran 2027/2028 dibuka Januari 2027');
      setDefault_(konten, 'wa_tampil', 'YA');
      setDefault_(konten, 'wa_nomor', '6281225000449');
      setDefault_(konten, 'hero_judul', 'Pendidikan Berkarakter untuk Generasi Cerdas Klambu');
      setDefault_(konten, 'hero_sub', 'SD Negeri 4 Klambu melayani pendidikan dasar bermutu di Kecamatan Klambu, Kabupaten Grobogan.');
      setDefault_(konten, 'sambutan', 'Assalamualaikum. Selamat datang di website resmi SD Negeri 4 Klambu.');
      setDefault_(konten, 'foto_kepsek', '');
      setDefault_(konten, 'foto_guru', '{}');
      setDefault_(konten, 'berita', '[]');
      setDefault_(konten, 'jadwal', '{}');
      setDefault_(konten, 'unduhan', '[]');
      setDefault_(konten, 'galeri', '[]');
    }
    // Drive folder
    var it = DriveApp.getFoldersByName(DRIVE_FOLDER);
    var folder = it.hasNext() ? it.next() : DriveApp.createFolder(DRIVE_FOLDER);
    props.setProperty('FOLDER_ID', folder.getId());
  } finally {
    lock.releaseLock();
  }
}

function setDefault_(sheet, key, val) {
  var v = sheet.getRange('A:B').getValues();
  for (var i = 0; i < v.length; i++) if (v[i][0] === key) return;
  sheet.appendRow([key, val]);
}

function getProp_(k) {
  return PropertiesService.getScriptProperties().getProperty(k);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============== API PUBLIK =================
// GET ?action=content  -> seluruh konten publik
// GET ?action=status&noreg=XXXX -> cek status pendaftaran
function doGet(e) {
  ensureSetup_();
  var action = (e.parameter.action || '');

  if (action === 'content') {
    var sheet = getSheet_().getSheetByName('KONTEN');
    var rows = sheet.getDataRange().getValues();
    var out = {};
    for (var i = 1; i < rows.length; i++) out[rows[i][0]] = rows[i][1];
    return json_({ ok: true, data: out });
  }

  if (action === 'status') {
    var noreg = String(e.parameter.noreg || '').trim().toUpperCase();
    if (!noreg) return json_({ ok: false, err: 'Masukkan nomor registrasi' });
    var sh = getSheet_().getSheetByName('PPDB');
    var data = sh.getDataRange().getValues();
    for (var j = 1; j < data.length; j++) {
      if (String(data[j][1]).toUpperCase() === noreg) {
        return json_({ ok: true, data: {
          noreg: data[j][1], nama: data[j][2], waktu: data[j][0],
          jalur: data[j][9], status: data[j][10] || 'MENUNGGU'
        }});
      }
    }
    return json_({ ok: false, err: 'Nomor registrasi tidak ditemukan' });
  }

  return json_({ ok: false, err: 'Aksi tidak dikenal' });
}

// ============== API POST (form & admin) =================
// POST  action=daftar      -> pendaftaran PPDB publik
// POST  action=login       -> cek password admin
// POST  action=save        -> simpan konten (admin)
// POST  action=upload      -> upload foto base64 (admin)
// POST  action=list_ppdb   -> daftar pendaftar (admin)
// POST  action=set_status  -> ubah status pendaftar (admin)
function doPost(e) {
  ensureSetup_();
  var req;
  try { req = JSON.parse(e.postData.contents); }
  catch (err) { return json_({ ok: false, err: 'Data tidak valid' }); }

  var action = req.action || '';

  // ---- Pendaftaran publik (tanpa password) ----
  if (action === 'daftar') {
    var ss = getSheet_();
    var sh = ss.getSheetByName('PPDB');
    var k = sh.getLastRow(); // nomor urut
    var noreg = 'PPDB-2027-' + ('0000' + k).slice(-4);
    var status = String((getVal_('ppdb_status') || 'OPEN')).toUpperCase();
    if (status === 'CLOSED') {
      return json_({ ok: false, err: 'Maaf, pendaftaran sedang DITUTUP.' });
    }
    sh.appendRow([
      new Date(), noreg,
      req.nama || '', req.jk || '', req.tgl || '', req.tk || '',
      req.orangtua || '', req.alamat || '', req.wa || '',
      req.jalur || '', 'MENUNGGU'
    ]);
    return json_({ ok: true, noreg: noreg,
      data: { nama: req.nama, jalur: req.jalur, waktu: new Date().toLocaleString('id-ID') } });
  }

  // ---- Semua aksi admin wajib login ----
  if (action === 'login') {
    if (req.user === ADMIN_USER && req.pass === ADMIN_PASS) {
      return json_({ ok: true });
    }
    return json_({ ok: false, err: 'Username atau password salah' });
  }

  if (!cekLogin_(req)) {
    return json_({ ok: false, err: 'Akses ditolak. Login terlebih dahulu.' });
  }

  if (action === 'save') {
    var sheet = getSheet_().getSheetByName('KONTEN');
    var data = req.data || {};
    for (var key in data) setVal_(sheet, key, String(data[key]));
    return json_({ ok: true, msg: 'Tersimpan di Spreadsheet' });
  }

  if (action === 'upload') {
    // data: "data:image/png;base64,....", name: nama file
    var m = String(req.data || '').match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
    if (!m) return json_({ ok: false, err: 'Format gambar tidak dikenal' });
    var blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], req.name || 'foto.png');
    var fid = getProp_('FOLDER_ID');
    var folder = DriveApp.getFolderById(fid);
    // hapus file lama dengan nama sama (kecuali id sama)
    var old = req.key || req.name;
    if (old) {
      var files = folder.getFilesByName(old);
      while (files.hasNext()) files.next().setTrashed(true);
    }
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var url = 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w800';
    return json_({ ok: true, url: url, id: file.getId() });
  }

  if (action === 'list_ppdb') {
    var sh2 = getSheet_().getSheetByName('PPDB');
    var d = sh2.getDataRange().getValues();
    var rows = [];
    for (var k2 = 1; k2 < d.length; k2++) {
      rows.push({ waktu: String(d[k2][0]), noreg: d[k2][1], nama: d[k2][2],
        jk: d[k2][3], tgl: d[k2][4], tk: d[k2][5], ortu: d[k2][6],
        alamat: d[k2][7], wa: d[k2][8], jalur: d[k2][9], status: d[k2][10] });
    }
    return json_({ ok: true, data: rows });
  }

  if (action === 'set_status') {
    var sh3 = getSheet_().getSheetByName('PPDB');
    var d3 = sh3.getDataRange().getValues();
    for (var k3 = 1; k3 < d3.length; k3++) {
      if (String(d3[k3][1]) === String(req.noreg)) {
        sh3.getRange(k3 + 1, 11).setValue(req.status);
        return json_({ ok: true });
      }
    }
    return json_({ ok: false, err: 'Nomor tidak ditemukan' });
  }

  return json_({ ok: false, err: 'Aksi tidak dikenal' });
}

// ============== UTIL KONTEN =================
function getVal_(key) {
  var sheet = getSheet_().getSheetByName('KONTEN');
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) if (rows[i][0] === key) return rows[i][1];
  return null;
}

function setVal_(sheet, key, val) {
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(val);
      return;
    }
  }
  sheet.appendRow([key, val]);
}

function cekLogin_(req) {
  return req.user === ADMIN_USER && req.pass === ADMIN_PASS;
}
