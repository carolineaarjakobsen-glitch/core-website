// ============================================================
//  Glimt – opprett-glimt.js
//  Håndterer dynamiske glimt-kort og lagring av et reisebrev
//  til localStorage under nøkkelen "glimt.userGlimts".
// ============================================================

const STORAGE_KEY = "glimt.userGlimts";

// ── By-normalisering ────────────────────────────────────────
// Mapper nærliggende kommuner/bydeler til sin «forelder»-by
// slik at f.eks. Frederiksberg → København.
const CITY_ALIASES = {
  // København-området
  "frederiksberg":      "København",
  "gentofte":           "København",
  "gladsaxe":           "København",
  "herlev":             "København",
  "hvidovre":           "København",
  "rødovre":            "København",
  "tårnby":             "København",
  "dragør":             "København",
  "vallensbæk":         "København",
  "brøndby":            "København",
  "albertslund":         "København",
  "ballerup":           "København",
  "lyngby-taarbæk":    "København",
  "rudersdal":          "København",
  "amager":             "København",
  "vesterbro":          "København",
  "nørrebro":           "København",
  "østerbro":           "København",
  "christianshavn":     "København",
  "vanløse":            "København",
  "valby":              "København",
  "brønshøj":           "København",
  "copenhagen":         "København",
  "copenhagen municipality": "København",
  "köpenhamn":          "København",

  // Stockholm-området
  "södermalm":          "Stockholm",
  "östermalm":          "Stockholm",
  "kungsholmen":        "Stockholm",
  "vasastan":           "Stockholm",
  "norrmalm":           "Stockholm",
  "gamla stan":         "Stockholm",
  "djurgården":         "Stockholm",
  "solna":              "Stockholm",
  "sundbyberg":         "Stockholm",
  "lidingö":            "Stockholm",
  "nacka":              "Stockholm",

  // Roma-området
  "rome":               "Roma",
  "trastevere":         "Roma",
  "testaccio":          "Roma",
  "municipio i":        "Roma",

  // Dublin-området
  "dún laoghaire":      "Dublin",
  "dun laoghaire":      "Dublin",
  "howth":              "Dublin",
  "blackrock":          "Dublin",
  "fingal":             "Dublin",

  // Gardasjøen-området
  "malcesine":          "Gardasjøen",
  "limone sul garda":   "Gardasjøen",
  "sirmione":           "Gardasjøen",
  "riva del garda":     "Gardasjøen",
  "desenzano del garda":"Gardasjøen",
  "bardolino":          "Gardasjøen",
  "lazise":             "Gardasjøen",
  "peschiera del garda":"Gardasjøen",
  "torri del benaco":   "Gardasjøen",
  "garda":              "Gardasjøen",
  "limone":             "Gardasjøen",
  "torbole":            "Gardasjøen",
  "nago-torbole":       "Gardasjøen",
  "arco":               "Gardasjøen",
  "salò":               "Gardasjøen",
  "gardone riviera":    "Gardasjøen",
  "gargnano":           "Gardasjøen",
  "toscolano-maderno":  "Gardasjøen",
  "brenzone":           "Gardasjøen",
  "brenzone sul garda": "Gardasjøen",
  "cassone":            "Gardasjøen"
};

/**
 * Normaliser et bynavn mot kjente aliaser.
 * Returnerer det normaliserte navnet, eller originalen om ingen match.
 */
function normalizeCity(raw) {
  if (!raw) return "";
  const key = raw.trim().toLowerCase();
  return CITY_ALIASES[key] || raw.trim();
}

/**
 * Trekk ut by fra en meta-streng som "Frederiksberg, Danmark"
 * eller "Trastevere, Roma, Italia". Returnerer normalisert by.
 */
function extractCityFromMeta(meta) {
  if (!meta) return "";
  // Prøv første del (typisk locality)
  const parts = meta.split(",").map(s => s.trim()).filter(Boolean);
  for (const part of parts) {
    const norm = normalizeCity(part);
    // Sjekk om normalisert verdi matcher en kjent by i CITIES
    if (typeof CITIES !== "undefined" && Array.isArray(CITIES)) {
      if (CITIES.some(c => c.name === norm)) return norm;
    }
    // Sjekk om det er et kjent alias
    if (CITY_ALIASES[part.toLowerCase()]) return CITY_ALIASES[part.toLowerCase()];
  }
  // Fallback: returner normalisert første del
  return parts.length > 0 ? normalizeCity(parts[0]) : "";
}

// ── Adresse-søk konfig ───────────────────────────────────────
const NOMINATIM_URL       = "https://nominatim.openstreetmap.org/search";
const ADDRESS_DEBOUNCE_MS = 300;
const ADDRESS_MIN_CHARS   = 2;

// Google Places – opprettes lazy når SDK er lastet
let googleSessionToken      = null;
let googleAutocompleteSvc   = null;
let googlePlacesSvc         = null;

const form            = document.getElementById("guide-form");
const container       = document.getElementById("glimts-container");
const addBtn          = document.getElementById("add-glimt-btn");
const storylineList   = document.getElementById("storyline-list");
const storylineCount  = document.getElementById("storyline-count");
const storylineEmpty  = document.getElementById("storyline-empty");

// ── Glimt-datalager (array med objekter) ────────────────────
// Hvert glimt har en unik id og alle feltene fra popup-modal.
// Preview-kort i DOM refererer til glimtets id via data-glimt-id.
let glimtItems = [];

// Holder styr på det kortet som er «aktivt» i storyline
let activeCardId = null;

// Redigeringsmodus: satt hvis ?edit=<id> finnes i URL og guiden
// finnes i localStorage. Vi lagrer guide-ID så saveGuide oppdaterer
// eksisterende post i stedet for å opprette en ny.
let editingGuideId = null;

// ── Hjelp: generer unik id ───────────────────────────────────
function uid() {
  return "g" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Hjelp: debounce ──────────────────────────────────────────
function debounce(fn, ms) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

// ── Google Places: tilgjengelighet + services ────────────────
function isGoogleReady() {
  return !!(
    window.google &&
    window.google.maps &&
    window.google.maps.places &&
    typeof window.google.maps.places.AutocompleteService === "function"
  );
}

function ensureGoogleServices() {
  if (!isGoogleReady()) return false;
  if (!googleAutocompleteSvc) {
    googleAutocompleteSvc = new google.maps.places.AutocompleteService();
    // PlacesService krever et map/div-element
    googlePlacesSvc = new google.maps.places.PlacesService(
      document.createElement("div")
    );
  }
  return true;
}

function newGoogleSession() {
  if (!isGoogleReady()) return null;
  googleSessionToken = new google.maps.places.AutocompleteSessionToken();
  return googleSessionToken;
}

// ── Google Places: søk ───────────────────────────────────────
function searchGooglePlaces(query) {
  if (!ensureGoogleServices()) return Promise.resolve([]);
  if (!googleSessionToken) newGoogleSession();

  return new Promise((resolve) => {
    googleAutocompleteSvc.getPlacePredictions(
      {
        input: query,
        sessionToken: googleSessionToken
      },
      (predictions, status) => {
        const Status = google.maps.places.PlacesServiceStatus;
        if (status === Status.ZERO_RESULTS) {
          resolve([]);
          return;
        }
        if (status !== Status.OK) {
          console.warn("Google Places status:", status);
          resolve([]);
          return;
        }
        resolve(
          (predictions || []).map((p) => ({
            provider: "google",
            placeId: p.place_id,
            main:
              p.structured_formatting?.main_text || p.description,
            meta:
              p.structured_formatting?.secondary_text || "",
            description: p.description
          }))
        );
      }
    );
  });
}

// ── Google Places: hent detaljer for valgt prediksjon ────────
function fetchGooglePlaceDetails(placeId) {
  if (!ensureGoogleServices()) return Promise.resolve(null);

  return new Promise((resolve) => {
    googlePlacesSvc.getDetails(
      {
        placeId,
        fields: [
          "formatted_address",
          "geometry",
          "name",
          "place_id"
        ],
        sessionToken: googleSessionToken
      },
      (place, status) => {
        // Uansett utfall – forbruk session token og start en ny
        const prev = googleSessionToken;
        newGoogleSession();
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !place
        ) {
          resolve(null);
          return;
        }
        const loc = place.geometry?.location;
        resolve({
          formatted_address: place.formatted_address || place.name || "",
          name: place.name || "",
          lat: loc ? loc.lat() : null,
          lon: loc ? loc.lng() : null,
          placeId: place.place_id || placeId,
          _prevSession: prev
        });
      }
    );
  });
}

// ── Nominatim-søk (fallback) ─────────────────────────────────
async function searchNominatim(query) {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("accept-language", "no,en");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" }
  });
  if (!res.ok) throw new Error("Nominatim-feil: " + res.status);
  const data = await res.json();

  return data.map((item) => {
    const a = item.address || {};
    const road = a.road
      ? a.house_number
        ? `${a.road} ${a.house_number}`
        : a.road
      : "";
    const mainCandidates = [
      a.attraction,
      a.tourism,
      a.historic,
      a.building,
      a.amenity,
      item.name,
      road,
      a.hamlet,
      a.suburb
    ].filter(Boolean);
    const main =
      mainCandidates[0] || item.display_name.split(",")[0];
    const locality =
      a.city ||
      a.town ||
      a.village ||
      a.municipality ||
      a.county ||
      "";
    const country = a.country || "";
    const meta = [locality, country].filter(Boolean).join(", ");

    return {
      provider: "nominatim",
      main,
      meta,
      fullAddress: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon)
    };
  });
}

// ── Velg rett provider basert på tilgjengelighet ─────────────
function activeProvider() {
  return isGoogleReady() ? "google" : "nominatim";
}

// ── Koble opp adresse-autocomplete på et kort ────────────────
function wireAddressAutocomplete(card) {
  const wrapper = card.querySelector("[data-address-wrapper]");
  const input   = card.querySelector("[data-address]");
  const list    = card.querySelector("[data-address-suggestions]");
  if (!wrapper || !input || !list) return;

  let currentItems     = [];
  let highlightedIndex = -1;
  let lastQuery        = "";

  const closeList = () => {
    list.hidden = true;
    list.innerHTML = "";
    currentItems = [];
    highlightedIndex = -1;
  };

  const showStatus = (text, provider) => {
    list.innerHTML = "";
    const li = document.createElement("li");
    li.className = "address-status";
    li.textContent = text;
    list.appendChild(li);
    addAttribution(provider || activeProvider());
    list.hidden = false;
  };

  const addAttribution = (provider) => {
    const li = document.createElement("li");
    li.className = "address-attribution";
    const link = document.createElement("a");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    if (provider === "google") {
      link.href =
        "https://developers.google.com/maps/documentation/places/web-service/policies";
      link.textContent = "Powered by Google";
    } else {
      link.href = "https://www.openstreetmap.org/copyright";
      link.textContent = "© OpenStreetMap";
    }
    li.appendChild(link);
    list.appendChild(li);
  };

  const highlight = (idx) => {
    highlightedIndex = idx;
    list.querySelectorAll(".address-suggestion").forEach((el, i) => {
      el.classList.toggle("is-highlighted", i === idx);
    });
  };

  const selectItem = async (idx) => {
    const item = currentItems[idx];
    if (!item) return;

    if (item.provider === "google") {
      // Vi må hente detaljer for å få formatted_address + koordinater
      showStatus("Henter detaljer…", "google");
      const details = await fetchGooglePlaceDetails(item.placeId);
      if (!details) {
        // Lagre det vi har selv uten detaljer
        input.value = item.description || item.main;
        card.dataset.addressDisplay = input.value;
        delete card.dataset.addressLat;
        delete card.dataset.addressLon;
        card.dataset.addressPlaceId = item.placeId;
      } else {
        const display =
          details.formatted_address || item.description || item.main;
        input.value = display;
        card.dataset.addressDisplay = display;
        if (Number.isFinite(details.lat))
          card.dataset.addressLat = details.lat;
        if (Number.isFinite(details.lon))
          card.dataset.addressLon = details.lon;
        if (details.placeId)
          card.dataset.addressPlaceId = details.placeId;
      }
      // Lagre locality/by fra meta-feltet
      card.dataset.addressCity = extractCityFromMeta(item.meta || "");
    } else {
      // Nominatim – alt er allerede med i treffet
      input.value = item.fullAddress;
      card.dataset.addressDisplay = item.fullAddress;
      card.dataset.addressLat = item.lat;
      card.dataset.addressLon = item.lon;
      delete card.dataset.addressPlaceId;
      // Lagre locality/by fra meta-feltet
      card.dataset.addressCity = extractCityFromMeta(item.meta || "");
    }

    lastQuery = input.value;
    closeList();
    input.focus();
    // Trigg "input" slik at andre lyttere kan reagere
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const renderResults = (items, provider) => {
    currentItems = items;
    highlightedIndex = -1;
    list.innerHTML = "";

    if (!items.length) {
      showStatus("Ingen treff", provider);
      return;
    }

    items.forEach((item, idx) => {
      const li = document.createElement("li");
      li.className = "address-suggestion";
      li.setAttribute("role", "option");

      const titleEl = document.createElement("span");
      titleEl.className = "address-suggestion-title";
      titleEl.textContent = item.main;

      const metaEl = document.createElement("span");
      metaEl.className = "address-suggestion-meta";
      metaEl.textContent =
        item.meta || item.fullAddress || item.description || "";

      li.appendChild(titleEl);
      li.appendChild(metaEl);

      li.addEventListener("mousedown", (e) => {
        e.preventDefault(); // forhindrer blur før klikk
        selectItem(idx);
      });
      li.addEventListener("mouseenter", () => highlight(idx));

      list.appendChild(li);
    });

    addAttribution(provider);
    list.hidden = false;
  };

  const doSearch = async () => {
    const q = input.value.trim();
    if (q.length < ADDRESS_MIN_CHARS) {
      closeList();
      return;
    }
    lastQuery = q;
    const provider = activeProvider();
    showStatus("Søker…", provider);
    try {
      let data;
      if (provider === "google") {
        data = await searchGooglePlaces(q);
      } else {
        data = await searchNominatim(q);
      }
      // Ignorer svar hvis brukeren har skrevet noe nytt i mellomtiden
      if (input.value.trim() !== q) return;
      renderResults(data, provider);
    } catch (err) {
      console.error("Kunne ikke hente adresseforslag:", err);
      showStatus("Kunne ikke hente forslag akkurat nå", provider);
    }
  };

  const debouncedSearch = debounce(doSearch, ADDRESS_DEBOUNCE_MS);

  input.addEventListener("input", () => {
    // Tilbakestill lagrede koordinater når brukeren endrer manuelt
    if (input.value !== card.dataset.addressDisplay) {
      delete card.dataset.addressLat;
      delete card.dataset.addressLon;
      delete card.dataset.addressDisplay;
      delete card.dataset.addressPlaceId;
    }
    debouncedSearch();
  });

  input.addEventListener("focus", () => {
    // Start en ny Google-session ved hvert nye søk/fokus
    if (isGoogleReady() && !googleSessionToken) newGoogleSession();
    if (currentItems.length && input.value.trim() === lastQuery) {
      list.hidden = false;
    }
  });

  input.addEventListener("keydown", (e) => {
    if (list.hidden || !currentItems.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      highlight(Math.min(currentItems.length - 1, highlightedIndex + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      highlight(Math.max(0, highlightedIndex - 1));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0) {
        e.preventDefault();
        selectItem(highlightedIndex);
      }
    } else if (e.key === "Escape") {
      closeList();
    }
  });

  input.addEventListener("blur", () => {
    // Liten forsinkelse slik at klikk på forslag rekker å trigges
    setTimeout(closeList, 180);
  });
}

// ══════════════════════════════════════════════════════════════
//  POPUP-MODAL LOGIKK (erstatter inline kort-skjema)
// ══════════════════════════════════════════════════════════════

// ── Hjelpefunksjoner ─────────────────────────────────────────

function escHtml(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

// ── Render storyline-sidebaren ───────────────────────────────
function renderStoryline() {
  if (!storylineList) return;

  // Oppdater teller
  if (storylineCount) storylineCount.textContent = glimtItems.length;

  // Vis/skjul tomt-state
  if (storylineEmpty) {
    storylineEmpty.style.display = glimtItems.length === 0 ? "block" : "none";
  }

  // Bygg listen på nytt
  storylineList.innerHTML = "";
  glimtItems.forEach((glimt, i) => {
    const isEmpty = !glimt.title;
    const label   = glimt.title || `Glimt ${i + 1}`;

    const li = document.createElement("li");
    li.className = "storyline-item";
    if (isEmpty) li.classList.add("is-empty");
    if (glimt.id === activeCardId) li.classList.add("is-active");
    li.dataset.target = glimt.id;

    const titleSpan = document.createElement("span");
    titleSpan.className = "storyline-item-title";
    titleSpan.textContent = label;
    li.appendChild(titleSpan);

    li.addEventListener("click", () => {
      const target = container.querySelector(`[data-glimt-id="${glimt.id}"]`);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      setActiveCard(glimt.id);
    });

    storylineList.appendChild(li);
  });
}

// ── Marker et kort som aktivt i storylinen ───────────────────
function setActiveCard(cardId) {
  activeCardId = cardId;
  if (!storylineList) return;
  storylineList.querySelectorAll(".storyline-item").forEach(item => {
    item.classList.toggle("is-active", item.dataset.target === cardId);
  });
}

// ══════════════════════════════════════════════════════════════
//  OPPRETT/REDIGER GLIMT – POPUP-MODAL
// ══════════════════════════════════════════════════════════════

const glimtModal     = document.getElementById("opprett-glimt-modal");
const glimtForm      = document.getElementById("opprett-glimt-form");
const glimtModalTitle = document.getElementById("opprett-modal-title");
const glimtEditIdField = document.getElementById("opprett-edit-id");
const glimtSubmitText  = document.getElementById("opprett-modal-submit-text");

function openGlimtModal(editId) {
  if (!glimtModal) return;

  // Reset form
  glimtForm.reset();
  glimtEditIdField.value = "";

  // Reset autofill status
  const afStatus = document.getElementById("opprett-autofill-status");
  if (afStatus) afStatus.style.display = "none";

  if (editId) {
    // Redigeringsmodus – fyll inn eksisterende data
    const glimt = glimtItems.find(g => g.id === editId);
    if (glimt) {
      glimtEditIdField.value = editId;
      glimtModalTitle.textContent = "Rediger glimt";
      glimtSubmitText.textContent = "Oppdater glimt";

      // Fyll inn feltene
      const f = glimtForm;
      if (f.title)    f.title.value    = glimt.title || "";
      if (f.desc)     f.desc.value     = glimt.desc || "";
      if (f.sted)     f.sted.value     = glimt.sted || glimt.address || "";
      if (f.city)     f.city.value     = glimt.city || "";
      if (f.tips)     f.tips.value     = glimt.tips || "";
      if (f.image)    f.image.value    = glimt.image || "";
      if (f.kostnad)  f.kostnad.value  = glimt.kostnad || "";
      if (f.emoji)    f.emoji.value    = glimt.emoji || "";

      // Checkboxer
      setCheckboxes(f, "hvem",      glimt.hvem || []);
      setCheckboxes(f, "budsjett",  glimt.budsjett || []);
      setCheckboxes(f, "stemning",  glimt.stemning || []);
      setCheckboxes(f, "tidspunkt", glimt.tidspunkt || []);

      // Radioknapper
      setRadio(f, "aktivitetsniva", glimt.aktivitetsniva || "");
      setRadio(f, "varighet",       glimt.varighet || "");
    }
  } else {
    glimtModalTitle.textContent = "Opprett nytt glimt";
    glimtSubmitText.textContent = "Legg til glimt";
  }

  glimtModal.style.display = "";
  document.body.style.overflow = "hidden";

  // Fokuser første felt
  setTimeout(() => {
    const firstInput = glimtForm.querySelector('input[name="title"]');
    if (firstInput) firstInput.focus();
  }, 200);
}

function closeGlimtModal() {
  if (!glimtModal) return;
  glimtModal.style.display = "none";
  document.body.style.overflow = "";
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

// ── Håndter modal-submit ────────────────────────────────────
function handleGlimtModalSubmit(e) {
  e.preventDefault();

  const data = new FormData(glimtForm);
  const editId = data.get("_editId");

  const glimtData = {
    id:             editId || uid(),
    title:          data.get("title")?.trim() || "",
    desc:           data.get("desc")?.trim() || "",
    sted:           data.get("sted")?.trim() || "",
    address:        data.get("sted")?.trim() || "",  // alias for bakoverkompatibilitet
    city:           data.get("city") || "",
    tips:           data.get("tips")?.trim() || "",
    image:          data.get("image")?.trim() || "",
    emoji:          data.get("emoji")?.trim() || "",
    kostnad:        data.get("kostnad")?.trim() || "",
    varighet:       data.get("varighet") || "",
    aktivitetsniva: data.get("aktivitetsniva") || "",
    hvem:           data.getAll("hvem"),
    budsjett:       data.getAll("budsjett"),
    stemning:       data.getAll("stemning"),
    tidspunkt:      data.getAll("tidspunkt"),
    createdBy:      "user",
    createdAt:      new Date().toISOString()
  };

  if (editId) {
    // Oppdater eksisterende
    const idx = glimtItems.findIndex(g => g.id === editId);
    if (idx >= 0) {
      glimtData.createdAt = glimtItems[idx].createdAt; // behold original
      glimtItems[idx] = glimtData;
    }
  } else {
    // Nytt glimt
    glimtItems.push(glimtData);
  }

  closeGlimtModal();
  renderPreviewCards();
  renderStoryline();
  setActiveCard(glimtData.id);

  // Scroll til det nye/oppdaterte kortet
  setTimeout(() => {
    const card = container.querySelector(`[data-glimt-id="${glimtData.id}"]`);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 100);
}

// ── Autofill fra URL (kopiér fra mine-enkeltglimt) ──────────
async function handleOpprettAutofill() {
  const urlInput = document.getElementById("opprett-url-input");
  const btn      = document.getElementById("opprett-autofill-btn");
  const btnText  = btn.querySelector(".meg-autofill-btn-text");
  const btnSpin  = btn.querySelector(".meg-autofill-spinner");

  const url = urlInput?.value?.trim();
  if (!url) { showOpprettAutofillStatus("Lim inn en URL først.", "error"); return; }

  btn.disabled = true;
  btnText.style.display = "none";
  btnSpin.style.display = "";
  showOpprettAutofillStatus("Henter data fra lenken...", "loading");

  try {
    const res = await fetch("/api/parse-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();

    // Fyll inn skjemaet
    const f = glimtForm;
    if (result.title && f.title)   f.title.value = result.title;
    if (result.description && f.desc) f.desc.value = result.description;
    if (result.address && f.sted)  f.sted.value = result.address;
    if (result.city && f.city)     f.city.value = result.city;
    if (result.tips && f.tips)     f.tips.value = result.tips;
    if (result.image && f.image)   f.image.value = result.image;
    if (result.emoji && f.emoji)   f.emoji.value = result.emoji;
    if (result.kostnad && f.kostnad) f.kostnad.value = result.kostnad;

    if (result.hvem)      setCheckboxes(f, "hvem", result.hvem);
    if (result.budsjett)  setCheckboxes(f, "budsjett", result.budsjett);
    if (result.stemning)  setCheckboxes(f, "stemning", result.stemning);
    if (result.tidspunkt) setCheckboxes(f, "tidspunkt", result.tidspunkt);
    if (result.aktivitetsniva) setRadio(f, "aktivitetsniva", result.aktivitetsniva);
    if (result.varighet)  setRadio(f, "varighet", result.varighet);

    showOpprettAutofillStatus("Data hentet! Juster feltene om nødvendig.", "success");
  } catch (err) {
    const msg = err.message?.includes("Failed to fetch")
      ? "Kunne ikke nå API-et."
      : `Feil: ${err.message || "Ukjent feil."}`;
    showOpprettAutofillStatus(msg, "error");
  } finally {
    btn.disabled = false;
    btnText.style.display = "inline-flex";
    btnSpin.style.display = "none";
  }
}

function showOpprettAutofillStatus(message, type) {
  const el = document.getElementById("opprett-autofill-status");
  if (!el) return;
  el.style.display = "block";
  el.className = `meg-autofill-status meg-autofill-status--${type}`;
  el.textContent = message;
}

// ══════════════════════════════════════════════════════════════
//  PREVIEW-KORT (visningskort i reisebrev-container)
// ══════════════════════════════════════════════════════════════

function renderPreviewCards() {
  container.innerHTML = "";
  glimtItems.forEach((glimt, idx) => {
    const card = buildPreviewCard(glimt, idx);
    container.appendChild(card);
  });
}

function buildPreviewCard(glimt, index) {
  const div = document.createElement("div");
  div.className = "glimt-preview-card";
  div.dataset.glimtId = glimt.id;

  const emoji = glimt.emoji ? `<span class="glimt-preview-card-emoji">${escHtml(glimt.emoji)}</span>` : "";
  const title = escHtml(glimt.title || "Uten tittel");
  const desc  = escHtml(glimt.desc || glimt.note || "");
  const addr  = glimt.sted || glimt.address || "";
  const city  = glimt.city || "";
  const image = glimt.image || "";
  const kostnad = glimt.kostnad || "";

  // Tags
  let tagsHtml = "";
  if (city)    tagsHtml += `<span class="glimt-preview-card-tag glimt-preview-card-tag--city">${escHtml(city)}</span>`;
  if (kostnad) tagsHtml += `<span class="glimt-preview-card-tag glimt-preview-card-tag--cost">${escHtml(kostnad)}</span>`;
  if (glimt.varighet) tagsHtml += `<span class="glimt-preview-card-tag">${escHtml(glimt.varighet)}</span>`;
  if (glimt.stemning && glimt.stemning.length) {
    glimt.stemning.slice(0, 2).forEach(s => {
      tagsHtml += `<span class="glimt-preview-card-tag">${escHtml(s)}</span>`;
    });
  }

  div.innerHTML = `
    ${image ? `<div class="glimt-preview-card-image"><img src="${escHtml(image)}" alt="" /></div>` : ""}
    <div class="glimt-preview-card-body">
      <div class="glimt-preview-card-top">
        <span class="glimt-preview-card-number">Glimt ${index + 1}</span>
        <div class="glimt-preview-card-actions">
          <button type="button" class="glimt-preview-card-action-btn" data-action="edit" title="Rediger">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
            </svg>
          </button>
          <button type="button" class="glimt-preview-card-action-btn glimt-preview-card-action-btn--delete" data-action="delete" title="Fjern">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="glimt-preview-card-title">${emoji} ${title}</div>
      ${addr ? `
        <div class="glimt-preview-card-address">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          <span>${escHtml(addr)}</span>
        </div>` : ""}
      ${desc ? `<p class="glimt-preview-card-desc">${desc}</p>` : ""}
      ${tagsHtml ? `<div class="glimt-preview-card-tags">${tagsHtml}</div>` : ""}
    </div>
    <div class="glimt-preview-card-foot">
      <span class="glimt-preview-card-status">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        Lagret
      </span>
      <button type="button" class="glimt-preview-card-edit" data-action="edit">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
        </svg>
        Rediger
      </button>
    </div>
  `;

  // Event: klikk på kort (ikke knapper) → rediger
  div.addEventListener("click", (e) => {
    // Sjekk om klikk på en action-knapp
    const actionBtn = e.target.closest("[data-action]");
    if (actionBtn) {
      e.stopPropagation();
      const action = actionBtn.dataset.action;
      if (action === "edit") {
        openGlimtModal(glimt.id);
      } else if (action === "delete") {
        removeGlimt(glimt.id);
      }
      return;
    }
    // Klikk på selve kortet → åpne redigering
    openGlimtModal(glimt.id);
  });

  return div;
}

function removeGlimt(id) {
  glimtItems = glimtItems.filter(g => g.id !== id);
  renderPreviewCards();
  renderStoryline();
}

// ══════════════════════════════════════════════════════════════
//  LAGRE REISEBREV (samle glimt fra datalageret)
// ══════════════════════════════════════════════════════════════

// ── Last et eksisterende reisebrev inn for redigering ────────
function loadGuideForEditing(guide) {
  if (!guide || !Array.isArray(guide.glimts) || guide.glimts.length === 0) {
    return false;
  }

  // Konverter gamle glimt-format til nytt format med alle feltene
  guide.glimts.forEach((g) => {
    glimtItems.push({
      id:             g.id || uid(),
      title:          g.title || "",
      desc:           g.desc || g.note || "",
      sted:           g.sted || g.address || "",
      address:        g.sted || g.address || "",
      city:           g.city || "",
      tips:           g.tips || "",
      image:          g.image || "",
      emoji:          g.emoji || "",
      kostnad:        g.kostnad || "",
      varighet:       g.varighet || "",
      aktivitetsniva: g.aktivitetsniva || "",
      hvem:           g.hvem || [],
      budsjett:       g.budsjett || [],
      stemning:       g.stemning || [],
      tidspunkt:      g.tidspunkt || [],
      createdBy:      g.createdBy || "user",
      createdAt:      g.createdAt || new Date().toISOString()
    });
  });

  // Sett reiseplan-toggle basert på lagret verdi
  const guideToggle = document.getElementById("guide-toggle-cb");
  if (guideToggle && (guide.isGuide || guide.isReiseplan)) {
    guideToggle.checked = true;
  }

  // Oppdater UI-tekst til "rediger reisebrev"-modus
  const title = document.querySelector(".opprett-title");
  const eyebrow = document.querySelector(".opprett-eyebrow");
  const subtitle = document.querySelector(".opprett-subtitle");
  const submitBtn = form.querySelector('button[type="submit"]');
  if (eyebrow)  eyebrow.textContent  = "Rediger reisebrev";
  if (title)    title.textContent    = guide.title || "Rediger reisebrev";
  if (subtitle) subtitle.textContent =
    "Juster glimtene dine, endre rekkefølgen, eller legg til nye. Endringene lagres når du klikker «Oppdater reisebrev» nederst.";
  if (submitBtn) {
    submitBtn.childNodes[0].nodeValue = "Oppdater reisebrev ";
  }

  renderPreviewCards();
  renderStoryline();
  return true;
}

// ── Lagre hele reisebrevet i localStorage ────────────────────
function saveGuide(e) {
  e.preventDefault();

  // Bruk glimtItems direkte (all data er der allerede)
  const filled = glimtItems.filter(g =>
    g.title || g.address || g.sted || g.desc || g.image
  );

  if (filled.length === 0) {
    alert("Legg til minst ett glimt før du lagrer reisebrevet.");
    return;
  }

  // Konverter til bakoverkompatibelt format for lagring
  const glimtsForStorage = filled.map(g => ({
    ...g,
    note:    g.desc || "",         // bakoverkompatibilitet
    address: g.sted || g.address || ""
  }));

  // Første glimt med tittel brukes som tittel på reisebrevet
  const mainTitle =
    filled.find(g => g.title)?.title || "Mitt reisebrev";

  // By
  const mainCity = filled.map(g => g.city).find(c => c) || filled[0].sted || filled[0].address || "";

  // Les eksisterende reisebrev
  let existing = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) existing = parsed;
    }
  } catch (_) {}

  const existingGuide = editingGuideId
    ? existing.find((g) => g.id === editingGuideId)
    : null;

  const guideToggle = document.getElementById("guide-toggle-cb");
  const isReiseplan = guideToggle ? guideToggle.checked : false;

  const guide = {
    id:          existingGuide ? existingGuide.id : uid(),
    title:       mainTitle,
    city:        mainCity,
    spotifyUrl:  (document.getElementById("guide-spotify-url") || {}).value || "",
    createdAt:   existingGuide ? existingGuide.createdAt : new Date().toISOString(),
    updatedAt:   editingGuideId ? new Date().toISOString() : undefined,
    isGuide:     isReiseplan,
    isReiseplan: isReiseplan,
    glimts:      glimtsForStorage
  };

  if (editingGuideId && existingGuide) {
    existing = existing.map((g) => (g.id === editingGuideId ? guide : g));
  } else {
    existing.unshift(guide);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error("Kunne ikke lagre reisebrev:", err);
    const isQuota = err && (
      err.name === "QuotaExceededError" ||
      err.code === 22 ||
      err.code === 1014 ||
      /quota/i.test(err.message || "")
    );

    if (isQuota) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([guide]));
        alert("Nettleseren er tom for plass. Vi måtte fjerne eldre reisebrev for å lagre det nye.");
      } catch (err2) {
        alert("Nettleseren har ikke plass til å lagre reisebrevet. Prøv færre glimt.");
        return;
      }
    } else {
      alert("Kunne ikke lagre reisebrevet: " + (err.message || "ukjent feil") + ". Prøv igjen.");
      return;
    }
  }

  syncReiseplan(guide);
  window.location.href = `glimt-detalj.html?id=${encodeURIComponent(guide.id)}`;
}

// ══════════════════════════════════════════════════════════════
//  LAGRET-GLIMT MODAL (velg eksisterende glimt)
// ══════════════════════════════════════════════════════════════

function openLagretGlimtModal() {
  const overlay = document.getElementById("lagret-glimt-overlay");
  if (!overlay) return;
  overlay.classList.add("lagret-glimt-overlay--visible");
  document.body.style.overflow = "hidden";
  populateLagretGlimtModal();
}

function closeLagretGlimtModal() {
  const overlay = document.getElementById("lagret-glimt-overlay");
  if (!overlay) return;
  overlay.classList.remove("lagret-glimt-overlay--visible");
  document.body.style.overflow = "";
}

function populateLagretGlimtModal() {
  const egnePanel = document.getElementById("lagret-panel-egne");
  let egne = [];
  try {
    const raw = localStorage.getItem("glimt.myCreatedGlimt");
    if (raw) egne = JSON.parse(raw) || [];
    if (!Array.isArray(egne)) egne = [];
  } catch { egne = []; }

  if (egne.length === 0) {
    egnePanel.innerHTML = `<div class="lg-empty"><div class="lg-empty-icon">✦</div><p>Du har ingen egne glimt ennå.</p></div>`;
  } else {
    egnePanel.innerHTML = egne.map(g => buildLgCard(g, "Opprettet av deg")).join("");
  }

  const bokmerketPanel = document.getElementById("lagret-panel-bokmerket");
  let bokmerket = [];
  try {
    const raw = localStorage.getItem("glimt.savedGlimt");
    if (raw) bokmerket = JSON.parse(raw) || [];
    if (!Array.isArray(bokmerket)) bokmerket = [];
  } catch { bokmerket = []; }

  if (bokmerket.length === 0) {
    bokmerketPanel.innerHTML = `<div class="lg-empty"><div class="lg-empty-icon">🔖</div><p>Ingen bokmerka glimt ennå.</p></div>`;
  } else {
    bokmerketPanel.innerHTML = bokmerket.map(g => buildLgCard(g, g.author || "Fra andre")).join("");
  }
}

function buildLgCard(g, source) {
  const title = escHtml(g.title || "Uten tittel");
  const desc  = escHtml(g.desc || g.description || g.note || "");
  const city  = escHtml(g.city || "");
  const img   = g.image || "";
  const emoji = g.emoji || "✦";
  const addr  = escHtml(g.sted || g.address || "");

  const thumbHtml = img
    ? `<div class="lg-card-thumb" style="background-image:url('${img}')"></div>`
    : `<div class="lg-card-thumb lg-card-thumb--emoji">${emoji}</div>`;

  return `
    <div class="lg-card" onclick="selectLagretGlimt(this)"
      data-lg-title="${title}"
      data-lg-address="${addr}"
      data-lg-city="${city}"
      data-lg-note="${desc}"
      data-lg-image="${img}"
      data-lg-emoji="${escHtml(g.emoji || "")}"
      data-lg-tips="${escHtml(g.tips || "")}"
      data-lg-kostnad="${escHtml(g.kostnad || "")}"
      data-lg-varighet="${escHtml(g.varighet || "")}"
      data-lg-aktivitetsniva="${escHtml(g.aktivitetsniva || "")}">
      ${thumbHtml}
      <div class="lg-card-info">
        <div class="lg-card-name">${title}</div>
        <div class="lg-card-sub">${escHtml(source)}${city ? ' · ' + city : ''}</div>
        ${desc ? `<div class="lg-card-desc">${desc.length > 90 ? desc.slice(0, 90) + '…' : desc}</div>` : ''}
      </div>
    </div>`;
}

// Brukt av lagret-glimt modal: legg valgt glimt til som preview-kort
function selectLagretGlimt(el) {
  const newGlimt = {
    id:             uid(),
    title:          el.dataset.lgTitle   || "",
    desc:           el.dataset.lgNote    || "",
    sted:           el.dataset.lgAddress || "",
    address:        el.dataset.lgAddress || "",
    city:           el.dataset.lgCity    || "",
    tips:           el.dataset.lgTips    || "",
    image:          el.dataset.lgImage   || "",
    emoji:          el.dataset.lgEmoji   || "",
    kostnad:        el.dataset.lgKostnad || "",
    varighet:       el.dataset.lgVarighet || "",
    aktivitetsniva: el.dataset.lgAktivitetsniva || "",
    hvem:           [],
    budsjett:       [],
    stemning:       [],
    tidspunkt:      [],
    createdBy:      "user",
    createdAt:      new Date().toISOString()
  };

  glimtItems.push(newGlimt);
  renderPreviewCards();
  renderStoryline();
  setActiveCard(newGlimt.id);
  closeLagretGlimtModal();

  setTimeout(() => {
    const card = container.querySelector(`[data-glimt-id="${newGlimt.id}"]`);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 100);
}

function initLagretGlimtModal() {
  const lagretBtn = document.getElementById("add-glimt-lagret");
  if (lagretBtn) lagretBtn.addEventListener("click", openLagretGlimtModal);

  const closeBtn = document.getElementById("lagret-glimt-close");
  if (closeBtn) closeBtn.addEventListener("click", closeLagretGlimtModal);

  const overlay = document.getElementById("lagret-glimt-overlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeLagretGlimtModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay && overlay.classList.contains("lagret-glimt-overlay--visible")) {
      closeLagretGlimtModal();
    }
  });

  document.querySelectorAll(".lagret-glimt-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".lagret-glimt-tab").forEach(t => t.classList.remove("lagret-glimt-tab--active"));
      document.querySelectorAll(".lagret-glimt-panel").forEach(p => p.classList.remove("lagret-glimt-panel--active"));
      tab.classList.add("lagret-glimt-tab--active");
      const panelId = `lagret-panel-${tab.dataset.ltab}`;
      document.getElementById(panelId)?.classList.add("lagret-glimt-panel--active");
    });
  });
}

// ══════════════════════════════════════════════════════════════
//  SYNKRONISERING REISEBREV → REISEPLAN
// ══════════════════════════════════════════════════════════════

function syncReiseplan(guide) {
  const RP_KEY = "glimt.reiseplaner";
  let plans = [];
  try {
    const raw = localStorage.getItem(RP_KEY);
    if (raw) plans = JSON.parse(raw) || [];
    if (!Array.isArray(plans)) plans = [];
  } catch { plans = []; }

  const planId = "rp-from-" + guide.id;

  if (guide.isReiseplan) {
    const existingIdx = plans.findIndex(p => p.id === planId);
    const plan = {
      id:            planId,
      name:          guide.title || "Uten tittel",
      city:          guide.city || "",
      from:          "",
      to:            "",
      glimtCount:    guide.glimts ? guide.glimts.length : 0,
      eventCount:    0,
      status:        "mal",
      sourceType:    "reisebrev",
      sourceId:      guide.id,
      createdAt:     existingIdx >= 0 ? plans[existingIdx].createdAt : new Date().toISOString(),
      updatedAt:     new Date().toISOString()
    };
    if (existingIdx >= 0) {
      plans[existingIdx] = plan;
    } else {
      plans.push(plan);
    }
  } else {
    plans = plans.filter(p => p.id !== planId);
  }

  try {
    localStorage.setItem(RP_KEY, JSON.stringify(plans));
  } catch (e) {
    console.warn("Kunne ikke synkronisere reiseplan:", e);
  }
}

// ══════════════════════════════════════════════════════════════
//  MAL-VELGER + MAL-DEFINISJONER
// ══════════════════════════════════════════════════════════════

const REISEBREV_MALER = {
  mattur: {
    name: "Mattur",
    glimts: [
      { title: "Frokost",               desc: "Hvor starter dagen? Beskriv atmosfæren, smakene og det lille som gjør det spesielt." },
      { title: "Lunsj / street food",    desc: "En rask matbit underveis — marked, gatekjøkken eller et lokalt funn." },
      { title: "Middag",                desc: "Kveldens høydepunkt. Hva bestilte du, og hvorfor var det verdt det?" },
      { title: "Noe søtt eller en drink", desc: "Gelato, bakervare, en aperitivo — den perfekte avrundingen." }
    ]
  },
  kultur: {
    name: "Kulturreise",
    glimts: [
      { title: "Museum eller galleri", desc: "Hva gjorde inntrykk? Et verk, et rom, en følelse." },
      { title: "Historisk sted",       desc: "Ruiner, gamlebyen, en kirke — beskriv hva du så og kjente." },
      { title: "Lokal perle",          desc: "Et sted guidebøkene ikke nevner. Hvordan fant du det?" },
      { title: "Utsiktspunkt eller park", desc: "Hvor stoppet du opp og bare tok inn utsikten?" }
    ]
  },
  romantisk: {
    name: "Romantisk weekend",
    glimts: [
      { title: "Solnedgangssted",    desc: "Hvor så dere solen gå ned? Beskriv lyset og stemningen." },
      { title: "Koselig restaurant",  desc: "Lys, meny, stemning — det perfekte måltidet for to." },
      { title: "Rolig øyeblikk",      desc: "En benk, en park, en utsikt. Det stille øyeblikket dere delte." }
    ]
  },
  aktivitet: {
    name: "Aktivitetsreise",
    glimts: [
      { title: "Hovedaktivitet",   desc: "Vandring, sykling, kajakktur — beskriv ruten og opplevelsen." },
      { title: "Naturhøydepunkt",  desc: "Utsikten, vannet, fjellet. Det øyeblikket naturen tok pusten fra deg." },
      { title: "Lokal matpause",   desc: "Hvor stoppet du for å fylle energien? Enkel, god mat." },
      { title: "Belønningen",      desc: "Solnedgangen etter turen, badet etterpå, den kalde drikken." }
    ]
  }
};

function initMalVelger() {
  const velger  = document.getElementById("mal-velger");
  const main    = document.getElementById("opprett-main");
  if (!velger || !main) return;

  velger.querySelectorAll(".mal-kort").forEach(kort => {
    kort.addEventListener("click", () => {
      const malId = kort.dataset.mal;
      velger.classList.add("mal-velger--leaving");
      setTimeout(() => {
        velger.style.display = "none";
        main.style.display = "";
        applyMal(malId);
      }, 350);
    });
  });
}

function applyMal(malId) {
  if (malId === "blank" || !REISEBREV_MALER[malId]) {
    // Blank — ingen forhåndsutfylte glimt, bare vis tomt
    return;
  }

  const mal = REISEBREV_MALER[malId];

  // Opprett et glimt for hvert skjelett i malen
  mal.glimts.forEach((g) => {
    glimtItems.push({
      id:             uid(),
      title:          g.title || "",
      desc:           g.desc || "",
      sted:           "",
      address:        "",
      city:           "",
      tips:           "",
      image:          "",
      emoji:          "",
      kostnad:        "",
      varighet:       "",
      aktivitetsniva: "",
      hvem:           [],
      budsjett:       [],
      stemning:       [],
      tidspunkt:      [],
      createdBy:      "user",
      createdAt:      new Date().toISOString()
    });
  });

  renderPreviewCards();
  renderStoryline();
}

// ══════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  // Populate by-velger i modal
  const citySelect = document.getElementById("opprett-city-select");
  if (citySelect && typeof CITIES !== "undefined") {
    CITIES.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.name;
      opt.textContent = c.name;
      citySelect.appendChild(opt);
    });
  }

  // Sjekk redigeringsmodus
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("edit");
  let loadedExisting = false;

  if (editId) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const all = raw ? JSON.parse(raw) : [];
      if (Array.isArray(all)) {
        const guide = all.find((g) => g.id === editId);
        if (guide) {
          editingGuideId = guide.id;
          loadedExisting = loadGuideForEditing(guide);
        }
      }
    } catch (err) {
      console.warn("Klarte ikke å laste reisebrev for redigering:", err);
    }
  }

  const preselectedMal = urlParams.get("mal");

  if (loadedExisting) {
    const velger = document.getElementById("mal-velger");
    const main   = document.getElementById("opprett-main");
    if (velger) velger.style.display = "none";
    if (main) main.style.display = "";
  } else if (preselectedMal) {
    const velger = document.getElementById("mal-velger");
    const main   = document.getElementById("opprett-main");
    if (velger) velger.style.display = "none";
    if (main) main.style.display = "";
    applyMal(preselectedMal);
  } else {
    initMalVelger();
  }

  // «Opprett nytt glimt»-knappen → åpne popup-modal
  addBtn.addEventListener("click", () => {
    openGlimtModal();
  });

  // «Lagre reisebrev»-knappen
  form.addEventListener("submit", saveGuide);

  // Popup-modal: submit
  if (glimtForm) {
    glimtForm.addEventListener("submit", handleGlimtModalSubmit);
  }

  // Popup-modal: lukk
  const modalCloseBtn = document.getElementById("opprett-modal-close");
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeGlimtModal);

  // Popup-modal: klikk utenfor
  if (glimtModal) {
    glimtModal.addEventListener("click", (e) => {
      if (e.target === glimtModal) closeGlimtModal();
    });
  }

  // Popup-modal: Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && glimtModal && glimtModal.style.display !== "none") {
      closeGlimtModal();
    }
  });

  // Autofill-knapp i modal
  const autofillBtn = document.getElementById("opprett-autofill-btn");
  if (autofillBtn) autofillBtn.addEventListener("click", handleOpprettAutofill);

  // Init lagret-glimt modal
  initLagretGlimtModal();
});
