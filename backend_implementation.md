
# Panduan Perbaikan Database Supabase

Jika Anda melihat pesan **"Schema Cache Hilang"**, ikuti langkah-langkah presisi berikut:

### Langkah 1: Buka SQL Editor
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard).
2. Pilih proyek Anda: `xdwrqaeotnokxygralcx`.
3. Di bilah sisi kiri, klik ikon **SQL Editor** (ikon `>_`).
4. Klik **"+ New Query"**.

### Langkah 2: Jalankan Skrip Perbaikan Total
Salin dan tempel kode di bawah ini, lalu klik tombol **"Run"**:

```sql
-- 1. Pastikan tabel benar-benar ada
CREATE TABLE IF NOT EXISTS public.lokasi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kode_lokasi VARCHAR(50) UNIQUE NOT NULL,
    nama_lokasi VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Matikan Row Level Security (RLS) untuk sementara agar mudah diakses
ALTER TABLE public.lokasi DISABLE ROW LEVEL SECURITY;

-- 3. Berikan izin akses eksplisit ke API (role anon)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.lokasi TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. PAKSA RELOAD SCHEMA CACHE (Ini yang paling penting)
-- Menambahkan komentar akan memaksa PostgREST menyadari ada perubahan
COMMENT ON TABLE public.lokasi IS 'Updated on ' || NOW();
NOTIFY pgrst, 'reload schema';
```

### Langkah 3: Verifikasi di Aplikasi
Setelah menjalankan skrip di atas:
1. Kembali ke aplikasi SmartWarehouse Anda.
2. Klik tombol merah **"SUDAH SAYA JALANKAN, CEK LAGI"**.
3. Jika masih error, tekan **F5** atau **Refresh** pada browser Anda.

---

### Tips Tambahan
- **URL & Key**: Pastikan `SUPABASE_URL` dan `SUPABASE_ANON_KEY` di file `store.ts` sudah sesuai dengan yang ada di menu **Settings > API** proyek Supabase Anda.
- **Table Name**: Pastikan nama tabel di database adalah `lokasi` (huruf kecil semua). Jika Anda membuatnya dengan nama `Lokasi` (huruf kapital), API mungkin akan gagal menemukannya kecuali dipanggil dengan tanda kutip.
