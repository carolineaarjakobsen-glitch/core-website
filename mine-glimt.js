// ============================================================
//  Glimt – mine-glimt.js
//  Henter brukerens lagrede glimt og bygger flise-oversikten.
//  Når opprettelsesskjemaet er på plass lagres glimt i
//  localStorage under nøkkelen "glimt.userGlimts" som JSON:
//  [
//    {
//      id: "unik-id",
//      title: "Helgetur til Roma",
//      city: "Roma",
//      createdAt: "2026-04-11T10:00:00Z",
//      images: [url1, url2, url3, url4]   // nøyaktig 4 bilder
//    },
//    ...
//  ]
// ============================================================

const STORAGE_KEY = "glimt.userGlimts";

// Demo-dataene er definert i demo-glimts.js og tilgjengelige
// som GLIMT_DEMOS på window-objektet. De vises kun når
// brukeren ikke har lagret egne reisebrev.

// ── Hent glimt fra localStorage ──────────────────────────────
function loadGlimts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.warn("Kunne ikke lese glimt fra localStorage:", err);
    return [];
  }
}

// ── Format dato til norsk ────────────────────────────────────
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

// ── Sikre nøyaktig 4 bilder (padding med fallback) ───────────
function ensureFourImages(images) {
  const fallback = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80";
  const result = Array.isArray(images) ? images.slice(0, 4) : [];
  while (result.length < 4) result.push(fallback);
  return result;
}

// ── Trekk ut bilder fra et lagret reisebrev ──────────────────
// Foretrekker en eksplisitt `images`-array (for bakover-
// kompatibilitet med eldre lagrede glimt og demo-data), men
// faller tilbake til å hente bildene fra glimts-arrayen.
function extractImages(glimt) {
  if (Array.isArray(glimt.images) && glimt.images.length > 0) {
    return glimt.images;
  }
  if (Array.isArray(glimt.glimts)) {
    return glimt.glimts.map(g => g && g.image).filter(Boolean);
  }
  return [];
}

// ── Bygg én flis ─────────────────────────────────────────────
function buildCard(glimt) {
  const images = ensureFourImages(extractImages(glimt));

  const tiles = images
    .map(src => `<div class="glimt-card-bg-tile" style="background-image:url('${src}')"></div>`)
    .join("");

  const meta = [glimt.city, formatDate(glimt.createdAt)]
    .filter(Boolean)
    .join(" · ");

  return `
    <a class="glimt-card" href="glimt-detalj.html?id=${encodeURIComponent(glimt.id)}">
      <div class="glimt-card-bg">${tiles}</div>
      <div class="glimt-card-overlay"></div>
      <div class="glimt-card-arrow">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
      <div class="glimt-card-content">
        ${meta ? `<span class="glimt-card-meta">${meta}</span>` : ""}
        <h2 class="glimt-card-title">${glimt.title || "Uten tittel"}</h2>
      </div>
    </a>
  `;
}

// ── Render ───────────────────────────────────────────────────
function render() {
  const grid  = document.getElementById("mine-glimt-grid");
  const empty = document.getElementById("mine-glimt-empty");
  if (!grid || !empty) return;

  const saved = loadGlimts();
  const demos = Array.isArray(window.GLIMT_DEMOS) ? window.GLIMT_DEMOS : [];
  const glimts = saved.length > 0 ? saved : demos;

  if (glimts.length === 0) {
    grid.innerHTML = "";
    grid.style.display = "none";
    empty.style.display = "block";
    return;
  }

  grid.style.display = "grid";
  empty.style.display = "none";
  grid.innerHTML = glimts.map(buildCard).join("");
}

document.addEventListener("DOMContentLoaded", render);
