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
const cardTemplate    = document.getElementById("glimt-card-template");
const storylineList   = document.getElementById("storyline-list");
const storylineCount  = document.getElementById("storyline-count");
const storylineEmpty  = document.getElementById("storyline-empty");

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

// ── Oppdater numrene på alle glimt-kort ──────────────────────
function renumber() {
  const cards = container.querySelectorAll("[data-glimt-card]");
  cards.forEach((card, i) => {
    const num = card.querySelector("[data-glimt-number]");
    if (num) num.textContent = i + 1;
  });
}

// ── Render storyline-sidebaren ───────────────────────────────
function renderStoryline() {
  if (!storylineList) return;
  const cards = Array.from(container.querySelectorAll("[data-glimt-card]"));

  // Oppdater teller
  if (storylineCount) storylineCount.textContent = cards.length;

  // Vis/skjul tomt-state
  if (storylineEmpty) {
    storylineEmpty.style.display = cards.length === 0 ? "block" : "none";
  }

  // Bygg listen på nytt
  storylineList.innerHTML = "";
  cards.forEach((card, i) => {
    // Sørg for at hvert kort har en id
    if (!card.dataset.cardId) {
      card.dataset.cardId = uid();
    }
    const cardId = card.dataset.cardId;

    const titleInput = card.querySelector("[data-title]");
    const rawTitle   = titleInput ? titleInput.value.trim() : "";
    const isEmpty    = !rawTitle;
    const label      = rawTitle || `Glimt ${i + 1}`;

    const li = document.createElement("li");
    li.className = "storyline-item";
    if (isEmpty) li.classList.add("is-empty");
    if (cardId === activeCardId) li.classList.add("is-active");
    li.dataset.target = cardId;

    const titleSpan = document.createElement("span");
    titleSpan.className = "storyline-item-title";
    titleSpan.textContent = label;
    li.appendChild(titleSpan);

    li.addEventListener("click", () => {
      const target = container.querySelector(
        `[data-card-id="${cardId}"]`
      );
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      setActiveCard(cardId);
      const firstInput = target.querySelector("[data-title]");
      if (firstInput) setTimeout(() => firstInput.focus(), 350);
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

// ── Les bildefil og returner data-URL ────────────────────────
function readImageAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// ── Komprimer bilde via canvas ───────────────────────────────
// Skalerer ned til maks MAX_DIM px på lengste side og lagrer
// som JPEG med gitt kvalitet. Returnerer ny data-URL.
const IMAGE_MAX_DIM   = 1280;
const IMAGE_QUALITY   = 0.82;
const IMAGE_MAX_BYTES = 900 * 1024; // ~900 KB pr bilde etter komprimering

function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Kunne ikke laste bilde"));
      img.onload = () => {
        try {
          const { width, height } = img;
          let targetW = width;
          let targetH = height;
          if (Math.max(width, height) > IMAGE_MAX_DIM) {
            if (width >= height) {
              targetW = IMAGE_MAX_DIM;
              targetH = Math.round((height / width) * IMAGE_MAX_DIM);
            } else {
              targetH = IMAGE_MAX_DIM;
              targetW = Math.round((width / height) * IMAGE_MAX_DIM);
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d");
          // Hvit bakgrunn (i tilfelle bildet har gjennomsiktighet og
          // vi lagrer som JPEG)
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(img, 0, 0, targetW, targetH);

          // Reduser kvaliteten gradvis til den er under grensen
          let quality = IMAGE_QUALITY;
          let dataUrl = canvas.toDataURL("image/jpeg", quality);
          // base64 er ~4/3 av binær størrelse
          const approxBytes = (url) => Math.ceil(url.length * 0.75);
          let tries = 0;
          while (approxBytes(dataUrl) > IMAGE_MAX_BYTES && quality > 0.45 && tries < 4) {
            quality -= 0.12;
            dataUrl = canvas.toDataURL("image/jpeg", quality);
            tries += 1;
          }
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── Koble opp logikk på et nytt glimt-kort ───────────────────
function wireCard(card) {
  // Sørg for at kortet har en unik id (brukes av storylinen)
  if (!card.dataset.cardId) {
    card.dataset.cardId = uid();
  }

  const imageInput   = card.querySelector("[data-image]");
  const imageEmpty   = card.querySelector("[data-image-empty]");
  const imagePreview = card.querySelector("[data-image-preview]");
  const imageThumb   = card.querySelector("[data-image-thumb]");
  const imageRemove  = card.querySelector("[data-image-remove]");
  const removeBtn    = card.querySelector("[data-remove]");
  const saveBtn      = card.querySelector("[data-save]");
  const saveLabel    = card.querySelector("[data-save-label]");
  const titleInput   = card.querySelector("[data-title]");
  const editBtn      = card.querySelector("[data-edit]");

  // Preview-elementer (visningsvinduet)
  const previewEl         = card.querySelector("[data-preview]");
  const previewTitle      = card.querySelector("[data-preview-title]");
  const previewAddressEl  = card.querySelector("[data-preview-address]");
  const previewAddressTxt = card.querySelector("[data-preview-address-text]");
  const previewNote       = card.querySelector("[data-preview-note]");
  const previewImageWrap  = card.querySelector("[data-preview-image]");
  const previewImg        = card.querySelector("[data-preview-img]");

  // Live-oppdater storylinen når tittelen endres
  if (titleInput) {
    titleInput.addEventListener("input", renderStoryline);
  }

  // Marker kortet som aktivt når brukeren fokuserer i det
  card.addEventListener("focusin", () => {
    setActiveCard(card.dataset.cardId);
  });

  // Koble opp adresse-autocomplete
  wireAddressAutocomplete(card);

  // Bildeopplasting (med komprimering)
  imageInput.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      // Komprimer først; fall tilbake til rå data-URL hvis noe feiler
      let dataUrl;
      try {
        dataUrl = await compressImageFile(file);
      } catch (err) {
        console.warn("Klarte ikke å komprimere bilde, bruker original:", err);
        dataUrl = await readImageAsDataURL(file);
      }
      imageThumb.src = dataUrl;
      imageEmpty.hidden = true;
      imagePreview.hidden = false;
      card.dataset.imageData = dataUrl;
    } catch (err) {
      console.error("Kunne ikke lese bilde:", err);
      alert("Kunne ikke laste opp bildet. Prøv et annet bilde.");
    }
  });

  // Fjern bilde
  imageRemove.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    imageInput.value = "";
    imageThumb.src = "";
    imageEmpty.hidden = false;
    imagePreview.hidden = true;
    delete card.dataset.imageData;
  });

  // Fjern helt kort
  removeBtn.addEventListener("click", () => {
    const cards = container.querySelectorAll("[data-glimt-card]");
    if (cards.length <= 1) return; // alltid minst ett
    if (activeCardId === card.dataset.cardId) {
      activeCardId = null;
    }
    card.remove();
    renumber();
    renderStoryline();
  });

  // Lagre glimt – samle innholdet til et visningsvindu.
  // Ingenting lagres permanent før hele reisebrevet sendes inn.
  saveBtn.addEventListener("click", () => {
    const data = collectCardData(card);

    // Krev minst en tittel eller adresse eller note før vi kan "lagre"
    if (!data.title && !data.address && !data.note && !data.image) {
      alert("Fyll inn noe i glimtet før du lagrer det.");
      titleInput?.focus();
      return;
    }

    // Fyll ut preview-innhold
    if (previewTitle) {
      previewTitle.textContent = data.title || "Uten tittel";
    }
    if (previewAddressEl && previewAddressTxt) {
      if (data.address) {
        previewAddressTxt.textContent = data.address;
        previewAddressEl.hidden = false;
      } else {
        previewAddressEl.hidden = true;
      }
    }
    if (previewNote) {
      if (data.note) {
        previewNote.textContent = data.note;
        previewNote.hidden = false;
      } else {
        previewNote.textContent = "";
        previewNote.hidden = true;
      }
    }
    if (previewImageWrap && previewImg) {
      if (data.image) {
        previewImg.src = data.image;
        previewImageWrap.hidden = false;
      } else {
        previewImg.removeAttribute("src");
        previewImageWrap.hidden = true;
      }
    }

    // Bytt til visningsmodus
    card.classList.add("is-saved");
    card.classList.add("is-view");
    if (saveLabel) saveLabel.textContent = "Lagre glimt";

    // Oppdater storyline (viser nå tittelen)
    renderStoryline();
    setActiveCard(card.dataset.cardId);
  });

  // Rediger – tilbake til skjema-modus
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      card.classList.remove("is-view");
      setActiveCard(card.dataset.cardId);
      // Fokuser på tittelen og scroll kortet inn i visning
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      if (titleInput) {
        setTimeout(() => titleInput.focus(), 250);
      }
    });
  }

  // Når brukeren endrer noe, fjern «lagret»-stilen (men la is-view være)
  card.querySelectorAll("input, textarea").forEach(inp => {
    inp.addEventListener("input", () => card.classList.remove("is-saved"));
  });
}

// ── Legg til et nytt glimt-kort ──────────────────────────────
function addCard() {
  const clone = cardTemplate.content.firstElementChild.cloneNode(true);
  container.appendChild(clone);
  wireCard(clone);
  renumber();
  setActiveCard(clone.dataset.cardId);
  renderStoryline();
  return clone;
}

// ── Populér et kort med eksisterende data (brukt i edit-modus) ─
function populateCard(card, data) {
  if (!card || !data) return;
  const titleInput   = card.querySelector("[data-title]");
  const addressInput = card.querySelector("[data-address]");
  const noteInput    = card.querySelector("[data-note]");
  const imageEmpty   = card.querySelector("[data-image-empty]");
  const imagePreview = card.querySelector("[data-image-preview]");
  const imageThumb   = card.querySelector("[data-image-thumb]");

  if (titleInput)   titleInput.value   = data.title   || "";
  if (addressInput) addressInput.value = data.address || "";
  if (noteInput)    noteInput.value    = data.note    || "";

  // Lagre adresse-metadata på kortet
  if (data.address) card.dataset.addressDisplay = data.address;
  if (data.city)    card.dataset.addressCity    = data.city;
  if (Number.isFinite(data.lat)) card.dataset.addressLat = data.lat;
  if (Number.isFinite(data.lon)) card.dataset.addressLon = data.lon;
  if (data.placeId) card.dataset.addressPlaceId = data.placeId;

  // Bilde
  if (data.image) {
    card.dataset.imageData = data.image;
    if (imageThumb) imageThumb.src = data.image;
    if (imageEmpty) imageEmpty.hidden = true;
    if (imagePreview) imagePreview.hidden = false;
  }
}

// ── Last et eksisterende reisebrev inn i skjemaet (edit-modus) ─
function loadGuideForEditing(guide) {
  if (!guide || !Array.isArray(guide.glimts) || guide.glimts.length === 0) {
    return false;
  }

  // Tøm container (addCard() har allerede blitt kalt i init med ett kort)
  container.innerHTML = "";

  // Lag ett kort per glimt og fyll ut data
  guide.glimts.forEach((glimtData) => {
    const card = addCard();
    populateCard(card, glimtData);
    // Legg kortet direkte i visnings-modus så brukeren ser det som
    // et ferdig glimt med "Rediger"-knapp
    const saveBtn = card.querySelector("[data-save]");
    if (saveBtn) saveBtn.click();
  });

  // Sett guide-toggle basert på lagret verdi
  const guideToggle = document.getElementById("guide-toggle-cb");
  if (guideToggle && guide.isGuide) {
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

  renumber();
  renderStoryline();
  return true;
}

// ── Hent data fra et kort ────────────────────────────────────
function collectCardData(card) {
  const lat = card.dataset.addressLat
    ? parseFloat(card.dataset.addressLat)
    : null;
  const lon = card.dataset.addressLon
    ? parseFloat(card.dataset.addressLon)
    : null;
  return {
    title:   card.querySelector("[data-title]").value.trim(),
    address: card.querySelector("[data-address]").value.trim(),
    city:    card.dataset.addressCity || "",
    lat:     Number.isFinite(lat) ? lat : null,
    lon:     Number.isFinite(lon) ? lon : null,
    placeId: card.dataset.addressPlaceId || null,
    note:    card.querySelector("[data-note]").value.trim(),
    image:   card.dataset.imageData || ""
  };
}

// ── Lagre hele reisebrevet i localStorage ────────────────────
function saveGuide(e) {
  e.preventDefault();

  const cards  = container.querySelectorAll("[data-glimt-card]");
  const glimts = Array.from(cards).map(collectCardData);

  // Fjern tomme glimt (uten tittel, adresse, note og bilde)
  const filled = glimts.filter(g =>
    g.title || g.address || g.note || g.image
  );

  if (filled.length === 0) {
    alert("Legg til minst ett glimt før du lagrer reisebrevet.");
    return;
  }

  // Første glimt med tittel brukes som tittel på reisebrevet
  const mainTitle =
    filled.find(g => g.title)?.title || "Mitt reisebrev";

  // Bruk normalisert by fra glimt-kortene (faller tilbake til adressen)
  const mainCity = filled.map(g => g.city).find(c => c) || filled[0].address || "";

  // Les eksisterende glimt før vi bestemmer ID og createdAt
  let existing = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) existing = parsed;
    }
  } catch (_) {}

  // I redigeringsmodus beholder vi samme id og createdAt
  const existingGuide = editingGuideId
    ? existing.find((g) => g.id === editingGuideId)
    : null;

  // Sjekk om brukeren har huket av «Lagre som guide»
  const guideToggle = document.getElementById("guide-toggle-cb");
  const isGuide = guideToggle ? guideToggle.checked : false;

  const guide = {
    id:        existingGuide ? existingGuide.id : uid(),
    title:     mainTitle,
    city:      mainCity,
    createdAt: existingGuide ? existingGuide.createdAt : new Date().toISOString(),
    updatedAt: editingGuideId ? new Date().toISOString() : undefined,
    isGuide:   isGuide,
    glimts:    filled
    // Merk: vi dupliserer ikke bildene i en `images`-array lenger.
    // mine-glimt.js leser bildene direkte fra glimts for å spare plass.
  };

  if (editingGuideId && existingGuide) {
    // Erstatt den eksisterende guiden på samme plass
    existing = existing.map((g) => (g.id === editingGuideId ? guide : g));
  } else {
    existing.unshift(guide);
  }

  // Forsøk å lagre; håndter kvoteoverskridelse spesifikt
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error("Kunne ikke lagre reisebrev:", err);

    const isQuota =
      err && (
        err.name === "QuotaExceededError" ||
        err.code === 22 ||
        err.code === 1014 ||
        /quota/i.test(err.message || "")
      );

    if (isQuota) {
      // Prøv å frigjøre plass ved å droppe eldre egne reisebrev
      // (behold bare det nyeste) og prøve på nytt
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([guide]));
        alert(
          "Nettleseren er tom for plass. Vi måtte fjerne eldre reisebrev for å lagre det nye."
        );
      } catch (err2) {
        console.error("Fortsatt ikke plass etter rensing:", err2);
        alert(
          "Nettleseren har ikke plass til å lagre reisebrevet. " +
          "Prøv å bruke et mindre bilde eller færre glimt."
        );
        return;
      }
    } else {
      alert(
        "Kunne ikke lagre reisebrevet: " +
        (err && err.message ? err.message : "ukjent feil") +
        ". Prøv igjen."
      );
      return;
    }
  }

  // Gå rett til visningen av det nye reisebrevet
  window.location.href = `glimt-detalj.html?id=${encodeURIComponent(guide.id)}`;
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Sjekk om vi er i redigeringsmodus via ?edit=<guideId>
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

  if (!loadedExisting) {
    addCard(); // start med ett tomt glimt
  }

  addBtn.addEventListener("click", () => {
    const card = addCard();
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    const firstInput = card.querySelector("[data-title]");
    if (firstInput) setTimeout(() => firstInput.focus(), 300);
  });
  form.addEventListener("submit", saveGuide);

  // Logg hvilken adresse-provider vi ender opp med
  const announceProvider = () => {
    console.info(
      "Glimt adressesøk bruker:",
      isGoogleReady() ? "Google Places" : "OpenStreetMap/Nominatim"
    );
  };
  if (isGoogleReady()) {
    announceProvider();
  } else {
    document.addEventListener("glimt:google-ready", announceProvider, {
      once: true
    });
    // Sørg for at vi vet etter en kort ventetid hvis eventet ikke kommer
    setTimeout(() => {
      if (!isGoogleReady()) announceProvider();
    }, 3000);
  }
});
