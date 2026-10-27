Silverhawk Mixer — patch v8
===========================
js/audio-mixer.js
css/audio-mixer-amx.css
studio.html

Perbaikan fokus
---------------
1. Tombol ▶ YT → modal input link muncul di TENGAH layar
   (position:fixed ke document.body, z-index sangat tinggi)
   Sebelumnya overlay ikut flex root sehingga panel bergeser ke kiri
   dan kotak input tidak terlihat sebagai dialog.

2. CSS dialog + scrollbar di-inject juga lewat JS (ensureAmxUiCss)
   saat panel dibuka — tetap custom meski stylesheet lama ter-cache.

3. Scrollbar custom dipaksa di .amx-root / .amx-panel / .amx-tracks
   (WebKit + Firefox).

Cara uji YT
-----------
Klik ▶ YT → modal "Sematkan YouTube" → tempel link → OK.
