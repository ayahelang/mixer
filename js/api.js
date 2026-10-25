/**
 * Client API — panggil Supabase JS (publik) + Edge Function untuk aksi sensitif.
 */
(function (global) {
  function cfg() {
    return global.MIXER_CONFIG || {};
  }

  function enabled() {
    var c = cfg();
    return !!(c.supabaseUrl && c.supabaseAnonKey);
  }

  function client() {
    if (!enabled() || !global.supabase) return null;
    if (!global.__mixerSb) {
      global.__mixerSb = global.supabase.createClient(
        String(cfg().supabaseUrl).replace(/\/$/, ""),
        cfg().supabaseAnonKey
      );
    }
    return global.__mixerSb;
  }

  function apiBase() {
    var c = cfg();
    if (c.apiBase) return String(c.apiBase).replace(/\/$/, "");
    if (c.supabaseUrl)
      return String(c.supabaseUrl).replace(/\/$/, "") + "/functions/v1/mixer-api";
    return "";
  }

  async function edge(action, body, token) {
    var base = apiBase();
    if (!base) throw new Error("API belum dikonfigurasi");
    var headers = { "Content-Type": "application/json" };
    var c = cfg();
    if (c.supabaseAnonKey) headers.Authorization = "Bearer " + c.supabaseAnonKey;
    if (token) headers["X-User-Token"] = token;
    var res = await fetch(base, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(Object.assign({ action: action }, body || {})),
    });
    var data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok) throw new Error(data.error || data.message || "API error " + res.status);
    return data;
  }

  async function listMixes(limit) {
    var sb = client();
    if (!sb) return { items: [], offline: true };
    var q = sb
      .from("mixer_tracks")
      .select(
        "id,title,description,author_name,user_id,audio_url,duration_ms,likes_count,comments_count,created_at,cover_url,is_public"
      )
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(limit || 24);
    var res = await q;
    if (res.error) throw res.error;
    return { items: res.data || [], offline: false };
  }

  async function getMix(id) {
    var sb = client();
    if (!sb) throw new Error("Database offline");
    var res = await sb.from("mixer_tracks").select("*").eq("id", id).maybeSingle();
    if (res.error) throw res.error;
    return res.data;
  }

  async function listComments(trackId) {
    var sb = client();
    if (!sb) return [];
    var res = await sb
      .from("mixer_comments")
      .select("id,body,author_name,user_id,created_at")
      .eq("track_id", trackId)
      .order("created_at", { ascending: true });
    if (res.error) throw res.error;
    return res.data || [];
  }

  global.MixerAPI = {
    cfg: cfg,
    enabled: enabled,
    client: client,
    edge: edge,
    listMixes: listMixes,
    getMix: getMix,
    listComments: listComments,
  };
})(window);
