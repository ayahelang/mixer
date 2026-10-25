(function (global) {
  var KEY = "sh_mixer_session";

  function getLocal() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "null");
    } catch (e) {
      return null;
    }
  }
  function setLocal(s) {
    if (!s) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(s));
  }

  async function session() {
    var sb = MixerAPI.client();
    if (sb) {
      var r = await sb.auth.getSession();
      if (r.data && r.data.session) return r.data.session;
    }
    return getLocal();
  }

  async function loginGoogle() {
    var sb = MixerAPI.client();
    if (!sb) throw new Error("Supabase belum dikonfigurasi");
    var redirect = location.origin + location.pathname.replace(/[^/]+$/, "") + "auth.html";
    var r = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirect },
    });
    if (r.error) throw r.error;
  }

  async function registerLocal(name, password) {
    return MixerAPI.edge("register", { name: name, password: password });
  }

  async function loginLocal(name, password) {
    var data = await MixerAPI.edge("login", { name: name, password: password });
    if (data.token) {
      setLocal({
        access_token: data.token,
        user: data.user,
        local: true,
      });
    }
    return data;
  }

  async function logout() {
    setLocal(null);
    var sb = MixerAPI.client();
    if (sb) await sb.auth.signOut();
  }

  async function adminLogin(email, password) {
    return MixerAPI.edge("admin_login", { email: email, password: password });
  }

  global.MixerAuth = {
    session: session,
    loginGoogle: loginGoogle,
    registerLocal: registerLocal,
    loginLocal: loginLocal,
    logout: logout,
    adminLogin: adminLogin,
    getLocal: getLocal,
  };
})(window);
