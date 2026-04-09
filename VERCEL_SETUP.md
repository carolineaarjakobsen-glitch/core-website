# Vercel-oppsett for CORE – AI-aktivitetsforslag

Vercel gir deg gratis hosting + serverless functions som kan kalle Claude API.
Siden du allerede har GitHub, tar dette ca. 5 minutter.

---

## Steg 1 – Hent Anthropic API-nøkkel

1. Gå til **console.anthropic.com** og logg inn (eller opprett en konto)
2. Gå til **API Keys → Create Key**
3. Gi den et navn, f.eks. `core-website`
4. Kopier nøkkelen – du bruker den i Steg 3

---

## Steg 2 – Koble GitHub til Vercel

1. Gå til **vercel.com** og klikk **Sign Up** → velg **Continue with GitHub**
2. Etter innlogging, klikk **Add New → Project**
3. Finn og velg ditt GitHub-repo: `carolineaarjakobsen-glitch/core-website`
4. Klikk **Import**
5. La alle innstillinger stå som de er (Vercel oppdager automatisk at det er en statisk side med API-funksjoner)
6. Klikk **Deploy**

---

## Steg 3 – Legg til API-nøkkel som miljøvariabel

1. Etter deploy, gå til **Settings → Environment Variables** i Vercel-prosjektet
2. Klikk **Add New**
3. Fyll inn:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** nøkkelen du kopierte i Steg 1
4. Klikk **Save**
5. Gå til **Deployments** og klikk **Redeploy** (nødvendig for at env-variabelen skal bli aktiv)

---

## Steg 4 – Fremtidige oppdateringer

Hver gang du pusher kode til GitHub (`git push`), vil Vercel automatisk bygge og deploye den nye versjonen. Du trenger ikke gjøre noe manuelt.

---

## Ferdig!

Nettsiden din vil nå ligge på en URL som ligner:
`https://core-website-abc123.vercel.app`

Aktivitetsfilteret på `explore.html` kaller `/api/suggest` som igjen kaller Claude API og returnerer skreddersydde forslag basert på brukerens preferanser.

---

## Kostnader

- **Vercel:** Gratis (Hobby-plan dekker godt mer enn nok for dette prosjektet)
- **Anthropic API:** Betalt per bruk – ca. $0.003 per forespørsel med claude-opus-4-6 (altså 3 øre per søk)
