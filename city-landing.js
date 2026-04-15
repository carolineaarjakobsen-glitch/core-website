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
    eventImage:    pexels(1540406),
    reisebrevImage: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200&q=80"
  },
  // Eldre mann med forvitret ansikt utendørs – nordisk og tøff
  "København": {
    guideImage:    pexels(34559139),
    activityImage: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1200&q=80",
    eventImage:    pexels(28960680),
    reisebrevImage: "https://images.unsplash.com/photo-1508926024405-3cd4e6e0e2a3?w=1200&q=80"
  },
  // Gammel mann med smittende smil og rynker
  "Stockholm": {
    guideImage:    pexels(18419731),
    activityImage: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1200&q=80",
    eventImage:    pexels(15203359),
    reisebrevImage: "https://images.unsplash.com/photo-1572883454120-e8d0b19b22db?w=1200&q=80"
  },
  // Dramatisk svart-hvitt portrett av gammel irer
  "Dublin": {
    guideImage:    pexels(13308635),
    activityImage: "https://images.unsplash.com/photo-1564959130747-897fb406b9af?w=1200&q=80",
    eventImage:    pexels(1190297),
    reisebrevImage: "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=1200&q=80"
  },
  "Gardasjøen": {
    guideImage:    pexels(7004697),
    activityImage: "https://images.unsplash.com/photo-1534631006967-ec4c5765fa2b?w=1200&q=80",
    eventImage:    pexels(2440024),
    reisebrevImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80"
  }
};

const FALLBACK = {
  guideImage:    pexels(11511808),
  activityImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80",
  eventImage:    pexels(28960680),
  reisebrevImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80"
};

// =====================
//  BY-INTRODUKSJONER
// =====================
const CITY_INTROS = {
  "Roma": "Den evige satisf – en by hvor antikke ruiner, renessansekunst og livlig gatekultur smelter sammen. Fra Colosseum til Trasteveres smale smug venter uforglemmelige opplevelser rundt hvert hjørne.",
  "København": "Skandinavias kosmopolitiske perle – en by som forener fargerike havnehus, verdensledende gastronomi og en avslappet sykkelkultur. Fra Nyhavn til Vesterbros hippe kafeer er København en fest for sansene.",
  "Stockholm": "Bygget på fjorten øyer der Mälaren møter Østersjøen – en by med majestetisk arkitektur, grønne parker og et pulserende designmiljø. Gammelstans brostein og Södermalms kreative sjel venter på deg.",
  "Dublin": "Irlands hjerte og sjel – en by med litterær arv, levende puber og varm gjestfrihet. Fra Temple Bars brostein til Phoenixparkens grønne vidder byr Dublin på opplevelser du sent vil glemme.",
  "Gardasjøen": "Italias største innsjø omringet av dramatiske fjelltopper, sitronlunder og pastellfargede landsbyer. Fra Malcesines middelalderslott til Limones hengende stier over vannet – Gardasjøen er stedet der norditaliens dolce vita møter alpene."
};

// =====================
//  OPPSTART
// =====================
function init() {
  const params   = new URLSearchParams(window.location.search);
  const cityName = params.get("city") || "";

  // Hvis ingen by er valgt, redirect til forsiden
  if (!cityName) {
    window.location.href = "index.html";
    return;
  }

  // Sett sidetittel
  document.title = `Glimt – ${cityName}`;

  // Sett bynavn i hero-tittel
  const heroCityName = document.getElementById("hero-city-name");
  if (heroCityName) heroCityName.textContent = cityName;

  // Sett byintroduksjon
  const heroIntro = document.getElementById("hero-city-intro");
  if (heroIntro) heroIntro.textContent = CITY_INTROS[cityName] || `Utforsk alt ${cityName} har å by på – fra skjulte perler til lokale favoritter.`;

  // Sett bynavn i reisebrev-kortet
  const reisebrevCityName = document.getElementById("reisebrev-city-name");
  if (reisebrevCityName) reisebrevCityName.textContent = cityName;

  // Hent bilder for valgt by
  const imgs = CITY_IMAGES[cityName] || FALLBACK;

  // Sett reisebrev-panel bakgrunn
  const reisebrevBg = document.getElementById("reisebrev-bg");
  if (reisebrevBg) reisebrevBg.style.backgroundImage = `url('${imgs.reisebrevImage}')`;

  // Panel: Mine reiseplaner → filtrert for gjeldende by
  const panelPlaner = document.getElementById("panel-planer");
  if (panelPlaner) {
    panelPlaner.href = `mine-reiseplaner.html?city=${encodeURIComponent(cityName)}`;
  }

  // Sett bynavn i planer-kortet
  const planerCityName = document.getElementById("planer-city-name");
  if (planerCityName) planerCityName.textContent = cityName;

  // Vis antall planer for denne byen
  const planerCountTag = document.getElementById("planer-count-tag");
  if (planerCountTag && typeof loadPlansShared === "function") {
    const plans = loadPlansShared();
    const cityPlans = plans.filter(p => p.city === cityName);
    planerCountTag.textContent = cityPlans.length === 0
      ? "Ingen planer ennå"
      : `${cityPlans.length} ${cityPlans.length === 1 ? "plan" : "planer"}`;
  }

  // Panel: Utforsk reisebrev → community feed
  const panelReisebrev = document.getElementById("panel-reisebrev");
  if (panelReisebrev) {
    panelReisebrev.href = `utforsk-reisebrev.html?city=${encodeURIComponent(cityName)}`;
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
