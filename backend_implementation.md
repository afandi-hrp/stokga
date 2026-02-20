
# 🚀 Infrastruktur Backend: Supabase Self-Hosted

Aplikasi ini terhubung ke instance **Supabase Self-hosted** milik Waruna Group.

## 🔗 Koneksi
- **URL**: `https://supabase.waruna-group.co.id`
- **Auth**: Menggunakan Anon Key (JWT) untuk autentikasi client-side.

## 📦 Storage Setup (PENTING)
Agar fitur upload foto barang berfungsi, Anda harus membuat Bucket di Supabase Storage:

1. Masuk ke Dashboard Supabase.
2. Buka menu **Storage**.
3. Buat Bucket baru dengan nama: `barang-images`.
4. Pastikan bucket tersebut **Public** (agar gambar bisa diakses via URL).
5. **Policy (RLS)**:
   - Buat policy agar *Authenticated* atau *Anon* users bisa melakukan `INSERT` (Upload) dan `SELECT` (View).

## 🗄️ Database Schema
Tabel yang digunakan (PostgreSQL):
- `barang`: Menyimpan data stok (kolom `poto_barang` berisi URL dari Storage).
- `lokasi`: Menyimpan data master gudang.
- `users`: Menyimpan data login pengguna aplikasi.
- `settings`: Menyimpan konfigurasi branding aplikasi (JSON).

## 📱 Fitur Kamera
Aplikasi menggunakan HTML5 Media Capture (`capture="environment"`) untuk memicu kamera belakang secara langsung pada perangkat mobile saat tombol "Kamera" ditekan. Pastikan aplikasi diakses via HTTPS agar fitur ini berjalan optimal di semua browser.
