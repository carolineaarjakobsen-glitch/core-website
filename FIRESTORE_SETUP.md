# Firestore-oppsett for Glimt

Når appen nå lagrer glimt, reisebrev, reiseplaner og kalender i
Firebase Firestore trenger vi et engangs-oppsett i Firebase-
konsollen. Steg 1-4 gjøres **én gang**, så fungerer resten
automatisk.

---

## Steg 1 – Aktiver Firestore

1. Gå til [console.firebase.google.com](https://console.firebase.google.com)
2. Velg prosjektet `core-website-6e152`
3. I venstremenyen, klikk **Build → Firestore Database**
4. Klikk **Create database**
5. Velg **Start in production mode** (åpnes opp via reglene i steg 2)
6. Velg region – anbefalt: **`europe-west1`** (Belgia) for lavest
   ventetid i Norden
7. Klikk **Enable**

---

## Steg 2 – Sett sikkerhetsregler

Hver bruker skal bare kunne lese og skrive sine egne data. Reglene
finnes ferdig i `firestore.rules` i prosjektet.

1. I Firestore-konsollen, klikk på **Rules**-fanen
2. Slett alt som står der fra før
3. Lim inn hele innholdet av `firestore.rules`
4. Klikk **Publish**

Reglene sørger for at dokumenter under `users/{uid}/...` bare kan
leses og skrives av brukeren med samme `uid`.

---

## Steg 3 – Verifiser innlogging

Alle sider som jobber med glimt krever nå innlogging. Siden de
inkluderer `auth-guard.js`, vil ikke-innloggede brukere automatisk
redirectes til `login.html?redirect=<side>`, og deretter tilbake
til siden de prøvde å åpne etter vellykket innlogging.

Dette er pålagt på:

- `mine-glimt.html`, `mine-enkeltglimt.html`, `mine-reiseplaner.html`,
  `min-kalender.html`
- `opprett-glimt.html`, `glimt-detalj.html`, `reiseplan-detalj.html`
- `utforsk-glimt.html`, `utforsk-reisebrev.html`, `calendar.html`,
  `explore.html`, `city-landing.html`

`index.html` og `login.html` krever fremdeles ikke innlogging.

---

## Steg 4 – (Første gang) automatisk migrering av eksisterende data

Første gang en bruker logger inn etter denne oppgraderingen, laster
`glimt-store.js` automatisk over alt som ligger i localStorage
(`glimt.userGlimts`, `glimt.myCreatedGlimt`, `glimt.savedGlimt`,
`glimt.myCalendar`, `glimt.reiseplaner`) til brukerens Firestore.
Etter vellykket opplasting settes markøren `glimt.migratedToFirestore`
i localStorage og de gamle nøklene fjernes. Migreringen kjøres **én
gang per enhet/nettleser** og hopper over demo-/seedede data
(`demo-*`, `sg-*`).

Du kan kjøre migreringen om igjen ved å fjerne markøren manuelt i
DevTools:

```js
localStorage.removeItem("glimt.migratedToFirestore");
```

---

## Datastruktur i Firestore

```
users/
  {uid}/
    userGlimts/{guideId}        ← reisebrev
    myCreatedGlimt/{glimtId}    ← egne enkeltglimt
    savedGlimt/{glimtId}        ← lagrede glimt fra andre
    myCalendar/{eventId}        ← kalender-events
    reiseplaner/{planId}        ← reiseplaner
```

Alle dokumenter inneholder feltet `id` også i payloaden (lik
dokument-id) for å forenkle eksisterende kode som jobber med
listene direkte.

---

## Arkitektur

**`glimt-store.js`** er det sentrale persistens-laget. Det
eksponerer `window.GlimtStore` med synkrone read-funksjoner
(`getUserGlimts()`, `getMyCreatedGlimt()`, ...) som leser fra en
in-memory cache, og asynkrone write-funksjoner (`saveUserGlimt()`,
`deleteUserGlimt()`, ...) som oppdaterer cachen umiddelbart og
persisterer til Firestore. Dette holder signaturen nær den gamle
localStorage-baserte koden.

**`auth-guard.js`** laster på alle beskyttede sider. Den venter på
Firebase auth-statusen, redirecter til login hvis brukeren ikke er
innlogget, og kaller `GlimtStore.init(user.uid)` ved suksess.
Deretter fyres `glimt:ready`-eventet, som sidespesifikk JS venter
på før den rendrer.

**Script-rekkefølgen** i HTML er derfor:

```html
<script src=".../firebase-app-compat.js"></script>
<script src=".../firebase-auth-compat.js"></script>
<script src=".../firebase-firestore-compat.js"></script>
<script src="firebase-config.js"></script>
<script src="glimt-store.js"></script>
<script src="auth-guard.js"></script>
<script src="auth.js"></script>
<!-- … sidespesifikke scripts … -->
```

---

## Offentlig deling (utforsk-funksjon)

Brukere kan velge å dele reisebrev og enkeltglimt offentlig ved å
huke av boksen "Del offentlig" i opprett-skjemaet. Når feltet
`isPublic: true` er satt på et dokument:

- Alle innloggede brukere kan lese det via collection-group-spørringer
  (`GlimtStore.getPublicUserGlimts()` / `getPublicMyCreatedGlimt()`)
- Dokumentet får automatisk tilleggsfeltene `authorId` og
  `authorName` (fra `firebase.auth().currentUser.displayName`) av
  `glimt-store.js`
- Utforsk-sidene (`utforsk-reisebrev.html`, `utforsk-glimt.html`)
  henter fra de offentlige kolleksjonsgruppene

Dersom brukeren huker av boksen og lagrer på nytt uten avhuking,
fjernes `isPublic`, `authorId` og `authorName` – dokumentet blir
igjen privat og forsvinner fra collection-group-spørringene.

Sikkerhetsreglene tillater lesing av offentlige dokumenter med
en egen collection-group-match:

```
match /{path=**}/userGlimts/{docId} {
  allow read: if request.auth != null
              && resource.data.isPublic == true;
}
match /{path=**}/myCreatedGlimt/{docId} {
  allow read: if request.auth != null
              && resource.data.isPublic == true;
}
```

Private dokumenter (uten `isPublic: true`) er fortsatt utilgjengelige
for andre brukere, og skriving er fortsatt kun tillatt for eieren.

## Collection-group-indeks

Firestore krever en indeks for collection-group-spørringer som
filtrerer på felt. Første gang utforsk-siden lastes, vil Firestore
returnere en feilmelding i konsollen med en lenke som oppretter
indeksen automatisk. Klikk på den, vent 1-2 minutter, og prøv igjen.

Alternativt kan du opprette indeksene manuelt:
- Collection ID: `userGlimts`, Scope: Collection group, Field: `isPublic` (Ascending)
- Collection ID: `myCreatedGlimt`, Scope: Collection group, Field: `isPublic` (Ascending)

## Offline-støtte

`glimt-store.js` prøver å skru på Firestore sin offline-cache
(`enablePersistence`). Det gjør at lagrede glimt kan leses selv
uten nettforbindelse, og skriv-operasjoner synkroniseres når
nettet kommer tilbake. Støtte varierer per nettleser – koden
feiler stille hvis det ikke kan aktiveres.

---

## Tester

Legacy-testsiden `tests/test-saved-glimt.html` manipulerer
localStorage direkte og vil ikke fungere mot Firestore-lagringen
uten tilpasning. Den er trygg å beholde som arkivdokumentasjon
av det gamle formatet.
