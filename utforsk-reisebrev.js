// ============================================================
//  Glimt – utforsk-reisebrev.js
//  Viser en feed av andres reisebrev for en gitt by.
//  Bruker community demo-data inntil backend er på plass.
// ============================================================

// ── Community demo-reisebrev ────────────────────────────────
const COMMUNITY_REISEBREV = [
  {
    id: "community-roma-1",
    title: "Helgetur til Roma",
    city: "Roma",
    author: "Glimt",
    initials: "✦",
    isGlimt: true,
    createdAt: "2026-03-18T10:00:00Z",
    desc: "Tre dager med pasta, espresso og solnedganger over Trastevere. En perfekt helg for to.",
    likes: 24,
    stops: 4,
    images: [
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
      "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=800&q=80",
      "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&q=80",
      "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=800&q=80"
    ]
  },
  {
    id: "community-roma-2",
    title: "Roma med barn",
    city: "Roma",
    author: "Glimt",
    initials: "✦",
    isGlimt: true,
    createdAt: "2026-02-05T10:00:00Z",
    desc: "Gelato-jakt, Colosseum og en overraskende rolig park midt i kaoset. Barna elsket det.",
    likes: 31,
    stops: 5,
    images: [
      "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80",
      "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&q=80",
      "https://images.unsplash.com/photo-1555992828-ca4dbe41d294?w=800&q=80",
      "https://images.unsplash.com/photo-1548585744-f4532d07895f?w=800&q=80"
    ]
  },
  {
    id: "community-roma-3",
    title: "Romas skjulte perler",
    city: "Roma",
    author: "Glimt",
    initials: "✦",
    isGlimt: true,
    createdAt: "2026-01-22T10:00:00Z",
    desc: "Bort fra turistfellene – bakgater, lokale vinbarer og kirker ingen snakker om.",
    likes: 18,
    stops: 6,
    images: [
      "https://images.unsplash.com/photo-1546436836-07a91091f160?w=800&q=80",
      "https://images.unsplash.com/photo-1542820229-081e0c12af0b?w=800&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
      "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=800&q=80"
    ]
  },
  {
    id: "community-kbh-1",
    title: "Kulinarisk København",
    city: "København",
    author: "Glimt",
    initials: "✦",
    isGlimt: true,
    createdAt: "2026-03-10T10:00:00Z",
    desc: "Smørrebrød, naturvin og den beste kanelsnurr i Norden. En mattur gjennom hele byen.",
    likes: 42,
    stops: 5,
    images: [
      "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&q=80",
      "https://images.unsplash.com/photo-1552084117-56a987666449?w=800&q=80",
      "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=800&q=80",
      "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80"
    ]
  },
  {
    id: "community-kbh-2",
    title: "Sykkel-eventyr i KBH",
    city: "København",
    author: "Glimt",
    initials: "✦",
    isGlimt: true,
    createdAt: "2026-02-28T10:00:00Z",
    desc: "To dager på sykkel fra Nyhavn til Refshaleøen. Perfekt tempo for å oppdage byen.",
    likes: 27,
    stops: 4,
    images: [
      "https://images.unsplash.com/photo-1508926024405-3cd4e6e0e2a3?w=800&q=80",
      "https://images.unsplash.com/photo-1558005530-a7958896ec60?w=800&q=80",
      "https://images.unsplash.com/photo-1524168272322-bf73616d9cb5?w=800&q=80",
      "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80"
    ]
  },
  {
    id: "community-kbh-3",
    title: "Design & arkitektur",
    city: "København",
    author: "Glimt",
    initials: "✦",
    isGlimt: true,
    createdAt: "2026-01-15T10:00:00Z",
    desc: "Louisiana, Blox og den nye bydelen Nordhavn. Dansk design på sitt beste.",
    likes: 35,
    stops: 3,
    images: [
      "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&q=80",
      "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80",
      "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&q=80",
      "https://images.unsplash.com/photo-1552084117-56a987666449?w=800&q=80"
    ]
  },
  {
    id: "community-stockholm-1",
    title: "Høsttur til Stockholm",
    city: "Stockholm",
    author: "Glimt",
    initials: "✦",
    isGlimt: true,
    createdAt: "2026-03-02T10:00:00Z",
    desc: "Gylne blader, fika på Vete-Katten og en vandring gjennom Gamla stan i skumringen.",
    likes: 29,
    stops: 4,
    images: [
      "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&q=80",
      "https://images.unsplash.com/photo-1578950114438-7b26a87f2032?w=800&q=80",
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80",
      "https://images.unsplash.com/photo-1501621667575-af81f1f0bacc?w=800&q=80"
    ]
  },
  {
    id: "community-stockholm-2",
    title: "Stockholm for matnerder",
    city: "Stockholm",
    author: "Glimt",
    initials: "✦",
    isGlimt: true,
    createdAt: "2026-02-14T10:00:00Z",
    desc: "Fra Östermalms matmarknad til hemmelige ramen-steder i Södermalm.",
    likes: 21,
    stops: 5,
    images: [
      "https://images.unsplash.com/photo-1572883454120-e8d0b19b22db?w=800&q=80",
      "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&q=80",
      "https://images.unsplash.com/photo-1501621667575-af81f1f0bacc?w=800&q=80",
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80"
    ]
  },
  {
    id: "community-dublin-1",
    title: "Dublin på tre dager",
    city: "Dublin",
    author: "Glimt",
    initials: "✦",
    isGlimt: true,
    createdAt: "2026-03-25T10:00:00Z",
    desc: "Temple Bar, Guinness Storehouse og en dagstur til Howth. Irland leverer alltid.",
    likes: 33,
    stops: 6,
    images: [
      "https://images.unsplash.com/photo-1564959130747-897fb406b9af?w=800&q=80",
      "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=800&q=80",
      "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=800&q=80",
      "https://images.unsplash.com/photo-1560155016-661e1aab4117?w=800&q=80"
    ]
  },
  {
    id: "community-dublin-2",
    title: "Litterært Dublin",
    city: "Dublin",
    author: "Glimt",
    initials: "✦",
    isGlimt: true,
    createdAt: "2026-01-30T10:00:00Z",
    desc: "I fotsporene til Joyce, Wilde og Yeats. Puber, bokhandlere og forfatterhus.",
    likes: 19,
    stops: 4,
    images: [
      "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=800&q=80",
      "https://images.unsplash.com/photo-1564959130747-897fb406b9af?w=800&q=80",
      "https://images.unsplash.com/photo-1560155016-661e1aab4117?w=800&q=80",
      "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=800&q=80"
    ]
  },
  {
    id: "community-garda-1",
    title: "Malcesine – slott, taubane og hemmeligheter",
    city: "Gardasjøen",
    author: "Glimt",
    initials: "✦",
    isGlimt: true,
    createdAt: "2026-03-25T10:00:00Z",
    desc: "Fire dager i Malcesine med taubanen til Monte Baldo, bading fra klippene i Cassone og den beste pastaen jeg har smakt – på et sted uten nettside.",
    likes: 38,
    stops: 5,
    images: [
      "https://images.unsplash.com/photo-1534631006967-ec4c5765fa2b?w=800&q=80",
      "https://images.unsplash.com/photo-1597220869819-151d5be9c099?w=800&q=80",
      "https://images.unsplash.com/photo-1555992828-ca4dbe41d294?w=800&q=80",
      "https://images.unsplash.com/photo-1602002418679-40d185505577?w=800&q=80"
    ]
  },
  {
    id: "community-garda-2",
    title: "Limone – sitronlunder og solnedganger",
    city: "Gardasjøen",
    author: "Glimt",
    initials: "✦",
    isGlimt: true,
    createdAt: "2026-04-02T10:00:00Z",
    desc: "Tre netter i Limone med sykkelstien over vannet, hjemmelaget limoncello og kveldsturer langs havnen. Et sted som stopper tiden.",
    likes: 42,
    stops: 4,
    images: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
      "https://images.unsplash.com/photo-1602002418679-40d185505577?w=800&q=80",
      "https://images.unsplash.com/photo-1534631006967-ec4c5765fa2b?w=800&q=80",
      "https://images.unsplash.com/photo-1597220869819-151d5be9c099?w=800&q=80"
    ]
  }
];

// ── Formatér dato ───────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

// ── Bygg ett feed-kort ──────────────────────────────────────
function buildFeedCard(item) {
  const imgs = (item.images || []).slice(0, 4);
  const tiles = imgs
    .map(src => `<div class="feed-card-mosaic-tile" style="background-image:url('${src}')"></div>`)
    .join("");

  const isGlimt = item.isGlimt || false;
  const avatarClass = isGlimt ? "feed-card-avatar feed-card-avatar--glimt" : "feed-card-avatar";
  const badge = isGlimt ? `<span class="feed-card-glimt-badge">Glimt anbefaler</span>` : "";

  return `
    <a class="feed-card ${isGlimt ? "feed-card--glimt" : ""}" href="glimt-detalj.html?id=${encodeURIComponent(item.id)}">
      <div class="feed-card-mosaic">
        ${tiles}
        ${badge}
      </div>
      <div class="feed-card-body">
        <div class="feed-card-author">
          <div class="${avatarClass}">${item.initials || "?"}</div>
          <div class="feed-card-author-info">
            <span class="feed-card-author-name">${item.author || "Anonym"}</span>
            <span class="feed-card-author-date">${formatDate(item.createdAt)}</span>
          </div>
        </div>
        <h2 class="feed-card-title">${item.title || "Uten tittel"}</h2>
        <p class="feed-card-desc">${item.desc || ""}</p>
        <div class="feed-card-footer">
          <div class="feed-card-stats">
            <span class="feed-card-stat">
              <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              ${item.likes || 0}
            </span>
            <span class="feed-card-stat">
              <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="10" r="3"/>
                <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z"/>
              </svg>
              ${item.stops || 0} stopp
            </span>
          </div>
          <span class="feed-card-read">
            Les mer
            <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
        <button class="save-glimt-btn ${typeof isGlimtSaved === 'function' && isGlimtSaved(item.id) ? 'save-glimt-btn--saved' : ''}"
                data-save-id="${item.id}"
                data-save-title="${(item.title || '').replace(/"/g, '&quot;')}"
                data-save-city="${(item.city || '').replace(/"/g, '&quot;')}"
                data-save-author="${(item.author || '').replace(/"/g, '&quot;')}"
                data-save-image="${(item.images && item.images[0]) || ''}"
                onclick="event.preventDefault(); event.stopPropagation(); toggleSaveReisebrev(this);">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          ${typeof isGlimtSaved === 'function' && isGlimtSaved(item.id) ? 'Lagret' : 'Lagre'}
        </button>
      </div>
    </a>
  `;
}

// ── Init ────────────────────────────────────────────────────
function init() {
  const params   = new URLSearchParams(window.location.search);
  const cityName = params.get("city") || "";

  document.title = `Glimt – Reisebrev fra ${cityName || "alle byer"}`;

  // Sett bynavn i header
  const citySpan = document.getElementById("utforsk-city-name");
  if (citySpan) citySpan.textContent = cityName || "alle byer";

  // Tilbakelenke
  const backLink = document.getElementById("back-link");
  if (backLink && cityName) {
    backLink.href = `city-landing.html?city=${encodeURIComponent(cityName)}`;
  }

  // Hent brukerens delte guider fra localStorage
  let userGuides = [];
  try {
    const raw = localStorage.getItem("glimt.userGlimts");
    if (raw) {
      const all = JSON.parse(raw);
      if (Array.isArray(all)) {
        userGuides = all
          .filter(g => g.isGuide)
          .map(g => ({
            id:        g.id,
            title:     g.title || "Uten tittel",
            city:      g.city || "",
            author:    "Deg",
            initials:  "DG",
            createdAt: g.createdAt,
            desc:      (g.glimts && g.glimts[0] && g.glimts[0].note) || "",
            likes:     0,
            stops:     g.glimts ? g.glimts.length : 0,
            images:    g.glimts
              ? g.glimts.filter(gl => gl.image).map(gl => gl.image).slice(0, 4)
              : []
          }));
      }
    }
  } catch (_) {}

  // Kombiner community og brukerens delte guider
  let items = [...userGuides, ...COMMUNITY_REISEBREV];
  if (cityName) {
    items = items.filter(r => r.city === cityName);
  }

  renderFeed(items);
  setupFilters(items);
}



// ── Render feed ─────────────────────────────────────────────
function renderFeed(items) {
  const feed  = document.getElementById("utforsk-feed");
  const empty = document.getElementById("utforsk-empty");
  if (!feed || !empty) return;

  if (items.length === 0) {
    feed.innerHTML = "";
    feed.style.display = "none";
    empty.style.display = "block";
    return;
  }

  feed.style.display = "grid";
  empty.style.display = "none";
  feed.innerHTML = items.map(buildFeedCard).join("");
}

// ── Filter chips ────────────────────────────────────────────
function setupFilters(allItems) {
  const chips = document.querySelectorAll(".filter-chip");

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const filter = chip.dataset.filter;
      let sorted = [...allItems];

      if (filter === "nyeste") {
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (filter === "populære") {
        sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      }

      renderFeed(sorted);
    });
  });
}

// ── Lagre/fjerne reisebrev som glimt ───────────────────────
function toggleSaveReisebrev(btn) {
  const id     = btn.dataset.saveId;
  const title  = btn.dataset.saveTitle;
  const city   = btn.dataset.saveCity;
  const author = btn.dataset.saveAuthor;
  const image  = btn.dataset.saveImage;

  if (isGlimtSaved(id)) {
    removeSavedGlimt(id);
    btn.classList.remove("save-glimt-btn--saved");
    btn.querySelector("span") || (btn.lastChild.textContent = " Lagre");
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> Lagre`;
    showToast("Fjernet fra lagrede glimt", "remove");
  } else {
    addSavedGlimt({ id, title, city, author, image, type: "glimt", savedAt: new Date().toISOString() });
    btn.classList.add("save-glimt-btn--saved");
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> Lagret`;
    showToast("Lagret til mine reiseplaner!", "success");
  }
}

document.addEventListener("DOMContentLoaded", init);
