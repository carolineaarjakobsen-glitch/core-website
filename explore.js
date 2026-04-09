// =====================
//  TILSTAND
// =====================
const selected = {
  selskap: null,
  kostnad: null,
  tid:     null
};

// =====================
//  HENT BY FRA URL
// =====================
function getCityFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("city") || CITIES[0].name;
}

// =====================
//  SETT OPP HERO MED BYBILDE
// =====================
function setupHero() {
  const cityName = getCityFromURL();
  const cityData = CITIES.find(c => c.name === cityName);

  document.getElementById("explore-city").textContent = cityName;
  document.title = `CORE – Utforsk ${cityName}`;

  if (cityData) {
    document.getElementById("explore-bg").style.backgroundImage = `url('${cityData.image}')`;
  }
}

// =====================
//  FILTERKLIKK
// =====================
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;

  const group = btn.dataset.group;
  const value = btn.dataset.value;

  // Klikk på allerede valgt = avvelg
  if (selected[group] === value) {
    selected[group] = null;
    btn.classList.remove("selected");
  } else {
    // Fjern valg fra andre knapper i samme gruppe
    document.querySelectorAll(`.filter-btn[data-group="${group}"]`).forEach(b => {
      b.classList.remove("selected");
    });
    selected[group] = value;
    btn.classList.add("selected");
  }

  updateActiveTags();
});

// =====================
//  OPPDATER AKTIVE TAGS
// =====================
function updateActiveTags() {
  const container = document.getElementById("active-filters");
  const tags = Object.entries(selected)
    .filter(([, v]) => v !== null)
    .map(([, v]) => v);

  if (tags.length === 0) {
    container.innerHTML = `<span class="active-filters-label">Ingen filtre valgt ennå</span>`;
    return;
  }

  container.innerHTML = tags
    .map(t => `<span class="active-tag">${formatTag(t)}</span>`)
    .join("");
}

function formatTag(value) {
  const map = {
    solo: "🧍 Solo",
    par: "👫 Par",
    venner: "👯 Venner",
    familie: "👨‍👩‍👧‍👦 Familie",
    gratis: "🎁 Gratis",
    "$": "$ Rimelig",
    "$$": "$$ Moderat",
    "$$$": "$$$ Eksklusivt",
    morgen: "🌅 Morgen",
    formiddag: "☀️ Formiddag",
    ettermiddag: "🌤️ Ettermiddag",
    kveld: "🌙 Kveld"
  };
  return map[value] || value;
}

// =====================
//  VIS RESULTATER
// =====================
function showResults() {
  const cityName = getCityFromURL();

  // Filtrer opplevelser
  const matches = EXPERIENCES.filter(exp => {
    if (exp.city !== cityName) return false;
    if (selected.selskap && !exp.selskap.includes(selected.selskap)) return false;
    if (selected.kostnad && exp.kostnad !== selected.kostnad) return false;
    if (selected.tid && !exp.tid.includes(selected.tid)) return false;
    return true;
  });

  const area = document.getElementById("results-area");
  area.style.display = "block";

  if (matches.length === 0) {
    area.innerHTML = `<p class="no-results">Ingen opplevelser matchet filteret ditt – prøv et annet utvalg.</p>`;
    area.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const antallValgt = Object.values(selected).filter(Boolean).length;
  const subtitle = antallValgt > 0
    ? `${matches.length} opplevelse${matches.length !== 1 ? "r" : ""} passer for deg`
    : `Alle opplevelser i ${cityName}`;

  area.innerHTML = `
    <h2 class="results-title">${subtitle}</h2>
    <div class="results-grid">
      ${matches.map(exp => resultCard(exp)).join("")}
    </div>
  `;

  area.scrollIntoView({ behavior: "smooth", block: "start" });
}

// =====================
//  LAG RESULTATKORT
// =====================
function resultCard(exp) {
  const selskapLabels  = exp.selskap.map(s => formatTag(s)).join(", ");
  const tidLabels      = exp.tid.map(t => formatTag(t)).join(", ");
  const kostnadLabel   = exp.kostnad === "gratis" ? "🎁 Gratis" : exp.kostnad;

  return `
    <div class="result-card">
      <div class="result-card-image">${exp.emoji}</div>
      <div class="result-card-body">
        <div class="result-card-tags">
          <span class="result-tag">${tidLabels}</span>
          <span class="result-tag">${selskapLabels}</span>
        </div>
        <p class="result-card-title">${exp.title}</p>
        <p class="result-card-desc">${exp.desc}</p>
        <p class="result-card-cost">${kostnadLabel}</p>
      </div>
    </div>
  `;
}

// =====================
//  KJØR
// =====================
setupHero();
