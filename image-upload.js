// ============================================================
//  Glimt - image-upload.js (Cloudinary)
//  Gjenbrukbar opplastingskomponent via Cloudinary unsigned upload.
//  Finner alle .img-upload-wrap og kobler til nærmeste
//  input[name='image'] i samme forelder.
// ============================================================

(function () {
  "use strict";

  var CLOUD_NAME    = "dvuhbkzkz";
  var UPLOAD_PRESET = "glimt_uploads";
  var UPLOAD_URL    = "https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/image/upload";
  var MAX_SIZE      = 10 * 1024 * 1024;

  function initWidget(wrap) {
    if (wrap.dataset.inited) return;
    wrap.dataset.inited = "1";
    var fileInput   = wrap.querySelector(".img-upload-file");
    var btn         = wrap.querySelector(".img-upload-btn");
    var progress    = wrap.querySelector(".img-upload-progress");
    var bar         = wrap.querySelector(".img-upload-bar");
    var progressTxt = wrap.querySelector(".img-upload-text");
    var preview     = wrap.querySelector(".img-upload-preview");
    var thumb       = wrap.querySelector(".img-upload-thumb");
    var removeBtn   = wrap.querySelector(".img-upload-remove");
    var errorEl     = wrap.querySelector(".img-upload-error");
    var urlInput    = wrap.parentElement && wrap.parentElement.querySelector("input[name='image']");
    if (!fileInput || !btn || !urlInput) return;

    function showError(m) { if (errorEl) { errorEl.textContent = m; errorEl.hidden = false; } else alert(m); }
    function hideError() { if (errorEl) errorEl.hidden = true; }
    function setProgress(p) { if (bar) bar.style.width = p + "%"; if (progressTxt) progressTxt.textContent = Math.round(p) + "%"; }
    function showPreview(url) { if (thumb) thumb.src = url; if (preview) preview.hidden = false; }
    function hidePreview() { if (preview) preview.hidden = true; if (thumb) thumb.src = ""; }

    btn.addEventListener("click", function () { fileInput.click(); });
    if (removeBtn) {
      removeBtn.addEventListener("click", function () {
        urlInput.value = "";
        urlInput.dispatchEvent(new Event("input", { bubbles: true }));
        hidePreview();
        fileInput.value = "";
      });
    }

    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      hideError();
      if (!/^image\//.test(file.type)) { showError("Filen må være et bilde."); fileInput.value = ""; return; }
      if (file.size > MAX_SIZE) { showError("Bildet er for stort (maks 10 MB)."); fileInput.value = ""; return; }

      if (progress) progress.hidden = false;
      setProgress(0);
      btn.disabled = true;

      var formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      var xhr = new XMLHttpRequest();
      xhr.open("POST", UPLOAD_URL);
      xhr.upload.addEventListener("progress", function (e) {
        if (e.lengthComputable) setProgress((e.loaded / e.total) * 100);
      });
      xhr.addEventListener("load", function () {
        btn.disabled = false;
        if (progress) progress.hidden = true;
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            var data = JSON.parse(xhr.responseText);
            var url = data.secure_url || data.url;
            if (url) {
              urlInput.value = url;
              urlInput.dispatchEvent(new Event("input", { bubbles: true }));
              urlInput.dispatchEvent(new Event("change", { bubbles: true }));
              showPreview(url);
            } else { showError("Opplastingen returnerte ingen URL."); }
          } catch (e) { showError("Kunne ikke tolke svar fra Cloudinary."); }
        } else {
          try {
            var err = JSON.parse(xhr.responseText);
            showError("Opplasting feilet: " + ((err.error && err.error.message) || "ukjent feil"));
          } catch (e) { showError("Opplasting feilet (status " + xhr.status + ")."); }
        }
      });
      xhr.addEventListener("error", function () {
        btn.disabled = false;
        if (progress) progress.hidden = true;
        showError("Nettverksfeil ved opplasting.");
      });
      xhr.send(formData);
    });

    if (urlInput.value) showPreview(urlInput.value);
    urlInput.addEventListener("input", function () {
      if (urlInput.value) showPreview(urlInput.value); else hidePreview();
    });
  }

  function initAll() { document.querySelectorAll(".img-upload-wrap").forEach(initWidget); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initAll);
  else initAll();
  new MutationObserver(function () { initAll(); }).observe(document.body, { childList: true, subtree: true });
})();
