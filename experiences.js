/*
 * ============================================================
 *  CORE – OPPLEVELSE-DATABASE  (auto-generert av convert.py)
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
    "kostnad": "$$",
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
    "kostnad": "$$",
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
    "kostnad": "$$$",
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
    "kostnad": "$$$",
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
    "kostnad": "$$",
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
    "kostnad": "$$",
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
    "kostnad": "$$",
    "tid": [
      "ettermiddag",
      "kveld"
    ]
  }
];
