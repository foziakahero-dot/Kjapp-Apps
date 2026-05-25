import { supabase } from "@/lib/supabase/client";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}


export async function sendMessage(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke("kjapp-ai", {
      body: { mode: "customer", messages: messages.slice(-10), message: userMessage },
    });
    if (error) throw error;
    if (data?.reply) return data.reply;
  } catch (error) {
    console.warn("KJAPP AI edge fallback:", error);
  }

  return getFallbackResponse(userMessage);
}

function getFallbackResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("hei") || lower.includes("hallo")) {
    return "Hei! 👋 Jeg er KJAPP AI. Hvor skal du i dag? Jeg kan hjelpe deg med å bestille en tur, estimere pris, eller gi anbefalinger.";
  }

  if (lower.includes("pris") || lower.includes("kost") || lower.includes("kr")) {
    return "Her er våre priseksempler:\n\n🚗 KJAPP Standard: fra 89 kr\n🚙 KJAPP XL: fra 129 kr\n⭐ KJAPP Premium: fra 199 kr\n\nSi meg hvor du skal, så gir jeg et nøyaktig estimat!";
  }

  if (lower.includes("gardermoen") || lower.includes("flyplass")) {
    return "✈️ Til Gardermoen fra Oslo sentrum:\n\n🚗 KJAPP: 699 kr (ca. 35 min)\n⭐ KJAPP Premium: 899 kr (ca. 35 min)\n\nSkal jeg bestille en tur til flyplassen?";
  }

  if (lower.includes("bestill") || lower.includes("tur") || lower.includes("taxi")) {
    return "Selvfølgelig! 🚗 For å bestille trenger jeg:\n\n📍 Hvor skal jeg hente deg?\n🎯 Hvor skal du?\n\nEllers kan du bruke kartet for å velge direkte.";
  }

  if (lower.includes("oslo s") || lower.includes("sentrum")) {
    return "🏙️ Oslo Sentralstasjon er et populært mål!\n\nFra din posisjon estimerer jeg:\n🚗 KJAPP: ~129 kr (8 min)\n\nSkal jeg bestille?";
  }

  if (lower.includes("anbefal") || lower.includes("foreslå")) {
    return "Her er mine anbefalinger basert på tidspunktet:\n\n🍽️ Aker Brygge - Restauranter og utsikt\n🛍️ Karl Johan - Shopping\n🌳 Frognerparken - Utendørs\n🎭 Operaen - Kultur\n\nVil du at jeg bestiller til et av disse stedene?";
  }

  return "Jeg kan hjelpe deg med:\n\n🚗 Bestille taxi\n💰 Estimere pris\n📍 Foreslå destinasjoner\n⏱️ Sjekke ventetid\n\nBare si hva du trenger!";
}

export async function getDriverAIResponse(context: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke("kjapp-ai", {
      body: { mode: "driver", message: context },
    });
    if (error) throw error;
    if (data?.reply) return data.reply;
  } catch (error) {
    console.warn("KJAPP Driver AI edge fallback:", error);
  }

  return getDriverFallbackResponse(context);
}

function getDriverFallbackResponse(context: string): string {
  const lower = context.toLowerCase();

  if (lower.includes("trafikk")) {
    return "🚦 Trafikktips:\n\nE18 vestover har kø nå. Anbefaler Ring 3 via Sinsen.\nEstimert forsinkelse på E18: 12 min.";
  }

  if (lower.includes("tjene") || lower.includes("inntekt")) {
    return "💰 Tips for å tjene mer:\n\n• Rush-tid (07-09, 15-17) gir 1.5x pris\n• Gardermoen-turer gir best inntekt\n• Aker Brygge/Tjuvholmen er populært kveldstid";
  }

  return "🚗 KJAPP AI Sjåfør-tips:\n\n• Neste rush-tid: 15:00-17:00\n• Populært nå: Oslo S-området\n• Vær: Klart, gode kjøreforhold\n\nSpør meg om ruter, trafikk eller tips!";
}
