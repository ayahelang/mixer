// Deno Edge Function — secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// ADMIN_EMAIL, ADMIN_PASSWORD (plain only in secret store, never in git)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-token",
};

async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const body = await req.json();
    const action = body.action as string;
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(url, key);

    if (action === "register") {
      const name = String(body.name || "").trim();
      const password = String(body.password || "");
      if (name.length < 2 || password.length < 4) {
        return json({ error: "Nama/password terlalu pendek" }, 400);
      }
      const password_hash = await sha256(password + ":" + name.toLowerCase());
      const { error } = await sb.from("mixer_local_users").insert({ name, password_hash });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "login") {
      const name = String(body.name || "").trim();
      const password = String(body.password || "");
      const password_hash = await sha256(password + ":" + name.toLowerCase());
      const { data, error } = await sb
        .from("mixer_local_users")
        .select("id,name")
        .eq("name", name)
        .eq("password_hash", password_hash)
        .maybeSingle();
      if (error || !data) return json({ error: "Nama atau password salah" }, 401);
      const token = await sha256(data.id + ":" + Date.now());
      return json({ ok: true, token, user: { id: data.id, name: data.name } });
    }

    if (action === "admin_login") {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const adminEmail = (Deno.env.get("ADMIN_EMAIL") || "").toLowerCase();
      const adminPass = Deno.env.get("ADMIN_PASSWORD") || "";
      if (!adminEmail || !adminPass) {
        return json({ error: "Admin secrets belum diset" }, 500);
      }
      if (email !== adminEmail || password !== adminPass) {
        return json({ error: "Unauthorized" }, 401);
      }
      const token = await sha256("admin:" + email + ":" + Date.now());
      return json({ ok: true, token });
    }

    if (action === "like") {
      const track_id = body.track_id;
      const user_key = String(body.user_key || req.headers.get("X-User-Token") || "anon:" + (req.headers.get("cf-connecting-ip") || "x"));
      if (!track_id) return json({ error: "track_id wajib" }, 400);
      await sb.from("mixer_likes").upsert({ track_id, user_key });
      const { count } = await sb
        .from("mixer_likes")
        .select("*", { count: "exact", head: true })
        .eq("track_id", track_id);
      await sb.from("mixer_tracks").update({ likes_count: count || 0 }).eq("id", track_id);
      return json({ ok: true, likes_count: count || 0 });
    }

    if (action === "comment") {
      const track_id = body.track_id;
      const bodyText = String(body.body || "").trim();
      const author_name = String(body.author_name || "Tamu").slice(0, 64);
      if (!track_id || !bodyText) return json({ error: "Komentar kosong" }, 400);
      const { error } = await sb.from("mixer_comments").insert({
        track_id,
        body: bodyText.slice(0, 1000),
        author_name,
      });
      if (error) return json({ error: error.message }, 400);
      const { count } = await sb
        .from("mixer_comments")
        .select("*", { count: "exact", head: true })
        .eq("track_id", track_id);
      await sb.from("mixer_tracks").update({ comments_count: count || 0 }).eq("id", track_id);
      return json({ ok: true });
    }

    if (action === "publish") {
      // Upload metadata after client puts file in Storage (public bucket mixer-audio)
      const row = {
        title: String(body.title || "Untitled").slice(0, 120),
        description: String(body.description || "").slice(0, 1000),
        author_name: String(body.author_name || "Anonim").slice(0, 64),
        user_id: body.user_id || null,
        audio_url: body.audio_url,
        duration_ms: Number(body.duration_ms) || 0,
        is_public: body.is_public !== false,
      };
      if (!row.audio_url) return json({ error: "audio_url wajib" }, 400);
      const { data, error } = await sb.from("mixer_tracks").insert(row).select("id").single();
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, id: data.id });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
