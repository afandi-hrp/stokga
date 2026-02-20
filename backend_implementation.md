
# 🚀 Panduan Perbaikan: "No suitable key or wrong key type"

Error ini muncul 100% karena **ANON KEY** yang Anda masukkan di frontend **TIDAK COCOK** dengan **JWT SECRET** yang ada di server.

Aplikasi telah diperbarui dengan fitur **Dynamic Key Input**. Jika error terjadi, layar merah akan muncul meminta Anda memasukkan key yang benar.

## Cara Mendapatkan ANON KEY yang Benar dari Server Anda

Anda harus masuk ke server (VPS/Docker) tempat Supabase dijalankan.

### Cara 1: Cek File .env (Paling Mudah)
Biasanya file konfigurasi ada di folder `docker`.
```bash
# Masuk ke folder docker supabase Anda
cd supabase/docker

# Lihat isi file .env
cat .env | grep ANON_KEY
```
Salin string panjang yang dimulai dengan `eyJh...` dan masukkan ke aplikasi.

### Cara 2: Cek API Gateway (Kong)
Jika tidak ada di .env, cek file konfigurasi Kong.
```bash
cat volumes/api/kong.yml | grep anon
```

### Cara 3: Generate Ulang Key (Jika Anda tahu JWT_SECRET)
Jika Anda tahu `JWT_SECRET` server Anda, Anda bisa membuat key baru sendiri.
1. Buka [jwt.io](https://jwt.io)
2. Masukkan Payload:
   ```json
   {
     "role": "anon",
     "iss": "supabase",
     "iat": 1700000000,
     "exp": 2000000000
   }
   ```
3. Masukkan `JWT_SECRET` server Anda di bagian "Verify Signature".
4. Copy token yang dihasilkan di sebelah kiri.

---

## Solusi SQL Sebelumnya (Tetap Diperlukan)

Pastikan Anda juga sudah menjalankan skrip ini untuk masalah izin role `anon` (Error: Permission Denied).

```sql
-- 1. Buat Fungsi untuk Menambah User (Bypass RLS/Permission Check)
CREATE OR REPLACE FUNCTION create_user_safe(
    p_username text,
    p_password text,
    p_role text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.users (username, password, role)
    VALUES (p_username, p_password, p_role);
    
    RETURN '{"status": "success", "message": "User created via RPC"}'::json;
EXCEPTION WHEN unique_violation THEN
    RETURN '{"status": "error", "message": "Username already exists"}'::json;
END;
$$;

GRANT EXECUTE ON FUNCTION create_user_safe TO anon;
GRANT EXECUTE ON FUNCTION create_user_safe TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_safe TO service_role;
NOTIFY pgrst, 'reload schema';
```
