import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function fallback(mode: string, message: string) {
  const lower = (message || "").toLowerCase();
  if (mode === "driver") {
    if (lower.includes("tjene") || lower.includes("inntekt")) return "💰 Pilot-tips: hold deg rundt Oslo S, Aker Brygge og Majorstuen. Gå online før rush og aksepter korte turer raskt for å holde flyt.";
    if (lower.includes("trafikk")) return "🚦 Sjekk E18/Ring 3 før du aksepterer langtur. Ved kø: informer kunden tidlig og velg tryggeste rute.";
    return "🚗 KJAPP Sjåfør AI: hold appen online, vær presis på hentested og oppdater turstatus når du ankommer.";
  }
  if (lower.includes("gardermoen")) return "✈️ Til Gardermoen fra Oslo sentrum estimerer jeg ca. 699–899 kr avhengig av tid og trafikk. Vil du bestille?";
  if (lower.includes("pris") || lower.includes("koster")) return "KJAPP-estimat: kort tur 89–129 kr, medium tur 129–199 kr, lang tur 199–349 kr. Skriv hentested og destinasjon for bedre estimat.";
  if (lower.includes("bestill") || lower.includes("taxi") || lower.includes("tur")) return "Klart 🚗 Skriv hentested og destinasjon, eller gå til hjemskjermen og trykk Bestill KJAPP.";
  return "Hei! Jeg er KJAPP AI. Jeg kan hjelpe med bestilling, prisestimat, rute og pilotspørsmål.";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "driver" ? "driver" : "customer";
    const message = String(body.message || "");
    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      return Response.json({ reply: fallback(mode, message), source: "fallback" }, { headers: corsHeaders });
    }

    const system = mode === "driver"
      ? "Du er KJAPP AI for taxisjåfører i Norge. Svar kort, konkret og trygt på norsk bokmål."
      : "Du er KJAPP AI, en norsk taxi-assistent. Svar kort, vennlig og praktisk på norsk bokmål.";

    const messages = [
      { role: "system", content: system },
      ...Array.isArray(body.messages) ? body.messages.slice(-8).map((m: any) => ({ role: m.role === "user" ? "user" : "assistant", content: String(m.content || "") })) : [],
      { role: "user", content: message },
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: 260, temperature: 0.5 }),
    });

    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    return Response.json({ reply: data.choices?.[0]?.message?.content || fallback(mode, message), source: "openai" }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ reply: fallback("customer", ""), error: String(error?.message || error), source: "error_fallback" }, { headers: corsHeaders, status: 200 });
  }
});
