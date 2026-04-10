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
  }
};

// =====================
//  TILSTAND
// =====================
const params   = new URLSearchParams(window.location.search);
const cityName = params.get("city") || "Roma";

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
function selectDay(day) {
  selectedDay = day;
  renderCalendar(); // re-render for å vise valgt dag

  const events = getEventsForDate(viewYear, viewMonth, day);
  const date   = new Date(viewYear, viewMonth, day);

  const dateStr = date.toLocaleDateString("no-NO", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  document.getElementById("cal-aside-empty").style.display   = "none";
  document.getElementById("cal-aside-content").style.display = "block";
  document.getElementById("cal-aside-date").textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const list = document.getElementById("cal-events-list");
  list.innerHTML = events.map(ev => `
    <div class="cal-event-card">
      <span class="cal-event-emoji">${ev.emoji}</span>
      <div class="cal-event-body">
        <div class="cal-event-title">${ev.title}</div>
        <div class="cal-event-desc">${ev.desc}</div>
        <span class="cal-event-tag">${ev.tag}</span>
      </div>
    </div>
  `).join("");
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

  renderCalendar();
}

init();
