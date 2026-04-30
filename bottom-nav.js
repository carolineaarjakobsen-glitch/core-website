// ============================================================
//  Glimt – bottom-nav.js
//  Auto-injiserer en mobil bottom navigation bar (5 ikoner) på
//  alle hovedsider. Vises kun under 768 px (via CSS).
//  Skjules på login-siden og evt. andre sider via class="gbn-hide" på <html>.
//
//  Femte ikon er en profil/konto-knapp:
//    - Ikke innlogget: går til login.html?return=<her>
//    - Innlogget: viser brukerens initial; klikk åpner liten popover
//      med "Logg ut".
// ============================================================

(function () {
  "use strict";

  function getCurrentPath() {
    var p = window.location.pathname;
    // Fjern leading "/" og normaliser
    return p.replace(/^\/+/, "").toLowerCase();
  }

  // Sider hvor bottom nav skal SKJULES helt
  var HIDE_ON = [
    "login.html",
    "design-inspirasjon.html",
    "designforslag.html",
    "fargeforslag.html",
    "mockup-ny-palett.html"
  ];

  function shouldHide() {
    var path = getCurrentPath();
    if (HIDE_ON.some(function (p) { return path === p || path.endsWith("/" + p); })) return true;
    if (document.documentElement.classList.contains("gbn-hide")) return true;
    return false;
  }

  function getCurrentNav() {
    var path = getCurrentPath();
    if (path === "" || path === "index.html" || path.endsWith("/index.html") || path === "/") return "home";
    if (/mine-(glimt|enkeltglimt|reiseplaner)\.html/.test(path) || path === "min-kalender.html") return "mine";
    if (/opprett-(glimt|bucketlist)\.html/.test(path)) return "opprett";
    if (path === "explore.html" || /utforsk-(glimt|reisebrev)\.html/.test(path) || path === "city-landing.html") return "utforsk";
    if (path === "login.html") return "profil";
    return null;
  }

  // SVG-ikon for profil (logged-out state)
  var PROFILE_ICON_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="8" r="4"/>' +
    '<path d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1"/>' +
    '</svg>';

  function getInitialFromUser(user) {
    if (!user) return "";
    var src = user.displayName || user.email || "";
    src = String(src).trim();
    if (!src) return "";
    return src.charAt(0).toUpperCase();
  }

  function inject() {
    if (shouldHide()) return;
    if (document.querySelector(".glimt-bottom-nav")) return;

    var current = getCurrentNav();

    var items = [
      {
        id: "home",
        href: "index.html",
        label: "Hjem",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-5h4v5a1 1 0 001 1h3a1 1 0 001-1V10"/></svg>'
      },
      {
        id: "mine",
        href: "mine-glimt.html",
        label: "Mine",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>'
      },
      {
        id: "opprett",
        href: "opprett-glimt.html",
        label: "Opprett",
        primary: true,
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>'
      },
      {
        id: "utforsk",
        href: "explore.html",
        label: "Utforsk",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>'
      },
      {
        id: "profil",
        // href settes dynamisk basert på auth-state (login eller "#")
        href: "login.html",
        label: "Profil",
        // Markeres med en egen klasse så vi finner den senere for oppdatering
        extraClass: "gbn-item--profil",
        // Inkluderer både ikon-wrap (for initial) og selve ikonet (for utlogget)
        icon: PROFILE_ICON_SVG
      }
    ];

    var html = items.map(function (item) {
      var active = item.id === current ? " gbn-item--active" : "";
      var primary = item.primary ? " gbn-item--primary" : "";
      var extra = item.extraClass ? " " + item.extraClass : "";
      var iconBlock = item.primary
        ? '<span class="gbn-icon-wrap"><span class="gbn-icon">' + item.icon + "</span></span>"
        : '<span class="gbn-icon">' + item.icon + "</span>";
      return (
        '<a href="' + item.href + '" class="gbn-item' + active + primary + extra +
        '" aria-label="' + item.label + '" data-nav-id="' + item.id + '">' +
        iconBlock +
        '<span class="gbn-label">' + item.label + "</span>" +
        "</a>"
      );
    }).join("");

    var nav = document.createElement("nav");
    nav.className = "glimt-bottom-nav";
    nav.setAttribute("aria-label", "Hovednavigasjon");
    nav.innerHTML = html;
    document.body.appendChild(nav);

    setupProfilButton();
  }

  // ── Profil-knapp: lytter på auth-state og bytter visning ───
  function setupProfilButton() {
    var profilBtn = document.querySelector('.gbn-item--profil');
    if (!profilBtn) return;

    function setLoggedOut() {
      profilBtn.setAttribute("href", "login.html?return=" +
        encodeURIComponent(window.location.pathname + window.location.search));
      profilBtn.setAttribute("aria-label", "Logg inn");
      var iconEl = profilBtn.querySelector(".gbn-icon");
      if (iconEl) {
        iconEl.classList.remove("gbn-icon--avatar");
        iconEl.textContent = "";
        iconEl.innerHTML = PROFILE_ICON_SVG;
      }
      var labelEl = profilBtn.querySelector(".gbn-label");
      if (labelEl) labelEl.textContent = "Logg inn";
      // Standard navigasjon (ingen popover)
      profilBtn.onclick = null;
    }

    function setLoggedIn(user) {
      var initial = getInitialFromUser(user) || "·";
      profilBtn.setAttribute("href", "#profil");
      profilBtn.setAttribute("aria-label", "Profil og logg ut");
      var iconEl = profilBtn.querySelector(".gbn-icon");
      if (iconEl) {
        iconEl.classList.add("gbn-icon--avatar");
        iconEl.innerHTML = "";
        iconEl.textContent = initial;
      }
      var labelEl = profilBtn.querySelector(".gbn-label");
      if (labelEl) labelEl.textContent = "Profil";

      // Klikk åpner liten popover med "Logg ut"
      profilBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleProfilPopover(user);
      };
    }

    if (typeof firebase === "undefined" || !firebase.auth) {
      // Firebase ikke lastet på denne siden – bare gå til login
      setLoggedOut();
      return;
    }

    // Initial state mens auth hydrerer
    setLoggedOut();

    firebase.auth().onAuthStateChanged(function (user) {
      if (user) setLoggedIn(user);
      else setLoggedOut();
    });
  }

  // ── Popover med e-post + "Logg ut" ─────────────────────────
  function toggleProfilPopover(user) {
    var existing = document.querySelector(".gbn-profil-popover");
    if (existing) {
      existing.remove();
      document.removeEventListener("click", outsideClickHandler, true);
      return;
    }

    var pop = document.createElement("div");
    pop.className = "gbn-profil-popover";
    var name = (user && (user.displayName || user.email)) || "Profil";
    pop.innerHTML =
      '<div class="gbn-profil-popover-name">' + escHtml(name) + '</div>' +
      '<button type="button" class="gbn-profil-popover-logout">Logg ut</button>';
    document.body.appendChild(pop);

    pop.querySelector(".gbn-profil-popover-logout").addEventListener("click", function () {
      if (typeof firebase === "undefined" || !firebase.auth) {
        window.location.href = "login.html";
        return;
      }
      firebase.auth().signOut().then(function () {
        // auth-guard.js redirecter til login automatisk på beskyttede sider
        window.location.href = "login.html";
      }).catch(function (err) {
        console.error("Logg ut feilet:", err);
      });
    });

    // Lukk ved klikk utenfor
    setTimeout(function () {
      document.addEventListener("click", outsideClickHandler, true);
    }, 0);
  }

  function outsideClickHandler(e) {
    var pop = document.querySelector(".gbn-profil-popover");
    if (!pop) return;
    if (pop.contains(e.target)) return;
    var profilBtn = document.querySelector(".gbn-item--profil");
    if (profilBtn && profilBtn.contains(e.target)) return;
    pop.remove();
    document.removeEventListener("click", outsideClickHandler, true);
  }

  function escHtml(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
