// ============================================================
//  Glimt – glimt-detalj.js
//  Leser et enkelt reisebrev fra localStorage via ?id=...
//  og rendrer det som en vertikal visning.
// ============================================================

const STORAGE_KEY = "glimt.userGlimts";

// ── Hent ID fra URL ──────────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const guideId = params.get("id");

// ── Hent alle reisebrev ──────────────────────────────────────
function loadGuides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function saveGuides(guides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guides));
    return true;
  } catch (_) {
    return false;
  }
}

// ── Formater dato ────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// ── Escape HTML ──────────────────────────────────────────────
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, s => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[s]));
}

// ── Render «ikke funnet» ─────────────────────────────────────
function renderNotFound() {
  const main = document.getElementById("detalj-main");
  main.innerHTML = `
    <div class="detalj-notfound">
      <h2>Reisebrevet finnes ikke</h2>
      <p>Det ser ut til at dette reisebrevet er slettet eller ikke eksisterer.</p>
      <a href="mine-glimt.html">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Tilbake til mine reisebrev
      </a>
    </div>
  `;
}

// ── Render ett enkelt glimt ──────────────────────────────────
function renderGlimt(glimt, index) {
  const images = [];
  if (glimt.image) images.push(glimt.image);
  if (glimt.image2 && glimt.image2 !== glimt.image) images.push(glimt.image2);
  const hasImages = images.length > 0;

  let photosHtml = "";
  if (hasImages) {
    const slidesHtml = images.map(function (url) {
      return `<div class="postcard-slide" style="background-image:url('${url}')"></div>`;
    }).join("");
    const dotsHtml = images.length > 1
      ? `<div class="postcard-carousel-dots">` +
          images.map(function (_, i) {
            return `<button type="button" class="postcard-carousel-dot${i === 0 ? ' postcard-carousel-dot--active' : ''}" data-slide="${i}" aria-label="Bilde ${i + 1}"></button>`;
          }).join("") +
        `</div>`
      : "";
    const arrowsHtml = images.length > 1
      ? `<button type="button" class="postcard-carousel-arrow postcard-carousel-arrow--prev" aria-label="Forrige bilde">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
         </button>
         <button type="button" class="postcard-carousel-arrow postcard-carousel-arrow--next" aria-label="Neste bilde">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
         </button>`
      : "";
    photosHtml = `<div class="postcard-photos">
      <div class="postcard-carousel" data-total="${images.length}">
        <div class="postcard-slides">${slidesHtml}</div>
        ${arrowsHtml}
        ${dotsHtml}
      </div>
    </div>`;
  }

  const address = glimt.address || glimt.sted || "";
  const city = glimt.city || "";
  const title = glimt.title || "Uten tittel";
  const emoji = glimt.emoji || "✈️";
  const desc = glimt.desc || glimt.note || "";

  const addressHtml = address
    ? `<div class="postcard-address">
         <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
           <circle cx="12" cy="9" r="2.5"/>
         </svg>
         ${escapeHtml(address)}
       </div>`
    : "";

  const postmarkHtml = city
    ? `<div class="postcard-postmark">
         <div class="postcard-postmark-city">${escapeHtml(city)}</div>
         <div class="postcard-postmark-dots">• • •</div>
       </div>`
    : "";

  const glimtSaveId = "glimt-" + (glimt.title || "").replace(/\s+/g, "-").toLowerCase() + "-" + index;
  const isSaved = typeof isGlimtSaved === "function" ? isGlimtSaved(glimtSaveId) : false;
  const saveBtn = `
    <button class="save-glimt-btn ${isSaved ? 'save-glimt-btn--saved' : ''}"
            data-save-id="${glimtSaveId}"
            data-save-title="${escapeHtml(glimt.title || 'Uten tittel')}"
            data-save-image="${images[0] || ''}"
            data-save-note="${escapeHtml(desc)}"
            onclick="toggleSaveGlimtEntry(this)">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
      ${isSaved ? 'Lagret' : 'Lagre glimt'}
    </button>`;

  return `
    <article class="postcard${hasImages ? '' : ' postcard--no-image'}">
      ${photosHtml}
      <div class="postcard-content">
        <div class="postcard-index">N° ${String(index + 1).padStart(2, "0")}</div>
        <div class="postcard-stamp">
          <div class="postcard-stamp-inner">${escapeHtml(emoji)}</div>
        </div>
        ${postmarkHtml}
        <h3 class="postcard-title">${escapeHtml(title)}</h3>
        ${addressHtml}
        <div class="postcard-divider"></div>
        <div class="postcard-message">${escapeHtml(desc)}</div>
        <div class="postcard-footer">${saveBtn}</div>
      </div>
    </article>
  `;
}

// ── Geocoding via Nominatim ──────────────────────────────────
async function geocodeAddress(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "no,en" }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (_) {}
  return null;
}

// ── Bygg kartet ─────────────────────────────────────────────
async function buildMap(glimts) {
  const mapContainer = document.getElementById("glimt-map");
  if (!mapContainer || !glimts.length) return;

  // Geocode alle glimt som mangler koordinater
  const coords = [];
  for (let i = 0; i < glimts.length; i++) {
    const g = glimts[i];
    let lat = g.lat, lon = g.lon;
    if ((!lat || !lon) && g.address) {
      const result = await geocodeAddress(g.address);
      if (result) { lat = result.lat; lon = result.lon; }
    }
    if (lat && lon) {
      coords.push({ lat, lon, title: g.title || `Glimt ${i + 1}`, address: g.address, index: i });
    }
  }

  if (coords.length === 0) {
    mapContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#7a5044;font-family:DM Sans,sans-serif;font-size:0.9rem;">Ingen adresser å vise på kartet</div>';
    return;
  }

  // Fjern loading-tekst
  mapContainer.innerHTML = "";

  // Initialiser Leaflet-kartet
  const map = L.map("glimt-map", {
    zoomControl: false,
    scrollWheelZoom: false
  });

  // Zoom-kontroll øverst til høyre
  L.control.zoom({ position: "topright" }).addTo(map);

  // Varme, dempede kartfliser (CartoDB Positron med varm tone)
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19
  }).addTo(map);

  // Custom nummererte markører
  const markers = coords.map((c, i) => {
    const icon = L.divIcon({
      className: "glimt-marker-container",
      html: `<div class="glimt-marker">${c.index + 1}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -20]
    });

    const marker = L.marker([c.lat, c.lon], { icon }).addTo(map);
    marker.bindPopup(`<strong>${escapeHtml(c.title)}</strong><small>${escapeHtml(c.address || "")}</small>`);
    return marker;
  });

  // Rute-linje mellom stoppene
  if (coords.length >= 2) {
    const latlngs = coords.map(c => [c.lat, c.lon]);
    L.polyline(latlngs, {
      color: "#5D372A",
      weight: 3,
      opacity: 0.6,
      dashArray: "8, 8",
      lineCap: "round"
    }).addTo(map);
  }

  // Tilpass kartets visningsområde
  const group = L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.3));

  // Aktiver scroll-zoom etter første klikk
  map.on("click", () => { map.scrollWheelZoom.enable(); });
}

// ── Render hele reisebrevet ──────────────────────────────────
function renderGuide(guide) {
  const main = document.getElementById("detalj-main");

  const glimts = Array.isArray(guide.glimts) ? guide.glimts : [];
  const glimtsHtml = glimts.map(renderGlimt).join("");

  // Sjekk om noen glimt har adresse (for å vise kartet)
  const hasAddresses = glimts.some(g => g.address || (g.lat && g.lon));

  // Demo-reisebrev kan verken redigeres eller slettes
  const isDemo = String(guide.id).startsWith("demo-");

  const ownerActionsHtml = isDemo
    ? ""
    : `
      <div class="detalj-owner-actions">
        <a href="opprett-glimt.html?edit=${encodeURIComponent(guide.id)}"
           class="detalj-edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
          </svg>
          Rediger reisebrev
        </a>
        <button type="button" id="delete-guide-btn" class="detalj-delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          </svg>
          Slett reisebrev
        </button>
      </div>
    `;

  const mapHtml = hasAddresses
    ? `
      <section class="detalj-map-section">
        <div class="detalj-map-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
            <line x1="8" y1="2" x2="8" y2="18"/>
            <line x1="16" y1="6" x2="16" y2="22"/>
          </svg>
          Din reiserute
        </div>
        <div class="detalj-map-wrap">
          <div id="glimt-map">
            <div class="detalj-map-loading">Laster kart…</div>
          </div>
        </div>
      </section>
    `
    : "";

  main.innerHTML = `
    <section class="detalj-header">
      <div class="detalj-eyebrow">Reisebrev</div>
      <h1 class="detalj-title" data-edit-field="title" data-owner="${!isDemo ? '1' : '0'}">${escapeHtml(guide.title || "Uten tittel")}</h1>
      <p class="detalj-subtitle" data-edit-field="subtitle" data-owner="${!isDemo ? '1' : '0'}" data-empty="${guide.subtitle ? '0' : '1'}">${escapeHtml(guide.subtitle || (!isDemo ? 'Legg til en undertekst...' : ''))}</p>
      <div class="detalj-meta">
        <span>${escapeHtml(formatDate(guide.createdAt))}</span>
        <span class="detalj-meta-dot"></span>
        <span class="detalj-count">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          ${glimts.length} glimt
        </span>
      </div>
      ${ownerActionsHtml}
    </section>

    ${guide.spotifyUrl && window.spotifyToEmbedUrl && window.spotifyToEmbedUrl(guide.spotifyUrl)
      ? '<div class="spotify-hero"><iframe src="' + window.spotifyToEmbedUrl(guide.spotifyUrl) + '" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div>'
      : ''}

    ${mapHtml}

    <section class="detalj-glimts">
      ${glimtsHtml}
    </section>

    <div class="detalj-actions">
      <a href="mine-glimt.html" class="detalj-back">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Mine reisebrev
      </a>
    </div>
  `;

  // Bygg kartet asynkront
  if (hasAddresses) {
    buildMap(glimts);
  }

  // Slette-knapp
  const delBtn = document.getElementById("delete-guide-btn");
  if (delBtn) {
    delBtn.addEventListener("click", () => {
      const ok = confirm("Er du sikker på at du vil slette dette reisebrevet?");
      if (!ok) return;
      const all = loadGuides().filter(g => g.id !== guide.id);
      saveGuides(all);
      window.location.href = "mine-glimt.html";
    });
  }
}

// ── Lagre/fjerne enkelt glimt ────────────────────────────────
function toggleSaveGlimtEntry(btn) {
  const id    = btn.dataset.saveId;
  const title = btn.dataset.saveTitle;
  const image = btn.dataset.saveImage;
  const note  = btn.dataset.saveNote;

  // Hent guide-info for city og author
  const saved = loadGuides();
  let guide = saved.find(g => g.id === guideId);
  if (!guide && Array.isArray(window.GLIMT_DEMOS)) {
    guide = window.GLIMT_DEMOS.find(g => g.id === guideId);
  }
  const city = guide ? (guide.city || "") : "";
  const author = guide ? (guide.author || "Glimt") : "Glimt";

  if (isGlimtSaved(id)) {
    removeSavedGlimt(id);
    btn.classList.remove("save-glimt-btn--saved");
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> Lagre glimt`;
    showToast("Fjernet fra lagrede glimt", "remove");
  } else {
    addSavedGlimt({ id, title, city, author, image, note, type: "glimt", savedAt: new Date().toISOString() });
    btn.classList.add("save-glimt-btn--saved");
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> Lagret`;
    showToast("Lagret til mine reiseplaner!", "success");
  }
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  if (!guideId) {
    renderNotFound();
    return;
  }
  const saved = loadGuides();
  let guide = saved.find(g => g.id === guideId);

  // Fallback: sjekk om det er et demo-reisebrev
  if (!guide && Array.isArray(window.GLIMT_DEMOS)) {
    guide = window.GLIMT_DEMOS.find(g => g.id === guideId);
  }

  if (!guide) {
    renderNotFound();
    return;
  }
  document.title = `Glimt – ${guide.title || "Reisebrev"}`;
  renderGuide(guide);
});


// ── Inline edit for tittel + undertekst ────────────────────────
function initInlineEdit(guideId) {
  var fields = document.querySelectorAll('[data-edit-field][data-owner="1"]');
  fields.forEach(function (el) {
    el.contentEditable = "true";
    el.setAttribute("spellcheck", "false");
    // Fjern placeholder-tekst ved fokus hvis undertekst er tom
    el.addEventListener("focus", function () {
      if (el.dataset.empty === "1") {
        el.textContent = "";
        el.dataset.empty = "0";
      }
    });
    el.addEventListener("blur", function () {
      var field = el.dataset.editField;
      var newVal = el.textContent.trim();
      // Unngå å lagre placeholder-tekst
      if (field === "title" && !newVal) {
        el.textContent = "Uten tittel";
      }
      if (field === "subtitle" && !newVal) {
        el.dataset.empty = "1";
        el.textContent = "Legg til en undertekst...";
      }
      // Hent guide fra storage og oppdater
      try {
        var all = (typeof loadGuides === "function") ? loadGuides() : [];
        var idx = all.findIndex(function (g) { return g.id === guideId; });
        if (idx < 0) return;
        var currentVal = (all[idx][field] || "").trim();
        if (field === "title" && newVal === "Uten tittel") newVal = "";
        if (field === "subtitle" && newVal === "Legg til en undertekst...") newVal = "";
        if (newVal === currentVal) return;
        all[idx][field] = newVal;
        all[idx].updatedAt = new Date().toISOString();
        if (typeof saveGuides === "function") saveGuides(all);
      } catch (e) { console.error("Kunne ikke lagre:", e); }
    });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); el.blur(); }
      if (e.key === "Escape") { el.blur(); }
    });
  });
}

// Hook inn init ved render
(function () {
  var origRender = window.renderGuide;
  if (typeof origRender === "function") {
    window.renderGuide = function (guide) {
      var r = origRender.apply(this, arguments);
      if (guide && guide.id) setTimeout(function () { initInlineEdit(guide.id); }, 50);
      return r;
    };
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(function () {
        var titleEl = document.querySelector('[data-edit-field="title"]');
        var params = new URLSearchParams(window.location.search);
        var id = params.get("id");
        if (titleEl && id) initInlineEdit(id);
      }, 200);
    });
  }
})();


// ── Karusell-navigasjon for postkort-bilder ────────────────
function initPostcardCarousels() {
  document.querySelectorAll(".postcard-carousel").forEach(function (car) {
    if (car.dataset.inited) return;
    car.dataset.inited = "1";
    var slides = car.querySelector(".postcard-slides");
    var total = parseInt(car.dataset.total, 10) || 1;
    if (total <= 1) return;
    var dots = car.querySelectorAll(".postcard-carousel-dot");
    var prev = car.querySelector(".postcard-carousel-arrow--prev");
    var next = car.querySelector(".postcard-carousel-arrow--next");
    var current = 0;
    function update() {
      if (slides) slides.style.transform = "translateX(-" + (current * 100) + "%)";
      dots.forEach(function (d, i) { d.classList.toggle("postcard-carousel-dot--active", i === current); });
    }
    if (prev) prev.addEventListener("click", function () { current = (current - 1 + total) % total; update(); });
    if (next) next.addEventListener("click", function () { current = (current + 1) % total; update(); });
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () { current = i; update(); });
    });
  });
}

// Hook inn karusell-init ved render
(function () {
  var origRender = window.renderGuide;
  if (typeof origRender === "function") {
    window.renderGuide = function (guide) {
      var r = origRender.apply(this, arguments);
      setTimeout(initPostcardCarousels, 100);
      return r;
    };
  }
  // Initial run
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(initPostcardCarousels, 200); });
  else setTimeout(initPostcardCarousels, 200);
  // Observer for nye postkort
  new MutationObserver(function () { initPostcardCarousels(); }).observe(document.body, { childList: true, subtree: true });
})();
