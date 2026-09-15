import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { getListing, prixSejour, formatTND } from "@/lib/listings";

export const Route = createFileRoute("/logement/$id")({
  loader: ({ params }) => {
    const listing = getListing(params.id);
    if (!listing) throw notFound();
    return { listing };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Logement introuvable — Maison" }, { name: "robots", content: "noindex" }],
      };
    }
    const { listing } = loaderData;
    const titre = `${listing.titre}, ${listing.ville} — Maison`;
    const desc = `${listing.type} pour ${listing.voyageurs} voyageurs à ${listing.ville}. ${listing.prixNuit} TND la nuit, confirmation instantanée.`;
    return {
      meta: [
        { title: titre },
        { name: "description", content: desc },
        { property: "og:title", content: titre },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: LogementPage,
});

function LogementPage() {
  const { listing } = Route.useLoaderData();
  const [nuits, setNuits] = useState(6);
  const [reserve, setReserve] = useState(false);
  const prix = prixSejour(listing, nuits);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16">
        <Link to="/recherche" className="text-sm font-bold text-inksoft hover:text-ink">
          ← Retour aux résultats
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <img
              src={listing.image}
              alt={`${listing.titre} à ${listing.ville}`}
              width={1088}
              height={800}
              className="w-full aspect-[4/3] rounded-[2rem] object-cover clay"
            />

            <div className="mt-8 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-4xl font-semibold">{listing.titre}</h1>
                <p className="mt-2 text-inksoft">
                  {listing.ville} · {listing.voyageurs} voyageurs · {listing.chambres} chambres ·{" "}
                  {listing.lits} lits · {listing.sdb} sdb
                </p>
              </div>
              <span className="rounded-full bg-butter px-3 py-1.5 text-sm font-bold">
                ★ {listing.note.toFixed(1).replace(".", ",")} · {listing.avis} avis
              </span>
            </div>

            <p className="mt-6 text-lg leading-relaxed text-ink/80">{listing.description}</p>
            <p className="mt-3 text-sm font-semibold text-inksoft">Hôte : {listing.hote}</p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-[1.75rem] bg-surface clay p-6">
                <h2 className="text-xl font-semibold">Équipements</h2>
                <ul className="mt-3 space-y-2 text-inksoft">
                  {listing.equipements.map((e) => (
                    <li key={e}>· {e}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[1.75rem] bg-surface clay p-6">
                <h2 className="text-xl font-semibold">Règles de la maison</h2>
                <ul className="mt-3 space-y-2 text-inksoft">
                  {listing.regles.map((r) => (
                    <li key={r}>· {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <aside className="h-fit lg:sticky lg:top-8 rounded-[1.75rem] bg-surface clay p-6">
            <p className="text-2xl font-bold">
              {listing.prixNuit}{" "}
              <span className="text-base font-semibold text-inksoft">TND / nuit</span>
            </p>

            <label className="mt-5 block text-xs font-bold uppercase tracking-wide text-inksoft">
              Nombre de nuits
            </label>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNuits((n) => Math.max(1, n - 1))}
                className="size-10 rounded-2xl bg-cream text-lg font-bold"
                aria-label="Retirer une nuit"
              >
                −
              </button>
              <span className="min-w-10 text-center text-lg font-bold">{nuits}</span>
              <button
                type="button"
                onClick={() => setNuits((n) => Math.min(30, n + 1))}
                className="size-10 rounded-2xl bg-cream text-lg font-bold"
                aria-label="Ajouter une nuit"
              >
                +
              </button>
            </div>

            <div className="mt-6 space-y-2.5 border-t border-border pt-5 text-sm">
              <div className="flex justify-between">
                <span className="text-inksoft">
                  {listing.prixNuit} TND × {nuits} nuits
                </span>
                <span className="font-semibold">{formatTND(prix.sousTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-inksoft">Frais de ménage</span>
                <span className="font-semibold">{formatTND(prix.fraisMenage)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-inksoft">Frais de service (10 %)</span>
                <span className="font-semibold">{formatTND(prix.service)}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-between border-t border-border pt-5">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold">{formatTND(prix.total)}</span>
            </div>

            <button
              type="button"
              onClick={() => setReserve(true)}
              className="mt-6 w-full rounded-2xl bg-terra clay px-6 py-3.5 text-base font-bold text-cream transition-transform hover:-translate-y-0.5"
            >
              Réserver
            </button>
            <p className="mt-3 text-center text-xs font-semibold text-inksoft">
              Confirmation instantanée · démonstration, aucun paiement réel
            </p>
            {reserve && (
              <p className="mt-4 rounded-2xl bg-sage px-4 py-3 text-sm font-semibold text-ink">
                Réservation confirmée pour {nuits} nuits à {listing.titre}.
              </p>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
