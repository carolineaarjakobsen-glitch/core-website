// ============================================================
//  Glimt - auth-guard.js (standalone)
//  Viser siden som inspirasjon bak en minimal modal hvis
//  brukeren ikke er logget inn.
// ============================================================

(function () {
  "use strict";

  if (typeof firebase === "undefined" || !firebase.auth) {
    console.error("auth-guard: firebase-auth maa lastes foer auth-guard.js");
    return;
  }

  var authInstance = firebase.auth();

  function buildModal() {
    var style = document.createElement("style");
    style.id = "glimt-auth-guard-style";
    style.textContent = ""
      + ".glimt-auth-locked { overflow: hidden !important; }"
      + ".glimt-auth-locked > *:not(.glimt-auth-overlay) { pointer-events: none !important; user-select: none !important; }"
      + ".glimt-auth-overlay { position: fixed; inset: 0; z-index: 99999;"
      + "  background: rgba(20, 20, 25, 0.42); backdrop-filter: blur(2px);"
      + "  -webkit-backdrop-filter: blur(2px);"
      + "  display: flex; align-items: center; justify-content: center;"
      + "  padding: 20px; animation: glimt-auth-fade 0.2s ease-out;"
      + "  font-family: 'Poppins', -apple-system, system-ui, sans-serif; }"
      + "@keyframes glimt-auth-fade { from { opacity: 0; } to { opacity: 1; } }"
      + ".glimt-auth-card { background: #fff; border-radius: 14px; width: 320px; max-width: 100%;"
      + "  padding: 26px 24px 20px; box-shadow: 0 12px 40px rgba(0,0,0,0.18); }"
      + ".glimt-auth-card h2 { margin: 0 0 6px; font-family: 'DM Sans', 'Poppins', sans-serif;"
      + "  font-size: 17px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.01em; }"
      + ".glimt-auth-card p  { margin: 0 0 18px; color: #666; line-height: 1.5; font-size: 13.5px; }"
      + ".glimt-auth-btn { display: block; width: 100%; background: #5D372A; color: #fff;"
      + "  border: none; padding: 11px; border-radius: 8px; font-family: inherit;"
      + "  font-size: 14px; font-weight: 500; cursor: pointer;"
      + "  transition: background 0.15s; }"
      + ".glimt-auth-btn:hover  { background: #4a2a1f; }"
      + ".glimt-auth-link { display: block; text-align: center; margin-top: 10px; color: #999;"
      + "  font-size: 12.5px; text-decoration: none; }"
      + ".glimt-auth-link:hover { color: #1a1a1a; }";
    document.head.appendChild(style);

    document.body.classList.add("glimt-auth-locked");

    var overlay = document.createElement("div");
    overlay.className = "glimt-auth-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "glimt-auth-title");

    overlay.innerHTML = ""
      + "<div class=\"glimt-auth-card\">"
      +   "<h2 id=\"glimt-auth-title\">Logg inn for å fortsette</h2>"
      +   "<p>Denne siden krever innlogging.</p>"
      +   "<button type=\"button\" class=\"glimt-auth-btn\" id=\"glimt-auth-login-btn\">Logg inn</button>"
      +   "<a class=\"glimt-auth-link\" href=\"index.html\">Tilbake til forsiden</a>"
      + "</div>";

    document.body.appendChild(overlay);

    var loginBtn = document.getElementById("glimt-auth-login-btn");
    loginBtn.addEventListener("click", function () {
      var here = window.location.pathname + window.location.search;
      window.location.href = "login.html?return=" + encodeURIComponent(here);
    });
    setTimeout(function () { loginBtn.focus(); }, 50);
  }

  function showModalWhenReady() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", buildModal);
    } else {
      buildModal();
    }
  }

  var unsubscribe = authInstance.onAuthStateChanged(function (user) {
    unsubscribe();
    if (!user) {
      showModalWhenReady();
    }
  });
})();
