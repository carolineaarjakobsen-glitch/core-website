// ============================================================
//  Glimt – bottom-nav.js
//  Auto-injiserer en mobil bottom navigation bar (4 ikoner) på
//  alle hovedsider. Vises kun under 768 px (via CSS).
//  Skjules på login-siden og evt. andre sider via class="gbn-hide" på <html>.
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
    if (path === "bucket-list.html") return "bucket";
    return null;
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
        id: "bucket",
        href: "bucket-list.html",
        label: "Bucketlist",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>'
      }
    ];

    var html = items.map(function (item) {
      var active = item.id === current ? " gbn-item--active" : "";
      var primary = item.primary ? " gbn-item--primary" : "";
      var iconBlock = item.primary
        ? '<span class="gbn-icon-wrap"><span class="gbn-icon">' + item.icon + "</span></span>"
        : '<span class="gbn-icon">' + item.icon + "</span>";
      return (
        '<a href="' + item.href + '" class="gbn-item' + active + primary + '" aria-label="' + item.label + '">' +
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
