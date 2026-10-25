/**
 * Nilai publik saja. Ganti via environment deploy / isi setelah clone.
 * Anon key aman dengan RLS; service_role & admin password = Supabase secrets.
 */
window.MIXER_CONFIG = window.MIXER_CONFIG || {
  supabaseUrl: "",
  supabaseAnonKey: "",
  apiBase: "",
  siteName: "Silverhawk Audio Mixer",
  siteUrl: "https://mixer.silverhawk.web.id",
  maxTracks: 8,
  futureMaxTracks: 12
};
