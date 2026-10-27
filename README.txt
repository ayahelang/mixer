Silverhawk Mixer — patch v9 (MP3 / export)
==========================================
Salin ke root repo ayahelang/mixer:

  js/audio-mixer.js
  js/vendor/lame.min.js   ← BARU (encoder MP3)
  css/audio-mixer-amx.css
  studio.html

MP3
---
• studio.html memuat js/vendor/lame.min.js
• Jika belum ada, audio-mixer.js auto-load dari CDN
• ⬇ MP3 dan Showcase (encode MP3) menunggu encoder siap

WAV / WebM
----------
• Tidak butuh lamejs (WAV = buffer encode; WebM = MediaRecorder)
• Tetap jalan meski offline tanpa CDN

Showcase
--------
• Tombol Showcase → mix region → MP3 mono → onExport(blob, meta)
• Callback studio kompatibel blob.size

Hard refresh setelah deploy (Ctrl+Shift+R).
