/**
 * Client API — Supabase publik + Edge Function + publish showcase.
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
    // Supabase JWT if logged in
    try {
      var sb = client();
      if (sb) {
        var sess = await sb.auth.getSession();
        if (sess && sess.data && sess.data.session && sess.data.session.access_token) {
          headers.Authorization = "Bearer " + sess.data.session.access_token;
        }
      }
    } catch (e) {}
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

  function randId() {
    return (
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 10)
    );
  }

  /**
   * Upload audio blob ke Storage bucket mixer-audio → URL publik.
   */
  async function uploadAudio(blob, filename) {
    var sb = client();
    if (!sb) throw new Error("Supabase belum dikonfigurasi (js/config.js)");
    var bucket = (cfg().audioBucket || "mixer-audio").replace(/^\//, "");
    var ext = "mp3";
    var mime = (blob && blob.type) || "audio/mpeg";
    if (/wav/i.test(mime)) ext = "wav";
    else if (/webm/i.test(mime)) ext = "webm";
    else if (/ogg/i.test(mime)) ext = "ogg";
    else if (/mpeg|mp3/i.test(mime)) ext = "mp3";
    var safe =
      String(filename || "mix-" + randId())
        .replace(/[^\w.\-]+/g, "_")
        .slice(0, 80) || "mix";
    if (!/\.(mp3|wav|webm|ogg)$/i.test(safe)) safe += "." + ext;
    var path = "mixes/" + new Date().toISOString().slice(0, 10) + "/" + randId() + "-" + safe;

    var up = await sb.storage.from(bucket).upload(path, blob, {
      contentType: mime,
      cacheControl: "3600",
      upsert: false,
    });
    if (up.error) {
      throw new Error(
        "Upload storage gagal: " +
          (up.error.message || up.error) +
          " — pastikan bucket \"" +
          bucket +
          "\" publik & policy INSERT aktif."
      );
    }
    var pub = sb.storage.from(bucket).getPublicUrl(path);
    var url =
      (pub && pub.data && pub.data.publicUrl) ||
      (pub && pub.publicUrl) ||
      "";
    if (!url) throw new Error("Gagal mendapatkan URL publik audio");
    return { path: path, url: url, bucket: bucket };
  }

  async function resolveAuthor() {
    var author_name = "Anonim";
    var user_id = null;
    var token = null;
    try {
      if (global.MixerAuth && MixerAuth.session) {
        var sess = await MixerAuth.session();
        if (sess) {
          if (sess.user) {
            user_id = sess.user.id || null;
            author_name =
              (sess.user.user_metadata &&
                (sess.user.user_metadata.full_name ||
                  sess.user.user_metadata.name)) ||
              sess.user.name ||
              (sess.user.email && String(sess.user.email).split("@")[0]) ||
              author_name;
          }
          if (sess.access_token) token = sess.access_token;
          if (sess.local && sess.user && sess.user.name) {
            author_name = sess.user.name;
            user_id = sess.user.id || user_id;
          }
        }
      }
    } catch (e) {}
    return { author_name: author_name, user_id: user_id, token: token };
  }

  /**
   * Mix blob → Storage → baris mixer_tracks (showcase publik).
   * opts: { title, description, durationSec }
   */
  async function publishMix(blob, meta, opts) {
    opts = opts || {};
    if (!blob || !blob.size) throw new Error("File mix kosong");
    if (!enabled()) throw new Error("Supabase belum dikonfigurasi");

    var title = String(opts.title || meta && meta.title || "").trim();
    if (!title) title = "Mix " + new Date().toLocaleString("id-ID");
    title = title.slice(0, 120);

    var durationSec =
      (meta && meta.duration) ||
      opts.durationSec ||
      0;
    var duration_ms = Math.round(Number(durationSec) * 1000) || 0;

    var author = await resolveAuthor();
    var up = await uploadAudio(blob, title.replace(/\s+/g, "-") + ".mp3");

    var pub = await edge(
      "publish",
      {
        title: title,
        description: String(opts.description || "").slice(0, 1000),
        author_name: author.author_name,
        user_id: author.user_id,
        audio_url: up.url,
        duration_ms: duration_ms,
        is_public: true,
      },
      author.token
    );

    return {
      id: pub && pub.id,
      audio_url: up.url,
      title: title,
      author_name: author.author_name,
    };
  }

  global.MixerAPI = {
    cfg: cfg,
    enabled: enabled,
    client: client,
    edge: edge,
    listMixes: listMixes,
    getMix: getMix,
    listComments: listComments,
    uploadAudio: uploadAudio,
    publishMix: publishMix,
  };
})(window);
