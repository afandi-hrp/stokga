
# 🚀 Infrastruktur Database Baru: Local Storage (IndexedDB)

Aplikasi ini telah dimigrasikan dari Supabase ke **Local-First Architecture** menggunakan **Dexie.js**.

## ✅ Keunggulan
1. **Tidak Butuh API Key**: Error "No suitable key" hilang selamanya.
2. **Offline Mode**: Bisa dipakai tanpa internet.
3. **Data Persisten**: Data disimpan di browser (Chrome/Edge/Safari/Firefox).

## ⚠️ Catatan Penting
- Data tersimpan di **Browser** masing-masing perangkat.
- Data di Laptop A **tidak akan muncul** di Laptop B secara otomatis (karena tidak ada Cloud Sync).
- Jika Anda melakukan **Clear Cache / Clear Site Data** pada browser, data akan hilang.
- Gunakan fitur **Backup/Export JSON** di menu Settings secara rutin untuk mengamankan data.

## Struktur Data (Schema)
Database lokal (`SmartWarehouseDB`) memiliki tabel:
- `items`: Data stok barang
- `locations`: Data gudang/lokasi
- `users`: Data login user
- `settings`: Konfigurasi tampilan

## Login Default
Saat pertama kali dijalankan, sistem akan membuat akun default:
- **Username**: `admin`
- **Password**: `admin`
