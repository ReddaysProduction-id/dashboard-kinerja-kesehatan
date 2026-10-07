# PERBAIKAN V15 — STATUS POSYANDU ILP

Masalah yang diperbaiki:
- Pilihan SUDAH ILP / BELUM ILP sebelumnya tidak tampil sebagai kontrol yang dapat dipilih dengan jelas.
- Markup radio diperbaiki menggunakan input radio + span.
- CSS dibuat menjadi dua kartu pilihan yang dapat diklik.
- Status yang dipilih tetap tersimpan ke kolom `posyandu.ilp_status`.

Cara pakai:
1. Hentikan server lokal lama dengan Ctrl+C di Terminal.
2. Ganti folder dashboard lama dengan folder V15 fix ini.
3. Jalankan lagi `python3 -m http.server 8000`.
4. Refresh Chrome.
5. Buka Tambah/Edit Posyandu.
6. Klik kartu SUDAH ILP atau BELUM ILP.
