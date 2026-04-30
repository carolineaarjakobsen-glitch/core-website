# Sette opp Google Maps / Places for Glimt

Denne guiden viser deg hvordan du setter opp en Google Maps
JavaScript + Places API-nøkkel, låser den til domenet ditt, og
kobler den inn i Glimt. Resultatet er at adressesøket i
`opprett-glimt.html` bruker Google Places (samme søk som i Google
Maps), slik at brukerne finner restauranter, kaféer og andre POI-er.

Hvis nøkkelen mangler eller er ugyldig, faller adressesøket
automatisk tilbake til OpenStreetMap/Nominatim.

---

## 1. Opprett et Google Cloud-prosjekt

1. Gå til [Google Cloud Console](https://console.cloud.google.com/).
2. Logg inn med Google-kontoen du vil bruke for Glimt.
3. Klikk på prosjekt-velgeren øverst til venstre, deretter **"New
   Project"**.
4. Gi prosjektet et navn, f.eks. `glimt-web`. Organization kan
   stå som "No organization". Klikk **Create**.

## 2. Aktiver fakturering

Google krever at et prosjekt har et faktureringsmål koblet til før
Maps- og Places-API-ene kan brukes. Du får likevel en romslig
gratis kvote hver måned, og for MVP-bruk kommer du knapt i
nærheten av grensen.

1. I Cloud Console, gå til **Billing**.
2. Klikk **Link a billing account**. Hvis du ikke har en fra før,
   klikk **Create billing account** og fullfør skjemaet (krever
   kredittkort).
3. Koble faktureringskontoen til `glimt-web`-prosjektet.

Prisoversikt (per april 2026, sjekk alltid siste pris):

- **Place Autocomplete (per session)**: ~$0.017 per session. En
  session = alle tastetrykk + ett detaljoppslag. Vår integrasjon
  bruker `AutocompleteSessionToken`, så du betaler kun når brukeren
  faktisk velger et resultat.
- **Place Details**: inkludert i sessionen når session token
  brukes.
- **Gratis månedlig kreditt**: Google gir ~$200 / 10 000 kall i
  gratis kreditt hver måned på tvers av Maps-produkter.

Med andre ord: for et MVP med noen hundre brukere betaler du null.

## 3. Aktiver API-er

I Cloud Console → **APIs & Services → Library**, søk opp og
aktiver følgende for `glimt-web`-prosjektet:

1. **Maps JavaScript API** (kreves for å laste JS-SDK-en)
2. **Places API** (kreves for autocomplete + detaljer)

Klikk **Enable** på hver av dem.

## 4. Opprett en API-nøkkel

1. Gå til **APIs & Services → Credentials**.
2. Klikk **Create Credentials → API key**.
3. Kopier nøkkelen som vises (den starter typisk med `AIza...`).
4. Klikk **Edit API key** for å låse den (viktig!).

### Lås nøkkelen

Fordi API-nøkkelen kjører i nettleseren og er synlig for alle som
åpner Glimt, **må** den låses. Gjør to ting:

**Application restrictions** → **HTTP referrers (web sites)**

Legg til referrerne du bruker. Eksempel for lokalt arbeid +
produksjon:

```
http://localhost/*
http://127.0.0.1/*
http://localhost:*/*
https://DITT-DOMENE.no/*
https://www.DITT-DOMENE.no/*
```

Bytt ut `DITT-DOMENE.no` med det domenet du faktisk hoster Glimt
på. Hvis du også kjører via `file://` lokalt, se note i
feilsøkingsseksjonen.

**API restrictions** → **Restrict key**

Huk av kun:

- Maps JavaScript API
- Places API

Alt annet skal være av. Lagre.

## 5. Lim nøkkelen inn i Glimt

Åpne `google-maps-config.js` i prosjektet, og fyll inn nøkkelen:

```js
window.GLIMT_GOOGLE_MAPS_KEY = "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
```

Lagre filen. Last opprettelsessiden på nytt i nettleseren.

## 6. Bekreft at Google Places er aktivt

1. Åpne `opprett-glimt.html` i nettleseren.
2. Åpne devtools → Console. Du skal se meldingen:
   `Glimt adressesøk bruker: Google Places`
3. Skriv f.eks. "Corsa Pizza Vesterbrogade" i adressefeltet. Du
   skal nå se Google-forslag med restaurantnavn, adresse og by,
   og "Powered by Google" nederst i dropdownen.
4. Velg et forslag. Feltet fylles med den komplette adressen, og
   `lat`, `lon` og `placeId` lagres på kortet.

Hvis du fortsatt ser `© OpenStreetMap` i bunnen av dropdownen, har
SDK-en ikke lastet. Se feilsøking under.

---

## Feilsøking

**"RefererNotAllowedMapError" i console**
Domenet du laster siden fra er ikke lagt inn under "HTTP
referrers" i API-nøkkelinnstillingene. Legg til riktig URL og vent
~1 minutt før du tester på nytt (endringer kan ta noen sekunder å
propagere).

**"ApiNotActivatedMapError"**
Du har ikke aktivert Places API og/eller Maps JavaScript API i
`APIs & Services → Library`. Aktiver begge.

**"BillingNotEnabledMapError"**
Fakturering er ikke koblet til prosjektet. Følg steg 2.

**Dropdownen er tom eller viser kun Nominatim**
- Sjekk at `google-maps-config.js` faktisk har nøkkelen satt (ikke
  tom streng).
- Sjekk devtools → Network. Filtrer på `maps.googleapis.com`. Hvis
  requesten feiler med 403/400, er det sannsynligvis et nøkkel-
  eller restriksjonsproblem.
- Last siden på nytt etter du har endret nøkkel eller
  restriksjoner.

**Jeg vil teste lokalt med `file://`**
Google tillater vanligvis ikke `file://` som HTTP-referrer. Enten
kjør en lokal webserver (f.eks.
`python3 -m http.server 8000`) og bruk `http://localhost:8000`,
eller sett API-nøkkelen midlertidig til "None" under Application
restrictions mens du tester. **Husk å låse den igjen før du
deployer.**

---

## Kostnad og overvåkning

Gå til **Billing → Reports** i Cloud Console for å se bruk og
forventet kostnad. Du kan også sette et **Budget alert**
(Billing → Budgets & alerts) slik at du får mail hvis bruken
overstiger f.eks. 5 USD/mnd.

Session tokens sørger for at vi ikke belastes for hvert
tastetrykk, kun for fullførte søk der brukeren faktisk velger et
forslag.
