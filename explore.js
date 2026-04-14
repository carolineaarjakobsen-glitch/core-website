// ============================================================
//  Glimt – explore.js  (lokal database – ingen API-kostnad)
// ============================================================

const params = new URLSearchParams(window.location.search);
let CITY = params.get("city") || "";

document.addEventListener("DOMContentLoaded", () => {
  // Populate city selector from CITIES array
  const citySelect = document.getElementById("city-select");
  if (citySelect && typeof CITIES !== "undefined") {
    CITIES.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.name;
      opt.textContent = c.name;
      if (c.name === CITY) opt.selected = true;
      citySelect.appendChild(opt);
    });

    citySelect.addEventListener("change", () => {
      CITY = citySelect.value;
      updateCityUI();
    });
  }

  updateCityUI();
});

function updateCityUI() {
  const badge = document.getElementById("explore-city-badge");
  if (badge) {
    badge.textContent = CITY;
    badge.style.display = CITY ? "" : "none";
  }

  const back = document.getElementById("nav-back");
  if (back) {
    back.href = CITY
      ? `city-landing.html?city=${encodeURIComponent(CITY)}`
      : "index.html";
  }

  const loadingCity = document.getElementById("loading-city");
  if (loadingCity) loadingCity.textContent = CITY || "din by";
}

// ============================================================
//  LOKAL AKTIVITETSDATABASE
//  Tags: hvem[], budsjett[], stemning[], tid[]
// ============================================================

const ACTIVITIES = {

  "Roma": [
    {
      emoji: "🏛️", title: "Vandring i Trastevere",
      desc: "Utforsk Romas mest sjarmerende bydel med smale brosteinsveier, fargerike hus og lokale trattoriaer. Best besøkt på morgenkvisten før turistene ankommer.",
      sted: "Trastevere, Piazza Santa Maria",
      kostnad: "Gratis", tid: "2–3 timer",
      tips: "Ta med en kaffekopp fra Bar San Calisto – Romas billigste og mest autentiske kafé.",
      hvem: ["alene","par","venner","familie"], budsjett: ["gratis"], stemning: ["rolig","romantisk","kulturell"], tidspunkt: ["formiddag","ettermiddag"]
    },
    {
      emoji: "🍕", title: "Pizzeria i Testaccio",
      desc: "Testaccio er Romas matkvartal og hjemsted for det autentiske romerske kjøkkenet. Remo er en institusjon – tykk bunn, enkle ingredienser, kø ut døren.",
      sted: "Testaccio, Via Santa Maria Liberatrice",
      kostnad: "Ca. 15–20 €", tid: "1–2 timer",
      tips: "Kom etter kl. 20 for mest stemning, og be om 'supplì' som forrett – romernes svar på arancini.",
      hvem: ["alene","par","venner","familie"], budsjett: ["lav","middels"], stemning: ["mat"], tidspunkt: ["ettermiddag","kveld"]
    },
    {
      emoji: "🎨", title: "Borghese-galleriet",
      desc: "Et av verdens beste billedgallerier med Berninis marmorskulpturer og Caravaggios mesterverk. Inntaksmengden er begrenset så besøket føles eksklusivt og rolig.",
      sted: "Villa Borghese, Piazzale Scipione Borghese",
      kostnad: "Ca. 25–30 €", tid: "2 timer",
      tips: "Bestill alltid billetter på forhånd – ingen billetter i døren. Lørdag formiddag er stille.",
      hvem: ["alene","par","venner"], budsjett: ["middels"], stemning: ["kulturell","rolig"], tidspunkt: ["formiddag","ettermiddag"]
    },
    {
      emoji: "🌅", title: "Soloppgang ved Colosseum",
      desc: "Colosseum like etter soloppgang er en magisk opplevelse – nesten tomt for turister og badet i gyllent lys. Ta en rask kaffe på baren rett over veien etterpå.",
      sted: "Colosseum, Via Sacra",
      kostnad: "Ca. 18–24 €", tid: "1–2 timer",
      tips: "Kombiner med Forum Romanum og Palatinerhøyden – én billett dekker alle tre.",
      hvem: ["alene","par","venner"], budsjett: ["lav","middels"], stemning: ["kulturell","romantisk","eventyr"], tidspunkt: ["formiddag"]
    },
    {
      emoji: "🚴", title: "Sykkeltur langs Appian-veien",
      desc: "Den gamle Appian-veien er stengt for bil på søndager – perfekt for sykling mellom romerske mausoleer og landlige olivenlunder. En overraskende fredelig opplevelse midt i storbyen.",
      sted: "Via Appia Antica, Porta San Sebastiano",
      kostnad: "Ca. 15 € (sykkelleie)", tid: "Halvdag",
      tips: "Lei sykkel ved Porta San Sebastiano og ta med mat – det er ingen butikker langs veien.",
      hvem: ["alene","par","venner","familie"], budsjett: ["lav"], stemning: ["aktiv","eventyr"], tidspunkt: ["formiddag","hel_dag"]
    },
    {
      emoji: "🌿", title: "Piknik i Villa Borghese",
      desc: "Parken rundt Borghese-galleriet er Romas grønne lunge – rowbåter på innsjøen, skyggerike alleer og en fantastisk utsikt over byen fra Pincio-terrassen.",
      sted: "Villa Borghese, Pincio-terrassen",
      kostnad: "Gratis", tid: "2–4 timer",
      tips: "Gå til Pincio-terrassen rett før solnedgang for Roma-skylinens kanskje fineste utsiktspunkt.",
      hvem: ["par","venner","familie"], budsjett: ["gratis","lav"], stemning: ["rolig","romantisk"], tidspunkt: ["ettermiddag","hel_dag"]
    },
    {
      emoji: "🍷", title: "Aperitivo i Pigneto",
      desc: "Pigneto er Romas hipster-nabolag der lokale kunstnere og musikere samles. Barene serverer gratis mat til apéritifen – et helt måltid for prisen av en drink.",
      sted: "Pigneto, Via del Pigneto",
      kostnad: "10–15 €", tid: "2–3 timer",
      tips: "Bar Necci er det ikoniske stedet – men utforsk sidegatene for de mest autentiske stedene.",
      hvem: ["alene","par","venner"], budsjett: ["lav","middels"], stemning: ["mat","romantisk"], tidspunkt: ["kveld"]
    },
    {
      emoji: "🏊", title: "Terme di Caracalla",
      desc: "Gigantiske ruiner av keisertidens spa-kompleks – nå brukt til utendørs operaforestillinger om sommeren. Selv som vanlig ruin er dette enestående arkitektur.",
      sted: "Terme di Caracalla, Via delle Terme di Caracalla",
      kostnad: "Ca. 8–12 €", tid: "1–2 timer",
      tips: "Sjekk om det er operaforestilling under besøket – å se Verdi blant ruinene er uforglemmelig.",
      hvem: ["alene","par","venner"], budsjett: ["lav"], stemning: ["kulturell","eventyr"], tidspunkt: ["ettermiddag","kveld"]
    },
  ],

  "København": [
    {
      emoji: "🚲", title: "Sykkeltur til Frederiksberg Have",
      desc: "Lei en bysykkel og pedal til den kongelige parken med romantiske kanaler, svaner og det historiske slottet. En av Danmarks vakreste og minst turistifiserte parker.",
      sted: "Frederiksberg Have, Frederiksberg Runddel",
      kostnad: "Gratis (park) + Ca. 30 kr sykkelleie/t", tid: "2–3 timer",
      tips: "Gå inn fra bakdøren ved Pile Allé – der er det ingen kø og du unngår de turisterte inngangene.",
      hvem: ["alene","par","venner","familie"], budsjett: ["gratis","lav"], stemning: ["rolig","aktiv","romantisk"], tidspunkt: ["formiddag","ettermiddag","hel_dag"]
    },
    {
      emoji: "🥐", title: "Smørrebrød-lunsj på Aamanns",
      desc: "Det moderne, oppdaterte smørrebrødet – langt fra det tørre du forestiller deg. Aamanns på Østerport er det beste stedet for en autentisk dansk lunsjopplevelse med sæsongens råvarer.",
      sted: "Aamanns, Øster Farimagsgade 10",
      kostnad: "150–220 kr", tid: "1–2 timer",
      tips: "Bestill bordet på forhånd. Be om 'dagens anbefalte' – det er alltid det beste valget.",
      hvem: ["alene","par","venner"], budsjett: ["middels"], stemning: ["mat","kulturell"], tidspunkt: ["formiddag","ettermiddag"]
    },
    {
      emoji: "🏊", title: "Havnebad i Islands Brygge",
      desc: "Rett ved siden av sentrum kan du bade i ren havnefjord med badstue, klatretårn og sosial stemning. Et fantastisk bevis på Københavns livskvalitet.",
      sted: "Islands Brygge Havnebad",
      kostnad: "Gratis", tid: "2–4 timer",
      tips: "Kom tidlig på hverdager for å få god plass. Badstuen er alltid mer sosial enn du tror.",
      hvem: ["alene","par","venner"], budsjett: ["gratis"], stemning: ["aktiv","rolig"], tidspunkt: ["formiddag","ettermiddag"]
    },
    {
      emoji: "🎨", title: "Louisiana Museum for Moderne Kunst",
      desc: "En times togtur fra sentrum – men museet er så bra at det er verdt en hel dag. Skulpturparken ned mot Øresund og de permanente samlingene er enestående.",
      sted: "Louisiana, Humlebæk (35 min med tog fra København H)",
      kostnad: "155 kr (inkl. tog)", tid: "Halvdag",
      tips: "Tog fra København H til Humlebæk, 5 min gange. Kombiner med et stopp i Helsingør på vei tilbake.",
      hvem: ["alene","par","venner"], budsjett: ["middels"], stemning: ["kulturell","rolig"], tidspunkt: ["formiddag","hel_dag"]
    },
    {
      emoji: "🍺", title: "Mikrobryggeri i Mikkeller Bar",
      desc: "Mikkeller er et verdenskjent mikrobryggeri startet av en dansk gymnasielærer. Barene i København er legendariske for ølentusiaster – enkel mat, fokus på drikken.",
      sted: "Mikkeller Bar, Viktoriagade 8, Vesterbro",
      kostnad: "80–120 kr", tid: "2–3 timer",
      tips: "Spør bartenderen om råd – de er ekstremt kunnskapsrike og elsker å snakke om øl.",
      hvem: ["alene","par","venner"], budsjett: ["middels"], stemning: ["mat","rolig"], tidspunkt: ["ettermiddag","kveld"]
    },
    {
      emoji: "🌊", title: "Kajakkpadling i kanalene",
      desc: "Padl deg gjennom Christianshavns kanaler med byens tak som bakteppe. Du ser en helt annen side av København fra vannivå – rolig, magisk og litt eventyraktig.",
      sted: "Copenhagen Kayak, Børskaj",
      kostnad: "Ca. 150 kr/t", tid: "2–3 timer",
      tips: "Du trenger ingen erfaring – de gir deg rask instruksjon. Dobbeltkajakk er enklest for par.",
      hvem: ["par","venner","familie"], budsjett: ["middels"], stemning: ["aktiv","eventyr","romantisk"], tidspunkt: ["formiddag","ettermiddag"]
    },
    {
      emoji: "🛒", title: "Torvehallerne og Israels Plads",
      desc: "Torvehallerne er et overbygget marked med alt fra frisk kaffe og smørrebrød til krydder og håndlagde oster. Lørdager er det loppemarked på Israels Plads rett ved siden av.",
      sted: "Torvehallerne, Frederiksborggade 21",
      kostnad: "Gratis inngang (mat 50–150 kr)", tid: "1–2 timer",
      tips: "Prøv Coffee Collective inne i hallen – konsekvent rangert blant Europas beste kaffesteder.",
      hvem: ["alene","par","venner","familie"], budsjett: ["gratis","lav","middels"], stemning: ["mat","rolig"], tidspunkt: ["formiddag","ettermiddag"]
    },
    {
      emoji: "🌙", title: "Kveld i Nørrebro",
      desc: "Nørrebro er Københavns mest levende nabolag om kvelden – mangfoldig, ung og full av barer, restauranter og live-musikkvenueer langs Nørrebrogade.",
      sted: "Nørrebrogade og Elmegade",
      kostnad: "100–200 kr", tid: "Hel kveld",
      tips: "Start med mat på Kødbyens Food Market eller Thai-take-away på Nørrebrogade. Afslutt på Rust for live musikk.",
      hvem: ["alene","par","venner"], budsjett: ["lav","middels"], stemning: ["mat","eventyr"], tidspunkt: ["kveld"]
    },
  ],

  "Stockholm": [
    {
      emoji: "☕", title: "Fika-runde i Vasastan",
      desc: "Vasastan er Stockholms mest koselige nabolag for fika – uavhengige kaféer med hjemmebakt kanelbulle og interiør fra en annen tid. Her er det ingenting som haster.",
      sted: "Vasastan, Rörstrandsgatan",
      kostnad: "60–90 kr", tid: "1–2 timer",
      tips: "Prøv Mellqvist Kaffebar på Hornsgatan – her er kanelbullene bakt frisk hver morgen.",
      hvem: ["alene","par","venner"], budsjett: ["lav"], stemning: ["rolig","mat"], tidspunkt: ["formiddag","ettermiddag"]
    },
    {
      emoji: "🏰", title: "Vandring i Gamla Stan",
      desc: "Stockholms middelalderby er ett av Europas best bevarte historiske sentra. Snevre smug, gotiske kirker og fargerike fasader – men gå tidlig for å unngå folkemengdene.",
      sted: "Gamla Stan, Stortorget",
      kostnad: "Gratis", tid: "2–3 timer",
      tips: "Gå ned Mårten Trotzigs Gränd – Stockholms smaleste gate (0,9 m bred). De fleste turister går forbi den.",
      hvem: ["alene","par","venner","familie"], budsjett: ["gratis"], stemning: ["kulturell","romantisk"], tidspunkt: ["formiddag","ettermiddag"]
    },
    {
      emoji: "🚤", title: "Skjærgårdstur med Waxholmsbåten",
      desc: "Ta en vanlig rutebåt ut til øyene i Stockholms skjærgård – det er offentlig transport, men oppleves som en miniferie. Vaxholm er ett av de vakreste målene.",
      sted: "Strömkajen (avganger midt i sentrum)",
      kostnad: "Ca. 100 kr t/r", tid: "Halvdag–hel dag",
      tips: "Kjøp Waxholmsbolaget-app for digitale billetter. Medbring mat og grill – det er grillplasser på øyene.",
      hvem: ["alene","par","venner","familie"], budsjett: ["lav","middels"], stemning: ["aktiv","rolig","eventyr"], tidspunkt: ["formiddag","hel_dag"]
    },
    {
      emoji: "🎨", title: "Fotografiska museet",
      desc: "Et av verdens beste fotografimuseer holder til i et gammelt tollhus på Södermalm. Vekslingsutstillingene er alltid nyskapende – og takarestauranten har utsikt over Djurgården.",
      sted: "Fotografiska, Stadsgårdshamnen 22, Södermalm",
      kostnad: "195 kr", tid: "2–3 timer",
      tips: "Takarestauranten holder åpent til kl. 01 i helgene. Kom sent for vin og utsikt uten matkjøp.",
      hvem: ["alene","par","venner"], budsjett: ["middels"], stemning: ["kulturell","romantisk"], tidspunkt: ["ettermiddag","kveld"]
    },
    {
      emoji: "🍣", title: "Middag på Östermalms Saluhall",
      desc: "Den historiske markedshallen fra 1888 er restaurert og full av svenske delikatesser. Sjømat, smørbrød, ost og sushi – spis ved bardisken for den beste opplevelsen.",
      sted: "Östermalms Saluhall, Östermalmstorg",
      kostnad: "150–300 kr", tid: "1–2 timer",
      tips: "Typen ved Lisa Elmquist-bardisken er en legende – si han hva du har lyst på og be om hans råd.",
      hvem: ["alene","par","venner"], budsjett: ["middels","høy"], stemning: ["mat","kulturell"], tidspunkt: ["ettermiddag","kveld"]
    },
    {
      emoji: "🌿", title: "Jogge eller gå i Djurgården",
      desc: "Djurgården er en kongelig park midt i Stockholm – skog, stier, dyr og kystlinje. Det er her stockholmerne mosjonerer, griller og slapper av i helgene.",
      sted: "Djurgården (Trikk 7 fra sentrum)",
      kostnad: "Gratis", tid: "1–4 timer",
      tips: "Gå langs vannet på sørsiden mot Blockhusudden for de flotteste utsiktspunktene.",
      hvem: ["alene","par","venner","familie"], budsjett: ["gratis"], stemning: ["aktiv","rolig"], tidspunkt: ["formiddag","ettermiddag","hel_dag"]
    },
    {
      emoji: "🌃", title: "Kveld på SoFo i Södermalm",
      desc: "Kvarteret SoFo ('south of Folkungagatan') er Stockholms cooleste kveld-nabolag – uavhengige butikker, naturvinbarer og restauranter med sjel.",
      sted: "Södermalm, Skånegatan og Tjärhovsgatan",
      kostnad: "150–250 kr", tid: "Hel kveld",
      tips: "Start på Pelikan – et klassisk stockholmsk ölhall fra 1904. Avslutt på Akkurat for skandinavisk whisky.",
      hvem: ["alene","par","venner"], budsjett: ["middels","høy"], stemning: ["mat","eventyr"], tidspunkt: ["kveld"]
    },
    {
      emoji: "🧖", title: "Badstue og bad på Tantolunden",
      desc: "Sommerstid er Tantolundens badstue og strandbadet en sosial institusjon i Stockholm. Bygg opp varmen, hopp i vannet, gjenta. Lokalt, gratis og fantastisk.",
      sted: "Tantolundens Friluftsbad, Södermalm",
      kostnad: "Gratis", tid: "2–4 timer",
      tips: "Kom på hverdager ettermiddag for å slippe kø. Ta med mat og grill – det er tillatt i parken.",
      hvem: ["alene","par","venner"], budsjett: ["gratis"], stemning: ["rolig","aktiv"], tidspunkt: ["ettermiddag"]
    },
  ],

  "Dublin": [
    {
      emoji: "🍺", title: "Pubcrawl i Temple Bar-kvartalet",
      desc: "Dublins berømte pubkvartal med live tradisjonell irsk musikk i nesten hver bar. The Temple Bar pub, Gogarty's og Oliver St John Gogarty er klassikerne.",
      sted: "Temple Bar, Fleet Street og Dame Street",
      kostnad: "Ca. 20–40 € (drikke)", tid: "Hel kveld",
      tips: "Går du inn og hører musikk – bli! Sesjonene er spontane og musikerne elsker et engasjert publikum.",
      hvem: ["alene","par","venner"], budsjett: ["middels"], stemning: ["mat","eventyr"], tidspunkt: ["kveld"]
    },
    {
      emoji: "🦌", title: "Morgentur i Phoenix Park",
      desc: "Et av Europas største byparker med ville hjorter som vandrer fritt mellom trærne. Tidlig morgen er magisk – du har parken nesten for deg selv.",
      sted: "Phoenix Park, Parkgate Street inngangen",
      kostnad: "Gratis", tid: "2–3 timer",
      tips: "Hjortene er tamme nok til å komme nær – men respekter avstand. Trekk deg rolig tilbake om de viser tegn til uro.",
      hvem: ["alene","par","familie"], budsjett: ["gratis"], stemning: ["rolig","aktiv"], tidspunkt: ["formiddag"]
    },
    {
      emoji: "📜", title: "Book of Kells på Trinity College",
      desc: "Et av middelalderens aller vakreste manuskripter, illuminert av irske munker rundt år 800. Selve boken er nydelig, men universitetsbiblioteket Long Room er like imponerende.",
      sted: "Trinity College Dublin, College Green",
      kostnad: "Ca. 16–23 €", tid: "1–2 timer",
      tips: "Bestill billetter online – daglig utsolgt. Kom rett ved åpning (09:30) for minst kø.",
      hvem: ["alene","par","venner","familie"], budsjett: ["lav","middels"], stemning: ["kulturell"], tidspunkt: ["formiddag"]
    },
    {
      emoji: "🏘️", title: "Vandring i Portobello og Rathmines",
      desc: "Dublins lokale nabolag med Georgian-arkitektur, kafeer og det koselige Grand Canal. Langt fra turiststien – her lever Dublins egentlige byliv.",
      sted: "Portobello, South Circular Road",
      kostnad: "Gratis", tid: "2–3 timer",
      tips: "Stopp på Fallon & Byrne på Exchequer Street for delikatessemat eller frokost underveis.",
      hvem: ["alene","par","venner"], budsjett: ["gratis","lav"], stemning: ["rolig","kulturell"], tidspunkt: ["formiddag","ettermiddag"]
    },
    {
      emoji: "🚂", title: "Dagtur til Howth fiskerlandsby",
      desc: "30 min med DART-tog fra sentrum og du er i en sjarmerendefiskerlandsby med klippestier, friske sjømatrestauranter og fantastisk utsikt over Dublin Bay.",
      sted: "Howth (DART fra Connolly/Tara Street)",
      kostnad: "Ca. 6 € t/r + mat", tid: "Halvdag–hel dag",
      tips: "Gå klippestien rundt Howth Head – ca. 2 timer, ingen klatring. Avslutt med fish & chips ved havnen.",
      hvem: ["alene","par","venner","familie"], budsjett: ["lav"], stemning: ["aktiv","rolig","eventyr"], tidspunkt: ["formiddag","hel_dag"]
    },
    {
      emoji: "🍽️", title: "Middag på Grafton Street-området",
      desc: "Gatene rundt Grafton Street er fylt med restauranter i alle prisklasser. Fade Street Social er en Dublin-favoritt – tapas-stil med irske råvarer og laidback stemning.",
      sted: "Fade Street Social, Fade Street",
      kostnad: "30–50 € per person", tid: "2–3 timer",
      tips: "Gastro Bar-etasjen på Fade Street Social er billigere enn restauranten og like god.",
      hvem: ["par","venner"], budsjett: ["middels","høy"], stemning: ["mat","romantisk"], tidspunkt: ["kveld"]
    },
    {
      emoji: "🏛️", title: "Kilmainham Gaol – historisk fengsel",
      desc: "Det berømte fengselet der lederne av Påskeopprøret ble henrettet i 1916 er nå et museum. En dypt rørende og viktig del av irsk historie.",
      sted: "Kilmainham Gaol, Inchicore Road",
      kostnad: "Ca. 8 €", tid: "1,5–2 timer",
      tips: "Booking obligatorisk – og ta den guidede turen. Guidene er ekstremt kunnskapsrike og engasjerte.",
      hvem: ["alene","par","venner"], budsjett: ["gratis","lav"], stemning: ["kulturell"], tidspunkt: ["formiddag","ettermiddag"]
    },
    {
      emoji: "🎵", title: "Live irsk sesjon på Mulligan's",
      desc: "Mulligan's på Poolbeg Street er Dublins mest autentiske pub – her går musikere, journalister og stamgjester siden 1782. Musikken starter sent og varer lenge.",
      sted: "Mulligan's Pub, Poolbeg Street",
      kostnad: "15–25 € (drikke)", tid: "Hel kveld",
      tips: "Kom uten forventning om sesjon – men det skjer nesten alltid. Snakk med folk rundt deg, irene elsker å prate.",
      hvem: ["alene","par","venner"], budsjett: ["lav","middels"], stemning: ["mat","eventyr","rolig"], tidspunkt: ["kveld"]
    },
  ],

  "Gardasjøen": [
    {
      emoji: "🚡", title: "Taubanen opp til Monte Baldo",
      desc: "Den roterende gondolen fra Malcesine tar deg til 1800 meters høyde på 10 minutter. Utsikten over hele Gardasjøen fra toppen er overveldende – på klare dager ser du til Dolomittene.",
      sted: "Funivia Malcesine–Monte Baldo, Malcesine",
      kostnad: "Ca. 25 € tur-retur", tid: "Halvdag",
      tips: "Ta første gondolen kl. 08:00 – du har fjellet nesten for deg selv, og lyset er magisk. Pakk en ekstra genser, det er 15 grader kaldere på toppen.",
      hvem: ["alene","par","venner","familie"], budsjett: ["middels"], stemning: ["aktiv","eventyr"], tidspunkt: ["formiddag","hel_dag"]
    },
    {
      emoji: "🍋", title: "Limonaia del Castel i Limone",
      desc: "Et levende museum i en 700 år gammel sitronhage hengende over sjøen. Her dyrket munkene sitroner i steinterrasser lenge før resten av Europa hadde smakt en. Duften er uforglemmelig.",
      sted: "Limonaia del Castel, Via Orti 6, Limone sul Garda",
      kostnad: "Ca. 3 €", tid: "1 time",
      tips: "Kjøp en flaske hjemmelaget limoncello i den lille butikken inne – den er laget av sitroner fra akkurat disse trærne.",
      hvem: ["alene","par","venner","familie"], budsjett: ["gratis","lav"], stemning: ["rolig","kulturell"], tidspunkt: ["formiddag","ettermiddag"]
    },
    {
      emoji: "🚴", title: "Ciclopista del Garda – sykkelstien over vannet",
      desc: "En spektakulær sykkelsti som henger utover klippeveggen rett over sjøen ved Limone. Verdens vakreste pendlervei er åpen for syklister og fotgjengere – og den er gratis.",
      sted: "Ciclopista del Garda, Limone sul Garda",
      kostnad: "Gratis (sykkelleie ca. 15 €)", tid: "1–2 timer",
      tips: "Gå tidlig om morgenen eller ved solnedgang. Det er en fotobom – men knapt noen turister vet at du kan gå forbi den til den uferdigstilte forlengelsen med enda bedre utsikt.",
      hvem: ["alene","par","venner","familie"], budsjett: ["gratis","lav"], stemning: ["aktiv","romantisk","eventyr"], tidspunkt: ["formiddag","ettermiddag"]
    },
    {
      emoji: "🏰", title: "Scaliger-slottet i Malcesine",
      desc: "Et middelalderslott som strekker seg rett ut over vannet – Goethe ble arrestert her i 1786 fordi vaktene trodde skissene hans var spionkart. Gå opp de 112 trinnene i tårnet for den beste utsikten i hele Malcesine.",
      sted: "Castello Scaligero, Malcesine",
      kostnad: "Ca. 7 €", tid: "1–2 timer",
      tips: "Gå like før stengetid – turistene har dratt, og sollyset treffer slottet og sjøen perfekt.",
      hvem: ["alene","par","venner","familie"], budsjett: ["lav"], stemning: ["kulturell","romantisk","rolig"], tidspunkt: ["formiddag","ettermiddag"]
    },
    {
      emoji: "⛵", title: "Seiling med historisk trebåt",
      desc: "Gå ombord på Siora Veronica, en restaurert vintagebåt fra 1926, for en stille seiltur langs Malcesines kystlinje. Ingen motor – bare vind, bølger og Gardasjøens fjellkulisse.",
      sted: "Porto di Malcesine, Malcesine",
      kostnad: "Ca. 35–45 €", tid: "2–3 timer",
      tips: "Book solnedgangsturen – kapteinen åpner en flaske Lugana-vin fra lokale vinmarker når solen går ned bak fjellene.",
      hvem: ["par","venner"], budsjett: ["middels","høy"], stemning: ["romantisk","rolig","eventyr"], tidspunkt: ["ettermiddag","kveld"]
    },
    {
      emoji: "🍷", title: "Aperitivo med utsikt i Limone",
      desc: "Finn en av de små barene langs havnepromenaden i Limone og bestill en Aperol Spritz mens du ser solen forsvinne bak fjellene på vestsiden. Pastellhusene lyser opp i gyllent lys – det er ren magi.",
      sted: "Lungolago Marconi, Limone sul Garda",
      kostnad: "8–15 €", tid: "1–2 timer",
      tips: "Gå forbi de første turistbarene og finn Osteria Al Vecchio Fontec litt opp i bakken – bedre priser, fantastisk terrasse og en kokk som lager pasta for hånd.",
      hvem: ["alene","par","venner"], budsjett: ["lav","middels"], stemning: ["rolig","romantisk","mat"], tidspunkt: ["ettermiddag","kveld"]
    },
    {
      emoji: "🏊", title: "Bading fra klippene ved Cassone",
      desc: "Den lille landsbyen Cassone, like sør for Malcesine, har verdens korteste elv og en hemmelig badebukt mellom klippene. Lokalbefolkningen drar hit når strendene fylles av turister.",
      sted: "Cassone di Malcesine",
      kostnad: "Gratis", tid: "2–4 timer",
      tips: "Følg stien forbi den lille havnen og ned til høyre – der finner du flate klipper med krystallklart vann og nesten ingen mennesker.",
      hvem: ["alene","par","venner","familie"], budsjett: ["gratis"], stemning: ["aktiv","rolig","eventyr"], tidspunkt: ["formiddag","ettermiddag","hel_dag"]
    },
  ],
};

// ============================================================
//  FILTERLOGIKK
// ============================================================

// Mapping fra form-verdier til interne tag-verdier
const HVEM_MAP = {
  "Alene":            "alene",
  "Par / date":       "par",
  "Vennegjeng":       "venner",
  "Familie med barn": "familie",
};

const BUDSJETT_MAP = {
  "Gratis": "gratis",
  "$":      "lav",
  "$$":     "middels",
  "$$$":    "høy",
};

const STEMNING_MAP = {
  "Rolig og avslappende":   "rolig",
  "Aktiv og sporty":        "aktiv",
  "Kulturell og historisk": "kulturell",
  "Mat og drikke":          "mat",
  "Romantisk":              "romantisk",
  "Eventyrlig og unik":     "eventyr",
};

const TIDSPUNKT_MAP = {
  "Formiddag":   "formiddag",
  "Ettermiddag": "ettermiddag",
  "Kveld":       "kveld",
  "Hel dag":     "hel_dag",
};

function scoreActivity(act, filters) {
  let score = 0;
  if (filters.hvem     && act.hvem.includes(filters.hvem))     score += 3;
  if (filters.budsjett && act.budsjett.includes(filters.budsjett)) score += 3;
  if (filters.stemning && act.stemning.includes(filters.stemning)) score += 4;
  if (filters.tidspunkt && act.tidspunkt.includes(filters.tidspunkt)) score += 2;
  return score;
}

// ── Hent brukeropprettede glimt og konverter til aktivitetsformat ─
function loadUserCreatedActivities() {
  try {
    const raw = localStorage.getItem("glimt.myCreatedGlimt");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(g => ({
      emoji:     g.emoji || "✦",
      title:     g.title || "",
      desc:      g.desc || "",
      sted:      g.sted || "",
      kostnad:   g.kostnad || "",
      tid:       ({ under1: "Under 1 time", "1-2": "1–2 timer", "2-4": "2–4 timer", halvdag: "Halvdag", heldag: "Hel dag" })[g.varighet] || "",
      tips:      g.tips || "",
      city:      g.city || "",
      hvem:      g.hvem || [],
      budsjett:  g.budsjett || [],
      stemning:  g.stemning || [],
      tidspunkt: g.tidspunkt || [],
      isUserCreated: true
    }));
  } catch { return []; }
}

function getSuggestions(city, rawFilters) {
  // If no city selected, pool from ALL cities
  let pool;
  if (city && ACTIVITIES[city]) {
    pool = [...ACTIVITIES[city]];
  } else {
    pool = Object.values(ACTIVITIES).flat();
  }

  // Inkluder brukeropprettede glimt
  const userActs = loadUserCreatedActivities();
  if (city) {
    pool = pool.concat(userActs.filter(a => a.city === city));
  } else {
    pool = pool.concat(userActs);
  }

  const filters = {
    hvem:      HVEM_MAP[rawFilters.med_hvem]  || null,
    budsjett:  BUDSJETT_MAP[rawFilters.budsjett] || null,
    stemning:  STEMNING_MAP[rawFilters.stemning] || null,
    tidspunkt: TIDSPUNKT_MAP[rawFilters.tidspunkt] || null,
  };

  // Sett score + litt tilfeldig variasjon for mangfold
  const scored = pool.map(act => ({
    act,
    score: scoreActivity(act, filters) + Math.random() * 1.5,
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 4).map(s => ({
    emoji:   s.act.emoji,
    title:   s.act.title,
    desc:    s.act.desc,
    sted:    s.act.sted,
    kostnad: s.act.kostnad,
    tid:     s.act.tid,
    tips:    s.act.tips,
    isUserCreated: s.act.isUserCreated || false,
  }));
}

// ============================================================
//  HOVED-FUNKSJON (erstatter API-kallet)
// ============================================================

function fetchSuggestions(e) {
  e.preventDefault();

  const form = document.getElementById("explore-form");
  const btn  = document.getElementById("explore-submit-btn");
  const data = new FormData(form);

  const rawFilters = {
    med_hvem:  data.get("med_hvem")  || null,
    budsjett:  data.get("budsjett")  || null,
    stemning:  data.get("stemning")  || null,
    tidspunkt: data.get("tidspunkt") || null,
  };

  setLoading(btn, true);
  showState("loading");

  // Liten forsinkelse for å vise loading-animasjon
  setTimeout(() => {
    try {
      const activities = getSuggestions(CITY, rawFilters);
      renderCards(activities);
      showState("results");
    } catch (err) {
      console.error("getSuggestions feil:", err);
      showState("error");
    } finally {
      setLoading(btn, false);
    }
  }, 600);
}

// ============================================================
//  RENDER OG UI-HJELPERE
// ============================================================

function renderCards(activities) {
  const grid = document.getElementById("results-grid");
  if (!grid) return;

  grid.innerHTML = activities.map(act => `
    <div class="activity-card">
      ${act.isUserCreated ? '<div class="card-user-badge">Opprettet av deg</div>' : ''}
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

function showState(state) {
  document.getElementById("results-empty").style.display   = state === "empty"   ? "" : "none";
  document.getElementById("results-loading").style.display = state === "loading" ? "" : "none";
  document.getElementById("results-error").style.display   = state === "error"   ? "" : "none";
  document.getElementById("results-grid").style.display    = state === "results" ? "" : "none";
}

function resetResults() {
  showState("empty");
}

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
