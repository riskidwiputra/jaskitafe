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

## Yang TIDAK dibuat (sesuai arahan terakhir)
Fitur Supplier dan Role/hak akses (Owner vs Karyawan) sempat mulai dikerjakan tapi dibatalkan sesuai instruksi — kode terkait sudah dibersihkan lagi.

## Langkah berikutnya
Item 7 (reminder WhatsApp otomatis) belum dikerjakan — perlu didiskusikan dulu soal penyedia API WhatsApp yang mau dipakai, karena ini butuh layanan pihak ketiga berbayar (bukan sesuatu yang bisa langsung "dibuat" tanpa akun/API key).
# jaskitafe
