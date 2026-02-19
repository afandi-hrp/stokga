
# 🚀 Solusi "No suitable key or wrong key type" (Waruna Group)

Error ini muncul karena PostgREST (API Supabase) tidak bisa memverifikasi bahwa token Anda diizinkan untuk menulis ke tabel `public.users`.

### 🛠️ Jalankan Skrip Ini di SQL Editor Supabase:

```sql
-- 1. PASTIKAN ROLE 'anon' BISA MELIHAT SCHEMA PUBLIC
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- 2. BERIKAN IZIN PENUH PADA TABEL USERS (KHUSUSNYA INSERT)
-- Ganti 'public.users' sesuai nama tabel Anda jika berbeda
GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;

-- 3. IZINKAN PENGGUNAAN SEQUENCE (PENTING UNTUK ID OTOMATIS/UUID)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. MATIKAN ROW LEVEL SECURITY (RLS)
-- Ini adalah solusi tercepat untuk lingkungan internal agar tidak dicegat kebijakan security
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lokasi DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.barang DISABLE ROW LEVEL SECURITY;

-- 5. REFRESH CACHE API (AGAR PERUBAHAN IZIN TERDETEKSI)
NOTIFY pgrst, 'reload schema';
```

### 💡 Analisis Teknis untuk Admin IT:
Jika SQL di atas sudah dijalankan tapi error masih ada, periksa konfigurasi Docker/Server:
1. **JWT_SECRET:** Pastikan `JWT_SECRET` di file `.env` docker-compose Supabase sama dengan secret yang digunakan untuk meng-generate token `eyJhbGci...` tersebut.
2. **PGRST_JWT_AUD:** Jika di server diatur `PGRST_JWT_AUD=authenticated`, maka token dengan role `anon` akan ditolak. Solusinya adalah menjalankan `GRANT anon TO authenticated;` di SQL atau menyamakan audience-nya.
