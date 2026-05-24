# 🔧 dityaMotor 88 — Kasir Digital

> Aplikasi kasir berbasis web untuk bengkel & toko spare part motor. Ringan, offline-ready, dan bisa dipakai langsung dari browser tanpa instalasi.

🔗 **Live Demo:** [aprisandiii.github.io/dityaMotor88](https://aprisandiii.github.io/dityaMotor88/)

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| 🛒 **Kasir & Keranjang** | Tambah produk ke keranjang, atur qty, diskon nominal/persen |
| 📦 **Manajemen Produk** | Tambah, edit, hapus produk dengan kategori & stok minimum |
| 📊 **Dashboard Harian** | Omzet, laba, jumlah transaksi, dan stok kritis real-time |
| 🧾 **Print Nota** | Cetak struk thermal 80mm langsung dari browser |
| 📁 **Export Data** | Export laporan ke CSV, TXT, dan backup/restore JSON |
| 🔗 **Google Sheets Sync** | Kirim data transaksi & laporan ke Google Sheets via Apps Script |
| ⚠️ **Alert Stok** | Notifikasi otomatis saat stok mendekati batas minimum |
| 📱 **Responsive** | Tampil optimal di desktop maupun mobile |
| 💾 **Offline Ready** | Semua data tersimpan di localStorage, tidak butuh server |

---

## 🖥️ Screenshot

> Tambahkan screenshot aplikasi di sini.
> Contoh: drag & drop gambar ke README di GitHub, atau gunakan folder `/docs/screenshots/`.

---

## 🚀 Cara Pakai

### Online (Langsung Pakai)
Buka: **[aprisandiii.github.io/dityaMotor88](https://aprisandiii.github.io/dityaMotor88/)**

Tidak perlu instalasi. Cukup buka di browser.

### Offline / Self-host
```bash
git clone https://github.com/aprisandiii/dityaMotor88.git
cd dityaMotor88
# Buka index.html di browser
```

---

## 📋 Panduan Singkat

### 1. Setup Awal
- Klik **⚙️ Pengaturan** di pojok kanan atas
- Isi nama toko, alamat, telepon, dan pesan footer nota

### 2. Tambah Produk
- Pilih tab **+ Tambah Produk**
- Isi nama, kategori, harga modal (HPP), harga jual, stok, dan batas stok minimum

### 3. Proses Transaksi
- Klik **+** pada produk untuk masukkan ke keranjang
- Atur qty, tambahkan diskon jika ada
- Pilih metode bayar → klik **✔ Proses Checkout**
- Klik **🖨 Cetak Nota** untuk cetak struk

### 4. Laporan & Export
- Tab **📊 Laporan Harian** — lihat omzet & laba per hari
- Export ke **CSV** (Excel), **TXT**, atau **Backup JSON**

### 5. Sinkronisasi Google Sheets (Opsional)
- Buat Google Apps Script Web App
- Klik **🔗 Sheets** di topbar → masukkan URL
- Data transaksi akan otomatis terkirim setiap checkout

---

## 🗂️ Struktur File

```
dityaMotor88/
├── index.html       # Aplikasi utama (single file)
└── README.md        # Dokumentasi ini
```

---

## 🛠️ Teknologi

- **HTML5 + CSS3 + Vanilla JavaScript** — tanpa framework, tanpa dependency
- **localStorage** — penyimpanan data di sisi browser
- **Google Apps Script** — opsional untuk sinkronisasi ke Google Sheets
- **CSS Print Media** — untuk cetak struk 80mm

---

## 💡 Roadmap

- [ ] Multi-kasir / multi-user
- [ ] Laporan mingguan & bulanan
- [ ] Fitur hutang pelanggan
- [ ] PWA (install ke homescreen)
- [ ] Export ke PDF

---

## 👤 Developer

**Aprisandi** — [@aprisandiii](https://github.com/aprisandiii)

Dibuat untuk kebutuhan operasional **dityaMotor 88**, Sariwangi, Parongpong.

---

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi.
