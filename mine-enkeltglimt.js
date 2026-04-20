// ============================================================
//  Glimt – mine-enkeltglimt.js
//  Lar brukeren opprette egne enkelt-glimt med alle filter-
//  egenskaper, vise dem, og se lagrede glimt fra andre.
//  Brukeropprettede glimt lagres i localStorage under
//  "glimt.myCreatedGlimt".
// ============================================================

const MY_GLIMT_KEY = "glimt.myCreatedGlimt";

// ── Varighet-labels ─────────────────────────────────────────
const VARIGHET_LABELS = {
  "under1":  "Under 1 time",
  "1-2":     "1–2 timer",
  "2-4":     "2–4 timer",
  "halvdag":  "Halvdag",
  "heldag":   "Hel dag"
};

// ── CRUD ────────────────────────────────────────────────────
function loadMyGlimt() {
  try {
    const raw = localStorage.getItem(MY_GLIMT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveMyGlimt(list) {
  localStorage.setItem(MY_GLIMT_KEY, JSON.stringify(list));
}

function deleteMyGlimt(id) {
  const list = loadMyGlimt().filter(g => g.id !== id);
  saveMyGlimt(list);
  renderMineTab();
}

function uid() {
  return "mg-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── HTML-escape ─────────────────────────────────────────────
function esc(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

// ── Bygg kort for brukerens eget glimt ──────────────────────
function buildMyGlimtCard(g) {
  const emoji = g.emoji || "✦";
  const varighetLabel = VARIGHET_LABELS[g.varighet] || g.varighet || "";
  const tags = [];

  if (g.kostnad)       tags.push({ text: g.kostnad, cls: "meg-card-tag--cost" });
  if (varighetLabel)   tags.push({ text: varighetLabel, cls: "meg-card-tag--time" });
  if (g.aktivitetsniva) tags.push({ text: g.aktivitetsniva, cls: "" });

  // Stemning-chips (maks 3)
  if (g.stemning && g.stemning.length > 0) {
    const stemLabels = { rolig: "Rolig", aktiv: "Aktiv", kulturell: "Kultur", mat: "Mat", romantisk: "Romantisk", eventyr: "Eventyr" };
    g.stemning.slice(0, 3).forEach(s => {
      if (stemLabels[s]) tags.push({ text: stemLabels[s], cls: "" });
    });
  }

  const tagsHtml = tags.map(t =>
    `<span class="meg-card-tag ${t.cls}">${esc(t.text)}</span>`
  ).join("");

  const imageHtml = g.image
    ? `<img class="meg-card-image" src="${esc(g.image)}" alt="${esc(g.title)}" loading="lazy" />`
    : `<div class="meg-card-no-image">${emoji}</div>`;

  return `
    <article class="meg-card">
      <div class="meg-card-image-wrap">
        ${imageHtml}
        <span class="meg-card-author-badge meg-card-author-badge--user">Opprettet av deg</span>
        <span class="meg-card-city">${esc(g.city)}</span>
      </div>
      <div class="meg-card-body">
        <h3 class="meg-card-title">
          <span class="meg-card-emoji">${emoji}</span>
          ${esc(g.title)}
        </h3>
        <div class="meg-card-address">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          ${esc(g.sted)}
        </div>
        <p class="meg-card-desc">${esc(g.desc)}</p>
        <div class="meg-card-tags">${tagsHtml}</div>
        <div class="meg-card-footer">
          <button class="meg-card-action meg-card-action--plan" onclick="addMyGlimtToPlan('${esc(g.id)}')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Legg til i plan
          </button>
          <button class="meg-card-action meg-card-action--edit" onclick="editMyGlimt('${esc(g.id)}')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Rediger
          </button>
          <button class="meg-card-action meg-card-action--delete" onclick="confirmDeleteGlimt('${esc(g.id)}')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1.5 14a2 2 0 01-2 2h-7a2 2 0 01-2-2L5 6"/></svg>
            Slett
          </button>
        </div>
      </div>
    </article>
  `;
}

// ── Bygg kort for lagret glimt (fra andre) ──────────────────
function buildSavedGlimtCard(g) {
  const imageHtml = g.image
    ? `<img class="meg-card-image" src="${esc(g.image)}" alt="${esc(g.title)}" loading="lazy" />`
    : `<div class="meg-card-no-image">✦</div>`;

  return `
    <article class="meg-card">
      <div class="meg-card-image-wrap">
        ${imageHtml}
        <span class="meg-card-author-badge meg-card-author-badge--other">${esc(g.author || "Anonym")}</span>
        ${g.city ? `<span class="meg-card-city">${esc(g.city)}</span>` : ""}
      </div>
      <div class="meg-card-body">
        <h3 class="meg-card-title">${esc(g.title)}</h3>
        ${g.address ? `<div class="meg-card-address">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          ${esc(g.address)}
        </div>` : ""}
        ${g.note ? `<p class="meg-card-desc">${esc(g.note)}</p>` : ""}
        <div class="meg-card-footer">
          <button class="meg-card-action meg-card-action--plan" onclick="addSavedGlimtToPlan('${esc(g.id)}')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Legg til i plan
          </button>
          <button class="meg-card-action meg-card-action--delete" onclick="removeSavedAndRefresh('${esc(g.id)}')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1.5 14a2 2 0 01-2 2h-7a2 2 0 01-2-2L5 6"/></svg>
            Fjern
          </button>
        </div>
      </div>
    </article>
  `;
}

// ── Render tabs ─────────────────────────────────────────────
function renderMineTab() {
  const grid  = document.getElementById("meg-mine-grid");
  const empty = document.getElementById("meg-mine-empty");
  if (!grid || !empty) return;

  const items = loadMyGlimt();

  if (items.length === 0) {
    grid.innerHTML = "";
    grid.style.display = "none";
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
    grid.style.display = "grid";
    grid.innerHTML = items.map(buildMyGlimtCard).join("");
  }
}

function renderLagredeTab() {
  const grid  = document.getElementById("meg-lagrede-grid");
  const empty = document.getElementById("meg-lagrede-empty");
  if (!grid || !empty) return;

  const items = loadSavedGlimt();

  if (items.length === 0) {
    grid.innerHTML = "";
    grid.style.display = "none";
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
    grid.style.display = "grid";
    grid.innerHTML = items.map(buildSavedGlimtCard).join("");
  }
}

// ── Slett-bekreftelse ───────────────────────────────────────
function confirmDeleteGlimt(id) {
  if (confirm("Er du sikker på at du vil slette dette glimtet?")) {
    deleteMyGlimt(id);
    showToast("Glimtet ble slettet", "remove");
  }
}

// ── Fjern lagret glimt og oppdater ──────────────────────────
function removeSavedAndRefresh(id) {
  removeSavedGlimt(id);
  renderLagredeTab();
  showToast("Fjernet fra lagrede glimt", "remove");
}

// ── Legg mine glimt i plan ──────────────────────────────────
function addMyGlimtToPlan(id) {
  const g = loadMyGlimt().find(x => x.id === id);
  if (!g) return;
  showPlanPicker({
    id: g.id, title: g.title, city: g.city,
    image: g.image || "", address: g.sted,
    note: g.desc, type: "glimt"
  });
}

function addSavedGlimtToPlan(id) {
  const g = loadSavedGlimt().find(x => x.id === id);
  if (!g) return;
  showPlanPicker({
    id: g.id, title: g.title, city: g.city,
    image: g.image || "", address: g.address || "",
    note: g.note || "", type: "glimt"
  });
}

// ── Modal: åpne / lukke ─────────────────────────────────────
function openModal() {
  const modal = document.getElementById("meg-modal");
  if (modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}

function closeModal() {
  const modal = document.getElementById("meg-modal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
  // Reset form
  const form = document.getElementById("meg-form");
  if (form) form.reset();

  // Reset edit-state
  const editIdEl = document.getElementById("opprett-edit-id");
  const titleEl = document.getElementById("opprett-modal-title");
  const submitTextEl = document.getElementById("opprett-modal-submit-text");
  if (editIdEl) editIdEl.value = "";
  if (titleEl) titleEl.textContent = "Opprett nytt glimt";
  if (submitTextEl) submitTextEl.textContent = "Legg til glimt";

  // Reset autofill
  const urlInput = document.getElementById("meg-url-input");
  if (urlInput) urlInput.value = "";
  const statusEl = document.getElementById("meg-autofill-status");
  if (statusEl) { statusEl.style.display = "none"; statusEl.textContent = ""; }
}

// ── Autofyll fra URL ────────────────────────────────────────
async function handleAutofill() {
  const urlInput  = document.getElementById("meg-url-input");
  const btn       = document.getElementById("meg-autofill-btn");
  const statusEl  = document.getElementById("meg-autofill-status");
  const btnText   = btn.querySelector(".meg-autofill-btn-text");
  const btnSpin   = btn.querySelector(".meg-autofill-spinner");

  const url = (urlInput.value || "").trim();
  if (!url) {
    showAutofillStatus("Lim inn en lenke først.", "error");
    return;
  }

  // Valider URL klientsiden
  try {
    new URL(url);
  } catch {
    showAutofillStatus("Det ser ikke ut som en gyldig lenke. Sjekk at den starter med https://", "error");
    return;
  }

  // Loading-tilstand
  btn.disabled = true;
  btnText.style.display = "none";
  btnSpin.style.display = "inline-block";
  showAutofillStatus("Henter og analyserer siden... Dette kan ta noen sekunder.", "loading");

  try {
    const res = await fetch("/api/parse-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    let result;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      result = await res.json();
    } else {
      const text = await res.text();
      console.error("parse-url returnerte ikke JSON:", res.status, text.slice(0, 200));
      showAutofillStatus(
        `Serverfeil (HTTP ${res.status}). Er API-et deployet til Vercel?`,
        "error"
      );
      return;
    }

    if (!res.ok || !result.success) {
      showAutofillStatus(result.error || "Noe gikk galt. Prøv igjen.", "error");
      return;
    }

    const d = result.data;

    // Pre-fyll skjemafelter
    const form = document.getElementById("meg-form");
    if (!form) return;

    if (d.title)   form.querySelector('[name="title"]').value   = d.title;
    if (d.desc)    form.querySelector('[name="desc"]').value    = d.desc;
    if (d.sted)    form.querySelector('[name="sted"]').value    = d.sted;
    if (d.tips)    form.querySelector('[name="tips"]').value    = d.tips;
    if (d.image)   form.querySelector('[name="image"]').value   = d.image;
    if (d.kostnad) form.querySelector('[name="kostnad"]').value = d.kostnad;
    if (d.emoji)   form.querySelector('[name="emoji"]').value   = d.emoji;

    // By – match mot select-options
    if (d.city) {
      const citySelect = document.getElementById("meg-city-select");
      if (citySelect) {
        const opt = Array.from(citySelect.options).find(
          o => o.value.toLowerCase() === d.city.toLowerCase()
        );
        if (opt) {
          citySelect.value = opt.value;
        }
      }
    }

    // Checkbox-grupper (hvem, budsjett, stemning, tidspunkt)
    setCheckboxes(form, "hvem", d.hvem);
    setCheckboxes(form, "budsjett", d.budsjett);
    setCheckboxes(form, "stemning", d.stemning);
    setCheckboxes(form, "tidspunkt", d.tidspunkt);

    // Radio-grupper (aktivitetsniva, varighet)
    if (d.aktivitetsniva) setRadio(form, "aktivitetsniva", d.aktivitetsniva);
    if (d.varighet)       setRadio(form, "varighet", d.varighet);

    showAutofillStatus(
      "Dataen er hentet! Gå gjennom feltene under og juster det som trengs før du lagrer.",
      "success"
    );

  } catch (err) {
    console.error("Autofill feil:", err);
    const msg = err.message && err.message.includes("Failed to fetch")
      ? "Kunne ikke nå API-et. Sjekk at prosjektet er deployet til Vercel og at /api/parse-url finnes."
      : `Feil: ${err.message || "Ukjent feil. Sjekk nettverksforbindelsen."}`;
    showAutofillStatus(msg, "error");
  } finally {
    btn.disabled = false;
    btnText.style.display = "inline-flex";
    btnSpin.style.display = "none";
  }
}

function setCheckboxes(form, name, values) {
  if (!Array.isArray(values)) return;
  form.querySelectorAll(`input[name="${name}"]`).forEach(cb => {
    cb.checked = values.includes(cb.value);
  });
}

function setRadio(form, name, value) {
  if (!value) return;
  const radio = form.querySelector(`input[name="${name}"][value="${value}"]`);
  if (radio) radio.checked = true;
}

function showAutofillStatus(message, type) {
  const el = document.getElementById("meg-autofill-status");
  if (!el) return;
  el.style.display = "block";
  el.className = `meg-autofill-status meg-autofill-status--${type}`;
  el.textContent = message;
}

// ── Opprett glimt ───────────────────────────────────────────
function handleCreateGlimt(e) {
  e.preventDefault();

  const data = new FormData(e.target);
  const form = e.target;

  // Samle checkbox-verdier
  const hvem      = data.getAll("hvem");
  const budsjett  = data.getAll("budsjett");
  const stemning  = data.getAll("stemning");
  const tidspunkt = data.getAll("tidspunkt");

  const editId = (document.getElementById("opprett-edit-id") || {}).value || "";
  const list = loadMyGlimt();

  if (editId) {
    // ── Rediger eksisterende glimt ──
    const idx = list.findIndex(x => x.id === editId);
    if (idx >= 0) {
      const existing = list[idx];
      list[idx] = {
        ...existing,
        title:          data.get("title")?.trim() || "",
        desc:           data.get("desc")?.trim() || "",
        sted:           data.get("sted")?.trim() || "",
        city:           data.get("city") || "",
        tips:           data.get("tips")?.trim() || "",
        image:          data.get("image")?.trim() || "",
        image2:         data.get("image2")?.trim() || "",
        emoji:          data.get("emoji")?.trim() || "",
        kostnad:        data.get("kostnad")?.trim() || "",
        varighet:       data.get("varighet") || "",
        aktivitetsniva: data.get("aktivitetsniva") || "",
        hvem, budsjett, stemning, tidspunkt,
        updatedAt:      new Date().toISOString()
      };
      saveMyGlimt(list);
      closeModal();
      renderMineTab();
      showToast("Glimtet ble oppdatert!", "success");
      return;
    }
  }

  // ── Opprett nytt glimt ──
  const glimt = {
    id:             uid(),
    title:          data.get("title")?.trim() || "",
    desc:           data.get("desc")?.trim() || "",
    sted:           data.get("sted")?.trim() || "",
    city:           data.get("city") || "",
    tips:           data.get("tips")?.trim() || "",
    image:          data.get("image")?.trim() || "",
        image2:         data.get("image2")?.trim() || "",
    emoji:          data.get("emoji")?.trim() || "",
    kostnad:        data.get("kostnad")?.trim() || "",
    varighet:       data.get("varighet") || "",
    aktivitetsniva: data.get("aktivitetsniva") || "",
    hvem,
    budsjett,
    stemning,
    tidspunkt,
    createdBy:      "user",
    createdAt:      new Date().toISOString()
  };

  list.unshift(glimt);
  saveMyGlimt(list);

  closeModal();
  renderMineTab();
  showToast("Glimtet ble opprettet!", "success");
}

// ── Rediger glimt ───────────────────────────────────────────
function editMyGlimt(id) {
  const list = loadMyGlimt();
  const g = list.find(x => x.id === id);
  if (!g) return;

  const form = document.getElementById("opprett-glimt-form");
  const modal = document.getElementById("opprett-glimt-modal");
  if (!form || !modal) return;

  form.reset();

  // Tekstfelter
  const setVal = (name, v) => { const el = form.querySelector(`[name="${name}"]`); if (el) el.value = v || ""; };
  setVal("title", g.title);
  setVal("desc", g.desc);
  setVal("sted", g.sted);
  setVal("city", g.city);
  setVal("tips", g.tips);
  setVal("image", g.image);
  setVal("image2", g.image2);
  setVal("emoji", g.emoji);
  setVal("kostnad", g.kostnad);

  // Vis bildeforhåndsvisning hvis det finnes (trigger image-upload widget)
  const imgInput = form.querySelector('[name="image"]');
  if (imgInput) imgInput.dispatchEvent(new Event("input", { bubbles: true }));

  // Chips og radioer
  setCheckboxes(form, "hvem", g.hvem || []);
  setCheckboxes(form, "budsjett", g.budsjett || []);
  setCheckboxes(form, "stemning", g.stemning || []);
  setCheckboxes(form, "tidspunkt", g.tidspunkt || []);
  setRadio(form, "aktivitetsniva", g.aktivitetsniva || "");
  setRadio(form, "varighet", g.varighet || "");

  // Sett edit-id og oppdater modal-tittel
  const editIdEl = document.getElementById("opprett-edit-id");
  const titleEl = document.getElementById("opprett-modal-title");
  const submitTextEl = document.getElementById("opprett-modal-submit-text");
  if (editIdEl) editIdEl.value = id;
  if (titleEl) titleEl.textContent = "Rediger glimt";
  if (submitTextEl) submitTextEl.textContent = "Lagre endringer";

  openModal();
}

// ── Init ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

  // Populate by-velger
  const citySelect = document.getElementById("meg-city-select");
  if (citySelect && typeof CITIES !== "undefined") {
    CITIES.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.name;
      opt.textContent = c.name;
      citySelect.appendChild(opt);
    });
  }

  // Tabs
  document.querySelectorAll(".meg-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".meg-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const target = tab.dataset.tab;
      document.getElementById("panel-mine").style.display    = target === "mine" ? "" : "none";
      document.getElementById("panel-lagrede").style.display = target === "lagrede" ? "" : "none";

      if (target === "lagrede") renderLagredeTab();
    });
  });

  // Opprett-knapp → modal
  const createBtn = document.getElementById("meg-create-btn");
  if (createBtn) createBtn.addEventListener("click", openModal);

  // Lukk modal
  const closeBtn = document.getElementById("meg-modal-close");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  // Lukk ved klikk utenfor
  const overlay = document.getElementById("meg-modal");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  // Escape-tast
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Autofill-knapp
  const autofillBtn = document.getElementById("meg-autofill-btn");
  if (autofillBtn) autofillBtn.addEventListener("click", handleAutofill);

  // Form submit
  const form = document.getElementById("meg-form");
  if (form) form.addEventListener("submit", handleCreateGlimt);

  // Initial render
  renderMineTab();
});
