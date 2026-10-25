/**
 * Salin ke config.js dan isi nilai publik.
 * JANGAN taruh service_role / password admin di sini.
 * Secret sensitif hanya di Supabase Edge Function secrets.
 */
window.MIXER_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_ANON_KEY",
  /** URL Edge Function mixer-api (opsional; default: {supabaseUrl}/functions/v1/mixer-api) */
  apiBase: "",
  siteName: "Silverhawk Audio Mixer",
  siteUrl: "https://mixer.silverhawk.web.id",
  maxTracks: 8,
  futureMaxTracks: 12
};
