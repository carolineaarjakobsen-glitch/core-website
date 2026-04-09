// =====================
//  BY-SPESIFIKKE BILDER
//  guideImage  → portrettbilde av en person som kunne vært lokal guide
//  activityImage → bybilde som viser en aktivitet
// =====================
// Pexels CDN: https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?...
function pexels(id) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`;
}

const CITY_IMAGES = {
  // Gammel mann med fargerik lue og dype rynker – varm middelhavstype
  "Roma": {
    guideImage:    pexels(11511808),
    activityImage: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80",
    eventImage:    pexels(1540406)
  },
  // Eldre mann med forvitret ansikt utendørs – nordisk og tøff
  "København": {
    guideImage:    pexels(34559139),
    activityImage: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1200&q=80",
    eventImage:    pexels(28960680)
  },
  // Gammel mann med smittende smil og rynker
  "Stockholm": {
    guideImage:    pexels(18419731),
    activityImage: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1200&q=80",
    eventImage:    pexels(15203359)
  },
  // Dramatisk svart-hvitt portrett av gammel irer
  "Dublin": {
    guideImage:    pexels(13308635),
    activityImage: "https://images.unsplash.com/photo-1564959130747-897fb406b9af?w=1200&q=80",
    eventImage:    pexels(1190297)
  }
};

const FALLBACK = {
  guideImage:    pexels(11511808),
  activityImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80",
  eventImage:    pexels(28960680)
};

// =====================
//  OPPSTART
// =====================
function init() {
  const params   = new URLSearchParams(window.location.search);
  const cityName = params.get("city") || "";

  // Sett sidetittel
  document.title = `CORE – ${cityName}`;

  // Vis bynavn i midtstrek-pill
  const pill = document.getElementById("divider-city-name");
  if (pill) pill.textContent = cityName;

  // Hent bilder for valgt by
  const imgs = CITY_IMAGES[cityName] || FALLBACK;

  // Sett bakgrunnsbilder
  const guideBg    = document.getElementById("guide-bg");
  const activityBg = document.getElementById("activity-bg");
  if (guideBg)    guideBg.style.backgroundImage    = `url('${imgs.guideImage}')`;
  if (activityBg) activityBg.style.backgroundImage = `url('${imgs.activityImage}')`;

  // Sett event-panel bakgrunn
  const eventBg = document.getElementById("event-bg");
  if (eventBg) eventBg.style.backgroundImage = `url('${imgs.eventImage}')`;

  // Panel: Velg din guide → ikke aktiv ennå
  const panelGuide = document.getElementById("panel-guide");
  if (panelGuide) {
    panelGuide.href = "#";
    panelGuide.addEventListener("click", e => e.preventDefault());
    panelGuide.style.cursor = "default";
  }

  // Panel: Filtrer for aktiviteter → explore-siden
  const panelActivities = document.getElementById("panel-activities");
  if (panelActivities) {
    panelActivities.href = `explore.html?city=${encodeURIComponent(cityName)}`;
  }

  // Panel: Hva skjer i [by] → kalender
  const panelEvents = document.getElementById("panel-events");
  if (panelEvents) {
    panelEvents.href = `calendar.html?city=${encodeURIComponent(cityName)}`;
  }

  // Sett bynavn i events-panel-tittel
  const eventCityName = document.getElementById("event-city-name");
  if (eventCityName) eventCityName.textContent = cityName;
}

init();
