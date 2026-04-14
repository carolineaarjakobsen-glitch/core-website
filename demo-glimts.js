// ============================================================
//  Glimt – delte demo-reisebrev
//  Brukes både av mine-glimt.js og glimt-detalj.js slik at
//  demo-flisene er klikkbare til detaljvisningen fungerer.
//  Demoene forsvinner automatisk så snart brukeren har
//  lagret et eget reisebrev.
// ============================================================

const GLIMT_DEMOS = [
  {
    id: "demo-roma",
    title: "Helgetur til Roma",
    city: "Roma",
    createdAt: "2026-03-18T10:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
      "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=800&q=80",
      "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&q=80",
      "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=800&q=80"
    ],
    glimts: [
      {
        title: "Frokost i Trastevere",
        address: "Piazza Santa Maria in Trastevere, Roma",
        note: "Liten bakeri på hjørnet med ferske cornetti og espresso. Kom tidlig før turistene våkner.",
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80"
      },
      {
        title: "Vandring til Colosseum",
        address: "Piazza del Colosseo, Roma",
        note: "Gå via Via dei Fori Imperiali – ta det rolig og stopp ved Forum Romanum på veien.",
        image: "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=800&q=80"
      },
      {
        title: "Lunsj hos Da Enzo",
        address: "Via dei Vascellari 29, Roma",
        note: "Klassisk cacio e pepe og artisjokk alla romana. Liten restaurant – kom før klokken 12.",
        image: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&q=80"
      },
      {
        title: "Solnedgang fra Gianicolo",
        address: "Piazzale Giuseppe Garibaldi, Roma",
        note: "Den beste utsikten over hele Roma. Ta med en flaske vin og bli til det blir mørkt.",
        image: "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=800&q=80"
      }
    ]
  },
  {
    id: "demo-kbh",
    title: "Kulinarisk København",
    city: "København",
    createdAt: "2026-02-22T10:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&q=80",
      "https://images.unsplash.com/photo-1552084117-56a987666449?w=800&q=80",
      "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=800&q=80",
      "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80"
    ],
    glimts: [
      {
        title: "Smørrebrød på Schønnemann",
        address: "Hauser Plads 16, København",
        note: "Det klassiske smørrebrød-stedet. Bestill flere små retter og del.",
        image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&q=80"
      },
      {
        title: "Sykkeltur til Refshaleøen",
        address: "Refshalevej, København",
        note: "Lei sykkel fra Donkey Republic og rull ut til det gamle verftet. Perfekt til ettermiddagen.",
        image: "https://images.unsplash.com/photo-1552084117-56a987666449?w=800&q=80"
      },
      {
        title: "Kaffe på Prolog",
        address: "Høkerboderne 16, København",
        note: "Byens beste single origin. Liten, koselig og full av locals.",
        image: "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=800&q=80"
      }
    ]
  },
  {
    id: "demo-stockholm",
    title: "Høsttur til Stockholm",
    city: "Stockholm",
    createdAt: "2026-01-10T10:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&q=80",
      "https://images.unsplash.com/photo-1578950114438-7b26a87f2032?w=800&q=80",
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80",
      "https://images.unsplash.com/photo-1501621667575-af81f1f0bacc?w=800&q=80"
    ],
    glimts: [
      {
        title: "Fika på Vete-Katten",
        address: "Kungsgatan 55, Stockholm",
        note: "Den klassiske fikaen – kanelbulle og kaffe i en bakgård fra 1928.",
        image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&q=80"
      },
      {
        title: "Gamla stan på egen hånd",
        address: "Stortorget, Gamla stan, Stockholm",
        note: "Gå deg vill i de smale gatene. Ikke gå glipp av Mårten Trotzigs gränd – byens smaleste gate.",
        image: "https://images.unsplash.com/photo-1578950114438-7b26a87f2032?w=800&q=80"
      }
    ]
  },
  {
    id: "demo-garda",
    title: "Gardasjøen på langs",
    city: "Gardasjøen",
    createdAt: "2026-04-01T10:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1534631006967-ec4c5765fa2b?w=800&q=80",
      "https://images.unsplash.com/photo-1597220869819-151d5be9c099?w=800&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
      "https://images.unsplash.com/photo-1602002418679-40d185505577?w=800&q=80"
    ],
    glimts: [
      {
        title: "Frokost ved havnen i Malcesine",
        address: "Porto di Malcesine, Malcesine",
        note: "Cappuccino og cornetto med sjøutsikt. Finn den lille baren rett ved fergeleiet – lokalbefolkningen sitter her, ikke turistene.",
        image: "https://images.unsplash.com/photo-1534631006967-ec4c5765fa2b?w=800&q=80"
      },
      {
        title: "Monte Baldo med taubanen",
        address: "Funivia Malcesine-Monte Baldo, Via Navene Vecchia, Malcesine",
        note: "Roterende gondol til 1800 meter. På toppen åpner fjellet seg med utsikt over hele sjøen og Dolomittene. Ta med genser – det er kaldt der oppe.",
        image: "https://images.unsplash.com/photo-1597220869819-151d5be9c099?w=800&q=80"
      },
      {
        title: "Sitronhagene i Limone",
        address: "Limonaia del Castel, Via Orti 6, Limone sul Garda",
        note: "700 år gamle steinterrasser fulle av sitrontrær. Duften er overveldende. Kjøp en flaske limoncello laget av disse sitronene.",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80"
      },
      {
        title: "Solnedgang langs Ciclopista del Garda",
        address: "Ciclopista del Garda, Limone sul Garda",
        note: "Sykkelstien henger utover klippeveggen rett over vannet. Gå hit ved solnedgang – det er et av de vakreste stedene jeg har sett i Italia.",
        image: "https://images.unsplash.com/photo-1602002418679-40d185505577?w=800&q=80"
      }
    ]
  }
];
