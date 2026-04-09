# Firebase-oppsett for CORE – innlogging

Følg disse stegene én gang, så er innloggingen klar til bruk.

---

## Steg 1 – Opprett Firebase-prosjekt

1. Gå til **console.firebase.google.com** og logg inn med Google-kontoen din
2. Klikk **"Add project"** (eller "Legg til prosjekt")
3. Gi prosjektet et navn, f.eks. `core-reiseapp`
4. Du kan slå av Google Analytics hvis du vil (ikke nødvendig)
5. Klikk **"Create project"**

---

## Steg 2 – Legg til en web-app

1. I Firebase-konsollen, klikk på ikonet **`</>`** (Web)
2. Gi appen et kallenavn, f.eks. `core-web`
3. **Ikke** huk av for Firebase Hosting (ikke nødvendig nå)
4. Klikk **"Register app"**
5. Du får nå opp et kodeblokk med `firebaseConfig` – **kopier innholdet**

Åpne filen `firebase-config.js` i prosjektmappen og erstatt verdiene:

```js
const firebaseConfig = {
  apiKey:            "lim inn din apiKey her",
  authDomain:        "lim inn din authDomain her",
  projectId:         "lim inn din projectId her",
  storageBucket:     "lim inn din storageBucket her",
  messagingSenderId: "lim inn din messagingSenderId her",
  appId:             "lim inn din appId her"
};
```

---

## Steg 3 – Aktiver innloggingsmetoder

I Firebase-konsollen, gå til **Authentication → Sign-in method**

### Google (enklest)
1. Klikk **Google** i listen
2. Slå på **Enable**
3. Velg din e-post som support-e-post
4. Klikk **Save**
✅ Google-innlogging er nå klar

### E-post / passord
1. Klikk **Email/Password**
2. Slå på **Enable** (den øverste – ikke "Email link")
3. Klikk **Save**
✅ E-post/passord-innlogging er nå klar

### Facebook
Facebook krever et ekstra steg – du trenger en Facebook-utviklerkonto:

1. Gå til **developers.facebook.com** og opprett en app (velg "Consumer")
2. Under **Facebook Login → Settings**, legg til din OAuth redirect URI.
   Redirect URI-en finner du i Firebase-konsollen under **Authentication → Sign-in method → Facebook**
   (den ser slik ut: `https://DITT-PROSJEKT.firebaseapp.com/__/auth/handler`)
3. Kopier **App ID** og **App Secret** fra Facebook Developer Console
4. Lim dem inn i Firebase under **Authentication → Sign-in method → Facebook**
5. Klikk **Save**
✅ Facebook-innlogging er klar

---

## Steg 4 – Legg til autorisert domene

Når du skal publisere nettsiden (f.eks. på GitHub Pages eller Netlify):

1. Gå til **Authentication → Settings → Authorized domains**
2. Klikk **Add domain**
3. Skriv inn domenet ditt (f.eks. `carolineaar.github.io` eller `core.no`)

Lokalt fungerer `localhost` allerede uten noe ekstra oppsett.

---

## Ferdig!

Når `firebase-config.js` er oppdatert med dine verdier og innloggingsmetodene er aktivert, fungerer innloggingen automatisk på alle sider.
