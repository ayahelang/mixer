Silverhawk Mixer — patch v5 (showcase + YouTube guide)
======================================================
Sumber dasar: https://github.com/ayahelang/mixer (terbaru)

Salin ke root repo ayahelang/mixer:
  js/audio-mixer.js
  css/audio-mixer-amx.css
  studio.html

Perubahan
---------
1. Tombol export: "Kirim ke chat" → "Kirim ke showcase"
   (context chat/showcase/onExport)

2. Tombol "▶ YT" di toolbar:
   - Tempel link YouTube (karaoke / backing track)
   - Video tampil di dock dalam panel mixer
   - Play/Stop/Seek transport sinkron dengan video
   - Saat rekam overdub, video guide ikut jalan
   - Track YT muncul di daftar (Mute / Hapus)
   - CATATAN: audio YouTube TIDAK bisa di-mix ke file
     export (batasan browser/CORS). Gunakan sebagai
     guide lirik/backing; rekam vokal di track terpisah,
     instrumental bisa di-upload File jika punya audionya.

3. UI tetap mengikuti mockup mixer terkini (Master, Mark In/Out
   presisi, harmoni, peak meter, dll. dari repo mixer).

Cara uji YouTube
----------------
1. Buka Studio → Audio Mixer
2. Klik ▶ YT → tempel link karaoke
3. Play transport → video + (track audio lain) jalan bareng
4. Rekam vokal → Stop → export showcase
