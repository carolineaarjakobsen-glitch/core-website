// ============================================================
//  Glimt – pwa.js
//  Legger til PWA-meta-tags dynamisk + registrerer service worker.
//  Inkluderes på alle sider med: <script src="pwa.js"></script>
// ============================================================

(function () {
  "use strict";

  // ── 1. Legg til meta-tags og manifest-link hvis de mangler ──
  function ensureMeta(attr, value, content, extra) {
    var existing = document.querySelector("meta[" + attr + "='" + value + "']");
    if (existing) return existing;
    var m = document.createElement("meta");
    m.setAttribute(attr, value);
    if (content !== undefined) m.setAttribute("content", content);
    if (extra) Object.keys(extra).forEach(function (k) { m.setAttribute(k, extra[k]); });
    document.head.appendChild(m);
    return m;
  }

  function ensureLink(rel, href, extra) {
    var existing = document.querySelector("link[rel='" + rel + "']");
    if (existing) return existing;
    var l = document.createElement("link");
    l.rel = rel;
    l.href = href;
    if (extra) Object.keys(extra).forEach(function (k) { l.setAttribute(k, extra[k]); });
    document.head.appendChild(l);
    return l;
  }

  // Manifest
  ensureLink("manifest", "manifest.json");

  // Theme color (status bar på Android / Safari)
  ensureMeta("name", "theme-color", "#5D372A");

  // Apple-spesifikk (installerbar på iOS)
  ensureMeta("name", "apple-mobile-web-app-capable", "yes");
  ensureMeta("name", "apple-mobile-web-app-status-bar-style", "default");
  ensureMeta("name", "apple-mobile-web-app-title", "Glimt");
  ensureLink("apple-touch-icon", "apple-touch-icon.png");

  // Favicon
  ensureLink("icon", "favicon-32.png", { type: "image/png", sizes: "32x32" });

  // Mobil-viewport (alle sider har allerede, men for sikkerhets skyld)
  if (!document.querySelector("meta[name='viewport']")) {
    ensureMeta("name", "viewport", "width=device-width, initial-scale=1.0, viewport-fit=cover");
  }

  // ── 2. Registrer service worker ──
  if ("serviceWorker" in navigator) {
    // Vent til etter load for å ikke sabotere første-side-rendering
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(
        function (reg) {
          // Sjekk for nye versjoner hvert 60. minutt
          setInterval(function () { reg.update(); }, 60 * 60 * 1000);
        },
        function (err) {
          console.warn("Service worker-registrering feilet:", err);
        }
      );
    });
  }

  // ── 3. "Install"-prompt håndtering (Android / Chrome-desktop) ──
  // Lagrer prompten og viser en liten banner-knapp dersom appen ikke er installert.
  var deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  function showInstallBanner() {
    if (!deferredPrompt) return;
    if (sessionStorage.getItem("glimt-install-dismissed") === "1") return;
    if (document.getElementById("glimt-install-banner")) return;

    var bar = document.createElement("div");
    bar.id = "glimt-install-banner";
    bar.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;background:#5D372A;color:#FFF7E0;padding:12px 14px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.25);display:flex;align-items:center;gap:10px;z-index:9999;font-family:'Poppins',sans-serif;font-size:14px;max-width:420px;margin:0 auto";
    bar.innerHTML =
      '<span style="flex:1">Installer Glimt som app p\u00e5 hjem-skjermen?</span>' +
      '<button id="glimt-install-yes" style="background:#EA672D;color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;font:inherit;font-weight:500">Installer</button>' +
      '<button id="glimt-install-no" style="background:transparent;color:#FFF7E0;border:none;padding:8px 10px;cursor:pointer;font:inherit;opacity:0.7">Ikke n\u00e5</button>';
    document.body.appendChild(bar);

    document.getElementById("glimt-install-yes").addEventListener("click", function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () {
        deferredPrompt = null;
        bar.remove();
      });
    });
    document.getElementById("glimt-install-no").addEventListener("click", function () {
      sessionStorage.setItem("glimt-install-dismissed", "1");
      bar.remove();
    });
  }

  // Når appen faktisk blir installert
  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    var bar = document.getElementById("glimt-install-banner");
    if (bar) bar.remove();
  });
})();
