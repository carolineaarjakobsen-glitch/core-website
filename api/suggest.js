// ============================================================
//  Glimt – Vercel serverless function
//  POST /api/suggest  →  Claude genererer aktivitetsforslag
// ============================================================

const Anthropic = require("@anthropic-ai/sdk");

module.exports = async function handler(req, res) {
  // CORS – tillat kall fra alle origins (static site)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { city, med_hvem, budsjett, stemning, tidspunkt } = req.body || {};

  if (!city) return res.status(400).json({ error: "Mangler by" });

  // Bygg prompt basert på filtrene brukeren valgte
  const filterLines = [
    med_hvem  && `- Hvem er du med: ${med_hvem}`,
    budsjett  && `- Budsjett: ${budsjett}`,
    stemning  && `- Stemning / type aktivitet: ${stemning}`,
    tidspunkt && `- Tidspunkt: ${tidspunkt}`,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `Du er en entusiastisk lokal ekspert på ${city} med inngående kjennskap til alle bydeler, skjulte perler og lokale favoritter.

En turist ber om aktivitetsforslag med disse preferansene:
${filterLines || "- Ingen spesifikke preferanser (overrask meg!)"}

Foreslå nøyaktig 4 konkrete, autentiske aktiviteter i ${city}. Unngå kjedelige turistfeller – tenk som en lokal.

Returner KUN et gyldig JSON-array (ingen annen tekst), der hvert objekt har disse feltene:
{
  "title": "Kort, fengende tittel",
  "emoji": "Ett relevant emoji",
  "desc": "2–3 setninger med levende beskrivelse, lokalt forankret",
  "sted": "Konkret stedsnavn og gjerne gate/bydel i ${city}",
  "kostnad": "F.eks. Gratis, Ca. 120 kr, 200–400 kr per person",
  "tid": "F.eks. 1–2 timer, Halvdag, Hel kveld",
  "tips": "Ett konkret insidertips som bare en lokal ville visst"
}`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].text.trim();

    // Trekk ut JSON-arrayet fra svaret
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("AI returnerte ikke gyldig JSON");

    const activities = JSON.parse(jsonMatch[0]);

    return res.status(200).json({ activities });
  } catch (err) {
    console.error("suggest error:", err);
    return res.status(500).json({ error: "Kunne ikke hente forslag. Prøv igjen." });
  }
};
