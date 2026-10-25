(function (global) {
  function $(s, r) {
    return (r || document).querySelector(s);
  }
  function toast(msg) {
    var el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(function () {
      el.classList.remove("show");
    }, 2600);
  }
  function fmtDur(ms) {
    if (!ms || ms < 0) return "0:00";
    var s = Math.round(ms / 1000);
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }
  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }
  function toggleTheme() {
    document.body.classList.toggle("dark");
    try {
      localStorage.setItem(
        "sh_mixer_theme",
        document.body.classList.contains("dark") ? "dark" : "light"
      );
    } catch (e) {}
  }
  function initTheme() {
    try {
      if (localStorage.getItem("sh_mixer_theme") === "dark")
        document.body.classList.add("dark");
    } catch (e) {}
  }
  async function renderAuthSlot() {
    var slot = $("#authSlot");
    if (!slot) return;
    var sess = await MixerAuth.session();
    if (sess && (sess.user || sess.access_token)) {
      var name =
        (sess.user &&
          (sess.user.user_metadata || {}).full_name) ||
        (sess.user && sess.user.email) ||
        (sess.user && sess.user.name) ||
        "User";
      slot.innerHTML =
        '<span class="badge">' +
        escapeHtml(String(name).split("@")[0]) +
        '</span> <button type="button" class="btn btn-ghost" id="btnLogout">Keluar</button>';
      var b = $("#btnLogout");
      if (b)
        b.onclick = async function () {
          await MixerAuth.logout();
          location.reload();
        };
    } else {
      slot.innerHTML = '<a class="btn" href="auth.html">Masuk</a>';
    }
  }
  global.MixerUI = {
    $: $,
    toast: toast,
    fmtDur: fmtDur,
    escapeHtml: escapeHtml,
    toggleTheme: toggleTheme,
    initTheme: initTheme,
    renderAuthSlot: renderAuthSlot,
  };
})(window);
