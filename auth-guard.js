// ============================================================
//  Glimt – auth-guard.js (standalone)
//  Sikrer at brukeren er innlogget før en side lastes. Hvis
//  ikke logget inn, redirectes til login.html med gjeldende
//  side som ?redirect=... slik at login.js kan sende brukeren
//  tilbake etterpå.
//
//  Kravene er kun Firebase App + Firebase Auth. Inkluder fila
//  ETTER firebase-config.js og FØR side-spesifikk JS.
//
//  Bruk: <script src="auth-guard.js"></script>
// ============================================================

(function () {
  "use strict";

  if (typeof firebase === "undefined" || !firebase.auth) {
    console.error("auth-guard: firebase-auth må lastes før auth-guard.js");
    return;
  }

  var auth = firebase.auth();

  // Skjul body-innholdet til vi vet om brukeren er logget inn,
  // slik at vi ikke blinker innhold før en eventuell redirect.
  var style = document.createElement("style");
  style.id = "glimt-auth-guard-style";
  style.textContent = "body { visibility: hidden; }";
  document.documentElement.appendChild(style);

  function revealBody() {
    var el = document.getElementById("glimt-auth-guard-style");
    if (el) el.remove();
  }

  function redirectToLogin() {
    // login.js bruker ?return= for å sende brukeren tilbake etter login
    var here = window.location.pathname + window.location.search;
    var url  = "login.html?return=" + encodeURIComponent(here);
    window.location.replace(url);
  }

  // Vent på at Firebase har avgjort auth-tilstanden
  var unsubscribe = auth.onAuthStateChanged(function (user) {
    unsubscribe();
    if (!user) {
      redirectToLogin();
      return;
    }
    revealBody();
  });
})();
