document.addEventListener("DOMContentLoaded", async function () {
  MixerUI.initTheme();
  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", MixerUI.toggleTheme);
  await MixerUI.renderAuthSlot();

  var grid = document.getElementById("galleryGrid");
  if (grid) MixerGallery.renderGrid("#galleryGrid", 12);

  var openMixer = document.getElementById("btnOpenMixer");
  if (openMixer && window.SHAudioMixer) {
    openMixer.addEventListener("click", function () {
      SHAudioMixer.open({
        onExport: function (blob, meta) {
          MixerUI.toast(
            "Mix siap (" +
              Math.round((blob && blob.size) / 1024) +
              " KB). Login & unggah dari Studio untuk showcase."
          );
        },
      });
    });
  }
});
