
# ☢️ NUCLEAR FIX: Solusi Total Error "Schema Cache"

Jika error **"Could not find the table"** masih muncul setelah menjalankan perintah `NOTIFY`, gunakan skrip di bawah ini. Skrip ini akan menghapus tabel lama (jika ada) dan membangun ulang struktur yang 100% kompatibel dengan aplikasi SmartWarehouse.

### Langkah-Langkah:
1. Buka **SQL Editor** di Dashboard Supabase.
2. **PENTING:** Hapus semua teks yang ada di editor.
3. Tempel kode di bawah ini dan klik **Run**.

```sql
-- 1. HAPUS TABEL LAMA (BERSIHKAN SEMUA)
DROP TABLE IF EXISTS public.barang CASCADE;
DROP TABLE IF EXISTS public.lokasi CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

-- 2. BUAT ULANG TABEL LOKASI (HURUF KECIL SEMUA)
CREATE TABLE public.lokasi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kode_lokasi TEXT UNIQUE NOT NULL,
    nama_lokasi TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. BUAT ULANG TABEL BARANG
CREATE TABLE public.barang (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    nama_barang TEXT NOT NULL,
    kategori TEXT,
    stok INTEGER DEFAULT 0,
    poto_barang TEXT,
    lokasi_id UUID REFERENCES public.lokasi(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. BUAT ULANG TABEL SETTINGS
CREATE TABLE public.settings (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

-- 5. BUAT ULANG TABEL USERS
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. MATIKAN SECURITY (RLS) AGAR API BISA MENULIS DATA
ALTER TABLE public.lokasi DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.barang DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 7. BERIKAN IZIN AKSES KE ROLE ANON (WEB)
GRANT ALL ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 8. ISI DATA AWAL (DUMMY)
INSERT INTO public.lokasi (kode_lokasi, nama_lokasi) VALUES ('WH-A1', 'Gudang Utama A1');
INSERT INTO public.users (username, password, role) VALUES ('admin', 'admin', 'admin');

-- 9. PAKSA RELOAD SCHEMA (PENTING!)
NOTIFY pgrst, 'reload schema';
```

### Mengapa ini perlu?
Terkadang Supabase mengunci skema jika ada perubahan yang setengah jalan. Skrip `DROP ... CASCADE` akan memastikan semua "kotoran" skema lama hilang dan diganti dengan struktur yang bersih yang bisa dibaca oleh PostgREST.
