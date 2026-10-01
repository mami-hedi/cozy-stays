import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const RUN_HEADER = "X-Lovable-AIG-Run-ID";

function runIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId && !headers.has(RUN_HEADER)) headers.set(RUN_HEADER, runId);
    const res = await fetch(input, { ...init, headers });
    runId ??= res.headers.get(RUN_HEADER)?.trim() || undefined;
    return res;
  };
}

export type Candidat = {
  id: string;
  titre: string;
  ville: string;
  type: string;
  voyageurs: number;
  chambres: number;
  prixNuit: number;
  note: number;
  equipements: string[];
  description: string;
};

export type Reco = { id: string; score: number; raison: string };

export class GatewayError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function recommander(preferences: string, candidats: Candidat[]): Promise<Reco[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new GatewayError("Service IA non configuré.", 401);
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch(),
  });

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system:
      "Tu es un conseiller de voyage pour une plateforme de location en Tunisie. " +
      "À partir des préférences du voyageur et de la liste de logements (JSON), choisis au maximum 3 logements les plus adaptés. " +
      'Réponds UNIQUEMENT avec du JSON : {"recommandations":[{"id":"...","score":0-100,"raison":"une phrase en français, max 30 mots"}]}. ' +
      "N'utilise que des id présents dans la liste.",
    prompt: `Préférences du voyageur :\n${preferences}\n\nLogements :\n${JSON.stringify(candidats)}`,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  let text: string;
  try {
    text = await result.text;
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode ?? 500;
    const msg =
      status === 429
        ? "Trop de demandes, réessayez dans un instant."
        : status === 402
          ? "Crédits IA épuisés. Ajoutez des crédits à l'espace de travail."
          : "Le service de recommandation est indisponible.";
    throw new GatewayError(msg, status);
  }

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]) as { recommandations?: Reco[] };
    const ids = new Set(candidats.map((c) => c.id));
    return (parsed.recommandations ?? [])
      .filter((r) => r && ids.has(r.id))
      .slice(0, 3)
      .map((r) => ({
        id: r.id,
        score: Math.max(0, Math.min(100, Math.round(Number(r.score) || 0))),
        raison: String(r.raison ?? "").slice(0, 300),
      }));
  } catch {
    return [];
  }
}
