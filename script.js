// =====================
//  BY-DATABASE
//  Byene hentes fra cities.js – rediger den filen for å legge
//  til eller fjerne byer. Ikke endre noe her.
// =====================
const cities = CITIES;

// =====================
//  TILSTAND
// =====================
let currentIndex = 0;
let autoplayInterval = null;
const INTERVAL_MS = 4000; // Bytte hvert 4. sekund

// =====================
//  ELEMENTER
// =====================
const cityNameEl   = document.getElementById("city-name");
const cityImageEl  = document.getElementById("city-image");
const indicatorContainer = document.getElementById("indicators");

// =====================
//  OPPSTART
// =====================
function init() {
  buildIndicators();
  setCityInstant(0);
  startAutoplay();
}

// =====================
//  BYGG INDIKATORER
// =====================
function buildIndicators() {
  cities.forEach((city, i) => {
    const dot = document.createElement("div");
    dot.classList.add("indicator");
    if (i === 0) dot.classList.add("active");
    dot.title = city.name;
    dot.addEventListener("click", () => {
      goToCity(i);
      resetAutoplay();
    });
    indicatorContainer.appendChild(dot);
  });
}

// =====================
//  SETT BY (med animasjon)
// =====================
function goToCity(index) {
  if (index === currentIndex) return;

  // Fade ut
  cityNameEl.classList.add("fading");
  cityImageEl.classList.add("fading");

  setTimeout(() => {
    setCityInstant(index);

    // Fade inn
    cityNameEl.classList.remove("fading");
    cityImageEl.classList.remove("fading");
  }, 400);
}

// =====================
//  SETT BY (uten animasjon)
// =====================
function setCityInstant(index) {
  currentIndex = index;
  const city = cities[index];

  cityNameEl.textContent = city.name;
  cityImageEl.src        = city.image;
  cityImageEl.alt        = city.alt;

  updateIndicators();
}

// =====================
//  OPPDATER INDIKATORER
// =====================
function updateIndicators() {
  const dots = indicatorContainer.querySelectorAll(".indicator");
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentIndex);
  });
}

// =====================
//  AUTOPLAY
// =====================
function startAutoplay() {
  autoplayInterval = setInterval(() => {
    const nextIndex = (currentIndex + 1) % cities.length;
    goToCity(nextIndex);
  }, INTERVAL_MS);
}

function resetAutoplay() {
  clearInterval(autoplayInterval);
  startAutoplay();
}

// =====================
//  BY-VELGER MODAL
// =====================
const modal        = document.getElementById("city-modal");
const searchInput  = document.getElementById("city-search");
const listEl       = document.getElementById("city-modal-list");
const noResultsEl  = document.getElementById("city-no-results");

function openModal() {
  modal.setAttribute("aria-hidden", "false");
  modal.classList.add("open");
  searchInput.value = "";
  renderCityList(cities);
  setTimeout(() => searchInput.focus(), 80);
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function renderCityList(list) {
  listEl.innerHTML = "";
  noResultsEl.style.display = list.length === 0 ? "block" : "none";

  list.forEach(city => {
    const btn = document.createElement("button");
    btn.className = "city-card-option";
    btn.innerHTML = `
      <img class="city-card-thumb" src="${city.image}" alt="${city.alt}" loading="lazy" />
      <span class="city-card-name">${city.name}</span>
      <svg class="city-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    `;
    btn.addEventListener("click", () => selectCity(city.name));
    listEl.appendChild(btn);
  });
}

function filterCities() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = cities.filter(c => c.name.toLowerCase().includes(query));
  renderCityList(filtered);
}

function selectCity(name) {
  window.location.href = `city-landing.html?city=${encodeURIComponent(name)}`;
}

// Lukk ved klikk på overlay
modal.addEventListener("click", e => {
  if (e.target === modal) closeModal();
});

// Lukk ved Escape-tast
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

// =====================
//  KNAPP-HANDLING
// =====================
function handleExplore() {
  openModal();
}

// =====================
//  KJØR
// =====================
init();
