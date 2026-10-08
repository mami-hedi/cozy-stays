import { useState } from "react";
import { SITE_NAME, SITE_BASELINE } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { ListingCard } from "@/components/ListingCard";
import {
  useStore,
  annoncesVisibles,
  profilVoyageur,
  enregistrerRecherche,
  effacerHistorique,
} from "@/lib/reservations";
import { obtenirRecommandations } from "@/lib/recommandations.functions";

export const Route = createFileRoute("/conseiller")({
  head: () => ({
    meta: [
      { title: `Conseiller IA — Trouvez le logement idéal | ${SITE_NAME}` },
      {
        name: "description",
        content:
          "Décrivez votre séjour idéal et recevez des recommandations de logements personnalisées.",
      },
      { property: "og:title", content: `Conseiller IA — ${SITE_NAME}` },
      {
        property: "og:description",
        content: "Des recommandations de logements adaptées à vos envies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Conseiller,
});

const envies = ["Piscine", "Vue mer", "Calme", "Famille", "Médina", "Budget serré", "Plage à pied"];

type Reco = { id: string; score: number; raison: string };

function Conseiller() {
  const store = useStore();
  const listings = annoncesVisibles(store);
  const recommander = useServerFn(obtenirRecommandations);

  const [voyageurs, setVoyageurs] = useState(2);
  const [budget, setBudget] = useState(150);
  const [choix, setChoix] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [resultats, setResultats] = useState<Reco[] | null>(null);

  const historique = profilVoyageur(store);
  const [titre, setTitre] = useState("Nos recommandations");

  async function lancer(e: React.FormEvent) {
    e.preventDefault();
    const criteres = [
      `${voyageurs} voyageurs`,
      `budget ${budget} TND/nuit`,
      choix.join(", "),
      details.trim(),
    ]
      .filter(Boolean)
      .join(", ");
    enregistrerRecherche(`Conseiller : ${criteres}`);
    setTitre("Nos recommandations");
    await appeler(
      [
        `Voyageurs : ${voyageurs}`,
        `Budget max par nuit : ${budget} TND`,
        choix.length ? `Envies : ${choix.join(", ")}` : "",
        details.trim() ? `Détails : ${details.trim()}` : "",
        historique
          ? `\nHistorique du voyageur (à utiliser comme contexte secondaire) :\n${historique}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  async function pourVous() {
    setTitre("Sélection personnalisée pour vous");
    await appeler(
      `Aucun critère explicite : déduis les goûts du voyageur de son historique et propose des logements qu'il n'a pas encore réservés de préférence.\n${historique}`,
    );
  }

  async function appeler(preferences: string) {
    setChargement(true);
    setErreur(null);
    setResultats(null);
    try {
      const res = await recommander({
        data: {
          preferences,
          candidats: listings.map((l) => ({
            id: l.id,
            titre: l.titre,
            ville: l.ville,
            type: l.type,
            voyageurs: l.voyageurs,
            chambres: l.chambres,
            prixNuit: l.prixNuit,
            note: l.note,
            equipements: l.equipements,
            description: l.description.slice(0, 1500),
          })),
        },
      });
      if (res.ok) setResultats(res.recommandations);
      else setErreur(res.erreur);
    } catch {
      setErreur("Impossible de contacter le conseiller. Réessayez.");
    } finally {
      setChargement(false);
    }
  }

  const toggle = (v: string) =>
    setChoix((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16">
        <span className="inline-block rounded-full bg-lilac px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-ink">
          ✨ Conseiller IA
        </span>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold">
          Votre séjour idéal, en quelques mots
        </h1>
        <p className="mt-3 max-w-xl text-lg text-inksoft">
          Indiquez vos préférences, notre assistant sélectionne les logements qui vous
          correspondent.
        </p>

        <div className="mt-8 rounded-[2rem] bg-sage clay p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Pour vous</h2>
              <p className="mt-1 text-ink/80">
                {historique
                  ? `Basé sur ${store.recherches.length} recherche(s) et ${store.reservations.length} réservation(s).`
                  : "Faites une recherche ou une réservation pour obtenir des suggestions personnalisées."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={pourVous}
                disabled={!historique || chargement}
                className="rounded-2xl bg-terra clay px-6 py-3 font-bold text-cream disabled:opacity-50"
              >
                Voir mes suggestions
              </button>
              {store.recherches.length > 0 && (
                <button
                  type="button"
                  onClick={effacerHistorique}
                  className="rounded-2xl bg-cream px-4 py-3 text-sm font-semibold text-inksoft"
                >
                  Effacer mes recherches
                </button>
              )}
            </div>
          </div>
          {store.recherches.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2 text-xs">
              {store.recherches.slice(0, 5).map((r) => (
                <li key={r.id} className="rounded-full bg-cream px-3 py-1 text-inksoft">
                  {r.resume}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          onSubmit={lancer}
          className="mt-8 grid gap-6 rounded-[2rem] bg-surface clay p-6 md:grid-cols-2"
        >
          <div>
            <label htmlFor="voy" className="text-xs font-bold uppercase tracking-wide text-inksoft">
              Voyageurs
            </label>
            <input
              id="voy"
              type="number"
              min={1}
              max={12}
              value={voyageurs}
              onChange={(e) => setVoyageurs(Number(e.target.value) || 1)}
              className="mt-2 w-full rounded-2xl bg-cream px-4 py-3 font-semibold"
            />
          </div>
          <div>
            <label htmlFor="bud" className="text-xs font-bold uppercase tracking-wide text-inksoft">
              Budget max / nuit : {budget} TND
            </label>
            <input
              id="bud"
              type="range"
              min={40}
              max={300}
              step={10}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mt-4 w-full accent-terra"
            />
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wide text-inksoft">Envies</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {envies.map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={choix.includes(v)}
                  onClick={() => toggle(v)}
                  className={
                    choix.includes(v)
                      ? "rounded-2xl bg-sage px-3.5 py-2 text-sm font-bold text-ink"
                      : "rounded-2xl bg-cream px-3.5 py-2 text-sm font-semibold text-inksoft"
                  }
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="det" className="text-xs font-bold uppercase tracking-wide text-inksoft">
              Décrivez votre séjour (facultatif)
            </label>
            <textarea
              id="det"
              rows={3}
              maxLength={800}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Ex. : week-end romantique, terrasse pour les couchers de soleil, proche des cafés…"
              className="mt-2 w-full rounded-2xl bg-cream px-4 py-3"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={chargement}
              className="rounded-2xl bg-terra clay px-7 py-3.5 font-bold text-cream disabled:opacity-60"
            >
              {chargement ? "Analyse en cours…" : "Trouver mes logements"}
            </button>
          </div>
        </form>

        <div aria-live="polite" className="mt-10">
          {erreur && (
            <div className="rounded-[1.75rem] bg-surface clay p-6 font-semibold text-terra">
              {erreur}
            </div>
          )}
          {resultats && resultats.length === 0 && (
            <div className="rounded-[1.75rem] bg-surface clay p-6">
              Aucun logement ne correspond vraiment. Essayez d'élargir vos critères.
            </div>
          )}
          {resultats && resultats.length > 0 && (
            <>
              <h2 className="text-3xl font-semibold">{titre}</h2>
              <div className="mt-6 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {resultats.map((r) => {
                  const l = listings.find((x) => x.id === r.id);
                  if (!l) return null;
                  return (
                    <div key={r.id}>
                      <ListingCard listing={l} />
                      <div className="mt-3 rounded-2xl bg-butter/60 p-4 text-sm">
                        <p className="font-bold">Compatibilité {r.score} %</p>
                        <p className="mt-1 text-ink/80">{r.raison}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
