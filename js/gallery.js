(function (global) {
  function cardHtml(m) {
    var id = MixerUI.escapeHtml(m.id);
    var title = MixerUI.escapeHtml(m.title || "Tanpa judul");
    var author = MixerUI.escapeHtml(m.author_name || "Anonim");
    var dur = MixerUI.fmtDur(m.duration_ms);
    var likes = m.likes_count || 0;
    var comments = m.comments_count || 0;
    return (
      '<article class="mix-card" data-id="' +
      id +
      '">' +
      '<div class="cover"><span class="wave">🎛</span></div>' +
      '<div class="body">' +
      "<h3>" +
      title +
      "</h3>" +
      '<div class="meta">oleh ' +
      author +
      " · " +
      dur +
      "</div>" +
      '<div class="stats"><span>♥ ' +
      likes +
      "</span><span>💬 " +
      comments +
      "</span></div>" +
      '<div class="actions">' +
      '<a class="btn btn-primary" href="track.html?id=' +
      encodeURIComponent(m.id) +
      '">Buka</a>' +
      (m.audio_url
        ? '<button type="button" class="btn btn-ghost" data-play="' +
          MixerUI.escapeHtml(m.audio_url) +
          '">▶</button>'
        : "") +
      "</div></div></article>"
    );
  }

  async function renderGrid(sel, limit) {
    var el = document.querySelector(sel);
    if (!el) return;
    el.innerHTML = '<div class="empty">Memuat galeri…</div>';
    try {
      if (!MixerAPI.enabled()) {
        el.innerHTML =
          '<div class="empty">Hubungkan Supabase di <code>js/config.js</code> untuk menampilkan showcase.</div>';
        return;
      }
      var res = await MixerAPI.listMixes(limit || 24);
      var items = res.items || [];
      if (!items.length) {
        el.innerHTML =
          '<div class="empty">Belum ada karya. Jadilah yang pertama di <a href="studio.html">Studio</a>.</div>';
        return;
      }
      el.innerHTML = items.map(cardHtml).join("");
      el.querySelectorAll("[data-play]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var url = btn.getAttribute("data-play");
          if (!url) return;
          if (window.__mixAudio) {
            window.__mixAudio.pause();
          }
          window.__mixAudio = new Audio(url);
          window.__mixAudio.play();
          MixerUI.toast("Memutar…");
        });
      });
    } catch (e) {
      el.innerHTML =
        '<div class="empty">Gagal memuat: ' +
        MixerUI.escapeHtml(e.message || e) +
        "</div>";
    }
  }

  global.MixerGallery = { renderGrid: renderGrid, cardHtml: cardHtml };
})(window);
