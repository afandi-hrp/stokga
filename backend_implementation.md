
# Backend Implementation Guide (Supabase & SQL)

## ⚡ QUICK FIX: Schema Cache Error
Jika Anda melihat error **"Could not find the table 'public.lokasi' in the schema cache"**, ini berarti API Supabase belum mendeteksi tabel Anda.

**Jalankan kode ini di SQL Editor Supabase Anda sekarang:**

```sql
-- 1. Berikan izin akses penuh ke schema public
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Berikan izin ke tabel lokasi (Ulangi untuk tabel lain jika perlu)
GRANT ALL ON TABLE public.lokasi TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.barang TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.settings TO anon, authenticated, service_role;

-- 3. Berikan izin ke semua sequence (untuk ID otomatis)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. PAKSA API RELOAD (Langkah paling krusial)
NOTIFY pgrst, 'reload schema';
```

---

## 1. Database Schema (Full Script)
Gunakan script ini untuk membuat struktur awal yang benar:

```sql
-- Tabel Lokasi
CREATE TABLE IF NOT EXISTS lokasi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kode_lokasi VARCHAR(50) UNIQUE NOT NULL,
    nama_lokasi VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabel Barang
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

-- Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabel Settings
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

-- Matikan RLS untuk kemudahan akses internal
ALTER TABLE lokasi DISABLE ROW LEVEL SECURITY;
ALTER TABLE barang DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Data Awal
INSERT INTO users (username, password, role) 
VALUES ('admin', 'admin', 'admin') 
ON CONFLICT (username) DO NOTHING;

-- Reload Schema lagi setelah pembuatan tabel
NOTIFY pgrst, 'reload schema';
```
