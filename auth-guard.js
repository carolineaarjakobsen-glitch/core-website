// ============================================================
//  Glimt - auth-guard.js (standalone)
//  Viser siden som inspirasjon bak en modal-popup hvis brukeren
//  ikke er logget inn. Modalen har en "Logg inn"-knapp som
//  sender brukeren videre med ?return=... slik at login.js
//  sender dem tilbake etter innlogging.
//
//  Kravene er kun Firebase App + Firebase Auth. Inkluder fila
//  ETTER firebase-config.js og FOER side-spesifikk JS.
//
//  Bruk: <script src="auth-guard.js"></script>
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
      + "  background: rgba(20, 20, 25, 0.55); backdrop-filter: blur(3px);"
      + "  -webkit-backdrop-filter: blur(3px);"
      + "  display: flex; align-items: center; justify-content: center;"
      + "  padding: 20px; animation: glimt-auth-fade 0.25s ease-out;"
      + "  font-family: 'Poppins', -apple-system, system-ui, sans-serif; }"
      + "@keyframes glimt-auth-fade { from { opacity: 0; } to { opacity: 1; } }"
      + "@keyframes glimt-auth-pop  { from { transform: translateY(12px) scale(0.96); opacity: 0; }"
      + "                              to   { transform: translateY(0) scale(1); opacity: 1; } }"
      + ".glimt-auth-card { background: #fff; border-radius: 20px; max-width: 420px; width: 100%;"
      + "  padding: 36px 30px 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.28); text-align: center;"
      + "  animation: glimt-auth-pop 0.3s cubic-bezier(.22,1,.36,1); }"
      + ".glimt-auth-icon { width: 56px; height: 56px; margin: 0 auto 18px;"
      + "  display: flex; align-items: center; justify-content: center;"
      + "  background: #FFEEBC; border-radius: 50%; }"
      + ".glimt-auth-card h2 { margin: 0 0 8px; font-family: 'DM Sans', 'Poppins', sans-serif;"
      + "  font-size: 22px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.01em; }"
      + ".glimt-auth-card p  { margin: 0 0 24px; color: #555; line-height: 1.55; font-size: 15px; }"
      + ".glimt-auth-btn { display: block; width: 100%; background: #EA672D; color: #fff;"
      + "  border: none; padding: 14px; border-radius: 12px; font-family: inherit;"
      + "  font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 8px;"
      + "  transition: background 0.2s, transform 0.1s; }"
      + ".glimt-auth-btn:hover  { background: #d15a24; }"
      + ".glimt-auth-btn:active { transform: scale(0.98); }"
      + ".glimt-auth-link { display: inline-block; margin-top: 6px; color: #888;"
      + "  font-size: 14px; text-decoration: none; padding: 6px 10px; }"
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
      +   "<div class=\"glimt-auth-icon\" aria-hidden=\"true\">"
      +     "<svg width=\"26\" height=\"26\" viewBox=\"0 0 24 24\" fill=\"none\" "
      +          "stroke=\"#EA672D\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">"
      +       "<rect x=\"4\" y=\"11\" width=\"16\" height=\"10\" rx=\"2\"/>"
      +       "<path d=\"M8 11V7a4 4 0 0 1 8 0v4\"/>"
      +     "</svg>"
      +   "</div>"
      +   "<h2 id=\"glimt-auth-title\">Logg inn for å fortsette</h2>"
      +   "<p>Du må være innlogget for å bruke denne siden. "
      +     "Logg inn eller opprett en konto for å komme i gang.</p>"
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
