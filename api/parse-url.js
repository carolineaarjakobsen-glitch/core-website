// ============================================================
//  Glimt – Vercel serverless function
//  POST /api/parse-url  →  Henter en nettside og bruker Claude
//  til å trekke ut strukturert glimt-data (tittel, beskrivelse,
//  adresse, by, type, kostnad osv.) fra innholdet.
// ============================================================

const Anthropic = require("@anthropic-ai/sdk");

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "Mangler URL" });

  // Valider URL
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: "Ugyldig URL-protokoll" });
    }
  } catch {
    return res.status(400).json({ error: "Ugyldig URL" });
  }

  try {
    // ── Hent nettsiden ──────────────────────────────────────
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(parsedUrl.href, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GlimtBot/1.0; +https://glimt.app)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "no,nb,en;q=0.8",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(502).json({
        error: `Kunne ikke hente siden (HTTP ${response.status})`,
      });
    }

    const html = await response.text();

    // Begrens til 15 000 tegn for å holde tokens nede
    const trimmed = html.length > 15000
      ? html.slice(0, 15000) + "\n... (avkortet)"
      : html;

    // ── Send til Claude for å ekstrahere data ───────────────
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `Du er en hjelpsom assistent som trekker ut strukturert informasjon fra nettsider for en reise-app kalt Glimt.

Brukeren har limt inn en lenke til en nettside. Analyser HTML-innholdet og trekk ut all relevant informasjon for å opprette et "glimt" (en enkeltaktivitet/opplevelse).

Returner KUN et gyldig JSON-objekt (ingen annen tekst, ingen markdown) med disse feltene:
{
  "title": "Kort, fengende tittel for aktiviteten (maks 60 tegn)",
  "desc": "Engasjerende beskrivelse på 1-3 setninger som gjør at folk vil prøve dette. Skriv på norsk.",
  "sted": "Fullstendig adresse eller stedsnavn",
  "city": "Bynavn (f.eks. Roma, København, Stockholm, Dublin, Gardasjøen)",
  "tips": "Et nyttig tips for besøkende. Skriv på norsk.",
  "image": "URL til hovedbildet på siden (eller tom streng hvis ikke funnet)",
  "kostnad": "Prisnivå som fritekst (f.eks. 'Gratis', 'Ca. 15–20 €', '200 kr per person')",
  "emoji": "Én passende emoji (f.eks. 🍕 🏛️ 🌅 🏃 🍷)",
  "hvem": ["array av hvem det passer for: 'alene', 'par', 'venner', 'familie'"],
  "budsjett": ["array av budsjett-tags: 'gratis', 'lav', 'middels', 'høy'"],
  "stemning": ["array av stemnings-tags: 'rolig', 'aktiv', 'kulturell', 'mat', 'romantisk', 'eventyr'"],
  "tidspunkt": ["array av tidspunkt-tags: 'formiddag', 'ettermiddag', 'kveld', 'hel_dag'"],
  "aktivitetsniva": "lavt, middels, eller høyt",
  "varighet": "under1, 1-2, 2-4, halvdag, eller heldag"
}

Viktige regler:
- Skriv beskrivelse og tips på NORSK, uansett språket på nettsiden
- Gjett intelligent basert på konteksten — en restaurant er typisk "mat", kveld, par/venner etc.
- For budsjett: gratis = gratis, lav = under 200kr, middels = 200-500kr, høy = over 500kr
- Hvis du ikke kan finne viss informasjon, gi ditt beste estimat basert på typen sted/aktivitet
- Returner KUN valid JSON, absolutt ingen annen tekst

URL: ${parsedUrl.href}

HTML-innhold:
${trimmed}`;

    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    // Parse svaret
    const rawText = msg.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    // Prøv å finne JSON i svaret
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      // Prøv å hente JSON fra markdown-blokk
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        return res.status(500).json({
          error: "Kunne ikke tolke data fra siden",
        });
      }
    }

    return res.status(200).json({ success: true, data });

  } catch (err) {
    console.error("parse-url feil:", err);

    if (err.name === "AbortError") {
      return res.status(504).json({
        error: "Tidsavbrudd – siden tok for lang tid å laste",
      });
    }

    return res.status(500).json({
      error: err.message || "Ukjent feil under henting av lenken",
    });
  }
};
