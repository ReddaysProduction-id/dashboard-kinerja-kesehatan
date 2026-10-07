# DASHBOARD KINERJA KESEHATAN — V15 ONLINE TEST

## Yang sudah terhubung
- Supabase Authentication (login email/password)
- Pemeriksaan profil `profiles` setelah login
- Role ADMIN/PUSKESMAS/VIEWER ditampilkan
- Database cloud untuk Puskesmas, Posyandu, Kader
- Status Posyandu ILP SUDAH/BELUM
- Tingkatan Kader PURWA/MADYA/UTAMA
- Target 903 kader

## Cara uji lokal
1. Extract ZIP.
2. Pastikan `supabase-config.js` berisi Project URL dan publishable key.
3. Jalankan web server lokal (jangan buka file dengan `file://`).
   Contoh jika Python tersedia:
   `python3 -m http.server 8000`
4. Buka `http://localhost:8000/`.
5. Login dengan akun Supabase yang sudah dibuat.
6. Pilih modul Pelatihan Kader Posyandu (Siklus Hidup).
7. Tambah Posyandu, pilih status ILP, lalu tambah kader.
8. Periksa data di Supabase Table Editor.

## Catatan keamanan
Publishable/anon key boleh berada di frontend. Jangan pernah menaruh service_role/secret key di frontend.

## Tahap publikasi
Setelah uji lokal berhasil, upload folder ini ke GitHub Pages/hosting. Kemudian atur URL redirect Supabase Authentication sesuai domain publik.
