// =====================
//  MIN KALENDER
//  Viser brukerens lagrede arrangementer i en personlig kalender.
//  Data lagres i localStorage under "glimt.myCalendar".
// =====================

const MKAL_STORAGE_KEY = "glimt.myCalendar";

// Hjelpefunksjoner for localStorage
function loadSavedEvents() {
  try {
    const raw = localStorage.getItem(MKAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Kunne ikke lese lagrede events:", err);
    return [];
  }
}

function saveSavedEvents(events) {
  localStorage.setItem(MKAL_STORAGE_KEY, JSON.stringify(events));
}

function removeEvent(eventId) {
  const events = loadSavedEvents().filter(e => e.id !== eventId);
  saveSavedEvents(events);
  // Re-render gjeldende dag
  if (selectedDay !== null) {
    selectDay(selectedDay);
  }
  renderCalendar();
  renderSidebar();
}

// Kalender-state
const now = new Date();
let viewYear    = now.getFullYear();
let viewMonth   = now.getMonth();
let selectedDay = null;

const MONTHS_NO = [
  "Januar","Februar","Mars","April","Mai","Juni",
  "Juli","August","September","Oktober","November","Desember"
];

// =====================
//  RENDER SIDEBAR: ALLE LAGREDE GLIMT
// =====================
function renderSidebar() {
  const list    = document.getElementById("mkal-sidebar-list");
  const count   = document.getElementById("mkal-sidebar-count");
  const emptyEl = document.getElementById("mkal-sidebar-empty");
  const events  = loadSavedEvents();

  count.textContent = events.length;

  if (events.length === 0) {
    if (emptyEl) emptyEl.style.display = "flex";
    // Fjern eventuelle rendrede items men behold empty-div
    const items = list.querySelectorAll(".mkal-sidebar-item");
    items.forEach(i => i.remove());
    return;
  }

  // Sorter etter dato (nærmeste først)
  events.sort((a, b) => a.date.localeCompare(b.date));

  const MONTHS_SHORT = ["jan","feb","mar","apr","mai","jun","jul","aug","sep","okt","nov","des"];
  const MONTHS_FULL  = ["Januar","Februar","Mars","April","Mai","Juni","Juli","August","September","Oktober","November","Desember"];

  let html = "";
  let currentGroup = "";

  events.forEach(ev => {
    const d = new Date(ev.date + "T00:00:00");
    const monthIdx = d.getMonth();
    const yearStr  = d.getFullYear();
    const groupKey = `${yearStr}-${monthIdx}`;

    // Legg til månedsoverskrift hvis ny gruppe
    if (groupKey !== currentGroup) {
      currentGroup = groupKey;
      html += `<div class="mkal-sidebar-month">${MONTHS_FULL[monthIdx]} ${yearStr}</div>`;
    }

    const dayNum   = d.getDate();
    const monthStr = MONTHS_SHORT[monthIdx];
    const dateLabel = `${dayNum}. ${monthStr} ${yearStr}`;
    const cityLabel = ev.city || "";

    html += `
      <div class="mkal-sidebar-item" data-date="${ev.date}" onclick="goToEventDate('${ev.date}')">
        <span class="mkal-sidebar-item-emoji">${ev.emoji || "📌"}</span>
        <div class="mkal-sidebar-item-body">
          <div class="mkal-sidebar-item-title">${ev.title}</div>
          <div class="mkal-sidebar-item-meta">
            <span>${dateLabel}</span>
            ${cityLabel ? `<span class="mkal-sidebar-item-dot"></span><span>${cityLabel}</span>` : ""}
          </div>
        </div>
      </div>`;
  });

  // Behold empty-div men skjul den, legg til items
  if (emptyEl) emptyEl.style.display = "none";
  // Fjern gamle items og månedsoverskrifter
  const oldItems = list.querySelectorAll(".mkal-sidebar-item, .mkal-sidebar-month");
  oldItems.forEach(i => i.remove());
  list.insertAdjacentHTML("beforeend", html);
}

function goToEventDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  viewYear  = d.getFullYear();
  viewMonth = d.getMonth();
  selectedDay = d.getDate();
  renderCalendar();
  selectDay(selectedDay);

  // Marker aktiv i sidebar
  document.querySelectorAll(".mkal-sidebar-item").forEach(el => {
    el.classList.toggle("active", el.dataset.date === dateStr);
  });
}

// =====================
//  RENDER KALENDER
// =====================
function renderCalendar() {
  const grid     = document.getElementById("mkal-grid");
  const title    = document.getElementById("mkal-month-title");
  title.textContent = `${MONTHS_NO[viewMonth]} ${viewYear}`;

  // Hent lagrede events for denne maneden
  const saved = loadSavedEvents();
  const eventsThisMonth = {};
  saved.forEach(ev => {
    const d = new Date(ev.date);
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      const day = d.getDate();
      if (!eventsThisMonth[day]) eventsThisMonth[day] = 0;
      eventsThisMonth[day]++;
    }
  });

  // Forste dag i maneden (juster til mandag = 0)
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const offset   = (firstDay + 6) % 7; // mandag = 0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const todayY = now.getFullYear();
  const todayM = now.getMonth();
  const todayD = now.getDate();

  let html = "";

  // Tomme celler for offset
  for (let i = 0; i < offset; i++) {
    html += `<div class="mkal-day empty"></div>`;
  }

  // Dager
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday    = (viewYear === todayY && viewMonth === todayM && d === todayD);
    const isSelected = (d === selectedDay);
    const count      = eventsThisMonth[d] || 0;

    let classes = "mkal-day";
    if (isToday)    classes += " today";
    if (isSelected) classes += " selected";

    const dot   = count > 0 ? `<span class="mkal-day-dot"></span>` : "";
    const badge = count > 1 ? `<span class="mkal-day-count">${count}</span>` : "";

    html += `
      <div class="${classes}" onclick="selectDay(${d})">
        ${badge}
        <span class="mkal-day-num">${d}</span>
        ${dot}
      </div>`;
  }

  grid.innerHTML = html;
}

// =====================
//  VELG DAG
// =====================
function selectDay(day) {
  selectedDay = day;
  renderCalendar();

  const date = new Date(viewYear, viewMonth, day);
  const dateStr = date.toLocaleDateString("no-NO", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  document.getElementById("mkal-aside-empty").style.display   = "none";
  document.getElementById("mkal-aside-content").style.display = "block";
  document.getElementById("mkal-aside-date").textContent =
    dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  // Finn events for denne datoen
  const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const saved = loadSavedEvents().filter(ev => ev.date === dateKey);

  const list     = document.getElementById("mkal-events-list");
  const emptyDay = document.getElementById("mkal-aside-empty-day");

  if (saved.length === 0) {
    list.innerHTML = "";
    list.style.display = "none";
    emptyDay.style.display = "block";
  } else {
    emptyDay.style.display = "none";
    list.style.display = "flex";
    list.innerHTML = renderEventCards(saved);
  }
}

// =====================
//  RENDER EVENT-KORT
// =====================
function renderEventCards(events) {
  return events.map(ev => {
    const isTM = ev.source === "ticketmaster";
    const linkOpen  = ev.url ? `<a href="${ev.url}" target="_blank" rel="noopener" class="mkal-event-link">` : "";
    const linkClose = ev.url ? "</a>" : "";
    const tmTag     = isTM ? `<span class="mkal-event-tag mkal-event-tag--tm">Ticketmaster</span>` : "";
    const cityTag   = ev.city ? `<span class="mkal-event-tag mkal-event-tag--city">${ev.city}</span>` : "";

    return `
      <div class="mkal-event-card ${isTM ? "mkal-event-card--tm" : ""}">
        <span class="mkal-event-emoji">${ev.emoji || "📌"}</span>
        <div class="mkal-event-body">
          ${linkOpen}<div class="mkal-event-title">${ev.title}</div>${linkClose}
          <div class="mkal-event-desc">${ev.desc || ""}</div>
          <div class="mkal-event-tags">
            <span class="mkal-event-tag">${ev.tag || "Arrangement"}</span>
            ${cityTag}
            ${tmTag}
          </div>
        </div>
        <button class="mkal-remove-btn" onclick="removeEvent('${ev.id}')" title="Fjern fra min kalender">&#10005;</button>
      </div>
    `;
  }).join("");
}

// =====================
//  NAVIGASJON
// =====================
function prevMonth() {
  viewMonth--;
  if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  selectedDay = null;
  document.getElementById("mkal-aside-empty").style.display   = "flex";
  document.getElementById("mkal-aside-content").style.display = "none";
  renderCalendar();
}

function nextMonth() {
  viewMonth++;
  if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  selectedDay = null;
  document.getElementById("mkal-aside-empty").style.display   = "flex";
  document.getElementById("mkal-aside-content").style.display = "none";
  renderCalendar();
}

// =====================
//  MODAL: OPPRETT GLIMT
// =====================
function openModal() {
  const modal = document.getElementById("mkal-modal");
  modal.style.display = "flex";

  // Sett dato-feltet til valgt dag eller i dag
  const dateInput = document.getElementById("glimt-date");
  if (selectedDay !== null) {
    dateInput.value = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
  } else {
    const today = new Date();
    dateInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }

  // Reset skjema
  document.getElementById("glimt-title").value = "";
  document.getElementById("glimt-desc").value = "";
  document.getElementById("glimt-category").value = "Arrangement";
  document.getElementById("glimt-city").value = "København";

  // Reset emoji-valg
  document.querySelectorAll(".mkal-emoji-opt").forEach((btn, i) => {
    btn.classList.toggle("selected", i === 0);
  });
  document.getElementById("glimt-emoji").value = document.querySelector(".mkal-emoji-opt").dataset.emoji;
}

function closeModal() {
  document.getElementById("mkal-modal").style.display = "none";
}

function setupEmojiPicker() {
  const picker = document.getElementById("emoji-picker");
  const hidden = document.getElementById("glimt-emoji");

  picker.addEventListener("click", (e) => {
    const btn = e.target.closest(".mkal-emoji-opt");
    if (!btn) return;

    picker.querySelectorAll(".mkal-emoji-opt").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    hidden.value = btn.dataset.emoji;
  });
}

function handleFormSubmit(e) {
  e.preventDefault();

  const emoji    = document.getElementById("glimt-emoji").value;
  const title    = document.getElementById("glimt-title").value.trim();
  const dateVal  = document.getElementById("glimt-date").value;
  const city     = document.getElementById("glimt-city").value;
  const category = document.getElementById("glimt-category").value;
  const desc     = document.getElementById("glimt-desc").value.trim();

  if (!title || !dateVal) return;

  const eventData = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title,
    desc,
    emoji,
    tag: category,
    city,
    date: dateVal,
    url: "",
    source: "custom",
    savedAt: new Date().toISOString()
  };

  const saved = loadSavedEvents();
  saved.push(eventData);
  saveSavedEvents(saved);

  closeModal();
  renderCalendar();
  renderSidebar();

  // Vis den nye datoen i sidepanelet
  const d = new Date(dateVal);
  if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
    selectDay(d.getDate());
  }
}

// =====================
//  OPPSTART
// =====================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-prev").addEventListener("click", prevMonth);
  document.getElementById("btn-next").addEventListener("click", nextMonth);

  // Modal
  document.getElementById("btn-add-event").addEventListener("click", openModal);
  document.getElementById("btn-modal-close").addEventListener("click", closeModal);
  document.getElementById("mkal-modal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById("mkal-form").addEventListener("submit", handleFormSubmit);
  setupEmojiPicker();

  renderCalendar();
  renderSidebar();
});
