
# 🚀 Panduan Khusus Supabase Self-Hosted (Waruna Group)

Jika Anda mendapatkan error **"Expected 3 parts in JWT; got 1"**, itu berarti key yang Anda gunakan di `store.ts` bukan merupakan token JWT yang valid. Supabase Client mewajibkan key tersebut memiliki 3 bagian (dot-separated).

### 1. Di mana mencari ANON_KEY yang benar?
Buka server tempat Supabase diinstal (Docker), cari file `.env`:
- Cari variabel bernama `ANON_KEY`.
- Key yang benar selalu dimulai dengan `eyJ...` (ciri khas JWT).
- Jika Anda hanya menemukan key pendek seperti yang Anda berikan tadi, itu mungkin `SERVICE_ROLE_KEY` versi lama atau API Key kustom Kong.

### 2. Cara Membuat JWT Secara Manual (Jika tahu JWT_SECRET)
Jika Anda memiliki `JWT_SECRET` dari server, Anda bisa membuat token di [jwt.io](https://jwt.io):
- **Header:** `{"alg": "HS256", "typ": "JWT"}`
- **Payload:** `{"role": "anon", "iss": "supabase", "iat": 1700000000, "exp": 2700000000}`
- **Verify Signature:** Masukkan `JWT_SECRET` Anda.
- Hasilnya adalah string panjang yang harus ditaruh di variabel `SUPABASE_ANON_KEY` pada `store.ts`.

---

# ☢️ NUCLEAR FIX: Reset Permissions & Tables

Jalankan ini di SQL Editor Supabase Waruna untuk memastikan role `anon` bisa menulis data:

```sql
-- 1. BERIKAN IZIN AKSES (PENTING UNTUK SELF-HOSTED)
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 2. RESET TABEL LOKASI DENGAN IZIN BENAR
DROP TABLE IF EXISTS public.lokasi CASCADE;
CREATE TABLE public.lokasi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kode_lokasi TEXT UNIQUE NOT NULL,
    nama_lokasi TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RESET TABEL BARANG
DROP TABLE IF EXISTS public.barang CASCADE;
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

-- 4. MATIKAN RLS (KEAMANAN) AGAR BISA DIAKSES ANON
ALTER TABLE public.lokasi DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.barang DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- 5. ISI DATA AWAL
INSERT INTO public.lokasi (kode_lokasi, nama_lokasi) VALUES ('WH-A1', 'Gudang Utama A1');

-- 6. REFRESH API CACHE
NOTIFY pgrst, 'reload schema';
```
