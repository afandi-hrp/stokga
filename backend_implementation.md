
# 🚀 Panduan Khusus Supabase Self-Hosted (Waruna Group)

Jika Anda mendapatkan error **"No suitable key or wrong key type"** saat menambah data (User/Lokasi/Barang), itu berarti API Gateway PostgREST menolak key Anda karena masalah verifikasi JWT atau Izin Role Database.

### 🛠️ Langkah Perbaikan di SQL Editor Supabase:

Jalankan perintah SQL ini secara berurutan untuk memperbaiki izin role `anon` (key yang Anda gunakan di aplikasi):

```sql
-- 1. BERIKAN IZIN PADA SCHEMA PUBLIC
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 2. BERIKAN IZIN PADA SEMUA TABEL (PENTING)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 3. PASTIKAN TABEL USERS SUDAH ADA & BISA DIAKSES
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'staff',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. MATIKAN ROW LEVEL SECURITY (RLS) UNTUK AKSES MUDAH
-- (Hanya lakukan ini jika aplikasi digunakan di lingkungan internal aman)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lokasi DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.barang DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- 5. REFRESH CACHE API
NOTIFY pgrst, 'reload schema';
```

### Mengapa Error Ini Terjadi?
1. **JWT Secret Mismatch:** Server Supabase Anda menggunakan `JWT_SECRET` yang berbeda dengan secret yang digunakan untuk menandai `SUPABASE_ANON_KEY` di `store.ts`.
2. **Missing Claims:** JWT Anda mungkin tidak memiliki klaim `"aud": "anon"`. Jika perbaikan SQL di atas tidak berhasil, Anda harus meminta IT/Admin Server untuk memberikan `ANON_KEY` resmi dari file `.env` server.
3. **Database Permissions:** Secara default di Supabase, role `anon` seringkali hanya memiliki akses `SELECT`. Perintah `GRANT ALL` di atas akan memberikan izin `INSERT`, `UPDATE`, dan `DELETE`.
