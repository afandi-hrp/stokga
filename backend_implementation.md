
# Backend Implementation Guide (Supabase & SQL)

## 1. Database Schema & RLS Fix
Jalankan perintah SQL ini di **SQL Editor** Supabase Anda. Bagian `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` sangat penting untuk memperbaiki error yang Anda alami.

```sql
-- 1. Tabel Lokasi
CREATE TABLE IF NOT EXISTS lokasi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kode_lokasi VARCHAR(50) UNIQUE NOT NULL,
    nama_lokasi VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Tabel Barang
CREATE TABLE IF NOT EXISTS barang (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    nama_barang VARCHAR(255) NOT NULL,
    kategori VARCHAR(100),
    stok INT DEFAULT 0,
    poto_barang TEXT,
    lokasi_id UUID REFERENCES lokasi(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Tabel Settings (Untuk Branding)
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

-- ==========================================
-- SOLUSI ERROR: ROW-LEVEL SECURITY (RLS)
-- Jalankan kode ini agar aplikasi bisa menambah/mengubah data
-- ==========================================

ALTER TABLE lokasi DISABLE ROW LEVEL SECURITY;
ALTER TABLE barang DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Tambahkan User Admin Default jika tabel masih kosong
INSERT INTO users (username, password, role) 
VALUES ('admin', 'admin', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Tambahkan Branding Default
INSERT INTO settings (id, value) 
VALUES ('branding', '{"title": "SmartWarehouse Pro", "primaryColor": "#4f46e5", "logo": ""}')
ON CONFLICT (id) DO NOTHING;
```

## 2. Cara Mengatasi Error "Policy Violation"
Jika Anda mendapatkan error saat menambah data, itu berarti Supabase mencoba melindungi tabel Anda. 

**Langkah Perbaikan:**
1. Masuk ke Dashboard Supabase.
2. Klik menu **SQL Editor** (ikon `>_`) di sebelah kiri.
3. Paste kode `ALTER TABLE ... DISABLE ROW LEVEL SECURITY;` di atas.
4. Klik **Run**.
5. Coba kembali tambah user di aplikasi Anda.

## 3. Struktur .env (Jika menggunakan Server sendiri)
Jika Anda menggunakan Node.js lokal, gunakan template ini:
```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_super_secret_key_123
```
