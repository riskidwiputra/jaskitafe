# Sewa Jas Web — Rebuild + Fitur Baru

## Setup
1. Pakai backend `sewa-jas-api-rebuild.zip`, reset database dulu
2. `npm install`
3. `npm run dev`
4. Register akun baru lewat Postman, lalu login

## Fitur baru di rebuild ini

### Dashboard: Grafik Tren Bulanan
Grafik garis pendapatan bersih 6 bulan terakhir, plus badge naik/turun (%) dibanding bulan lalu.

### Buku Kas (halaman baru, menu "Buku Kas" di sidebar)
Menggabungkan semua uang masuk dan keluar jadi satu catatan:
- **Uang masuk**: dari hasil sewa (harga_sewa tiap transaksi) + denda
- **Uang keluar**: dari Pengeluaran yang BUKAN kategori "Modal"
- 3 kartu ringkasan: Total Pemasukan, Total Pengeluaran, Saldo
- 3 tab tampilan: Harian (per tanggal, lengkap dengan daftar transaksinya), Bulanan, Tahunan (ringkasan per periode)

### Ulasan pelanggan
- Galeri publik tersedia di `/ulasan`; form ulasan memakai link unik `/ulasan/:token`.
- Ulasan yang dikirim tampil di galeri publik dan menu dashboard **Ulasan**.
- Link hanya dapat dibuat untuk transaksi selesai dan berlaku 30 hari.
- Admin dapat melihat perbedaan link belum dipakai, sudah dipakai, atau kedaluwarsa; link yang sudah dipakai dapat diaktifkan kembali selama 30 hari.
- Pelanggan yang membuka link aktif kembali dapat memperbarui ulasan sebelumnya. Admin juga dapat mengedit atau menghapus ulasan dari menu dashboard.
- Foto JPG/PNG (maksimal 5 foto) otomatis diperkecil di browser hingga maksimal 300 KB dan 1280 px per foto sebelum diunggah. File asli dibatasi 20 MB; backend menerima maksimal 5 MB per foto dan menyimpannya di Cloudflare R2. Foto lama di folder lokal tetap dapat ditampilkan.
- Galeri memuat 9 ulasan pertama di server; tombol **Muat lebih banyak** mengambil halaman berikutnya. Frontend tidak menyimpan cache data ulasan; backend memakai Redis selama 60 detik jika `REDIS_URL` diatur. Foto galeri dimuat lazy dan dioptimalkan oleh Next Image.
- Atur `NEXT_PUBLIC_API_URL` pada frontend ke URL backend API (misalnya `http://localhost:8080/api`) dan `FRONTEND_URL` pada backend ke alamat frontend yang benar.

### Halaman utama JasKita
- Route `/` adalah landing page publik dengan galeri media Instagram, peta lokasi Medan Johor, tautan ke galeri `/ulasan`, dan tombol WhatsApp.
- Galeri mengambil hingga 12 postingan terbaru melalui Instagram API resmi dan menyimpan hasil fetch di cache Next.js selama 1 jam. Akses token hanya dibaca di server, jangan gunakan prefix `NEXT_PUBLIC_` dan jangan commit token.
- Untuk feed otomatis, siapkan akun Instagram profesional dan aplikasi Meta dengan izin `instagram_business_basic`, lalu isi `INSTAGRAM_ACCESS_TOKEN` sebagai environment variable rahasia pada deployment frontend. Endpoint menggunakan Graph API `v22.0` secara default; versi dapat diubah melalui `INSTAGRAM_GRAPH_API_VERSION`. Token jangka panjang Instagram memiliki masa berlaku dan perlu diperbarui sesuai petunjuk Meta. Tanpa token, landing page tetap berjalan dan menampilkan tautan profil Instagram.
- Tombol WhatsApp saat ini diarahkan ke nomor JasKita Medan Johor `08216692650`. Peta mengarah ke lokasi Google Maps yang diberikan.

## Deployment gratis (untuk uji coba)

Backend dan panduan setup berada di repo [jaskitabe](https://github.com/riskidwiputra/jaskitabe). Deploy frontend ini di Netlify, lalu tambahkan environment variable `NEXT_PUBLIC_API_URL` dengan URL API Render lengkap beserta `/api` (contoh: `https://jaskita-api.onrender.com/api`). Sesudah Netlify memberi URL situs, masukkan URL itu ke `FRONTEND_URL` pada Render dan deploy ulang backend.

Untuk pembaruan galeri, deploy backend terlebih dahulu agar endpoint pagination tersedia, kemudian deploy frontend.

Kombinasi ini memakai Render Free untuk API dan TiDB Cloud Starter berprotokol MySQL untuk database; database aplikasi tidak diubah ke PostgreSQL. Layanan gratis dapat tidur atau memiliki kuota bulanan, jadi gunakan untuk uji coba dan periksa batas penyedia sebelum mengandalkannya untuk operasional usaha.

## Yang TIDAK dibuat (sesuai arahan terakhir)
Fitur Supplier dan Role/hak akses (Owner vs Karyawan) sempat mulai dikerjakan tapi dibatalkan sesuai instruksi — kode terkait sudah dibersihkan lagi.

## Langkah berikutnya
Item 7 (reminder WhatsApp otomatis) belum dikerjakan — perlu didiskusikan dulu soal penyedia API WhatsApp yang mau dipakai, karena ini butuh layanan pihak ketiga berbayar (bukan sesuatu yang bisa langsung "dibuat" tanpa akun/API key).
# jaskitafe
