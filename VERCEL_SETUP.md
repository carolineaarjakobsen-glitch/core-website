# Flytte Glimt fra GitHub Pages til Vercel

GitHub Pages kan bare servere statiske filer (HTML, CSS, JS). Vercel gjør det samme, men støtter også **serverless functions** — små backend-funksjoner som kjører i `/api/`-mappen. Det er disse vi trenger for autofill-funksjonen (som kaller Claude API).

Vercel er gratis for personlige prosjekter. Du trenger bare en GitHub-konto (som du allerede har).

---

## Steg 1 — Opprett Vercel-konto

1. Gå til **vercel.com** og klikk **Sign Up**
2. Velg **Continue with GitHub**
3. Godkjenn at Vercel får tilgang til GitHub-kontoen din

---

## Steg 2 — Importer prosjektet

1. Etter innlogging, klikk **Add New → Project**
2. Finn og velg repoet: **core-website**
3. Klikk **Import**
4. Under "Configure Project":
   - **Framework Preset**: la stå på "Other"
   - **Build Command**: la stå tom
   - **Output Directory**: la stå på `.`
5. Klikk **Deploy**

Vercel oppdager automatisk `vercel.json` og `api/`-mappen.

---

## Steg 3 — Legg til API-nøkkel

Autofill-funksjonen bruker Anthropic (Claude) API. Du trenger en API-nøkkel:

1. Gå til **console.anthropic.com** → logg inn eller opprett konto
2. Gå til **API Keys → Create Key** → gi den et navn, f.eks. `glimt`
3. Kopier nøkkelen

Deretter i Vercel:

1. Gå til prosjektet ditt → **Settings → Environment Variables**
2. Legg til:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** nøkkelen du kopierte
3. Klikk **Save**
4. Gå til **Deployments** → klikk **Redeploy** på siste deploy (slik at nøkkelen aktiveres)

---

## Steg 4 — Pek domenet ditt (valgfritt)

Vercel gir deg en URL som `core-website-abc123.vercel.app`. Hvis du vil bruke et eget domene, gå til **Settings → Domains** i Vercel-prosjektet.

Hvis du brukte GitHub Pages med et custom domain, må du oppdatere DNS-innstillingene til å peke mot Vercel i stedet.

---

## Steg 5 — Deaktiver GitHub Pages (valgfritt)

Etter at Vercel fungerer, kan du deaktivere GitHub Pages:

1. Gå til GitHub-repoet → **Settings → Pages**
2. Sett **Source** til **None**

---

## Hvordan fungerer det etterpå?

- Hver gang du pusher til GitHub (`git push`), deployer Vercel automatisk
- Statiske filer (HTML, CSS, JS) serveres som vanlig
- Filer i `/api/`-mappen blir serverless functions
- Du trenger ikke endre noe i hvordan du jobber med koden — `git add`, `git commit`, `git push` fungerer akkurat som før

---

## Kostnader

- **Vercel Hobby (gratis):** 100 GB båndbredde/mnd, 100 000 serverless-kall/mnd
- **Anthropic API:** ca. $0.003 per autofill-kall (3 øre)
