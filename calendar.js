// =====================
//  TICKETMASTER DISCOVERY API
//  Gratis: 5000 kall/dag, 5 req/sek
//  Registrer deg på https://developer.ticketmaster.com/
//  og bytt ut nøkkelen under.
// =====================
const TM_API_KEY = "MWHzzg3nQarJajkj0QU9JNijh8FCYylq";
const TM_BASE    = "https://app.ticketmaster.com/discovery/v2/events.json";

// By → Ticketmaster countryCode + latlong (mer treffsikkert enn city-navn)
const CITY_TM_MAP = {
  "Roma":       { countryCode: "IT", latlong: "41.9028,12.4964" },
  "København":  { countryCode: "DK", latlong: "55.6761,12.5683" },
  "Stockholm":  { countryCode: "SE", latlong: "59.3293,18.0686" },
  "Dublin":     { countryCode: "IE", latlong: "53.3498,-6.2603" },
  "Gardasjøen": { countryCode: "IT", latlong: "45.6387,10.7229" }
};

// Cache for å unngå unødvendige API-kall
const tmCache = {};

// Hent events fra Ticketmaster for en gitt dato
async function fetchTicketmasterEvents(cityName, year, month, day) {
  const mapping = CITY_TM_MAP[cityName];
  if (!mapping || TM_API_KEY === "DIN_TICKETMASTER_API_KEY") return [];

  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const cacheKey = `${cityName}-${dateStr}`;
  if (tmCache[cacheKey]) return tmCache[cacheKey];

  const startDateTime = `${dateStr}T00:00:00Z`;
  const endDateTime   = `${dateStr}T23:59:59Z`;

  const params = new URLSearchParams({
    apikey: TM_API_KEY,
    latlong: mapping.latlong,
    radius: "30",
    unit: "km",
    countryCode: mapping.countryCode,
    startDateTime,
    endDateTime,
    size: 10,
    sort: "date,asc"
  });

  try {
    const res = await fetch(`${TM_BASE}?${params}`);
    if (!res.ok) return [];
    const data = await res.json();

    const events = (data._embedded?.events || []).map(ev => {
      const classification = ev.classifications?.[0];
      const rawSegment = classification?.segment?.name || "";
      const rawGenre   = classification?.genre?.name || "";
      const segment = rawSegment === "Undefined" ? "" : rawSegment;
      const genre   = rawGenre === "Undefined" ? "" : rawGenre;
      const venue   = ev._embedded?.venues?.[0]?.name || "";
      const time    = ev.dates?.start?.localTime
        ? ev.dates.start.localTime.slice(0, 5)
        : "";
      const url     = ev.url || "";

      // Velg emoji basert på kategori
      let emoji = "🎫";
      if (segment === "Music")  emoji = "🎵";
      if (segment === "Sports") emoji = "⚽";
      if (segment === "Arts & Theatre") emoji = "🎭";
      if (genre === "Comedy")   emoji = "😂";
      if (genre === "Festival") emoji = "🎪";
      if (genre === "Classical") emoji = "🎻";
      if (segment === "Miscellaneous") emoji = "🎫";

      // Lag en pen tagg – filtrer bort "Miscellaneous" og "Undefined"
      const niceTag = (genre && genre !== "Miscellaneous")
        ? genre
        : (segment && segment !== "Miscellaneous")
          ? segment
          : "Arrangement";

      return {
        emoji,
        title: ev.name,
        desc: [venue, time ? `kl. ${time}` : ""].filter(Boolean).join(" · "),
        tag: niceTag,
        url,
        source: "ticketmaster"
      };
    });

    // Dedupliser: behold kun ett arrangement per unikt navn
    const seen = new Set();
    const unique = events.filter(ev => {
      if (seen.has(ev.title)) return false;
      seen.add(ev.title);
      return true;
    });

    tmCache[cacheKey] = unique;
    return unique;
  } catch (err) {
    console.warn("Ticketmaster API feil:", err);
    return [];
  }
}

// =====================
//  ARRANGEMENTSBASE PER BY
//  Struktur per by:
//    always   → skjer hele året
//    winter   → Des, Jan, Feb
//    spring   → Mar, Apr, Mai
//    summer   → Jun, Jul, Aug
//    autumn   → Sep, Okt, Nov
//    weekend  → Lør/Søn-spesifikke
//    friday   → Fredags-spesifikke
// =====================
const CITY_EVENTS = {

  "Roma": {
    always: [
      { emoji: "🏛️", title: "Colosseum og Forum Romanum", desc: "Tidløs opplevelse – best å bestille billetter på forhånd for å unngå kø.", tag: "Severdighet" },
      { emoji: "🍷", title: "Aperitivo i Trastevere", desc: "Lokalt kveldsliv fra kl. 18 i Romas sjarmerende bydel.", tag: "Mat & drikke" },
      { emoji: "🎨", title: "Vatikanmuseene", desc: "Sixtinsk kapell og mer – bestill tidsluke for å slippe å vente.", tag: "Kultur" },
    ],
    spring: [
      { emoji: "🌸", title: "Blomstershow på Piazza di Spagna", desc: "De spanske trappene dekkes av azalea hvert år i april og mai.", tag: "Sesong" },
      { emoji: "🏃", title: "Roma maraton", desc: "Internasjonalt maraton gjennom Romas historiske sentrum hvert år i mars.", tag: "Sport" },
      { emoji: "🌿", title: "Utendørs guidede turer", desc: "Vår er den perfekte sesongen for walking tours i de grønne parkene.", tag: "Tur" },
    ],
    summer: [
      { emoji: "🎬", title: "Utendørs kino på Villa Borghese", desc: "Sommerens kinofestival under åpen himmel fra juni til august.", tag: "Festival" },
      { emoji: "🎵", title: "Roma Summer Fest", desc: "Internasjonale artister på Cavea-scenen ved Auditorium Parco della Musica.", tag: "Konsert" },
      { emoji: "🍦", title: "Gelato-vandring", desc: "Utforsk Romas beste gelaterier i de kjøligere kveldstimene.", tag: "Mat" },
    ],
    autumn: [
      { emoji: "🍂", title: "Roma Europa Festival", desc: "Scenekunst, dans og teater i oktober og november.", tag: "Festival" },
      { emoji: "🏺", title: "Notte dei Musei", desc: "Gratis museumsnetter i oktober – utforsk Romas samlinger etter mørkets frembrud.", tag: "Kultur" },
      { emoji: "🍄", title: "Sesongmat på Campo de' Fiori", desc: "Høstmarkeder med trøfler, kastanjer og ferske oliven fra landsbygda.", tag: "Marked" },
    ],
    winter: [
      { emoji: "🎄", title: "Julemarked på Piazza Navona", desc: "Romas ikoniske julemarked med håndverk, godteri og stemning fra desember.", tag: "Marked" },
      { emoji: "🎆", title: "Nyttårsfeiring ved Colosseum", desc: "Stor folkefest og fyrverkeri rundt Colosseum nyttårsaften.", tag: "Feiring" },
      { emoji: "⛪", title: "Vatikanets julekonsert", desc: "Høytidskonsert i desember i Peterskirken – gratis inngang.", tag: "Konsert" },
    ],
    weekend: [
      { emoji: "🛒", title: "Markedet på Porta Portese", desc: "Romas største loppemarked hver søndag morgen i Trastevere. Kom tidlig!", tag: "Marked" },
      { emoji: "🚶", title: "Gratis omvisning i bydeler", desc: "Frivillige lokalguider tilbyr omvisning i Roma hvert helgemorgen.", tag: "Tur" },
    ],
    friday: [
      { emoji: "🎭", title: "Opera eller teater i Roma", desc: "Teatro dell'Opera di Roma har forestillinger de fleste fredager.", tag: "Kultur" },
    ],
  },

  "København": {
    always: [
      { emoji: "🚲", title: "Sykling langs kanalene", desc: "Leie sykkel og utforsk Christianshavn og Nyhavn i eget tempo.", tag: "Aktivitet" },
      { emoji: "🥐", title: "Torvehallerne matmarked", desc: "Åpent hver dag – smørrebrød, sild og dansk bakeri av ypperste klasse.", tag: "Mat" },
      { emoji: "🎨", title: "SMK – Statens Museum for Kunst", desc: "Gratis inngang med dansk nasjonalkunst og internasjonale utstillinger.", tag: "Kultur" },
    ],
    spring: [
      { emoji: "🌷", title: "Tivoli åpner sesongen", desc: "Tivoli åpner for vårsesong i slutten av mars med blomster og fornøyelser.", tag: "Sesong" },
      { emoji: "🎪", title: "CPH:DOX – dokumentarfilmfestival", desc: "Internasjonalt dokumentarfilmfestival hvert år i mars.", tag: "Festival" },
      { emoji: "🌿", title: "Havnebadet åpner", desc: "Københavns utendørs havnebad åpner for sommeren i mai.", tag: "Aktivitet" },
    ],
    summer: [
      { emoji: "🎸", title: "Roskilde Festival", desc: "Europas største musikk- og kulturfestival ca. 30 min fra København i juli.", tag: "Festival" },
      { emoji: "🍦", title: "Streetfood på Reffen", desc: "Skandinavias største streetfood-marked er åpent hele sommeren ved havnen.", tag: "Mat" },
      { emoji: "⛵", title: "Havnetur med kajak", desc: "Padl gjennom byens kanaler med utleide kajakker fra mai til september.", tag: "Aktivitet" },
    ],
    autumn: [
      { emoji: "🎬", title: "CPH:PIX – filmfestival", desc: "Internasjonalt filmfestival i oktober med hundrevis av filmer.", tag: "Festival" },
      { emoji: "🍂", title: "Kulturnatten i oktober", desc: "En natt i oktober åpner hundrevis av kulturinstitusjoner gratis for alle.", tag: "Kultur" },
      { emoji: "🏺", title: "Designmarked i Refshaleøen", desc: "Lokale designere og håndverkere samles til høstmarked.", tag: "Marked" },
    ],
    winter: [
      { emoji: "❄️", title: "Julemarked på Tivoli", desc: "Tivoli forvandles til et julenyland fra slutten av november.", tag: "Marked" },
      { emoji: "🕯️", title: "Lucia-feiring", desc: "Tradisjonell skandinavisk Lucia-feiring 13. desember i kirker og skoler.", tag: "Tradisjon" },
      { emoji: "🎆", title: "Nyttårskonsert i Tivoli", desc: "Fyverkeri og live musikk på nyttårsaften i Tivoli Gardens.", tag: "Feiring" },
    ],
    weekend: [
      { emoji: "🛒", title: "Israels Plads loppemarked", desc: "Populært loppemarked lørdag formiddag med antikviteter og kuriositeter.", tag: "Marked" },
      { emoji: "🚴", title: "Sykkelbyen om søndagen", desc: "Søndager er perfekt for å oppleve København på sykkel uten trafikk.", tag: "Aktivitet" },
    ],
    friday: [
      { emoji: "🎵", title: "Jazzklubb i Montmartre", desc: "Legendær jazzklubb i København – live jazz de fleste fredagskvelder.", tag: "Musikk" },
    ],
  },

  "Stockholm": {
    always: [
      { emoji: "☕", title: "Fika på et lokalt kafé", desc: "Den svenske fika-tradisjonen – kaffe og kanelbulle på et ikke-turistifisert kafé.", tag: "Tradisjon" },
      { emoji: "🏰", title: "Gamlastan på vandring", desc: "Utforsk Stockholms middelalderby med smale smug og fargerike fasader.", tag: "Aktivitet" },
      { emoji: "🎨", title: "Nationalmuseum", desc: "Nordeuropas største kunstmuseum med fri inngang fra tid til annen.", tag: "Kultur" },
    ],
    spring: [
      { emoji: "🌸", title: "Valborgmässoafton (30. april)", desc: "Sverige feirer vårens ankomst med bål, sang og folkefest.", tag: "Tradisjon" },
      { emoji: "⛵", title: "Skjærgårdsferger åpner", desc: "Fergetjenestene til skjærgården starter opp igjen i mai.", tag: "Aktivitet" },
      { emoji: "🌷", title: "Kungsträdgården i blomst", desc: "Kirsebærtrærne blomstrer i april – ikonisk stockholmsk våropplevelse.", tag: "Sesong" },
    ],
    summer: [
      { emoji: "🎵", title: "Stockholm Music & Arts", desc: "Musikkfestival på Djurgården i juli med internasjonale artister.", tag: "Festival" },
      { emoji: "🦞", title: "Kräftskiva – krepsefest", desc: "Tradisjonell svensk krepsfest i august – fest med sang og snapps.", tag: "Tradisjon" },
      { emoji: "🏊", title: "Badstue og bading i Långholmen", desc: "Utendørsbad med badstue i sjøen er en stockholmsk sommersomhet.", tag: "Aktivitet" },
    ],
    autumn: [
      { emoji: "🍄", title: "Sopphøsting i skogen", desc: "Oktober er gull for sopp – tog ut til skogen for kantareller og steinsopp.", tag: "Aktivitet" },
      { emoji: "🎬", title: "Stockholm Filmfestival", desc: "Internasjonalt filmfestival i november med hundrevis av filmer.", tag: "Festival" },
      { emoji: "🏺", title: "Antikvitetsmarked på Östermalm", desc: "Ukentlige markeder med skandinaviske antikviteter og design.", tag: "Marked" },
    ],
    winter: [
      { emoji: "❄️", title: "Julemarked på Skansen", desc: "Tradisjonelt julemarked på friluftsmuseet Skansen fra november.", tag: "Marked" },
      { emoji: "🕯️", title: "Lucia 13. desember", desc: "Lystoget og Lucia-feiring er en av Stockholms mest stemningsfulle tradisjoner.", tag: "Tradisjon" },
      { emoji: "🎆", title: "Nyttårsfyrverkeri ved rådhuset", desc: "Stockholms store nyttårsfest med fyrverkeri over Riddarfjärden.", tag: "Feiring" },
    ],
    weekend: [
      { emoji: "🛒", title: "Hornstulls marknad", desc: "Hipster-loppemarked langs Söder Mälarstrand – åpent lørdag og søndag.", tag: "Marked" },
      { emoji: "🚤", title: "Skjærgårdstur med ferge", desc: "Offentlig ferge til øyene i skjærgården – en hel dag ute på vannet.", tag: "Tur" },
    ],
    friday: [
      { emoji: "🎭", title: "Dramaten – Kungl. Dramatiska Teatern", desc: "Stockholms kongelige teater har forestillinger de fleste fredager.", tag: "Kultur" },
    ],
  },

  "Dublin": {
    always: [
      { emoji: "🍺", title: "Pub-kveld i Temple Bar", desc: "Irsk pubkultur – live musikk og Guinness i Dublins mest kjente kvartal.", tag: "Kultur" },
      { emoji: "🦌", title: "Phoenix Park", desc: "Europas største bypark med ville hjorter – perfekt for en morgentur.", tag: "Natur" },
      { emoji: "📜", title: "Book of Kells på Trinity College", desc: "Et av verdens mest berømte manuskripter – bestill billetter i god tid.", tag: "Severdighet" },
    ],
    spring: [
      { emoji: "🍀", title: "St. Patrick's Day (17. mars)", desc: "Dublins store nasjonaldag med parade, grønn farge og folkefest.", tag: "Feiring" },
      { emoji: "🌺", title: "St. Patrick's Festival", desc: "Fem dager med konserter, teater og kulturarrangementer rundt 17. mars.", tag: "Festival" },
      { emoji: "🌿", title: "Howth-tur langs kystlinjen", desc: "Vår er perfekt for kystvandringsturen fra Howth Head.", tag: "Natur" },
    ],
    summer: [
      { emoji: "🎵", title: "Electric Picnic", desc: "Irlands største musikkfestival i Stradbally – noen timer fra Dublin i august.", tag: "Festival" },
      { emoji: "🍦", title: "Outdoor Dining Week", desc: "Restauranter i Dublin åpner terrasser og serverer lokale spesialiteter.", tag: "Mat" },
      { emoji: "🎪", title: "Longitude Festival", desc: "Musikk og festivalstemning i Marlay Park i juni/juli.", tag: "Festival" },
    ],
    autumn: [
      { emoji: "🎃", title: "Halloween – Samhain Festival", desc: "Halloween stammer fra irsk tradisjon – Dublin feirer med festivaler.", tag: "Feiring" },
      { emoji: "🎬", title: "Dublin International Film Festival", desc: "Filmfestival i oktober/november med irsk og internasjonal film.", tag: "Festival" },
      { emoji: "🦞", title: "Galway Oyster Festival", desc: "Verdens lengste løpende oystefestival i september – tog dit fra Dublin.", tag: "Mat" },
    ],
    winter: [
      { emoji: "❄️", title: "Julemarked i St. Stephen's Green", desc: "Dublinsk julemarked med håndverk, mat og irsk glögg fra november.", tag: "Marked" },
      { emoji: "🎄", title: "12 Pubs of Christmas", desc: "Den berømte irske juletradisjonen – pubcrawl gjennom 12 barer.", tag: "Tradisjon" },
      { emoji: "🎆", title: "Nyttår langs Liffey-elven", desc: "Dublinsk nyttårsfeiring med fyrverkeri over elven og folkefest.", tag: "Feiring" },
    ],
    weekend: [
      { emoji: "🛒", title: "Flea Market på Newmarket Square", desc: "Populært loppemarked og vintage-marked lørdag og søndag.", tag: "Marked" },
      { emoji: "🎵", title: "Tradisjonell irsk sesjon", desc: "Finn en pub med live trad-session – vanligst lørdag og søndag ettermiddag.", tag: "Musikk" },
    ],
    friday: [
      { emoji: "🎭", title: "Abbey Theatre", desc: "Irlands nasjonalteater har forestillinger de fleste fredager og lørdager.", tag: "Kultur" },
    ],
  },

  "Gardasjøen": {
    months: {
      3: [
        { emoji: "🌸", title: "Vårfestival Lago di Garda", desc: "Internasjonal kulturfestival med konserter og utstillinger langs sjøen i april.", tag: "Festival" },
      ],
      4: [
        { emoji: "🍋", title: "Sitronhøsting i Limone", desc: "Limonaia-hagene åpner for sesongen – smak ferske sitroner rett fra treet.", tag: "Sesong" },
        { emoji: "⛵", title: "Seilsesongen åpner", desc: "Gardasjøens seilklubber åpner for sesongen med regattaer og prøveseilas.", tag: "Sport" },
      ],
      5: [
        { emoji: "🍷", title: "Palio del Chiaretto i Bardolino", desc: "Vinfestival som feirer Chiaretto-rosévin med smaking, musikk og konkurranse mellom landsbyene.", tag: "Festival" },
        { emoji: "🏊", title: "Badesesongen starter", desc: "Strendene langs sjøen åpner for sommeren – Cassone og Limone er blant de fineste.", tag: "Sesong" },
      ],
      6: [
        { emoji: "🎵", title: "Garda Jazz Festival", desc: "Jazzmusikere inntar torgene og hagene langs sjøen gjennom sommeren.", tag: "Konsert" },
        { emoji: "🪂", title: "Paragliding fra Monte Baldo", desc: "Høysesongen for tandem-paragliding – fly over sjøen med utsikt til Dolomittene.", tag: "Sport" },
      ],
      7: [
        { emoji: "🎭", title: "La Notte di Fiaba", desc: "Riva del Garda forvandles til et eventyrteater med forestillinger, workshops og musikk.", tag: "Festival" },
      ],
      10: [
        { emoji: "🫒", title: "Olivenhøst ved Gardasjøen", desc: "Lokale gårder åpner for olivenplugging og olivenolje-smaking langs østbredden.", tag: "Mat" },
      ],
      11: [
        { emoji: "🎄", title: "Julemarked i Riva del Garda", desc: "Tradisjonelt julemarked med lokalt håndverk, vin og alpeinspirert mat ved sjøen.", tag: "Marked" },
      ],
    },
    weekend: [
      { emoji: "🛒", title: "Onsdagsmarkedet i Malcesine", desc: "Bondens eget marked med lokal olivenolje, honning og fjelltørket skinke.", tag: "Marked" },
      { emoji: "🚢", title: "Fergetur mellom landsbyene", desc: "Ta fergen fra Malcesine til Limone – en time på vannet med spektakulær fjellkulisse.", tag: "Aktivitet" },
    ],
    friday: [
      { emoji: "🍷", title: "Vinbar-hopping i Bardolino", desc: "Bardolino-vinruten langs østbredden er perfekt for en fredagskveld med lokale viner.", tag: "Mat & drikke" },
    ],
  }
};

// =====================
//  TILSTAND
// =====================
const params   = new URLSearchParams(window.location.search);
let cityName = params.get("city") || "København";

let viewYear  = new Date().getFullYear();
let viewMonth = new Date().getMonth(); // 0-indexed
let selectedDay = null;

const today = new Date();

// =====================
//  MÅNEDSNAVN
// =====================
const MONTHS_NO = [
  "Januar","Februar","Mars","April","Mai","Juni",
  "Juli","August","September","Oktober","November","Desember"
];

const DAYS_NO = ["Man","Tir","Ons","Tor","Fre","Lør","Søn"];

// =====================
//  HJELP: sesong for måned
// =====================
function getSeason(month) {
  if ([11,0,1].includes(month))  return "winter";
  if ([2,3,4].includes(month))   return "spring";
  if ([5,6,7].includes(month))   return "summer";
  return "autumn";
}

// =====================
//  HENT EVENTS FOR EN DATO
// =====================
function getEventsForDate(year, month, day) {
  const db = CITY_EVENTS[cityName];
  if (!db) return [];

  const date = new Date(year, month, day);
  const dow  = date.getDay(); // 0=Sun, 6=Sat, 5=Fri
  const season = getSeason(month);

  const pool = [];

  // Alltid-tilgjengelige (maks 2)
  const always = db.always || [];
  pool.push(...always.slice(0, 2));

  // Sesong (maks 2)
  const seasonal = db[season] || [];
  pool.push(...seasonal.slice(0, 2));

  // Helg
  if (dow === 6 || dow === 0) {
    pool.push(...(db.weekend || []));
  }
  // Fredag
  if (dow === 5) {
    pool.push(...(db.friday || []));
  }

  // Shuffle lett og begrens til 5
  const shuffled = pool.sort(() => Math.random() - 0.3);
  return shuffled.slice(0, 5);
}

// =====================
//  SJEKK OM DATO HAR EVENTS
// =====================
function hasEvents(year, month, day) {
  return getEventsForDate(year, month, day).length > 0;
}

// =====================
//  RENDER KALENDER
// =====================
function renderCalendar() {
  const grid = document.getElementById("cal-grid");
  const title = document.getElementById("cal-month-title");
  grid.innerHTML = "";

  title.textContent = `${MONTHS_NO[viewMonth]} ${viewYear}`;

  // Første dag i måneden (justert til Man=0)
  const firstDay = new Date(viewYear, viewMonth, 1);
  let startDow = firstDay.getDay(); // 0=Sun
  startDow = startDow === 0 ? 6 : startDow - 1; // konverter til Man=0

  // Antall dager i måneden
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Tomme celler før første dag
  for (let i = 0; i < startDow; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-day empty";
    grid.appendChild(empty);
  }

  // Dager
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.className = "cal-day";

    const isToday = (d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear());
    const isSelected = (d === selectedDay && viewMonth === today.getMonth() && viewYear === today.getFullYear());

    if (isToday)    cell.classList.add("today");
    if (isSelected) cell.classList.add("selected");

    const num = document.createElement("span");
    num.className = "cal-day-num";
    num.textContent = d;
    cell.appendChild(num);

    if (hasEvents(viewYear, viewMonth, d)) {
      const dot = document.createElement("div");
      dot.className = "cal-day-dot";
      cell.appendChild(dot);
    }

    cell.addEventListener("click", () => selectDay(d));
    grid.appendChild(cell);
  }
}

// =====================
//  VELG DATO
// =====================
async function selectDay(day) {
  selectedDay = day;
  renderCalendar();

  const date = new Date(viewYear, viewMonth, day);
  const dateStr = date.toLocaleDateString("no-NO", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  document.getElementById("cal-aside-empty").style.display   = "none";
  document.getElementById("cal-aside-content").style.display = "block";
  document.getElementById("cal-aside-date").textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const list = document.getElementById("cal-events-list");

  // Hent egne lagrede glimt for denne datoen
  const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  let customEvents = [];
  try {
    const raw = localStorage.getItem(MKAL_STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : [];
    customEvents = saved
      .filter(e => e.date === dateKey && (e.city === cityName || e.source === "custom"))
      .map(e => ({ ...e, source: e.source || "custom" }));
  } catch(e) {}

  // Vis lokale forslag mens vi laster Ticketmaster-data
  const localEvents = getEventsForDate(viewYear, viewMonth, day);
  const initialCombined = [...customEvents, ...localEvents];
  list.innerHTML = renderEventCards(initialCombined);

  // Hent Ticketmaster-events asynkront
  const tmEvents = await fetchTicketmasterEvents(cityName, viewYear, viewMonth, day);

  // Kombiner: egne glimt + Ticketmaster + lokale tips (maks 10 totalt)
  const combined = [...customEvents, ...tmEvents, ...localEvents].slice(0, 10);
  list.innerHTML = renderEventCards(combined);
}

// =====================
//  LAGRE TIL MIN KALENDER
// =====================
const MKAL_STORAGE_KEY = "glimt.myCalendar";

function saveEventToMyCalendar(eventData) {
  try {
    const raw = localStorage.getItem(MKAL_STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : [];
    // Sjekk om allerede lagret (basert pa tittel + dato)
    const exists = saved.some(e => e.title === eventData.title && e.date === eventData.date);
    if (exists) return false;
    saved.push(eventData);
    localStorage.setItem(MKAL_STORAGE_KEY, JSON.stringify(saved));
    return true;
  } catch (err) {
    console.warn("Kunne ikke lagre event:", err);
    return false;
  }
}

function handleSaveEvent(btn, ev) {
  const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
  const eventData = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: ev.title,
    desc: ev.desc || "",
    emoji: ev.emoji || "",
    tag: ev.tag || "Arrangement",
    city: cityName,
    date: dateStr,
    url: ev.url || "",
    source: ev.source || "local",
    savedAt: new Date().toISOString()
  };
  const success = saveEventToMyCalendar(eventData);
  if (success) {
    btn.innerHTML = "&#10003;";
    btn.classList.add("cal-save-btn--saved");
    btn.disabled = true;
  }
}

// Gjor events tilgjengelig for onclick-handler
let currentRenderedEvents = [];

// =====================
//  RENDER EVENT-KORT
// =====================
function renderEventCards(events) {
  currentRenderedEvents = events;
  return events.map((ev, idx) => {
    const linkOpen  = ev.url ? `<a href="${ev.url}" target="_blank" rel="noopener" class="cal-event-link">` : "";
    const linkClose = ev.url ? "</a>" : "";
    const sourceTag = ev.source === "ticketmaster"
      ? `<span class="cal-event-tag cal-event-tag--tm">Ticketmaster</span>`
      : ev.source === "custom"
        ? `<span class="cal-event-tag cal-event-tag--custom">Mitt glimt</span>`
        : "";

    // Sjekk om allerede lagret
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    let alreadySaved = false;
    try {
      const raw = localStorage.getItem(MKAL_STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : [];
      alreadySaved = saved.some(e => e.title === ev.title && e.date === dateStr);
    } catch(e) {}

    const saveBtn = alreadySaved
      ? `<button class="cal-save-btn cal-save-btn--saved" disabled>&#10003;</button>`
      : `<button class="cal-save-btn" onclick="handleSaveEvent(this, currentRenderedEvents[${idx}])" title="Lagre til min kalender">&#43;</button>`;

    return `
      <div class="cal-event-card ${ev.source === "ticketmaster" ? "cal-event-card--tm" : ""}">
        <span class="cal-event-emoji">${ev.emoji}</span>
        <div class="cal-event-body">
          ${linkOpen}<div class="cal-event-title">${ev.title}</div>${linkClose}
          <div class="cal-event-desc">${ev.desc}</div>
          <div class="cal-event-tags">
            <span class="cal-event-tag">${ev.tag}</span>
            ${sourceTag}
          </div>
        </div>
        ${saveBtn}
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
  document.getElementById("cal-aside-empty").style.display   = "flex";
  document.getElementById("cal-aside-content").style.display = "none";
  renderCalendar();
}

function nextMonth() {
  viewMonth++;
  if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  selectedDay = null;
  document.getElementById("cal-aside-empty").style.display   = "flex";
  document.getElementById("cal-aside-content").style.display = "none";
  renderCalendar();
}

// =====================
//  BY-SWITCHER
// =====================
function switchCity(newCity) {
  cityName = newCity;
  selectedDay = null;

  // Oppdater UI
  document.title = `Glimt – Kalender · ${cityName}`;
  const label = document.getElementById("cal-city-label");
  if (label) label.textContent = cityName;

  const back = document.getElementById("nav-back");
  if (back) back.href = `city-landing.html?city=${encodeURIComponent(cityName)}`;

  // Oppdater aktiv pill
  document.querySelectorAll(".cal-city-pill").forEach(pill => {
    pill.classList.toggle("active", pill.dataset.city === cityName);
  });

  // Oppdater URL uten reload
  const url = new URL(window.location);
  url.searchParams.set("city", cityName);
  history.replaceState(null, "", url);

  // Reset sidebar
  document.getElementById("cal-aside-empty").style.display   = "flex";
  document.getElementById("cal-aside-content").style.display = "none";

  renderCalendar();
}

function setupCityFilter() {
  document.querySelectorAll(".cal-city-pill").forEach(pill => {
    pill.addEventListener("click", () => switchCity(pill.dataset.city));
  });
  // Sett aktiv pill
  document.querySelectorAll(".cal-city-pill").forEach(pill => {
    pill.classList.toggle("active", pill.dataset.city === cityName);
  });
}

// =====================
//  MODAL: OPPRETT GLIMT
// =====================
function openCalModal() {
  document.getElementById("cal-modal").style.display = "flex";

  // Forhåndsutfyll dato
  const dateInput = document.getElementById("cal-glimt-date");
  if (selectedDay !== null) {
    dateInput.value = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
  } else {
    const t = new Date();
    dateInput.value = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  }

  // Forhåndsutfyll by
  document.getElementById("cal-glimt-city").value = cityName;

  // Reset øvrige felt
  document.getElementById("cal-glimt-title").value = "";
  document.getElementById("cal-glimt-desc").value = "";
  document.getElementById("cal-glimt-category").value = "Arrangement";

  // Reset emoji
  document.querySelectorAll(".cal-emoji-opt").forEach((btn, i) => {
    btn.classList.toggle("selected", i === 0);
  });
  document.getElementById("cal-glimt-emoji").value = document.querySelector(".cal-emoji-opt").dataset.emoji;
}

function closeCalModal() {
  document.getElementById("cal-modal").style.display = "none";
}

function setupCalEmojiPicker() {
  const picker = document.getElementById("cal-emoji-picker");
  const hidden = document.getElementById("cal-glimt-emoji");

  picker.addEventListener("click", (e) => {
    const btn = e.target.closest(".cal-emoji-opt");
    if (!btn) return;
    picker.querySelectorAll(".cal-emoji-opt").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    hidden.value = btn.dataset.emoji;
  });
}

function handleCalGlimtSubmit(e) {
  e.preventDefault();

  const emoji    = document.getElementById("cal-glimt-emoji").value;
  const title    = document.getElementById("cal-glimt-title").value.trim();
  const dateVal  = document.getElementById("cal-glimt-date").value;
  const city     = document.getElementById("cal-glimt-city").value;
  const category = document.getElementById("cal-glimt-category").value;
  const desc     = document.getElementById("cal-glimt-desc").value.trim();

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

  saveEventToMyCalendar(eventData);
  closeCalModal();

  // Vis den nye datoen i kalenderen
  const d = new Date(dateVal);
  if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
    selectDay(d.getDate());
  }
}

// =====================
//  OPPSTART
// =====================
function init() {
  document.title = `Glimt – Kalender · ${cityName}`;

  const label = document.getElementById("cal-city-label");
  if (label) label.textContent = cityName;

  const back = document.getElementById("nav-back");
  if (back) back.href = `city-landing.html?city=${encodeURIComponent(cityName)}`;

  document.getElementById("btn-prev").addEventListener("click", prevMonth);
  document.getElementById("btn-next").addEventListener("click", nextMonth);

  // By-filter
  setupCityFilter();

  // Modal
  document.getElementById("btn-add-glimt").addEventListener("click", openCalModal);
  document.getElementById("btn-modal-close").addEventListener("click", closeCalModal);
  document.getElementById("cal-modal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeCalModal();
  });
  setupCalEmojiPicker();
  document.getElementById("cal-glimt-form").addEventListener("submit", handleCalGlimtSubmit);

  renderCalendar();
}

init();
