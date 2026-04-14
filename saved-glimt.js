// ============================================================
//  Glimt – Shared: Lagrede glimt & plan-tilknytning
//  Brukes av utforsk-reisebrev, glimt-detalj, mine-reiseplaner,
//  og reiseplan-detalj for å lagre/fjerne glimt og events,
//  og legge dem til i planer.
// ============================================================

const SAVED_GLIMT_KEY = "glimt.savedGlimt";
const SAVED_EVENTS_KEY = "glimt.myCalendar";
const REISEPLANER_KEY  = "glimt.reiseplaner";

// ── Lagrede glimt (fra andres reisebrev) ─────────────────────

function loadSavedGlimt() {
  try {
    const raw = localStorage.getItem(SAVED_GLIMT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveSavedGlimt(list) {
  localStorage.setItem(SAVED_GLIMT_KEY, JSON.stringify(list));
}

function addSavedGlimt(glimt) {
  const list = loadSavedGlimt();
  // Unngå duplikater
  if (list.some(g => g.id === glimt.id)) return false;
  list.push(glimt);
  saveSavedGlimt(list);
  return true;
}

function removeSavedGlimt(glimtId) {
  const list = loadSavedGlimt().filter(g => g.id !== glimtId);
  saveSavedGlimt(list);
  return list;
}

function isGlimtSaved(glimtId) {
  return loadSavedGlimt().some(g => g.id === glimtId);
}

// ── Lagrede events ───────────────────────────────────────────

function loadSavedEventsShared() {
  try {
    const raw = localStorage.getItem(SAVED_EVENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function removeSavedEvent(eventId) {
  const list = loadSavedEventsShared().filter(e => e.id !== eventId);
  localStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(list));
  return list;
}

// ── Reiseplaner ──────────────────────────────────────────────

function loadPlansShared() {
  try {
    const raw = localStorage.getItem(REISEPLANER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function savePlansShared(plans) {
  localStorage.setItem(REISEPLANER_KEY, JSON.stringify(plans));
}

// ── Toast-melding ────────────────────────────────────────────

function showToast(message, type) {
  // Fjern eksisterende toast
  const existing = document.querySelector(".glimt-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `glimt-toast glimt-toast--${type || "success"}`;
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      ${type === "remove"
        ? '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1.5 14a2 2 0 01-2 2h-7a2 2 0 01-2-2L5 6"/>'
        : '<path d="M20 6L9 17l-5-5"/>'
      }
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  // Animasjon
  requestAnimationFrame(() => {
    toast.classList.add("glimt-toast--visible");
  });

  setTimeout(() => {
    toast.classList.remove("glimt-toast--visible");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ── Plan-velger popup ────────────────────────────────────────

function showPlanPicker(itemData, onDone) {
  // Fjern eksisterende picker
  const existing = document.querySelector(".glimt-plan-picker-overlay");
  if (existing) existing.remove();

  const plans = loadPlansShared();
  if (plans.length === 0) {
    showToast("Ingen planer opprettet ennå – lag en plan først!", "info");
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "glimt-plan-picker-overlay";
  overlay.innerHTML = `
    <div class="glimt-plan-picker">
      <div class="glimt-plan-picker-header">
        <h3>Legg til i plan</h3>
        <button class="glimt-plan-picker-close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <p class="glimt-plan-picker-desc">Velg hvilken reiseplan du vil legge dette til:</p>
      <div class="glimt-plan-picker-list">
        ${plans.map(p => `
          <button class="glimt-plan-picker-item" data-plan-id="${p.id}">
            <div class="glimt-plan-picker-info">
              <span class="glimt-plan-picker-name">${escHtmlShared(p.name)}</span>
              <span class="glimt-plan-picker-city">${escHtmlShared(p.city)}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        `).join("")}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("glimt-plan-picker--visible"));

  // Lukk
  function close() {
    overlay.classList.remove("glimt-plan-picker--visible");
    setTimeout(() => overlay.remove(), 200);
  }

  overlay.querySelector(".glimt-plan-picker-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  // Velg plan
  overlay.querySelectorAll(".glimt-plan-picker-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const planId = btn.dataset.planId;
      const plans = loadPlansShared();
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      // Legg til i planens glimt eller events
      if (!plan.savedItems) plan.savedItems = [];

      // Sjekk duplikat
      if (plan.savedItems.some(si => si.id === itemData.id)) {
        showToast("Allerede lagt til i denne planen", "info");
        close();
        return;
      }

      plan.savedItems.push(itemData);

      // Oppdater tellere
      if (itemData.type === "glimt") {
        plan.glimtCount = (plan.glimtCount || 0) + 1;
      } else if (itemData.type === "event") {
        plan.eventCount = (plan.eventCount || 0) + 1;
      }

      savePlansShared(plans);
      showToast(`Lagt til i «${plan.name}»`, "success");
      close();
      if (onDone) onDone(planId);
    });
  });
}

function escHtmlShared(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}
