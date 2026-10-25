/**
 * Shared dengan Silverhawk Web Gallery (data/supabase-config.js).
 * Anon/publishable key memang untuk frontend; RLS + Edge Function melindungi write.
 * JANGAN taruh service_role di sini.
 */
window.MIXER_CONFIG = {
  supabaseUrl: "https://upnnjidobuujhvevfyaa.supabase.co",
  supabaseAnonKey: "sb_publishable_Eq3QRGvkOEbc1ygpx8BATw_k0vgzHDz",
  apiBase: "",
  siteName: "Silverhawk Audio Mixer",
  siteUrl: "https://mixer.silverhawk.web.id",
  maxTracks: 8,
  futureMaxTracks: 12
};
