# Mine glimt – dokumentasjon av flyten

Denne filen beskriver hvordan "Mine glimt"-funksjonen henger sammen:
fra opprettelse av et reisebrev, til lagring, visning i samlingen, og
visning av det enkelte reisebrevet.

## Oversikt

"Mine glimt" er brukerens personlige samling av reisebrev. Et
**reisebrev** (også kalt en **guide**) består av ett eller flere
**glimt** (øyeblikk fra turen). Hvert glimt har en tittel, adresse,
note og et bilde. Når brukeren lagrer reisebrevet, vises det som en
flis i samlingen, og flisen er klikkbar for å åpne en visning av hele
reisebrevet.

## Filer

| Fil | Rolle |
|---|---|
| `mine-glimt.html` | Oversiktsside – viser fliser med alle reisebrev |
| `mine-glimt.css` | Stil for oversikt, fliser og tom tilstand |
| `mine-glimt.js` | Leser reisebrev fra localStorage og rendrer fliser |
| `opprett-glimt.html` | Opprettelsesskjema for nytt reisebrev |
| `opprett-glimt.css` | Stil for skjema, glimt-kort, bildeopplasting |
| `opprett-glimt.js` | Dynamiske glimt-kort, bildelesing, lagring |
| `glimt-detalj.html` | Skall for visning av ett reisebrev |
| `glimt-detalj.css` | Stil for reisebrev-visningen (tidslinje) |
| `glimt-detalj.js` | Leser ett reisebrev fra localStorage og rendrer det |
| `demo-glimts.js` | Felles demo-data som brukes av både oversikt og detalj |
| `google-maps-config.js` | Inneholder Google Maps API-nøkkelen (valgfri – tom = Nominatim-fallback) |
| `SETUP-GOOGLE-MAPS.md` | Guide for å opprette og låse Google Maps / Places API-nøkkel |

## Lagring – localStorage

All lagring skjer i nettleserens `localStorage` under nøkkelen:

```
glimt.userGlimts
```

Verdien er en JSON-streng med et array av reisebrev-objekter. Nyeste
reisebrev ligger først.

### Datastruktur

Hvert reisebrev har formen:

```js
{
  id: "g<tidsstempel><random>",   // unik id, generert av opprett-glimt.js
  title: "Helgetur til Roma",     // hentet fra første glimts tittel
  city: "Piazza Santa Maria...",  // hentet fra første glimts adresse
  createdAt: "2026-04-11T10:00:00.000Z",
  images: [url1, url2, url3, url4], // opptil 4 bilder til flis-mosaikken
  glimts: [
    {
      title: "Frokost i Trastevere",
      address: "Piazza Santa Maria in Trastevere, Roma, Italia",
      lat: 41.8896,                   // fra Google/Nominatim – null hvis skrevet manuelt
      lon: 12.4699,                   // fra Google/Nominatim – null hvis skrevet manuelt
      placeId: "ChIJ...",             // Google Place-ID, null for Nominatim/manuell
      note: "Liten bakeri på hjørnet...",
      image: "data:image/jpeg;base64,..." // eller ekstern URL
    },
    // ...flere glimt
  ]
}
```

Bilder lastes opp lokalt og lagres som base64 data-URL-er inni
selve objektet, så alt er selvinneholdt i localStorage.

## Flyten steg for steg

### 1. Brukeren åpner Mine glimt

`mine-glimt.html` lastes. `mine-glimt.js` leser `glimt.userGlimts` fra
localStorage:

- Hvis brukeren har egne reisebrev, vises disse som fliser.
- Hvis ikke, vises demo-reisebrev fra `window.GLIMT_DEMOS`
  (definert i `demo-glimts.js`).
- Hvis både localStorage og demoer er tomme, vises tom tilstand med
  en "Kom i gang"-knapp som peker til `opprett-glimt.html`.

Hver flis rendres av `buildCard()` i `mine-glimt.js`:

- 2×2-mosaikk av de første fire bildene som bakgrunn
- Mørk gradient over mosaikken
- Tittel og meta (by + dato) nederst
- En pil øverst til høyre som fades inn ved hover
- Hele flisen er en lenke til `glimt-detalj.html?id=<reisebrev-id>`

### 2. Brukeren klikker "Opprett nytt glimt"

Knappen på Mine glimt-siden lenker til `opprett-glimt.html`.

### 3. Brukeren fyller inn skjemaet

`opprett-glimt.js` bygger ett tomt glimt-kort ved sideinnlasting.
Hvert kort har feltene:

- Glimt (tittel)
- Adresse (med autocomplete fra OpenStreetMap/Nominatim,
  se "Adressesøk" lenger ned)
- Note
- Legg ved bilde (leses med FileReader til data-URL og vises som
  forhåndsvisning)
- "Lagre glimt"-knapp (visuell bekreftelse – markerer kortet som
  lagret. Ingen data persisteres før hele reisebrevet lagres.)

Under kortene er det en "+ Legg til et nytt glimt"-knapp som kloner
malen `#glimt-card-template` og legger til et nytt kort. Kortene
nummereres på nytt. Hvert kort har en X-knapp for å fjernes (skjult
når det bare er ett kort igjen).

### 4. Brukeren klikker "Lagre reisebrev"

`saveGuide()` i `opprett-glimt.js`:

1. Samler data fra alle glimt-kortene
2. Filtrerer bort helt tomme kort
3. Stopper med en alert hvis ingen glimt er fylt ut
4. Bygger et guide-objekt (se datastruktur over)
5. Leser eksisterende `glimt.userGlimts`, legger det nye reisebrevet
   først i arrayet, og skriver tilbake
6. Navigerer til `glimt-detalj.html?id=<ny-id>`

### 5. Brukeren ser det nye reisebrevet

`glimt-detalj.js` leser `id` fra URL-parameteret, henter reisebrevet
fra `glimt.userGlimts`, og rendrer det som en vertikal tidslinje:

- Header med eyebrow "Reisebrev", tittel, dato og antall glimt
- Én seksjon per glimt, med nummerert sirkel på tidslinjen, bilde,
  tittel, adresse (med pin-ikon) og note
- Bunn-handlinger: tilbake-lenke og slett-knapp

Hvis `id` ikke finnes i localStorage, ser JS-filen etter det i
`window.GLIMT_DEMOS` (demo-reisebrev). Hvis det heller ikke finnes
der, vises en "ikke funnet"-tilstand.

### 6. Brukeren klikker tilbake eller sletter

- Tilbake-lenken fører tilbake til `mine-glimt.html`
- Slett-knappen (kun synlig for ekte reisebrev, ikke demoer) ber om
  bekreftelse og fjerner reisebrevet fra `glimt.userGlimts`, før
  brukeren sendes tilbake til samlingen

## Demo-reisebrev

Tre demo-reisebrev (Roma, København, Stockholm) er definert i
`demo-glimts.js` og eksponeres som `window.GLIMT_DEMOS`. Både
`mine-glimt.js` og `glimt-detalj.js` leser fra denne variabelen:

- Oversikten bruker demoer kun når `glimt.userGlimts` er tomt
- Detaljvisningen faller tilbake til demoene hvis en id ikke finnes i
  localStorage (gjør at demo-fliser er klikkbare)

Så snart brukeren lagrer sitt første ekte reisebrev, forsvinner
demoene fra oversikten (men demo-ider fungerer fortsatt i
detaljvisningen hvis noen har bokmerket en slik URL).

## Storyline-sidebar (roadmap)

Til venstre for opprettelsesskjemaet ligger en **storyline** som viser
de forskjellige glimtene i reisebrevet som en slags roadmap, og som
oppdateres live mens brukeren fyller inn skjemaet.

**Layout:**

- `.opprett-main` bruker et to-kolonners grid:
  `grid-template-columns: 280px 1fr; gap: 3rem;`
- Venstre kolonne (`.opprett-storyline`) er `position: sticky`
  (`top: 96px`) slik at storylinen følger med når brukeren scroller.
- Høyre kolonne (`.opprett-content`) inneholder skjemaheader, glimt-
  kortene og lagre-knappene.

**Roadmap-designet:**

Storylinen ser ut som en vei mellom et startpunkt og et mål:

- **Veien** er en coral-tintet vertikal stripe med stiplet hvit
  midtlinje (laget med en `repeating-linear-gradient` som
  ligner ekte kjørefeltsmarkering) og subtile kantskygger.
- **Stoppestedene** er kartnåler (teardrop-form laget med
  `clip-path: path(...)`) i coral. Nummeret vises midt i den runde
  delen av nålen. Tomme glimt får en lyst gjennomsiktig nål, mens
  aktive/hover-nåler fylles helt og får en `drop-shadow` som gir dem
  et løftet preg.
- **Start-markøren** øverst er en hvit sirkel med et coral flaggikon
  og teksten "START HER".
- **Mål-markøren** nederst er en mørk navy sirkel med et rutet
  målflagg og teksten "REISENS SLUTT".

**JS-logikk (`renderStoryline()` i `opprett-glimt.js`):**

- Itererer over alle `[data-glimt-card]` i `#glimts-container`.
- Gir hvert kort en `data-card-id` (slik at storyline-elementer vet
  hvilket kort de hører til).
- Bygger ett `<li class="storyline-item">` per kort, med kortets
  tittel (eller en kursiv "Glimt N"-placeholder hvis tittelen er
  tom – markert med klassen `is-empty`).
- Oppdaterer `#storyline-count` med antall kort og viser/skjuler
  `#storyline-empty`.
- Klikk på et storyline-element scroller til kortet og setter fokus i
  tittelfeltet.
- `wireCard()` lytter på `input` i tittelfeltet og `focusin` på kortet
  slik at storylinen oppdateres live og riktig element får klassen
  `is-active`.
- `addCard()` og X-knappen (fjern kort) kaller `renderStoryline()` og
  `setActiveCard()` etter at DOM er oppdatert.

**CSS-detaljer som er lett å bryte:**

- Vei-senter, kartnål-senter og start/mål-senter må alle ligge på
  `x = 18px` for å linjere riktig (regnet fra innsiden av
  `.storyline-roadmap`). Hvis du endrer bredden på nåler eller veien,
  må `left`-verdiene justeres så sentrene fortsatt matcher.
- `.storyline-item::before` har `margin-top: -22px` slik at den spisse
  enden av nålen peker ned mens sirkeldelen sentreres med kortets
  `top: 50%`. `::after` (nummeret) har `margin-top: -7px` slik at det
  lander midt i sirkeldelen.

## Adressesøk (Google Places med Nominatim-fallback)

Adressefeltet i opprettelsesskjemaet har en autocomplete-dropdown som
bruker **Google Places** hvis en API-nøkkel er konfigurert, og faller
tilbake til **OpenStreetMap/Nominatim** hvis ikke. Dette gjør at vi
får Google-kvalitet på restaurant-/POI-søk i produksjon, samtidig som
utviklere uten egen nøkkel fortsatt kan teste flyten.

### Filer involvert

| Fil | Rolle |
|---|---|
| `google-maps-config.js` | Inneholder `window.GLIMT_GOOGLE_MAPS_KEY` (fylles inn av deg, se `SETUP-GOOGLE-MAPS.md`) |
| `opprett-glimt.html` | Laster `google-maps-config.js` og injiserer Google Maps JS SDK med `libraries=places` hvis nøkkelen finnes |
| `opprett-glimt.js` | Inneholder provider-bevisst autocomplete: `searchGooglePlaces`, `fetchGooglePlaceDetails`, `searchNominatim`, `activeProvider` |
| `SETUP-GOOGLE-MAPS.md` | Steg-for-steg guide for å opprette prosjekt, aktivere API-er, lage nøkkel og låse den |

### Provider-valg

`activeProvider()` i `opprett-glimt.js` returnerer `"google"` hvis
`window.google.maps.places.AutocompleteService` er tilgjengelig, og
`"nominatim"` ellers. Dette sjekkes ved hvert søk, slik at vi
automatisk bytter over når SDK-en er ferdig lastet.

Ved init logges valget til konsollen:

```
Glimt adressesøk bruker: Google Places
```

eller

```
Glimt adressesøk bruker: OpenStreetMap/Nominatim
```

### Google Places-flyt

1. `opprett-glimt.html` leser `window.GLIMT_GOOGLE_MAPS_KEY` fra
   `google-maps-config.js`. Hvis den er satt, injiseres
   `https://maps.googleapis.com/maps/api/js?key=...&libraries=places`
   asynkront med et callback (`glimtGoogleReady`).
2. Første gang `ensureGoogleServices()` kalles opprettes
   `AutocompleteService` og `PlacesService` (sistnevnte trenger et
   DOM-element, så vi lager en usynlig `<div>`).
3. `newGoogleSession()` lager en `AutocompleteSessionToken`. Alle
   autocomplete-kall i samme søkeøkt bruker samme token. Ved detalj-
   oppslag forbrukes tokenet, og et nytt opprettes. Dette gjør at vi
   betaler per **fullført** søk, ikke per tastetrykk.
4. `searchGooglePlaces(query)` → `getPlacePredictions` → returnerer
   normaliserte items `{ provider: "google", placeId, main, meta }`.
5. Når brukeren velger et forslag, kaller `selectItem()`
   `fetchGooglePlaceDetails(placeId)` som henter
   `formatted_address` + `geometry.location` + `place_id`.
   Resultatet lagres på kortet som `data-address-display`,
   `data-address-lat`, `data-address-lon` og `data-address-place-id`.
6. `collectCardData()` tar med både `lat`, `lon` og `placeId` i
   hvert glimt-objekt.

### Nominatim-fallback

Hvis Google ikke er tilgjengelig brukes `searchNominatim()` som før
(debounce 300 ms, min. 2 tegn, global søk). Nominatim-treff har alt
data innebygd – `display_name`, `lat` og `lon` – så
`selectItem()` trenger ikke et ekstra detaljkall.

### Debounce og sesjon

- `ADDRESS_DEBOUNCE_MS = 300` og `ADDRESS_MIN_CHARS = 2`. Google
  Places takler lave terskler fint, og session-token sørger for at
  det uansett kun koster oss det ene detalj-oppslaget per søk.
- Når brukeren redigerer adressen manuelt etterpå, fjernes
  `data-address-lat`, `data-address-lon` og `data-address-place-id`
  fra kortet slik at vi ikke lagrer inkonsistent data.

### Attribusjon

Dropdownen viser riktig attribusjon for aktiv provider:

- Google: "Powered by Google" (påkrevd per Google Maps Platform
  Terms of Service når resultater vises uten et Google-kart)
- Nominatim: "© OpenStreetMap"

### Kostnad og begrensninger

- Google Places med session tokens: ~$0.017 per session. Gratis
  kvote på ~$200/mnd dekker MVP-trafikk. Se
  `SETUP-GOOGLE-MAPS.md` for detaljer.
- Nominatim: gratis, men
  [~1 req/sek per bruker](https://operations.osmfoundation.org/policies/nominatim/).
  Brukes kun som fallback når Google mangler, så produksjons-
  trafikken vil normalt ikke treffe det.

## Navbar / meny-integrasjon

Lenken "Mine glimt" i bruker-dropdownen ble oppdatert på alle sider
til å peke til `mine-glimt.html`:

- `index.html`
- `explore.html`
- `city-landing.html`
- `calendar.html`
- `mine-glimt.html` (peker til seg selv)
- `opprett-glimt.html` og `glimt-detalj.html` har samme meny

## Ting å huske på for videre utvikling

- **Firestore/Firebase-lagring:** I dag ligger alle reisebrev lokalt
  i nettleseren. For å dele mellom enheter/brukere må lagringen
  flyttes til Firestore (eller lignende) og kobles til
  `auth.onAuthStateChanged`. `opprett-glimt.js`, `mine-glimt.js` og
  `glimt-detalj.js` må da skrive/lese mot Firestore i stedet for
  localStorage.
- **Bildestørrelse:** base64-bilder i localStorage spiser raskt av
  kvoten (ca. 5 MB per domene). For en produksjonsversjon bør bilder
  lastes opp til f.eks. Firebase Storage og kun URL-en lagres.
- **Tittel på reisebrev:** I dag brukes det første glimtets tittel
  som tittel på hele reisebrevet (og dermed på flisen). Hvis vi
  senere vil ha et eget felt for "Navn på reisebrev", må det legges
  til øverst i `opprett-glimt.html` og mappes inn som `guide.title`
  i `saveGuide()`.
- **Redigering:** Det finnes ingen redigeringsflyt ennå. For å
  redigere et eksisterende reisebrev må `opprett-glimt.html` støtte
  en `?id=<id>`-parameter som forhåndslaster eksisterende glimt-kort
  og oppdaterer i stedet for å opprette nytt.
- **Rekkefølge på glimt:** Glimtene lagres i den rekkefølgen de
  vises i skjemaet. Drag-and-drop for omrokkering er ikke
  implementert.
