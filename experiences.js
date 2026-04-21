/*
 * ============================================================
 *  Glimt – OPPLEVELSE-DATABASE  (auto-generert av convert.py)
 * ============================================================
 *  IKKE rediger denne filen direkte.
 *  Gjør endringer i database.xlsx og kjør:  python3 convert.py
 * ============================================================
 */

const EXPERIENCES = [
  {
    "city": "Roma",
    "title": "Trastevere ved soloppgang",
    "desc": "Vandre gjennom Romas sjarmerende Trastevere-kvartal mens gatene er stille og morgenlyset treffer de okergule husene.",
    "emoji": "🌅",
    "selskap": [
      "solo",
      "par"
    ],
    "kostnad": "gratis",
    "tid": [
      "morgen"
    ]
  },
  {
    "city": "Roma",
    "title": "Matmarked på Campo de' Fiori",
    "desc": "Romas livligste marked med ferske råvarer, oster og lokale delikatesser – perfekt for et autentisk morgenbesøk.",
    "emoji": "🧀",
    "selskap": [
      "par",
      "venner",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "morgen",
      "formiddag"
    ]
  },
  {
    "city": "Roma",
    "title": "Colosseum-tur med lokal guide",
    "desc": "Utforsk historiens største amfiteater med en lidenskapelig lokalguide som kjenner alle hemmelighetene.",
    "emoji": "🏛️",
    "selskap": [
      "solo",
      "par",
      "venner",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "formiddag",
      "ettermiddag"
    ]
  },
  {
    "city": "Roma",
    "title": "Aperitivo i Pigneto",
    "desc": "Bli med lokalbefolkningen på den trendy aperitivo-tradisjonen i Romas hipste nabolag.",
    "emoji": "🍷",
    "selskap": [
      "par",
      "venner"
    ],
    "kostnad": "$",
    "tid": [
      "ettermiddag",
      "kveld"
    ]
  },
  {
    "city": "Roma",
    "title": "Middag på en trattoria ingen turister kjenner",
    "desc": "En liten familieeiet trattoria i Testaccio – autentisk romersk pasta og wienerschnitzel slik nonna lager det.",
    "emoji": "🍝",
    "selskap": [
      "solo",
      "par",
      "venner",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "kveld"
    ]
  },
  {
    "city": "Roma",
    "title": "Solnedgang fra Gianicolo-høyden",
    "desc": "Den beste utsikten over Roma – og nesten ingen turister. Ta med en flaske vin og nyt solnedgangen.",
    "emoji": "🌇",
    "selskap": [
      "solo",
      "par",
      "venner"
    ],
    "kostnad": "gratis",
    "tid": [
      "ettermiddag",
      "kveld"
    ]
  },
  {
    "city": "Roma",
    "title": "Eksklusiv Tasting Menu",
    "desc": "En gastronomisk kveld på en av Romas Michelin-restauranter – for de som vil ha det beste av det beste.",
    "emoji": "⭐",
    "selskap": [
      "par"
    ],
    "kostnad": "$$",
    "tid": [
      "kveld"
    ]
  },
  {
    "city": "København",
    "title": "Morgensykling langs kanalene",
    "desc": "Leie sykler og utforske Nyhavn og Christianshavn mens byen langsomt våkner.",
    "emoji": "🚲",
    "selskap": [
      "solo",
      "par",
      "venner",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "morgen"
    ]
  },
  {
    "city": "København",
    "title": "Torvehallerne matmarked",
    "desc": "Københavns beste matmarked med smørrebrød, sild og dansk bageri – et must for matinteresserte.",
    "emoji": "🥐",
    "selskap": [
      "par",
      "venner",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "morgen",
      "formiddag"
    ]
  },
  {
    "city": "København",
    "title": "Gratis museer på onsdag",
    "desc": "Statens Museum for Kunst og Nationalmuseet har gratis inngang – perfekt for kulturglade.",
    "emoji": "🎨",
    "selskap": [
      "solo",
      "par",
      "familie"
    ],
    "kostnad": "gratis",
    "tid": [
      "formiddag",
      "ettermiddag"
    ]
  },
  {
    "city": "København",
    "title": "Streetfood på Reffen",
    "desc": "Skandinavias største streetfood-marked ved havnen – internasjonal mat i en uformell og sosial atmosfære.",
    "emoji": "🌮",
    "selskap": [
      "venner",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "ettermiddag",
      "kveld"
    ]
  },
  {
    "city": "København",
    "title": "Noma-inspirert restaurantopplevelse",
    "desc": "Bestill bord på en av restaurantene som har lært av Noma og opplev det nordiske kjøkkenet på sitt beste.",
    "emoji": "🍽️",
    "selskap": [
      "par"
    ],
    "kostnad": "$$",
    "tid": [
      "kveld"
    ]
  },
  {
    "city": "Stockholm",
    "title": "Morgenbad i Långholmen",
    "desc": "En tradisjonell svensk morgenopplevelse – bading i den friske innsjøen på den lille øya Långholmen.",
    "emoji": "🏊",
    "selskap": [
      "solo",
      "venner"
    ],
    "kostnad": "gratis",
    "tid": [
      "morgen"
    ]
  },
  {
    "city": "Stockholm",
    "title": "Gamlastan på vandring",
    "desc": "Utforsk Stockholms middelalderby med smale smug, fargerike fasader og koselige kafeer.",
    "emoji": "🏰",
    "selskap": [
      "solo",
      "par",
      "familie"
    ],
    "kostnad": "gratis",
    "tid": [
      "formiddag",
      "ettermiddag"
    ]
  },
  {
    "city": "Stockholm",
    "title": "Fika på ett lokalt kafé",
    "desc": "Opplev den svenske fika-tradisjonen på et ikke-turistifisert kafé med kanelbullar og kaffe.",
    "emoji": "☕",
    "selskap": [
      "solo",
      "par"
    ],
    "kostnad": "$",
    "tid": [
      "morgen",
      "formiddag",
      "ettermiddag"
    ]
  },
  {
    "city": "Stockholm",
    "title": "Båttur i skjærgården",
    "desc": "Ta en offentlig ferge ut i Stockholms vakre skjærgård – over 30 000 øyer å utforske.",
    "emoji": "⛵",
    "selskap": [
      "par",
      "venner",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "formiddag",
      "ettermiddag"
    ]
  },
  {
    "city": "Stockholm",
    "title": "Cocktailbar i Södermalm",
    "desc": "Stockholms hippeste bydel har et utmerket utvalg av kreative cocktailbarer med god stemning.",
    "emoji": "🍸",
    "selskap": [
      "par",
      "venner"
    ],
    "kostnad": "$",
    "tid": [
      "kveld"
    ]
  },
  {
    "city": "Dublin",
    "title": "Gratis vandring i Phoenix Park",
    "desc": "Europas største bypark med ville dyr, historiske minnesmerker og perfekte turveier.",
    "emoji": "🦌",
    "selskap": [
      "solo",
      "par",
      "familie"
    ],
    "kostnad": "gratis",
    "tid": [
      "morgen",
      "formiddag"
    ]
  },
  {
    "city": "Dublin",
    "title": "Book of Kells på Trinity College",
    "desc": "Se det berømte illuminerte manuskriptet fra 800-tallet og den fantastiske Long Room-biblioteket.",
    "emoji": "📜",
    "selskap": [
      "solo",
      "par",
      "venner"
    ],
    "kostnad": "$",
    "tid": [
      "formiddag",
      "ettermiddag"
    ]
  },
  {
    "city": "Dublin",
    "title": "Pub-quiz på en lokal pub",
    "desc": "Delta i ukentlig pub-quiz og møt ekte dublinere – morsommere enn noe turistattraksjon.",
    "emoji": "🍺",
    "selskap": [
      "venner"
    ],
    "kostnad": "$",
    "tid": [
      "kveld"
    ]
  },
  {
    "city": "Dublin",
    "title": "Livmusikk på The Cobblestone",
    "desc": "Autentisk irsk tradisjonsmusikk i en av Dublins mest elskede puber – ekte stemning, ingen turister.",
    "emoji": "🎵",
    "selskap": [
      "solo",
      "par",
      "venner"
    ],
    "kostnad": "$",
    "tid": [
      "ettermiddag",
      "kveld"
    ]
  },
  {
    "city": "Dublin",
    "title": "Seafood-middag i Howth",
    "desc": "Ta toget til fiskebygrenda Howth og spis fersk hummer og sjøkreps rett ved havnen.",
    "emoji": "🦞",
    "selskap": [
      "par",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "ettermiddag",
      "kveld"
    ]
  },
  {
    "city": "Edinburgh",
    "title": "Morgenvandring på Arthur's Seat",
    "desc": "Klatre opp Edinburgh's slumrende vulkan før byen våkner og nyt 360°-utsikten over Old Town, havet og Pentlandfjellene.",
    "emoji": "🏞️",
    "selskap": [
      "solo",
      "par",
      "venner"
    ],
    "kostnad": "gratis",
    "tid": [
      "morgen"
    ]
  },
  {
    "city": "Edinburgh",
    "title": "Edinburgh Castle ved åpningstid",
    "desc": "Vær blant de første inn på slottet før turistgruppene kommer — Scottish Crown Jewels og One O'Clock Gun venter.",
    "emoji": "🏰",
    "selskap": [
      "par",
      "familie",
      "venner"
    ],
    "kostnad": "$",
    "tid": [
      "formiddag"
    ]
  },
  {
    "city": "Edinburgh",
    "title": "Whisky-smaking i Old Town",
    "desc": "Scotch Whisky Experience på Royal Mile tilbyr guidet smaking gjennom de fem regionene — torv, sherry, eller honning.",
    "emoji": "🥃",
    "selskap": [
      "par",
      "venner"
    ],
    "kostnad": "$",
    "tid": [
      "ettermiddag"
    ]
  },
  {
    "city": "Edinburgh",
    "title": "Litterær bytur fra Harry Potter til Sir Walter Scott",
    "desc": "Utforsk caféene der JK Rowling skrev og brosteinsgater som inspirerte Diagon Alley.",
    "emoji": "📖",
    "selskap": [
      "solo",
      "venner",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "formiddag",
      "ettermiddag"
    ]
  },
  {
    "city": "Edinburgh",
    "title": "Dean Village og spasertur langs Water of Leith",
    "desc": "Skjult grend midt i byen med bindingsverkshus og stille sti langs elven — fri fra turister.",
    "emoji": "🌳",
    "selskap": [
      "solo",
      "par"
    ],
    "kostnad": "gratis",
    "tid": [
      "morgen",
      "ettermiddag"
    ]
  },
  {
    "city": "Edinburgh",
    "title": "Ghost tour i Old Town ved skumring",
    "desc": "En guide i kappe leder deg gjennom Edinburgh's mørke passasjer og hemmelige gatekjellere under bakken.",
    "emoji": "👻",
    "selskap": [
      "venner",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "kveld"
    ]
  },
  {
    "city": "Edinburgh",
    "title": "Traditionell haggis og dram på Greyfriars",
    "desc": "Middag på Greyfriars Bobby's Bar med den hunden-berømte statuen utenfor — ekte skotsk pub-stemning.",
    "emoji": "🍽️",
    "selskap": [
      "par",
      "venner"
    ],
    "kostnad": "$",
    "tid": [
      "kveld"
    ]
  },
  {
    "city": "Milano",
    "title": "Soloppgang ved Duomo",
    "desc": "Vær på Piazza del Duomo når første lys treffer katedralens marmor — fotostund uten kaos.",
    "emoji": "🌅",
    "selskap": [
      "solo",
      "par"
    ],
    "kostnad": "gratis",
    "tid": [
      "morgen"
    ]
  },
  {
    "city": "Milano",
    "title": "Aperitivo i Navigli",
    "desc": "Slapp av langs kanalene ved Naviglio Grande med en Spritz og gratis tapas — favorittritual for milanesiske.",
    "emoji": "🍹",
    "selskap": [
      "par",
      "venner"
    ],
    "kostnad": "$",
    "tid": [
      "ettermiddag",
      "kveld"
    ]
  },
  {
    "city": "Milano",
    "title": "Vintage og design i Brera",
    "desc": "Slynge deg gjennom kunstnerkvartalet Brera med uavhengige vintage-butikker og designstudioer.",
    "emoji": "👜",
    "selskap": [
      "solo",
      "par"
    ],
    "kostnad": "$",
    "tid": [
      "formiddag",
      "ettermiddag"
    ]
  },
  {
    "city": "Milano",
    "title": "Se Leonardos 'Nattverden'",
    "desc": "Bestill billett i forveien for å komme inn i Santa Maria delle Grazie og se verdens berømte fresko.",
    "emoji": "🎨",
    "selskap": [
      "solo",
      "par",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "formiddag"
    ]
  },
  {
    "city": "Milano",
    "title": "Espresso i Galleria Vittorio Emanuele II",
    "desc": "Den eldste arkaden i Italia med glasskuppel, stucco og Cafe Biffi der du kan nippe en espresso staende ved baren.",
    "emoji": "☕",
    "selskap": [
      "solo",
      "par"
    ],
    "kostnad": "$",
    "tid": [
      "formiddag"
    ]
  },
  {
    "city": "Milano",
    "title": "Pasta og tartufo på en trattoria i Isola",
    "desc": "Lokalt nabolag med autentiske restauranter langt fra Duomo — prøv risotto alla milanese og osso buco.",
    "emoji": "🍝",
    "selskap": [
      "par",
      "venner"
    ],
    "kostnad": "$$",
    "tid": [
      "kveld"
    ]
  },
  {
    "city": "Milano",
    "title": "Sykeltur langs Naviglio-kanalen",
    "desc": "Lei en sykkel og trå ut fra byen langs kanalene som Leonardo selv tegnet — rett ut i rolig landsbygd.",
    "emoji": "🚲",
    "selskap": [
      "par",
      "venner",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "morgen",
      "formiddag"
    ]
  },
  {
    "city": "Oslo",
    "title": "Morgentur på Akershus festning",
    "desc": "Spaser langs middelaldervollene med utsikt over Oslofjorden før byen våkner.",
    "emoji": "🏰",
    "selskap": [
      "solo",
      "par",
      "familie"
    ],
    "kostnad": "gratis",
    "tid": [
      "morgen"
    ]
  },
  {
    "city": "Oslo",
    "title": "Sauna og kaldbad på Oslofjorden",
    "desc": "Nordisk sauna-kultur på flytebrygger ved Sukkerbiten eller Bjoervika — vekselvarm opplevelse med fjordutsikt.",
    "emoji": "🧖",
    "selskap": [
      "par",
      "venner"
    ],
    "kostnad": "$",
    "tid": [
      "ettermiddag",
      "kveld"
    ]
  },
  {
    "city": "Oslo",
    "title": "Frokost på Mathallen",
    "desc": "Nordens beste mat-marked ved Akerselva — nordisk laks, surdeigsbrød og håndverksbrennerier.",
    "emoji": "🥖",
    "selskap": [
      "par",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "morgen",
      "formiddag"
    ]
  },
  {
    "city": "Oslo",
    "title": "Munchmuseet med guidet omvisning",
    "desc": "Det nye muset ved Bjoervika rommer 'Skrik' og hele Munch-samlingen — book guide for kontekst.",
    "emoji": "🖼️",
    "selskap": [
      "solo",
      "par",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "formiddag",
      "ettermiddag"
    ]
  },
  {
    "city": "Oslo",
    "title": "Sykeltur langs Akerselva",
    "desc": "Følg elven fra Maridalen ned til fjorden — fosser, tidligere industri, grønne parker og kaffebarer.",
    "emoji": "🚴",
    "selskap": [
      "solo",
      "par",
      "venner"
    ],
    "kostnad": "gratis",
    "tid": [
      "formiddag",
      "ettermiddag"
    ]
  },
  {
    "city": "Oslo",
    "title": "Fjordsafari med RIB",
    "desc": "Høyoktanoppleving øy-hopping i Oslofjorden, sel-titt og Droebak havn — perfekt for eventyrsjeler.",
    "emoji": "🚤",
    "selskap": [
      "venner",
      "familie"
    ],
    "kostnad": "$$",
    "tid": [
      "ettermiddag"
    ]
  },
  {
    "city": "Oslo",
    "title": "Nordisk middag på Grünerløkka",
    "desc": "Trendy bydel med moderne skandinaviske restauranter — prøv Mares, Smalhans eller Kontrast.",
    "emoji": "🍷",
    "selskap": [
      "par",
      "venner"
    ],
    "kostnad": "$$",
    "tid": [
      "kveld"
    ]
  },
  {
    "city": "Paris",
    "title": "Croissant og cafe au lait på morgenen",
    "desc": "Start dagen på et lokalt boulangerie — prøv Du Pain et des Idées eller Boulangerie Utopie for autentisk opplevelse.",
    "emoji": "🥐",
    "selskap": [
      "solo",
      "par",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "morgen"
    ]
  },
  {
    "city": "Paris",
    "title": "Piknik på Champ de Mars under Eiffeltårnet",
    "desc": "Kjøp baguette, ost og vin — slapp av i gresset mens tårnet rager over deg. Blinker hver time etter mørket.",
    "emoji": "🗼",
    "selskap": [
      "par",
      "familie"
    ],
    "kostnad": "gratis",
    "tid": [
      "ettermiddag",
      "kveld"
    ]
  },
  {
    "city": "Paris",
    "title": "Louvre når de åpner",
    "desc": "Kjøp time-billetter for klokken 9 og se Mona Lisa uten folkemengder — gå så direkte til Nike av Samothrake.",
    "emoji": "🎨",
    "selskap": [
      "solo",
      "par",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "morgen",
      "formiddag"
    ]
  },
  {
    "city": "Paris",
    "title": "Vandring i Le Marais",
    "desc": "Jodisk kvarter med falafel-kioskker, vintage-butikker og skjulte gardener — utforsk Place des Vosges.",
    "emoji": "👜",
    "selskap": [
      "solo",
      "par"
    ],
    "kostnad": "$",
    "tid": [
      "formiddag",
      "ettermiddag"
    ]
  },
  {
    "city": "Paris",
    "title": "Vinsmaking og ostebrett i Saint-Germain",
    "desc": "Besok en caviste på venstre bredd — de guider deg gjennom jord, rhone og bourgogne med ost på siden.",
    "emoji": "🍷",
    "selskap": [
      "par",
      "venner"
    ],
    "kostnad": "$",
    "tid": [
      "ettermiddag",
      "kveld"
    ]
  },
  {
    "city": "Paris",
    "title": "Seine-cruise ved solnedgang",
    "desc": "Bateaux Mouches eller Vedettes du Pont-Neuf — passer Notre Dame, Louvre og Eiffeltårnet i magisk lys.",
    "emoji": "🚢",
    "selskap": [
      "par",
      "familie"
    ],
    "kostnad": "$",
    "tid": [
      "ettermiddag",
      "kveld"
    ]
  },
  {
    "city": "Paris",
    "title": "Hemmelig jazz-klubb i Montmartre",
    "desc": "Caveau de la Huchette eller Le Petit Journal — live jazz i kjellere der Sartre og Picasso engang satt.",
    "emoji": "🎷",
    "selskap": [
      "par",
      "venner"
    ],
    "kostnad": "$",
    "tid": [
      "kveld"
    ]
  }
];
