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
- Foto JPG/PNG (maksimal 5 foto) otomatis diperkecil di browser hingga di bawah 1 MB per foto jika diperlukan sebelum diunggah. File asli dibatasi 20 MB; hasil unggahan divalidasi maksimal 5 MB per foto oleh backend dan disimpan di Cloudflare R2. Foto lama di folder lokal tetap dapat ditampilkan.
- Atur `NEXT_PUBLIC_API_URL` pada frontend ke URL backend API (misalnya `http://localhost:8080/api`) dan `FRONTEND_URL` pada backend ke alamat frontend yang benar.

## Deployment gratis (untuk uji coba)

Backend dan panduan setup berada di repo [jaskitabe](https://github.com/riskidwiputra/jaskitabe). Deploy frontend ini di Netlify, lalu tambahkan environment variable `NEXT_PUBLIC_API_URL` dengan URL API Render lengkap beserta `/api` (contoh: `https://jaskita-api.onrender.com/api`). Sesudah Netlify memberi URL situs, masukkan URL itu ke `FRONTEND_URL` pada Render dan deploy ulang backend.

Kombinasi ini memakai Render Free untuk API dan TiDB Cloud Starter berprotokol MySQL untuk database; database aplikasi tidak diubah ke PostgreSQL. Layanan gratis dapat tidur atau memiliki kuota bulanan, jadi gunakan untuk uji coba dan periksa batas penyedia sebelum mengandalkannya untuk operasional usaha.

## Yang TIDAK dibuat (sesuai arahan terakhir)
Fitur Supplier dan Role/hak akses (Owner vs Karyawan) sempat mulai dikerjakan tapi dibatalkan sesuai instruksi — kode terkait sudah dibersihkan lagi.

## Langkah berikutnya
Item 7 (reminder WhatsApp otomatis) belum dikerjakan — perlu didiskusikan dulu soal penyedia API WhatsApp yang mau dipakai, karena ini butuh layanan pihak ketiga berbayar (bukan sesuatu yang bisa langsung "dibuat" tanpa akun/API key).
# jaskitafe
