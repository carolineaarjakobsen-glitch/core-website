// ============================================================
//  Glimt – Mine Reiseplaner
//  Lagrer reiseplaner i localStorage under "glimt.reiseplaner"
// ============================================================

const RP_STORAGE_KEY = "glimt.reiseplaner";
const MKAL_KEY       = "glimt.myCalendar";

// ── By-filter fra URL-param ──────────────────────────────
const RP_PARAMS = new URLSearchParams(window.location.search);
let FILTER_CITY = RP_PARAMS.get("city") || "";

// ── Hjelpefunksjoner ──────────────────────────────────────

function loadPlans() {
  try {
    const raw = localStorage.getItem(RP_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function savePlans(plans) {
  localStorage.setItem(RP_STORAGE_KEY, JSON.stringify(plans));
}

function loadCalendarEvents() {
  try {
    const raw = localStorage.getItem(MKAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function cityImage(cityName) {
  if (typeof CITIES !== "undefined") {
    const c = CITIES.find(x => x.name === cityName);
    if (c) return c.image;
  }
  return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";
}

const MONTHS_SHORT = ["jan","feb","mar","apr","mai","jun","jul","aug","sep","okt","nov","des"];

// ── Demo-data for mockup ──────────────────────────────────

const DEMO_PLANS = [
  {
    id: "plan-roma-mai",
    name: "Roma i mai",
    city: "Roma",
    from: "2026-05-12",
    to: "2026-05-17",
    glimtCount: 4,
    eventCount: 2,
    status: "aktiv"
  },
  {
    id: "plan-kobenhavn-sommer",
    name: "København sommerferie",
    city: "København",
    from: "2026-07-01",
    to: "2026-07-06",
    glimtCount: 2,
    eventCount: 1,
    status: "aktiv"
  },
  {
    id: "plan-gardasjoen",
    name: "Gardasjøen roadtrip",
    city: "Gardasjøen",
    from: "",
    to: "",
    glimtCount: 0,
    eventCount: 0,
    status: "utkast"
  }
];

const DEMO_SAVED_GLIMT = [
  {
    id: "sg-1",
    title: "Trastevere om morgenen",
    city: "Roma",
    author: "Glimt",
    image: "https://images.unsplash.com/photo-1529154036614-a60975f5c7f6?w=600&q=80"
  },
  {
    id: "sg-2",
    title: "Street food i Testaccio",
    city: "Roma",
    author: "Glimt",
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80"
  },
  {
    id: "sg-3",
    title: "Nyhavn ved solnedgang",
    city: "København",
    author: "Glimt",
    image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=600&q=80"
  },
  {
    id: "sg-4",
    title: "Malcesine havn",
    city: "Gardasjøen",
    author: "Glimt",
    image: "https://images.unsplash.com/photo-1534631006967-ec4c5765fa2b?w=600&q=80"
  },
  {
    id: "sg-5",
    title: "Torvehallerne matmarked",
    city: "København",
    author: "MatsReiser",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80"
  }
];

const DEMO_MALER = [
  {
    id: "mal-roma-3d",
    name: "Roma på 3 dager",
    city: "Roma",
    tag: "Glimt anbefaler",
    duration: "3 dager",
    desc: "Det klassiske Roma-opplegget: Colosseum, Trastevere, Vatikanet og Testaccio – med lokale tips.",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    includes: ["4 aktiviteter", "3 restauranter", "2 severdigheter"]
  },
  {
    id: "mal-kobenhavn-weekend",
    name: "København helgetur",
    city: "København",
    tag: "Populær",
    duration: "2 dager",
    desc: "Nyhavn, Strøget, Torvehallerne og Christiania – en kompakt helg i den danske hovedstaden.",
    image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&q=80",
    includes: ["3 aktiviteter", "2 restauranter", "1 musikkscene"]
  },
  {
    id: "mal-gardasjoen-roadtrip",
    name: "Gardasjøen roadtrip",
    city: "Gardasjøen",
    tag: "Ny",
    duration: "4 dager",
    desc: "Fra Malcesine til Limone langs verdens vakreste sykkelvei – med Monte Baldo og vinslotting.",
    image: "https://images.unsplash.com/photo-1534631006967-ec4c5765fa2b?w=800&q=80",
    includes: ["5 aktiviteter", "2 restauranter", "1 vintasting"]
  },
  {
    id: "mal-stockholm-kultur",
    name: "Stockholm kulturbad",
    city: "Stockholm",
    tag: "Glimt anbefaler",
    duration: "3 dager",
    desc: "Gamla Stan, Fotografiska, ABBA-museet og skjærgården – Stockholm for kultur- og matentusiasten.",
    image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&q=80",
    includes: ["3 museer", "3 restauranter", "1 båttur"]
  },
  {
    id: "mal-dublin-pub",
    name: "Dublin pub & kultur",
    city: "Dublin",
    tag: "Populær",
    duration: "3 dager",
    desc: "Temple Bar, Guinness Storehouse, Trinity College og de beste lokale pubene med livemusikk.",
    image: "https://images.unsplash.com/photo-1564959130747-897fb406b9af?w=800&q=80",
    includes: ["2 severdigheter", "4 puber", "1 dagtur"]
  }
];

// ── Init ──────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  initCityFilter();
  initTabs();
  initModal();
  renderPlans();
  renderGlimt();
  renderEvents();
  renderMaler();
});

// ── By-filter chips ──────────────────────────────────────

function initCityFilter() {
  const container = document.getElementById("rp-city-chips");
  const filterWrap = document.getElementById("rp-city-filter");
  if (!container) return;

  // Samle by-navn: "Alle" + CITIES
  const cityNames = typeof CITIES !== "undefined" ? CITIES.map(c => c.name) : [];

  // Bygg chips
  const allChip = document.createElement("button");
  allChip.className = `rp-city-chip ${FILTER_CITY === "" ? "rp-city-chip--active" : ""}`;
  allChip.textContent = "Alle byer";
  allChip.addEventListener("click", () => selectCity(""));
  container.appendChild(allChip);

  cityNames.forEach(name => {
    const chip = document.createElement("button");
    chip.className = `rp-city-chip ${FILTER_CITY === name ? "rp-city-chip--active" : ""}`;
    chip.textContent = name;
    chip.addEventListener("click", () => selectCity(name));
    container.appendChild(chip);
  });

  // Oppdater side-tittel
  updateFilterTitle();
}

function selectCity(city) {
  FILTER_CITY = city;

  // Oppdater URL uten reload
  const url = new URL(window.location);
  if (city) {
    url.searchParams.set("city", city);
  } else {
    url.searchParams.delete("city");
  }
  history.replaceState({}, "", url);

  // Oppdater aktiv chip
  document.querySelectorAll(".rp-city-chip").forEach(chip => {
    const isAll = chip.textContent === "Alle byer";
    chip.classList.toggle("rp-city-chip--active",
      (city === "" && isAll) || chip.textContent === city
    );
  });

  updateFilterTitle();
  renderPlans();
  renderGlimt();
  renderEvents();
  renderMaler();
}

function updateFilterTitle() {
  const titleEl = document.querySelector(".rp-title");
  if (titleEl) {
    titleEl.textContent = FILTER_CITY
      ? `Mine reiseplaner – ${FILTER_CITY}`
      : "Mine reiseplaner";
  }
}

// ── Tabs ──────────────────────────────────────────────────

function initTabs() {
  const tabs = document.querySelectorAll(".rp-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("rp-tab--active"));
      tab.classList.add("rp-tab--active");

      const target = tab.dataset.tab;
      document.querySelectorAll(".rp-panel").forEach(p => {
        p.classList.toggle("rp-panel--hidden", p.id !== `panel-${target}`);
      });
    });
  });
}

// ── Modal (Ny plan) ───────────────────────────────────────

function initModal() {
  const overlay = document.getElementById("rp-modal-overlay");
  const openBtn = document.getElementById("rp-new-plan-btn");
  const closeBtn = document.getElementById("rp-modal-close");
  const form = document.getElementById("rp-modal-form");
  const citySelect = document.getElementById("rp-modal-city");

  // Populate city options
  if (typeof CITIES !== "undefined") {
    CITIES.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.name;
      opt.textContent = c.name;
      citySelect.appendChild(opt);
    });
  }

  openBtn.addEventListener("click", () => {
    overlay.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => {
    overlay.style.display = "none";
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.style.display = "none";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("rp-modal-name").value.trim();
    const city = document.getElementById("rp-modal-city").value;
    const from = document.getElementById("rp-modal-from").value;
    const to   = document.getElementById("rp-modal-to").value;

    if (!name) return;

    const plans = loadPlans();
    plans.push({
      id: "plan-" + Date.now(),
      name,
      city,
      from,
      to,
      glimtCount: 0,
      eventCount: 0,
      status: "utkast"
    });
    savePlans(plans);
    renderPlans();

    form.reset();
    overlay.style.display = "none";
  });
}

// ── Render: Plans ─────────────────────────────────────────

function renderPlans() {
  const grid  = document.getElementById("rp-plans-grid");
  const empty = document.getElementById("rp-plans-empty");

  let plans = loadPlans();

  // Seed demo plans if empty
  if (plans.length === 0) {
    plans = DEMO_PLANS;
    savePlans(plans);
  }

  // Filtrer på by hvis satt
  const filtered = FILTER_CITY
    ? plans.filter(p => p.city === FILTER_CITY)
    : plans;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    empty.style.display = "block";
    if (FILTER_CITY) {
      empty.querySelector("h3").textContent = `Ingen planer for ${FILTER_CITY}`;
      empty.querySelector("p").textContent = `Lag din første reiseplan for ${FILTER_CITY} – kombiner lagrede glimt, events og aktiviteter til en komplett reiseguide.`;
    }
    return;
  }

  empty.style.display = "none";
  plans = filtered;
  grid.innerHTML = plans.map(plan => {
    const img = cityImage(plan.city);
    const dateStr = plan.from && plan.to
      ? formatRange(plan.from, plan.to)
      : plan.from ? `Fra ${formatDate(plan.from)}` : "Ingen datoer satt";
    const draftBadge = plan.status === "utkast"
      ? `<span class="rp-plan-draft">Utkast</span>` : "";

    return `
      <a class="rp-plan-card" href="reiseplan-detalj.html?id=${encodeURIComponent(plan.id)}"
        <div class="rp-plan-hero" style="background-image:url('${img}')">
          ${draftBadge}
          <div class="rp-plan-city-pill">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            ${plan.city}
          </div>
        </div>
        <div class="rp-plan-body">
          <div class="rp-plan-name">${escHtml(plan.name)}</div>
          <div class="rp-plan-dates">${dateStr}</div>
          <div class="rp-plan-stats">
            <span class="rp-plan-stat">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              ${plan.glimtCount} glimt
            </span>
            <span class="rp-plan-stat">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ${plan.eventCount} events
            </span>
          </div>
        </div>
      </a>`;
  }).join("");
}

// ── Render: Lagrede glimt ─────────────────────────────────

function renderGlimt() {
  const grid  = document.getElementById("rp-glimt-grid");
  const empty = document.getElementById("rp-glimt-empty");
  const count = document.getElementById("glimt-count");

  // Les ekte data fra localStorage, seed demo hvis tom
  let glimt = loadSavedGlimt();
  if (glimt.length === 0) {
    // Seed demo-data
    DEMO_SAVED_GLIMT.forEach(g => addSavedGlimt({ ...g, type: "glimt", savedAt: new Date().toISOString() }));
    glimt = loadSavedGlimt();
  }

  // Filtrer på by
  if (FILTER_CITY) {
    glimt = glimt.filter(g => g.city === FILTER_CITY);
  }

  count.textContent = glimt.length;

  if (glimt.length === 0) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  grid.innerHTML = glimt.map(g => `
    <div class="rp-glimt-card" data-glimt-id="${g.id}">
      <div class="rp-glimt-img" style="background-image:url('${g.image}')"></div>
      <div class="rp-glimt-body">
        <div class="rp-glimt-title">${escHtml(g.title)}</div>
        <div class="rp-glimt-meta">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          ${escHtml(g.city)} · av ${escHtml(g.author)}
        </div>
        <div class="rp-glimt-actions">
          <button class="rp-glimt-action" title="Legg til i plan"
                  onclick="onAddGlimtToPlan('${g.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Legg i plan
          </button>
          <button class="rp-glimt-action" title="Fjern"
                  onclick="onRemoveGlimt('${g.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1.5 14a2 2 0 01-2 2h-7a2 2 0 01-2-2L5 6"/></svg>
            Fjern
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function onRemoveGlimt(glimtId) {
  removeSavedGlimt(glimtId);
  showToast("Glimt fjernet", "remove");
  renderGlimt();
}

function onAddGlimtToPlan(glimtId) {
  const glimt = loadSavedGlimt().find(g => g.id === glimtId);
  if (!glimt) return;
  showPlanPicker({ ...glimt, type: "glimt" }, () => renderPlans());
}

// ── Render: Lagrede events ────────────────────────────────

function renderEvents() {
  const list  = document.getElementById("rp-events-list");
  const empty = document.getElementById("rp-events-empty");
  const count = document.getElementById("events-count");

  let events = loadCalendarEvents();

  // Filtrer på by
  if (FILTER_CITY) {
    events = events.filter(e => e.city === FILTER_CITY);
  }

  count.textContent = events.length;

  if (events.length === 0) {
    list.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  // Sort by date
  events.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  list.innerHTML = events.map(ev => {
    const d = ev.date ? new Date(ev.date + "T00:00:00") : null;
    const day   = d ? d.getDate() : "?";
    const month = d ? MONTHS_SHORT[d.getMonth()] : "";
    const city  = ev.city || "Ukjent";
    const venue = ev.venue || "";

    return `
      <div class="rp-event-row" data-event-id="${ev.id}">
        <div class="rp-event-date-box">
          <span class="rp-event-date-day">${day}</span>
          <span class="rp-event-date-month">${month}</span>
        </div>
        <div class="rp-event-info">
          <div class="rp-event-name">${escHtml(ev.name || ev.title || "Arrangement")}</div>
          <div class="rp-event-venue">${escHtml(venue)}</div>
        </div>
        <span class="rp-event-city">${escHtml(city)}</span>
        <button class="rp-event-add-btn"
                onclick="onAddEventToPlan('${ev.id}')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          Legg i plan
        </button>
        <button class="remove-glimt-btn"
                onclick="onRemoveEvent('${ev.id}')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1.5 14a2 2 0 01-2 2h-7a2 2 0 01-2-2L5 6"/></svg>
          Fjern
        </button>
      </div>`;
  }).join("");
}

function onRemoveEvent(eventId) {
  removeSavedEvent(eventId);
  showToast("Event fjernet", "remove");
  renderEvents();
}

function onAddEventToPlan(eventId) {
  const events = loadCalendarEvents();
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;
  showPlanPicker({
    id: ev.id,
    title: ev.name || ev.title || "Event",
    city: ev.city || "",
    date: ev.date || "",
    venue: ev.venue || "",
    type: "event"
  }, () => renderPlans());
}

// ── Render: Maler ─────────────────────────────────────────

function renderMaler() {
  const grid = document.getElementById("rp-maler-grid");

  const maler = FILTER_CITY
    ? DEMO_MALER.filter(m => m.city === FILTER_CITY)
    : DEMO_MALER;

  if (maler.length === 0) {
    grid.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-light);font-size:0.88rem;">Ingen maler for denne byen ennå.</div>';
    return;
  }

  grid.innerHTML = maler.map(m => `
    <div class="rp-mal-card">
      <div class="rp-mal-hero" style="background-image:url('${m.image}')">
        <span class="rp-mal-duration">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${m.duration}
        </span>
      </div>
      <div class="rp-mal-body">
        <span class="rp-mal-tag">${escHtml(m.tag)}</span>
        <div class="rp-mal-name">${escHtml(m.name)}</div>
        <div class="rp-mal-desc">${escHtml(m.desc)}</div>
        <div class="rp-mal-includes">
          ${m.includes.map(i => `<span class="rp-mal-chip">${escHtml(i)}</span>`).join("")}
        </div>
      </div>
    </div>
  `).join("");
}

// ── Utility ───────────────────────────────────────────────

function escHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function formatRange(from, to) {
  const d1 = new Date(from + "T00:00:00");
  const d2 = new Date(to + "T00:00:00");
  if (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()) {
    return `${d1.getDate()}.–${d2.getDate()}. ${MONTHS_SHORT[d1.getMonth()]} ${d1.getFullYear()}`;
  }
  return `${formatDate(from)} – ${formatDate(to)}`;
}
