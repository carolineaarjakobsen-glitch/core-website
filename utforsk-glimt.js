// ============================================================
//  Glimt – utforsk-glimt.js
//  Viser en feed av enkelt-glimt (aktiviteter, restauranter,
//  severdigheter osv.) fra alle reisebrev. Brukeren kan
//  filtrere, søke, lagre og legge til i reiseplaner.
// ============================================================

// ── Kategori-mapping basert på nøkkelord ────────────────────
const CATEGORY_KEYWORDS = {
  mat: ["frokost", "lunsj", "middag", "restaurant", "bakeri", "kafé", "kaffe", "café", "espresso", "pasta", "gelato", "smørrebrød", "mat", "vin", "drikke", "cornetti", "cacio", "limoncello", "kanelbulle", "fika", "ramen"],
  kultur: ["museum", "kirke", "slott", "historisk", "arkitektur", "galleri", "teater", "opera", "gamle", "gamla", "forum", "colosseum", "litterært", "design", "louisiana", "blox"],
  natur: ["utsikt", "solnedgang", "fjell", "sjø", "strand", "park", "hage", "vandring", "monte", "taubane", "sitronhage", "sykkelsti", "ciclopista", "gianicolo", "howth"],
  aktivitet: ["sykkeltur", "sykkel", "vandring", "gå", "tur", "eventyr", "rull", "lei", "bading", "utforskning"],
  shopping: ["marked", "butikk", "shopping", "handel", "matmarknad"]
};

function guessCategory(title, note, address) {
  const text = `${title} ${note} ${address}`.toLowerCase();
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some(w => text.includes(w))) return cat;
  }
  return "aktivitet";
}

const CATEGORY_LABELS = {
  mat: "Mat & drikke",
  kultur: "Kultur & historie",
  natur: "Natur & utsikt",
  aktivitet: "Aktivitet",
  shopping: "Shopping & marked"
};

// ── By-normalisering (speiler opprett-glimt.js) ────────────
const CITY_ALIASES_UG = {
  "frederiksberg": "København", "gentofte": "København", "gladsaxe": "København",
  "herlev": "København", "hvidovre": "København", "rødovre": "København",
  "tårnby": "København", "dragør": "København", "vallensbæk": "København",
  "brøndby": "København", "albertslund": "København", "ballerup": "København",
  "lyngby-taarbæk": "København", "rudersdal": "København", "amager": "København",
  "vesterbro": "København", "nørrebro": "København", "østerbro": "København",
  "christianshavn": "København", "vanløse": "København", "valby": "København",
  "brønshøj": "København", "copenhagen": "København",
  "copenhagen municipality": "København", "köpenhamn": "København",
  "södermalm": "Stockholm", "östermalm": "Stockholm", "kungsholmen": "Stockholm",
  "vasastan": "Stockholm", "norrmalm": "Stockholm", "gamla stan": "Stockholm",
  "djurgården": "Stockholm", "solna": "Stockholm", "sundbyberg": "Stockholm",
  "lidingö": "Stockholm", "nacka": "Stockholm",
  "rome": "Roma", "trastevere": "Roma", "testaccio": "Roma", "municipio i": "Roma",
  "dún laoghaire": "Dublin", "dun laoghaire": "Dublin", "howth": "Dublin",
  "blackrock": "Dublin", "fingal": "Dublin",
  "malcesine": "Gardasjøen", "limone sul garda": "Gardasjøen", "sirmione": "Gardasjøen",
  "riva del garda": "Gardasjøen", "desenzano del garda": "Gardasjøen",
  "bardolino": "Gardasjøen", "lazise": "Gardasjøen", "peschiera del garda": "Gardasjøen",
  "torri del benaco": "Gardasjøen", "garda": "Gardasjøen", "limone": "Gardasjøen",
  "torbole": "Gardasjøen", "nago-torbole": "Gardasjøen", "arco": "Gardasjøen",
  "salò": "Gardasjøen", "gardone riviera": "Gardasjøen", "gargnano": "Gardasjøen",
  "toscolano-maderno": "Gardasjøen", "brenzone": "Gardasjøen",
  "brenzone sul garda": "Gardasjøen", "cassone": "Gardasjøen"
};

function normalizeCityUG(raw) {
  if (!raw) return "";
  const key = raw.trim().toLowerCase();
  return CITY_ALIASES_UG[key] || raw.trim();
}

// ── Samle alle enkelt-glimt fra demo-reisebrev ──────────────
function collectAllGlimt() {
  const allGlimt = [];

  // Fra GLIMT_DEMOS (demo-reisebrev)
  if (typeof GLIMT_DEMOS !== "undefined" && Array.isArray(GLIMT_DEMOS)) {
    GLIMT_DEMOS.forEach(reisebrev => {
      if (!reisebrev.glimts) return;
      reisebrev.glimts.forEach((g, idx) => {
        const cat = guessCategory(g.title || "", g.note || "", g.address || "");
        allGlimt.push({
          id: `${reisebrev.id}--g${idx}`,
          title: g.title,
          address: g.address || "",
          note: g.note || "",
          image: g.image || "",
          city: normalizeCityUG(g.city || reisebrev.city || ""),
          reisebrevTitle: reisebrev.title || "",
          reisebrevId: reisebrev.id,
          category: cat
        });
      });
    });
  }

  // Fra brukerens egne reisebrev (localStorage)
  try {
    const raw = localStorage.getItem("glimt.userGlimts");
    if (raw) {
      const userGlimts = JSON.parse(raw);
      if (Array.isArray(userGlimts)) {
        userGlimts.forEach(reisebrev => {
          if (!reisebrev.glimts) return;
          reisebrev.glimts.forEach((g, idx) => {
            const cat = guessCategory(g.title || "", g.note || "", g.address || "");
            allGlimt.push({
              id: `${reisebrev.id}--g${idx}`,
              title: g.title,
              address: g.address || "",
              note: g.note || "",
              image: g.image || "",
              city: normalizeCityUG(g.city || reisebrev.city || ""),
              reisebrevTitle: reisebrev.title || "",
              reisebrevId: reisebrev.id,
              category: cat
            });
          });
        });
      }
    }
  } catch (_) {}

  // Fra brukeropprettede enkelt-glimt (glimt.myCreatedGlimt)
  try {
    const raw2 = localStorage.getItem("glimt.myCreatedGlimt");
    if (raw2) {
      const userCreated = JSON.parse(raw2);
      if (Array.isArray(userCreated)) {
        userCreated.forEach(g => {
          // Bruk stemning-taggen som kategori, eller gjett fra tittel/desc
          let cat = "aktivitet";
          if (g.stemning && g.stemning.length > 0) {
            const stemToCat = { mat: "mat", kulturell: "kultur", aktiv: "aktivitet", rolig: "natur", romantisk: "natur", eventyr: "aktivitet" };
            cat = stemToCat[g.stemning[0]] || "aktivitet";
          }
          allGlimt.push({
            id: g.id,
            title: g.title || "",
            address: g.sted || "",
            note: g.desc || "",
            image: g.image || "",
            city: normalizeCityUG(g.city || ""),
            reisebrevTitle: "Opprettet av deg",
            reisebrevId: null,
            category: cat,
            isUserCreated: true
          });
        });
      }
    }
  } catch (_) {}

  return allGlimt;
}

// ── HTML-escape ─────────────────────────────────────────────
function esc(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

// ── Bygg ett glimt-kort ────────────────────────────────────
function buildGlimtCard(g) {
  const saved = typeof isGlimtSaved === "function" && isGlimtSaved(g.id);
  const catLabel = CATEGORY_LABELS[g.category] || "Aktivitet";

  return `
    <article class="ug-card">
      <div class="ug-card-image-wrap">
        ${g.image
          ? `<img class="ug-card-image" src="${esc(g.image)}" alt="${esc(g.title)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><div class="ug-card-image ug-card-placeholder" style="display:none;background:var(--blush-mid);align-items:center;justify-content:center;color:var(--text-light);font-size:2rem;">&#9733;</div>`
          : `<div class="ug-card-image ug-card-placeholder" style="background:var(--blush-mid);display:flex;align-items:center;justify-content:center;color:var(--text-light);font-size:2rem;">&#9733;</div>`
        }
        <span class="ug-card-cat-badge">${g.isUserCreated ? 'Opprettet av deg' : esc(catLabel)}</span>
        <span class="ug-card-city-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          ${esc(g.city)}
        </span>
      </div>
      <div class="ug-card-body">
        <h3 class="ug-card-title">${esc(g.title)}</h3>
        <div class="ug-card-address">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          ${esc(g.address)}
        </div>
        <p class="ug-card-note">${esc(g.note)}</p>
        <div class="ug-card-source">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M2 5l10 7 10-7"/></svg>
          Fra: ${esc(g.reisebrevTitle)}
        </div>
        <div class="ug-card-footer">
          <button class="ug-card-save-btn ${saved ? 'ug-card-save-btn--saved' : ''}"
                  data-glimt-id="${esc(g.id)}"
                  onclick="toggleSaveGlimt(this)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
            ${saved ? "Lagret" : "Lagre"}
          </button>
          <button class="ug-card-plan-btn"
                  data-glimt-id="${esc(g.id)}"
                  onclick="addGlimtToPlan(this)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Legg til i plan
          </button>
        </div>
      </div>
    </article>
  `;
}

// ── State ───────────────────────────────────────────────────
let ALL_GLIMT = [];
let activeCity = "alle";
let activeCat  = "alle";
let searchTerm = "";

// ── Filtrer og render ───────────────────────────────────────
function filterAndRender() {
  let filtered = [...ALL_GLIMT];

  if (activeCity !== "alle") {
    filtered = filtered.filter(g => g.city === activeCity);
  }
  if (activeCat !== "alle") {
    filtered = filtered.filter(g => g.category === activeCat);
  }
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(g =>
      (g.title || "").toLowerCase().includes(q) ||
      (g.address || "").toLowerCase().includes(q) ||
      (g.note || "").toLowerCase().includes(q) ||
      (g.city || "").toLowerCase().includes(q) ||
      (g.reisebrevTitle || "").toLowerCase().includes(q)
    );
  }

  const grid  = document.getElementById("ug-grid");
  const empty = document.getElementById("ug-empty");
  if (!grid || !empty) return;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    grid.style.display = "none";
    empty.style.display = "block";
  } else {
    grid.style.display = "grid";
    empty.style.display = "none";
    grid.innerHTML = filtered.map(buildGlimtCard).join("");
  }
}

// ── Lagre / fjern glimt ─────────────────────────────────────
function toggleSaveGlimt(btn) {
  const id = btn.dataset.glimtId;
  const glimt = ALL_GLIMT.find(g => g.id === id);
  if (!glimt) return;

  if (isGlimtSaved(id)) {
    removeSavedGlimt(id);
    btn.classList.remove("ug-card-save-btn--saved");
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> Lagre`;
    showToast("Fjernet fra lagrede glimt", "remove");
  } else {
    addSavedGlimt({
      id: glimt.id,
      title: glimt.title,
      city: glimt.city,
      author: "Glimt",
      image: glimt.image,
      address: glimt.address,
      note: glimt.note,
      type: "glimt",
      savedAt: new Date().toISOString()
    });
    btn.classList.add("ug-card-save-btn--saved");
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> Lagret`;
    showToast("Lagret til mine glimt!", "success");
  }
}

// ── Legg til i plan ─────────────────────────────────────────
function addGlimtToPlan(btn) {
  const id = btn.dataset.glimtId;
  const glimt = ALL_GLIMT.find(g => g.id === id);
  if (!glimt) return;

  showPlanPicker({
    id: glimt.id,
    title: glimt.title,
    city: glimt.city,
    image: glimt.image,
    address: glimt.address,
    note: glimt.note,
    type: "glimt"
  });
}

// ── Init ────────────────────────────────────────────────────
function init() {
  ALL_GLIMT = collectAllGlimt();

  // Bygg by-filter-chips fra tilgjengelige byer
  const cities = [...new Set(ALL_GLIMT.map(g => g.city).filter(Boolean))].sort();
  const filterRow = document.querySelector(".ug-filter-row");
  if (filterRow) {
    cities.forEach(city => {
      const chip = document.createElement("button");
      chip.className = "ug-filter-chip";
      chip.dataset.city = city;
      chip.textContent = city;
      filterRow.appendChild(chip);
    });
  }

  // By-filter events
  document.querySelectorAll(".ug-filter-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".ug-filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeCity = chip.dataset.city;
      filterAndRender();
    });
  });

  // Kategori-filter events
  document.querySelectorAll(".ug-cat-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".ug-cat-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeCat = chip.dataset.cat;
      filterAndRender();
    });
  });

  // Søk
  const searchInput = document.getElementById("ug-search");
  if (searchInput) {
    let debounce;
    searchInput.addEventListener("input", () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        searchTerm = searchInput.value.trim();
        filterAndRender();
      }, 250);
    });
  }

  // Sjekk URL-param for by
  const params = new URLSearchParams(window.location.search);
  const cityParam = params.get("city");
  if (cityParam) {
    activeCity = cityParam;
    const matchChip = document.querySelector(`.ug-filter-chip[data-city="${cityParam}"]`);
    if (matchChip) {
      document.querySelectorAll(".ug-filter-chip").forEach(c => c.classList.remove("active"));
      matchChip.classList.add("active");
    }
  }

  filterAndRender();
}

document.addEventListener("DOMContentLoaded", init);
