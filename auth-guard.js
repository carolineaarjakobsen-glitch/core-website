// ============================================================
//  Glimt – auth-guard.js (standalone)
//  Sikrer at brukeren er innlogget før en side lastes. Hvis
//  ikke logget inn, redirectes til login.html med gjeldende
//  side som ?return=... slik at login.js kan sende brukeren
//  tilbake etterpå.
//
//  I tillegg lytter guarden kontinuerlig på onAuthStateChanged,
//  slik at sesjons-utløp midt i bruk også sender brukeren til
//  login (i stedet for at side-koden plutselig opererer på en
//  ikke-eksisterende bruker).
//
//  Hvis Firebase Firestore + GlimtStore er lastet, starter
//  guarden også GlimtStore.init() så snart en bruker er kjent.
//  Dette gjør at lagring/lesing kan begynne tidligst mulig –
//  og at side-koden trygt kan vente på GlimtStore.onReady()
//  før Lagre-knappen aktiveres.
//
//  Krav: Firebase App + Firebase Auth. (Firestore + glimt-store
//  er valgfritt, men sterkt anbefalt for sider som lagrer.)
//  Inkluder fila ETTER firebase-config.js og FØR side-spesifikk JS.
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

  // Husk hvilken bruker vi har startet GlimtStore.init() for, så
  // vi ikke kjører den på nytt for samme bruker (init er idempotent
  // mot samme uid, men vi unngår unødige logger).
  var initStartedForUid = null;

  function maybeInitStore(user) {
    if (!user) return;
    if (typeof window.GlimtStore !== "object") return; // siden bruker ikke storen
    if (initStartedForUid === user.uid) return;
    initStartedForUid = user.uid;
    Promise.resolve()
      .then(function () { return window.GlimtStore.init(user.uid); })
      .catch(function (err) {
        console.error("auth-guard: GlimtStore.init feilet:", err);
      });
  }

  // Lytt KONTINUERLIG. Vi unsubscriber ikke etter første callback,
  // så hvis brukeren logges ut midt i bruk (sesjons-utløp eller
  // logout fra annen fane), redirecter vi umiddelbart til login.
  var hasResolvedInitial = false;
  auth.onAuthStateChanged(function (user) {
    if (!user) {
      // Ikke innlogget – send til login (også ved sesjons-utløp).
      redirectToLogin();
      return;
    }

    // Innlogget. Start GlimtStore (no-op hvis allerede gjort) og
    // avslør body første gang.
    maybeInitStore(user);

    if (!hasResolvedInitial) {
      hasResolvedInitial = true;
      revealBody();
    }
  });
})();
