// ============================================================
//  Glimt – Reiseplan Detalj
// ============================================================

const RP_KEY  = "glimt.reiseplaner";
const CAL_KEY = "glimt.myCalendar";
const params  = new URLSearchParams(window.location.search);
const PLAN_ID = params.get("id") || "";

const MONTHS_SHORT = ["jan","feb","mar","apr","mai","jun","jul","aug","sep","okt","nov","des"];

// City quotes for inspiration
const CITY_QUOTES = {
  "Roma":        "Alle veier fører til Roma – og denne planen viser deg de beste.",
  "København":   "Hygge, Nyhavn og sykkelveier – København venter på deg.",
  "Stockholm":   "Vakrere enn du husker – Stockholm er alltid en god idé.",
  "Dublin":      "Grønt og gyllent – Dublin har alltid et eventyr på lur.",
  "Gardasjøen":  "Sitroner, fjell og turkist vann – Gardasjøen er ren magi."
};

// Demo itinerary for "Roma i mai"
const DEMO_ITINERARY = {
  "plan-roma-mai": {
    days: [
      {
        title: "Ankomst & Trastevere",
        items: [
          { emoji: "✈️", title: "Ankomst Fiumicino", desc: "Leonardo Express til Termini (32 min, €14)", tags: ["Transport", "14:00"] },
          { emoji: "🏨", title: "Sjekk inn Hotel Santa Maria", desc: "Vicolo del Piede 2, Trastevere – rolig gårdshage, perfekt beliggenhet", tags: ["Overnatting"] },
          { emoji: "🚶", title: "Vandring i Trastevere", desc: "Utforsk smale gater, street art og lokalt liv. Start ved Piazza Santa Maria.", tags: ["Gratis", "2 timer"] },
          { emoji: "🍝", title: "Middag på Da Enzo", desc: "Autentisk cucina romana – prøv cacio e pepe og fiori di zucca. Bestill bord!", tags: ["$$", "20:00"] }
        ]
      },
      {
        title: "Colosseum & Forum",
        items: [
          { emoji: "☕", title: "Frokost på Sant'Eustachio", desc: "Romas mest berømte kaffe – gran caffè espresso. Piazza Sant'Eustachio.", tags: ["$", "08:30"] },
          { emoji: "🏛️", title: "Colosseum + Palatinen", desc: "Kombinert billett, forhåndsbestilt. Kom tidlig for å unngå kø. 2–3 timer.", tags: ["€16", "10:00"] },
          { emoji: "📸", title: "Forum Romanum", desc: "Samme billett – vandre gjennom de gamle ruinene. Fantastisk utsikt fra Palatinen.", tags: ["Inkludert", "13:00"] },
          { emoji: "🍕", title: "Pizza ved Remo", desc: "Testaccio – tykk bunn, enkle ingredienser. Be om supplì som forrett.", tags: ["$", "20:30"] }
        ]
      },
      {
        title: "Vatikanet & kunst",
        items: [
          { emoji: "🎨", title: "Vatikanmuseene", desc: "Bestill skip-the-line billetter. Gå rett til Sixtinske kapell, deretter tilbake.", tags: ["€17", "09:00"] },
          { emoji: "⛪", title: "Peterskirken", desc: "Gratis inngang, men lang kø. Gå opp i kuppelen (€8) for Romas beste utsikt.", tags: ["Gratis/€8", "12:00"] },
          { emoji: "🍦", title: "Gelato på Fatamorgana", desc: "Romas beste iskrem – kreative smaker som basilikum-valnøtt og mørk sjokolade.", tags: ["$", "14:00"] },
          { emoji: "🌅", title: "Solnedgang fra Pincio", desc: "Villa Borghese-parken – ta med vin og ost fra en lokal alimentari.", tags: ["Gratis", "19:00"] }
        ]
      }
    ],
    accommodation: "Hotel Santa Maria, Trastevere\nVicolo del Piede 2, Roma\nBooking.com ref: 8834721\nInnsjekk: 15:00 / Utsjekk: 11:00",
    transport: "Fly: Norwegian DY1862\nOslo → Roma Fiumicino\n12. mai kl 11:30 → 14:45\n\nRetur: DY1863\n17. mai kl 16:00 → 19:15",
    budget: "Fly: 2800 kr\nHotell: 5 netter × 1200 kr = 6000 kr\nMat: ~500 kr/dag = 2500 kr\nMuseer/transport: ~1500 kr\n\nTotalt: ~12 800 kr",
    packing: ["Pass","Lader","Komfortable sko","Solkrem","Reiseadapter (Type C/L)","Lett jakke","Kamera"],
    notes: "• Bestill Colosseum-billetter minst 2 uker i forveien\n• Husk å skrive ut hotellbekreftelse\n• Vatikanmuseene er stengt på søndager (unntatt siste søndag i mnd)\n• Tipping er ikke forventet, men 1–2€ for god service\n• Vanlig å betale cover charge (coperto) på restauranter"
  }
};

// Demo saved glimt
const DEMO_GLIMT = {
  "Roma": [
    { title: "Trastevere om morgenen", img: "https://images.unsplash.com/photo-1529154036614-a60975f5c7f6?w=300&q=80", sub: "av Glimt" },
    { title: "Street food i Testaccio", img: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=300&q=80", sub: "av Glimt" },
    { title: "Borghese-galleriet", img: "https://images.unsplash.com/photo-1553342385-111fd6bc6ab3?w=300&q=80", sub: "av MatsReiser" }
  ],
  "København": [
    { title: "Nyhavn ved solnedgang", img: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=300&q=80", sub: "av Glimt" },
    { title: "Torvehallerne", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80", sub: "av Glimt" }
  ],
  "Gardasjøen": [
    { title: "Malcesine havn", img: "https://images.unsplash.com/photo-1534631006967-ec4c5765fa2b?w=300&q=80", sub: "av Glimt" },
    { title: "Monte Baldo gondol", img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300&q=80", sub: "av Glimt" }
  ]
};

// Demo suggested activities
const DEMO_ACTIVITIES = {
  "Roma": [
    { emoji: "🍷", title: "Vinsmaking i Frascati", sub: "Dagtur · $$" },
    { emoji: "🛵", title: "Vespa-tur langs Appiaveien", sub: "3 timer · $$" },
    { emoji: "🎭", title: "Opera ved Caracallas termer", sub: "Kveld · $$$" }
  ],
  "København": [
    { emoji: "🚲", title: "Sykkeltur langs kanalene", sub: "2 timer · $" },
    { emoji: "🍺", title: "Mikkeller øl-tasting", sub: "Kveld · $$" }
  ],
  "Gardasjøen": [
    { emoji: "🚡", title: "Monte Baldo gondol", sub: "Halv dag · $$" },
    { emoji: "🚴", title: "Ciclopista del Garda", sub: "3 timer · Gratis" }
  ]
};

// ── Init ──────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const plan = loadPlan();
  if (!plan) {
    document.querySelector(".rpd-content").innerHTML =
      '<div style="text-align:center;padding:4rem"><h2>Plan ikke funnet</h2><a href="mine-reiseplaner.html">← Tilbake</a></div>';
    return;
  }
  renderHero(plan);
  renderSidebar(plan);
  renderDays(plan);
  renderExtras(plan);
  initAddDay(plan);
  initPacking(plan);
  initAutoSave(plan);
});

// ── Load plan ─────────────────────────────────────────────

function loadPlan() {
  try {
    const raw = localStorage.getItem(RP_KEY);
    if (!raw) return null;
    const plans = JSON.parse(raw);
    return plans.find(p => p.id === PLAN_ID) || null;
  } catch { return null; }
}

function savePlan(plan) {
  try {
    const raw = localStorage.getItem(RP_KEY);
    const plans = raw ? JSON.parse(raw) : [];
    const idx = plans.findIndex(p => p.id === plan.id);
    if (idx >= 0) plans[idx] = plan;
    else plans.push(plan);
    localStorage.setItem(RP_KEY, JSON.stringify(plans));
  } catch (e) { console.warn("Lagring feilet:", e); }
}

function cityImage(cityName) {
  if (typeof CITIES !== "undefined") {
    const c = CITIES.find(x => x.name === cityName);
    if (c) return c.image;
  }
  return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";
}

// ── Render Hero ───────────────────────────────────────────

function renderHero(plan) {
  const hero = document.getElementById("rpd-hero");
  hero.style.backgroundImage = `url('${cityImage(plan.city)}')`;

  document.getElementById("rpd-city").textContent = plan.city;
  document.getElementById("rpd-title").textContent = plan.name;
  document.getElementById("rpd-dates").textContent = formatRange(plan.from, plan.to);
  document.getElementById("rpd-quote").textContent = CITY_QUOTES[plan.city] || "Din neste eventyr begynner her.";
}

// ── Render Sidebar ────────────────────────────────────────

function renderSidebar(plan) {
  // Tips
  const tipsEl = document.getElementById("rpd-tips");
  const demo = DEMO_ITINERARY[plan.id];
  if (demo && demo.notes) {
    tipsEl.innerHTML = `<p>${escHtml(demo.notes.split('\n')[0])}</p>`;
  }

  // Saved glimt — hent fra localStorage, filtrer på planens by
  const glimtList = document.getElementById("rpd-inspo-glimt");
  const allSaved = typeof loadSavedGlimt === "function" ? loadSavedGlimt() : [];
  const cityGlimt = allSaved.filter(g => g.city === plan.city || !g.city);
  const fallbackGlimt = cityGlimt.length > 0 ? cityGlimt : (DEMO_GLIMT[plan.city] || []).map((g, i) => ({
    id: `demo-sidebar-${plan.city}-${i}`, title: g.title, image: g.img, author: g.sub, city: plan.city, type: "glimt"
  }));
  glimtList.innerHTML = fallbackGlimt.map(g => `
    <div class="rpd-inspo-item" data-inspo-type="glimt" data-inspo-title="${escHtml(g.title)}" data-inspo-image="${g.image || g.img || ''}">
      <div class="rpd-inspo-thumb" style="background-image:url('${g.image || g.img || ''}')"></div>
      <div class="rpd-inspo-info">
        <div class="rpd-inspo-name">${escHtml(g.title)}</div>
        <div class="rpd-inspo-sub">${escHtml(g.author || g.sub || '')}</div>
      </div>
      <button class="rpd-inspo-add" title="Legg til i aktiv dag" onclick="addInspoToDay(this)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </div>`).join("") || '<div style="font-size:0.8rem;color:var(--text-light)">Ingen lagrede glimt for denne byen</div>';

  // Calendar events
  const eventsList = document.getElementById("rpd-inspo-events");
  try {
    const allEvents = JSON.parse(localStorage.getItem(CAL_KEY) || "[]");
    const cityEvents = allEvents.filter(e => e.city === plan.city).slice(0, 4);
    eventsList.innerHTML = cityEvents.map(ev => {
      const d = ev.date ? new Date(ev.date + "T00:00:00") : null;
      const dateStr = d ? `${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]}` : "";
      return `
        <div class="rpd-inspo-item" data-inspo-type="event" data-inspo-title="${escHtml(ev.name || ev.title || 'Event')}" data-inspo-date="${dateStr}">
          <div class="rpd-inspo-thumb" style="background:var(--navy);display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.7rem;font-weight:600">${dateStr}</div>
          <div class="rpd-inspo-info">
            <div class="rpd-inspo-name">${escHtml(ev.name || ev.title || "Event")}</div>
            <div class="rpd-inspo-sub">${escHtml(ev.venue || "")}</div>
          </div>
          <button class="rpd-inspo-add" title="Legg til i aktiv dag" onclick="addInspoToDay(this)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>`;
    }).join("") || '<div style="font-size:0.8rem;color:var(--text-light)">Ingen events i kalenderen for denne byen</div>';
  } catch { eventsList.innerHTML = '<div style="font-size:0.8rem;color:var(--text-light)">Ingen events</div>'; }

  // Suggested activities
  const actList = document.getElementById("rpd-inspo-activities");
  const activities = DEMO_ACTIVITIES[plan.city] || [];
  actList.innerHTML = activities.map(a => `
    <div class="rpd-inspo-item" data-inspo-type="activity" data-inspo-title="${escHtml(a.title)}" data-inspo-emoji="${a.emoji}" data-inspo-sub="${escHtml(a.sub)}">
      <div class="rpd-inspo-thumb" style="background:var(--blush-bg);display:flex;align-items:center;justify-content:center;font-size:1.2rem">${a.emoji}</div>
      <div class="rpd-inspo-info">
        <div class="rpd-inspo-name">${escHtml(a.title)}</div>
        <div class="rpd-inspo-sub">${escHtml(a.sub)}</div>
      </div>
      <button class="rpd-inspo-add" title="Legg til i aktiv dag" onclick="addInspoToDay(this)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </div>`).join("") || '<div style="font-size:0.8rem;color:var(--text-light)">Ingen forslag tilgjengelig</div>';
}

// ── Render Days ───────────────────────────────────────────

function renderDays(plan) {
  const container = document.getElementById("rpd-days");
  const demo = DEMO_ITINERARY[plan.id];

  if (!demo || !demo.days || demo.days.length === 0) {
    // Empty plan – show first empty day
    container.innerHTML = buildDayHTML(1, "Dag 1", getDateForDay(plan.from, 1), []);
    return;
  }

  container.innerHTML = demo.days.map((day, i) => {
    const dateStr = getDateForDay(plan.from, i + 1);
    return buildDayHTML(i + 1, day.title, dateStr, day.items);
  }).join("");
}

function buildDayHTML(num, title, dateStr, items) {
  const itemsHTML = items.map(item => `
    <div class="rpd-item">
      <span class="rpd-item-emoji">${item.emoji}</span>
      <div class="rpd-item-body">
        <div class="rpd-item-title">${escHtml(item.title)}</div>
        <div class="rpd-item-desc">${escHtml(item.desc)}</div>
        <div class="rpd-item-meta">
          ${item.tags.map(t => `
            <span class="rpd-item-tag">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="4"/></svg>
              ${escHtml(t)}
            </span>`).join("")}
        </div>
      </div>
      <div class="rpd-item-actions">
        <button class="rpd-item-action" title="Rediger">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
        </button>
        <button class="rpd-item-action" title="Fjern">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>`).join("");

  const activeClass = num === 1 ? "rpd-day--active" : "rpd-day--collapsed";
  const chevronRotation = num === 1 ? "rotate(180deg)" : "rotate(0deg)";

  return `
    <div class="rpd-day ${activeClass}" data-day="${num}">
      <div class="rpd-day-header" onclick="toggleDay(${num})">
        <div class="rpd-day-number">${num}</div>
        <div class="rpd-day-label">
          <div class="rpd-day-title-text">${escHtml(title)}</div>
          <div class="rpd-day-date">${escHtml(dateStr)}</div>
        </div>
        <div class="rpd-day-item-count">${items.length} glimt</div>
        <div class="rpd-day-chevron" style="transform:${chevronRotation}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div class="rpd-day-items">
        ${itemsHTML}
        <button class="rpd-add-item" onclick="event.stopPropagation(); openGlimtModal(${num})">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          Legg til glimt
        </button>
      </div>
    </div>`;
}

// ── Toggle day accordion ──────────────────────────────────

function toggleDay(dayNum) {
  const allDays = document.querySelectorAll(".rpd-day");
  const clicked = document.querySelector(`.rpd-day[data-day="${dayNum}"]`);
  const wasActive = clicked && clicked.classList.contains("rpd-day--active");

  allDays.forEach(day => {
    const num = parseInt(day.dataset.day);
    if (num === dayNum) {
      // Toggle clicked day – collapse if already active
      if (wasActive) {
        day.classList.remove("rpd-day--active");
        day.classList.add("rpd-day--collapsed");
      } else {
        day.classList.remove("rpd-day--collapsed");
        day.classList.add("rpd-day--active");
      }
    } else {
      // Collapse others
      day.classList.remove("rpd-day--active");
      day.classList.add("rpd-day--collapsed");
    }
  });
}

// ── Legg til inspirasjon i aktiv dag ─────────────────────────

function addInspoToDay(btn) {
  const item = btn.closest(".rpd-inspo-item");
  const type  = item.dataset.inspoType;
  const title = item.dataset.inspoTitle;
  const emoji = item.dataset.inspoEmoji || "📌";
  const sub   = item.dataset.inspoSub || "";
  const image = item.dataset.inspoImage || "";
  const date  = item.dataset.inspoDate || "";

  // Finn aktiv dag
  const activeDay = document.querySelector(".rpd-day--active");
  if (!activeDay) {
    showToast("Åpne en dag først for å legge til glimt", "info");
    return;
  }

  const dayItems = activeDay.querySelector(".rpd-day-items");
  if (!dayItems) return;

  // Bygg nytt glimt-element
  const desc = type === "event" ? `Event · ${date}` : (sub || "Lagt til fra inspirasjon");
  const newItem = document.createElement("div");
  newItem.className = "rpd-item rpd-item--added";
  newItem.innerHTML = `
    <span class="rpd-item-emoji">${emoji}</span>
    <div class="rpd-item-body">
      <div class="rpd-item-title">${escHtml(title)}</div>
      <div class="rpd-item-desc">${escHtml(desc)}</div>
      <div class="rpd-item-meta">
        <span class="rpd-item-tag">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="4"/></svg>
          ${type === "glimt" ? "Fra glimt" : type === "event" ? "Event" : "Aktivitet"}
        </span>
      </div>
    </div>
    <div class="rpd-item-actions">
      <button class="rpd-item-action" title="Fjern" onclick="this.closest('.rpd-item').remove(); updateDayCount();">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `;

  // Sett inn før "Legg til glimt"-knappen
  const addBtn = dayItems.querySelector(".rpd-add-item");
  if (addBtn) {
    dayItems.insertBefore(newItem, addBtn);
  } else {
    dayItems.appendChild(newItem);
  }

  // Oppdater item-count
  updateDayCount();

  // Visuell feedback på knappen
  btn.classList.add("rpd-inspo-add--done");
  btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>`;
  setTimeout(() => {
    btn.classList.remove("rpd-inspo-add--done");
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>`;
  }, 1500);

  showToast(`«${title}» lagt til i dag ${activeDay.dataset.day}`, "success");
}

function updateDayCount() {
  document.querySelectorAll(".rpd-day").forEach(day => {
    const items = day.querySelectorAll(".rpd-item").length;
    const badge = day.querySelector(".rpd-day-item-count");
    if (badge) badge.textContent = `${items} glimt`;
  });
}

// ── Render Extras ─────────────────────────────────────────

function renderExtras(plan) {
  const demo = DEMO_ITINERARY[plan.id];
  if (!demo) return;

  if (demo.accommodation) {
    document.getElementById("rpd-accommodation").textContent = demo.accommodation;
  }
  if (demo.transport) {
    document.getElementById("rpd-transport").textContent = demo.transport;
  }
  if (demo.budget) {
    document.getElementById("rpd-budget").textContent = demo.budget;
  }
  if (demo.notes) {
    document.getElementById("rpd-notes").textContent = demo.notes;
  }
  if (demo.packing) {
    renderPackingList(demo.packing);
  }
}

// ── Packing list ──────────────────────────────────────────

function renderPackingList(items) {
  const container = document.getElementById("rpd-packing");
  container.innerHTML = items.map((item, i) => `
    <label class="rpd-check-item">
      <input type="checkbox" data-pack="${i}" />
      <span>${escHtml(item)}</span>
    </label>
  `).join("");

  container.querySelectorAll("input[type='checkbox']").forEach(cb => {
    cb.addEventListener("change", () => {
      cb.closest(".rpd-check-item").classList.toggle("is-checked", cb.checked);
    });
  });
}

function initPacking() {
  const input = document.getElementById("rpd-packing-input");
  const addBtn = document.getElementById("rpd-packing-add");

  function addItem() {
    const val = input.value.trim();
    if (!val) return;
    const container = document.getElementById("rpd-packing");
    const label = document.createElement("label");
    label.className = "rpd-check-item";
    label.innerHTML = `<input type="checkbox" /><span>${escHtml(val)}</span>`;
    label.querySelector("input").addEventListener("change", (e) => {
      label.classList.toggle("is-checked", e.target.checked);
    });
    container.appendChild(label);
    input.value = "";
    input.focus();
  }

  addBtn.addEventListener("click", addItem);
  input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); addItem(); }});
}

// ── Add day ───────────────────────────────────────────────

function initAddDay(plan) {
  const btn = document.getElementById("rpd-add-day");
  const container = document.getElementById("rpd-days");
  let dayCount = container.querySelectorAll(".rpd-day").length;

  btn.addEventListener("click", () => {
    dayCount++;
    const dateStr = getDateForDay(plan.from, dayCount);
    const html = buildDayHTML(dayCount, `Dag ${dayCount}`, dateStr, []);
    container.insertAdjacentHTML("beforeend", html);
    // Open the new day, collapse others
    toggleDay(dayCount);
  });
}

// ── Auto-save ─────────────────────────────────────────────

function initAutoSave(plan) {
  const saveBtn = document.getElementById("rpd-save-btn");
  const status  = document.getElementById("rpd-save-status");

  saveBtn.addEventListener("click", () => {
    // Collect title
    const titleEl = document.getElementById("rpd-title");
    plan.name = titleEl.textContent.trim() || plan.name;
    savePlan(plan);

    status.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      Lagret!`;
    setTimeout(() => {
      status.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Automatisk lagret`;
    }, 2000);
  });

  // Delete plan
  initDeletePlan(plan);
}

// ── Delete plan ───────────────────────────────────────────

function initDeletePlan(plan) {
  const deleteBtn      = document.getElementById("rpd-delete-btn");
  const overlay        = document.getElementById("rpd-confirm-overlay");
  const cancelBtn      = document.getElementById("rpd-confirm-cancel");
  const confirmBtn     = document.getElementById("rpd-confirm-delete");

  deleteBtn.addEventListener("click", () => {
    overlay.classList.add("rpd-confirm-overlay--visible");
  });

  cancelBtn.addEventListener("click", () => {
    overlay.classList.remove("rpd-confirm-overlay--visible");
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("rpd-confirm-overlay--visible");
  });

  confirmBtn.addEventListener("click", () => {
    deletePlan(plan.id);
    overlay.classList.remove("rpd-confirm-overlay--visible");
    showToast("Planen er slettet", "remove");
    setTimeout(() => {
      window.location.href = "mine-reiseplaner.html";
    }, 800);
  });
}

function deletePlan(planId) {
  const plans = loadPlansShared();
  const updated = plans.filter(p => p.id !== planId);
  savePlansShared(updated);
}

// ── Utilities ─────────────────────────────────────────────

function escHtml(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

function formatRange(from, to) {
  if (!from) return "Ingen datoer satt";
  const d1 = new Date(from + "T00:00:00");
  const d2 = to ? new Date(to + "T00:00:00") : null;
  if (d2 && d1.getMonth() === d2.getMonth()) {
    return `${d1.getDate()}.–${d2.getDate()}. ${MONTHS_SHORT[d1.getMonth()]} ${d1.getFullYear()}`;
  }
  if (d2) {
    return `${d1.getDate()}. ${MONTHS_SHORT[d1.getMonth()]} – ${d2.getDate()}. ${MONTHS_SHORT[d2.getMonth()]} ${d2.getFullYear()}`;
  }
  return `Fra ${d1.getDate()}. ${MONTHS_SHORT[d1.getMonth()]} ${d1.getFullYear()}`;
}

function getDateForDay(fromStr, dayNum) {
  if (!fromStr) return "";
  const d = new Date(fromStr + "T00:00:00");
  d.setDate(d.getDate() + dayNum - 1);
  const dayNames = ["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"];
  return `${dayNames[d.getDay()]} ${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]}`;
}

// ── Glimt-velger modal ──────────────────────────────────────

let _glimtModalTargetDay = null;

function openGlimtModal(dayNum) {
  _glimtModalTargetDay = dayNum;
  const overlay = document.getElementById("glimt-modal-overlay");
  overlay.classList.add("glimt-modal--visible");
  document.body.style.overflow = "hidden";
  populateGlimtTabs();
}

function closeGlimtModal() {
  const overlay = document.getElementById("glimt-modal-overlay");
  overlay.classList.remove("glimt-modal--visible");
  document.body.style.overflow = "";
  _glimtModalTargetDay = null;
}

function populateGlimtTabs() {
  populateMineGlimt();
  populateLagredeGlimt();
}

// ── Tab: Mine glimt ──────────────────────────────────────────

function populateMineGlimt() {
  const container = document.getElementById("glimt-list-mine");

  // Hent fra glimt.myCreatedGlimt (standalone opprettede glimt)
  let myGlimt = [];
  try {
    const raw = localStorage.getItem("glimt.myCreatedGlimt");
    if (raw) myGlimt = JSON.parse(raw) || [];
  } catch {}

  // Hent også glimt fra brukerens reisebrev (glimt.userGlimts)
  let reisebrevGlimt = [];
  try {
    const raw = localStorage.getItem("glimt.userGlimts");
    if (raw) {
      const letters = JSON.parse(raw) || [];
      letters.forEach(letter => {
        if (letter.glimts && Array.isArray(letter.glimts)) {
          letter.glimts.forEach(g => {
            reisebrevGlimt.push({
              id: g.id || `rb-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
              emoji: "✦",
              title: g.title || "Uten tittel",
              desc: g.description || g.desc || "",
              image: g.image || "",
              city: letter.city || "",
              source: `Fra reisebrev: ${letter.title || "Uten tittel"}`
            });
          });
        }
      });
    }
  } catch {}

  const allMine = [...myGlimt, ...reisebrevGlimt];

  if (allMine.length === 0) {
    container.innerHTML = `
      <div class="glimt-modal-empty">
        <div class="glimt-modal-empty-icon">✦</div>
        <p>Du har ingen egne glimt ennå.</p>
        <p class="glimt-modal-empty-hint">Opprett et nytt glimt i fanen «Opprett nytt», eller gå til <a href="mine-enkeltglimt.html">Mine glimt</a>.</p>
      </div>`;
    return;
  }

  container.innerHTML = allMine.map(g => buildGlimtPickerCard(g, "mine")).join("");
}

// ── Tab: Lagrede glimt ───────────────────────────────────────

function populateLagredeGlimt() {
  const container = document.getElementById("glimt-list-lagrede");
  const saved = typeof loadSavedGlimt === "function" ? loadSavedGlimt() : [];

  if (saved.length === 0) {
    container.innerHTML = `
      <div class="glimt-modal-empty">
        <div class="glimt-modal-empty-icon">🔖</div>
        <p>Ingen lagrede glimt ennå.</p>
        <p class="glimt-modal-empty-hint">Utforsk glimt fra andre reisende og lagre favorittene dine.</p>
      </div>`;
    return;
  }

  container.innerHTML = saved.map(g => buildGlimtPickerCard(g, "lagret")).join("");
}

// ── Bygg kort i picker ───────────────────────────────────────

function buildGlimtPickerCard(g, type) {
  const emoji = g.emoji || "✦";
  const title = escHtml(g.title || "Uten tittel");
  const desc  = escHtml(g.desc || g.description || "");
  const city  = escHtml(g.city || "");
  const source = type === "lagret"
    ? escHtml(g.author || "Fra andre")
    : escHtml(g.source || "Opprettet av deg");
  const img = g.image || "";

  const thumbHtml = img
    ? `<div class="glimt-picker-thumb" style="background-image:url('${img}')"></div>`
    : `<div class="glimt-picker-thumb glimt-picker-thumb--emoji">${emoji}</div>`;

  return `
    <div class="glimt-picker-card" data-glimt-id="${escHtml(g.id || '')}" data-glimt-emoji="${emoji}" data-glimt-title="${title}" data-glimt-desc="${desc}" data-glimt-city="${city}" data-glimt-image="${img}">
      ${thumbHtml}
      <div class="glimt-picker-info">
        <div class="glimt-picker-name">${title}</div>
        <div class="glimt-picker-sub">${source}${city ? ' · ' + city : ''}</div>
        ${desc ? `<div class="glimt-picker-desc">${desc.length > 80 ? desc.slice(0, 80) + '…' : desc}</div>` : ''}
      </div>
      <button class="glimt-picker-add" onclick="addPickedGlimtToDay(this)" title="Legg til i dagen">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </div>`;
}

// ── Legg valgt glimt til i dag (kopi-tilnærming) ────────────

function addPickedGlimtToDay(btn) {
  const card = btn.closest(".glimt-picker-card");
  const emoji = card.dataset.glimtEmoji || "📌";
  const title = card.dataset.glimtTitle || "Uten tittel";
  const desc  = card.dataset.glimtDesc || "";

  addGlimtItemToDay(emoji, title, desc, "Fra glimt");

  // Visuell feedback
  btn.classList.add("glimt-picker-add--done");
  btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>`;
  setTimeout(() => {
    btn.classList.remove("glimt-picker-add--done");
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>`;
  }, 1500);
}

// ── Opprett nytt glimt direkte ───────────────────────────────

function initGlimtCreateForm() {
  const form = document.getElementById("glimt-create-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const emoji = document.getElementById("glimt-new-emoji").value.trim() || "📌";
    const title = document.getElementById("glimt-new-title").value.trim();
    const desc  = document.getElementById("glimt-new-desc").value.trim();
    const time  = document.getElementById("glimt-new-time").value.trim();
    const cost  = document.getElementById("glimt-new-cost").value.trim();

    if (!title) return;

    const tags = [];
    if (time) tags.push(time);
    if (cost) tags.push(cost);

    const fullDesc = desc + (tags.length ? ` · ${tags.join(", ")}` : "");
    addGlimtItemToDay(emoji, title, fullDesc, "Nytt glimt");

    // Reset form
    form.reset();
    document.getElementById("glimt-new-emoji").value = "📌";
  });
}

// ── Felles: Legg glimt til aktiv dag ────────────────────────

function addGlimtItemToDay(emoji, title, desc, tagLabel) {
  const targetDay = _glimtModalTargetDay
    ? document.querySelector(`.rpd-day[data-day="${_glimtModalTargetDay}"]`)
    : document.querySelector(".rpd-day--active");

  if (!targetDay) {
    showToast("Ingen dag valgt", "info");
    return;
  }

  // Sørg for at dagen er åpen
  if (targetDay.classList.contains("rpd-day--collapsed")) {
    toggleDay(parseInt(targetDay.dataset.day));
  }

  const dayItems = targetDay.querySelector(".rpd-day-items");
  if (!dayItems) return;

  const newItem = document.createElement("div");
  newItem.className = "rpd-item rpd-item--added";
  newItem.innerHTML = `
    <span class="rpd-item-emoji">${emoji}</span>
    <div class="rpd-item-body">
      <div class="rpd-item-title">${escHtml(title)}</div>
      <div class="rpd-item-desc">${escHtml(desc)}</div>
      <div class="rpd-item-meta">
        <span class="rpd-item-tag">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="4"/></svg>
          ${escHtml(tagLabel)}
        </span>
      </div>
    </div>
    <div class="rpd-item-actions">
      <button class="rpd-item-action" title="Fjern" onclick="this.closest('.rpd-item').remove(); updateDayCount();">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `;

  const addBtn = dayItems.querySelector(".rpd-add-item");
  if (addBtn) dayItems.insertBefore(newItem, addBtn);
  else dayItems.appendChild(newItem);

  updateDayCount();
  showToast(`«${title}» lagt til i dag ${targetDay.dataset.day}`, "success");
}

// ── Modal init ───────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // Lukk-knapp
  const closeBtn = document.getElementById("glimt-modal-close");
  if (closeBtn) closeBtn.addEventListener("click", closeGlimtModal);

  // Klikk utenfor modal
  const overlay = document.getElementById("glimt-modal-overlay");
  if (overlay) overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeGlimtModal();
  });

  // Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay && overlay.classList.contains("glimt-modal--visible")) {
      closeGlimtModal();
    }
  });

  // Tab-switcher
  document.querySelectorAll(".glimt-modal-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".glimt-modal-tab").forEach(t => t.classList.remove("glimt-modal-tab--active"));
      document.querySelectorAll(".glimt-modal-panel").forEach(p => p.classList.remove("glimt-modal-panel--active"));
      tab.classList.add("glimt-modal-tab--active");
      const panelId = `glimt-panel-${tab.dataset.tab}`;
      document.getElementById(panelId)?.classList.add("glimt-modal-panel--active");
    });
  });

  // Init create form
  initGlimtCreateForm();
});
