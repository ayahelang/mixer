# Silverhawk Audio Mixer

Web app multi-track audio mixer + galeri showcase (like & komentar).  
Brand & pola UX selaras [Silver Xylophone](https://xylophone.silverhawk.web.id).  
Database: **Supabase project yang sama dengan Silverhawk Web Gallery**.

## Fitur

- **Studio mixer** (modul utama): rekam mic, upload, max 8 track, Mark In/Out, peak meter, harmoni, export WAV/MP3/WebM
- **Galeri publik** showcase karya
- **Auth**: Google (Supabase Auth) atau nama + password (Edge Function)
- **Like & komentar**
- Roadmap: template instrument/melody, **12 channel**

## Struktur

```
css/          tokens, base, layout, gallery, audio-mixer-amx
js/           config, api, auth, ui, gallery, app, audio-mixer
supabase/     migrations + Edge Function mixer-api
assets/       favicon.svg, og-image.svg
*.html        index, gallery, studio, track, auth, admin
robots.txt, sitemap.xml, site.webmanifest, CNAME
```

## Setup (tanpa secret di GitHub)

### 1. Supabase (project Web Gallery)

1. SQL Editor → jalankan `supabase/migrations/001_mixer_tables.sql`
2. Storage: buat bucket publik `mixer-audio` (opsional, untuk upload file)
3. Deploy Edge Function:

```bash
supabase functions deploy mixer-api
supabase secrets set ADMIN_EMAIL=admin@silverhawk.web.id
supabase secrets set ADMIN_PASSWORD='Bismillaah'
# SUPABASE_SERVICE_ROLE_KEY biasanya otomatis tersedia di function env
```

### 2. Config frontend

Salin `js/config.example.js` → isi `js/config.js`:

```js
window.MIXER_CONFIG = {
  supabaseUrl: "https://xxxx.supabase.co",
  supabaseAnonKey: "eyJ...",  // anon public + RLS
  siteUrl: "https://mixer.silverhawk.web.id"
};
```

**Jangan** commit `service_role` atau password admin.

### 3. Deploy GitHub Pages

1. Push repo
2. Settings → Pages → branch `main` / root
3. Custom domain: `mixer.silverhawk.web.id` (file `CNAME` sudah ada)

## Admin

- URL: `/admin.html`
- Kredensial **hanya** di Supabase secrets (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- Nilai yang Anda minta untuk production secrets: `admin@silverhawk.web.id` / `Bismillaah`

## Modul mixer

Panel `SHAudioMixer.open()` dari `js/audio-mixer.js` (hasil iterasi UI/UX terbaru).
