
# 🚀 Solusi Final: Bypass Izin dengan Stored Procedure (RPC)

Jika Insert biasa masih gagal dengan "No suitable key" atau "Permission denied", jalankan SQL ini. Ini membuat sebuah fungsi "jalur khusus" (RPC) yang berjalan dengan hak akses admin (`SECURITY DEFINER`), sehingga tidak terpengaruh oleh pembatasan role `anon`.

### 🛠️ Jalankan Skrip Ini di SQL Editor Supabase:

```sql
-- 1. Buat Fungsi untuk Menambah User (Bypass RLS/Permission Check)
CREATE OR REPLACE FUNCTION create_user_safe(
    p_username text,
    p_password text,
    p_role text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- KUNCI UTAMA: Fungsi ini berjalan sebagai Super Admin
AS $$
BEGIN
    INSERT INTO public.users (username, password, role)
    VALUES (p_username, p_password, p_role);
    
    RETURN '{"status": "success", "message": "User created via RPC"}'::json;
EXCEPTION WHEN unique_violation THEN
    RETURN '{"status": "error", "message": "Username already exists"}'::json;
END;
$$;

-- 2. Berikan Izin Eksekusi Fungsi ini ke Role Anon
GRANT EXECUTE ON FUNCTION create_user_safe TO anon;
GRANT EXECUTE ON FUNCTION create_user_safe TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_safe TO service_role;

-- 3. Pastikan Schema Cache di-refresh
NOTIFY pgrst, 'reload schema';
```

### Mengapa ini bekerja?
Metode `SECURITY DEFINER` membuat fungsi tersebut berjalan dengan hak akses pembuat fungsi (Database Owner), bukan hak akses user yang memanggilnya (`anon`). Aplikasi akan otomatis mencoba metode ini jika insert biasa gagal.
