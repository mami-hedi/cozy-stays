import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  preferences: z.string().trim().min(3).max(5000),
  candidats: z
    .array(
      z.object({
        id: z.string().max(100),
        titre: z.string().max(200),
        ville: z.string().max(100),
        type: z.string().max(50),
        voyageurs: z.number(),
        chambres: z.number(),
        prixNuit: z.number(),
        note: z.number(),
        equipements: z.array(z.string().max(80)).max(30),
        description: z.string().max(1500),
      }),
    )
    .max(50),
});

export const obtenirRecommandations = createServerFn({ method: "POST" })
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data }) => {
    const { recommander, GatewayError } = await import("./recommandations.server");
    try {
      return { ok: true as const, recommandations: await recommander(data.preferences, data.candidats) };
    } catch (e) {
      if (e instanceof GatewayError) return { ok: false as const, erreur: e.message };
      return { ok: false as const, erreur: "Une erreur est survenue." };
    }
  });
