Silverhawk Mixer — patch v10
============================
js/audio-mixer.js
js/vendor/lame.min.js
css/audio-mixer-amx.css
studio.html

YouTube & export
----------------
Browser MELARANG membaca audio mentah dari iframe YouTube (CORS).
Tidak ada cara 100% otomatis murni-client tanpa izin user.

Solusi yang diimplementasikan (viable di Chrome/Edge):
  1. Sematkan video (▶ YT) — guide lirik, sinkron transport
  2. Klik "⏺ Ambil audio YT"
  3. Dialog sistem: pilih tab ini + centang "Bagikan audio tab"
  4. Video diputar dari awal sambil direkam → decode jadi track
  5. Track audio itu IKUT mix / WAV / MP3 / WebM / Showcase

Alur karaoke yang disarankan
----------------------------
  Ambil audio YT → rekam vokal (● Rekam) → atur vol → export / Showcase

WAV / MP3 / WebM / Showcase
---------------------------
  Sama seperti v9 (lamejs lokal + CDN fallback).
