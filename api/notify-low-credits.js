// ============================================================
//  Glimt – Vercel serverless function
//  POST /api/notify-low-credits  →  Sender e-postvarsel når
//  Anthropic API-kredittene er tomme eller lave.
//  Bruker Resend (gratis, 100 e-poster/mnd).
// ============================================================

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "caroline.aar.jakobsen@gmail.com";

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY mangler i miljøvariabler");
    return res.status(500).json({ error: "E-postvarsel er ikke konfigurert" });
  }

  const { reason } = req.body || {};

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Glimt <onboarding@resend.dev>",
        to: [NOTIFY_EMAIL],
        subject: "⚠️ Glimt: API-kredittene er snart tomme",
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #8B4513;">Glimt – Kredittvarsel</h2>
            <p>Autofyll-funksjonen i Glimt kunne ikke fullføres fordi Anthropic API-kredittene er lave eller tomme.</p>
            <p><strong>Grunn:</strong> ${reason || "Kreditter oppbrukt"}</p>
            <p>For å fikse dette:</p>
            <ol>
              <li>Gå til <a href="https://console.anthropic.com/settings/billing">Anthropic Billing</a></li>
              <li>Klikk "Buy credits"</li>
              <li>Legg til $5–10 (holder i flere tusen kall)</li>
            </ol>
            <p style="color: #999; font-size: 13px;">Denne e-posten sendes maks én gang per time for å unngå spam.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Resend-feil:", text);
      return res.status(502).json({ error: "Kunne ikke sende e-post" });
    }

    return res.status(200).json({ success: true, message: "Varsel sendt" });

  } catch (err) {
    console.error("notify-low-credits feil:", err);
    return res.status(500).json({ error: "Feil ved sending av varsel" });
  }
};
