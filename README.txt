Silverhawk Mixer — patch v13 (Showcase benar-benar publish)
==========================================================
Salin ke root repo ayahelang/mixer:

  js/audio-mixer.js
  js/api.js                 ← publishMix + upload Storage
  js/vendor/lame.min.js
  css/audio-mixer-amx.css
  studio.html               ← onExport benar-benar unggah
  supabase/storage_mixer_audio.sql  ← policy bucket (sekali)

Alur tombol Showcase
--------------------
1. Mix region → MP3 mono
2. Prompt judul
3. Upload ke Storage bucket "mixer-audio"
4. Edge action "publish" → baris mixer_tracks (is_public)
5. Muncul di gallery.html setelah refresh

Jika list tetap kosong
----------------------
• Pastikan js/config.js terisi supabaseUrl + supabaseAnonKey
• Jalankan SQL: supabase/storage_mixer_audio.sql
• Edge Function mixer-api sudah di-deploy
• Tabel mixer_tracks (migration 001) sudah dijalankan
• Cek Console browser jika upload/policy error

Login tidak wajib untuk publish (author "Anonim"),
tapi disarankan agar nama penulis tampil.
