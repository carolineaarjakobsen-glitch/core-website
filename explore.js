// ============================================================
//  CORE – explore.js
//  Henter city fra URL, sender filtre til /api/suggest,
//  og viser AI-genererte aktivitetskort
// ============================================================

// ── Hent by fra URL-param ──────────────────────────────────

const params = new URLSearchParams(window.location.search);
const CITY   = params.get("city") || "København";

document.addEventListener("DOMContentLoaded", () => {
  // Oppdater badge og tilbake-lenke
  const badge = document.getElementById("explore-city-badge");
  if (badge) badge.textContent = CITY;

  const back = document.getElementById("nav-back");
  if (back) back.href = `city-landing.html?city=${encodeURIComponent(CITY)}`;

  const loadingCity = document.getElementById("loading-city");
  if (loadingCity) loadingCity.textContent = CITY;
});

// ── Hent forslag fra Claude (via /api/suggest) ─────────────

async function fetchSuggestions(e) {
  e.preventDefault();

  const form   = document.getElementById("explore-form");
  const btn    = document.getElementById("explore-submit-btn");
  const data   = new FormData(form);

  const filters = {
    city:      CITY,
    med_hvem:  data.get("med_hvem")  || null,
    budsjett:  data.get("budsjett")  || null,
    stemning:  data.get("stemning")  || null,
    tidspunkt: data.get("tidspunkt") || null,
  };

  setLoading(btn, true);
  showState("loading");

  try {
    const response = await fetch("/api/suggest", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(filters),
    });

    const json = await response.json();

    if (!response.ok || !json.activities) {
      throw new Error(json.error || "Ukjent feil");
    }

    renderCards(json.activities);
    showState("results");
  } catch (err) {
    console.error("fetchSuggestions:", err);
    const errMsg = document.getElementById("results-error-msg");
    if (errMsg) errMsg.textContent = err.message || "Noe gikk galt. Prøv igjen.";
    showState("error");
  } finally {
    setLoading(btn, false);
  }
}

// ── Bygg aktivitetskort ────────────────────────────────────

function renderCards(activities) {
  const grid = document.getElementById("results-grid");
  if (!grid) return;

  grid.innerHTML = activities.map(act => `
    <div class="activity-card">
      <div class="card-emoji">${act.emoji || "📍"}</div>
      <div class="card-title">${escHtml(act.title)}</div>
      <div class="card-desc">${escHtml(act.desc)}</div>
      <div class="card-meta">
        <span class="card-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          ${escHtml(act.kostnad)}
        </span>
        <span class="card-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${escHtml(act.tid)}
        </span>
      </div>
      <div class="card-sted">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
        ${escHtml(act.sted)}
      </div>
      <div class="card-tips">💡 ${escHtml(act.tips)}</div>
    </div>
  `).join("");
}

// ── Tilstandsstyring ───────────────────────────────────────

function showState(state) {
  document.getElementById("results-empty").style.display   = state === "empty"   ? "" : "none";
  document.getElementById("results-loading").style.display = state === "loading" ? "" : "none";
  document.getElementById("results-error").style.display   = state === "error"   ? "" : "none";
  document.getElementById("results-grid").style.display    = state === "results" ? "" : "none";
}

function resetResults() {
  showState("empty");
}

// ── Hjelpere ───────────────────────────────────────────────

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.querySelector(".btn-text").style.display    = loading ? "none" : "";
  btn.querySelector(".btn-spinner").style.display = loading ? ""     : "none";
}

function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
