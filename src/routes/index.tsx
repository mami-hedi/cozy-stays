import { SITE_NAME, SITE_BASELINE, SITE_DESCRIPTION } from "@/lib/site";
import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { ListingCard } from "@/components/ListingCard";
import { useStore, annoncesVisibles, isoDate } from "@/lib/reservations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE_NAME} — ${SITE_BASELINE}` },
      {
        name: "description",
        content: SITE_DESCRIPTION,
      },
      { property: "og:title", content: `${SITE_NAME} — ${SITE_BASELINE}` },
      {
        property: "og:description",
        content: "Villas, appartements et refuges d'exception, réservés simplement.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function dansJours(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

const champ = "mt-1.5 w-full rounded-2xl bg-cream px-4 py-3 text-base font-semibold";
const etiquette = "text-xs font-bold uppercase tracking-wide text-inksoft";

function Index() {
  const store = useStore();
  const listings = annoncesVisibles(store);
  const navigate = useNavigate();
  const villes = Array.from(new Set(listings.map((l) => l.ville))).sort();
  const [ville, setVille] = useState("");
  const [arrivee, setArrivee] = useState(dansJours(7));
  const [depart, setDepart] = useState(dansJours(14));
  const [voyageurs, setVoyageurs] = useState(2);

  function rechercher(e: React.FormEvent) {
    e.preventDefault();
    navigate({
      to: "/recherche",
      search: {
        ...(ville ? { ville } : {}),
        ...(arrivee && depart && arrivee < depart ? { arrivee, depart } : {}),
        voyageurs,
      },
    });
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-8">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-sage px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-ink">
            Retrouvez votre coin de paradis
          </span>
          <h1 className="mt-5 text-5xl md:text-6xl font-semibold leading-[1.05]">
            Des lieux à partager, <span className="text-terra">des souvenirs à créer</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-inksoft">
            Villas, appartements et refuges d'exception, réservés simplement entre voyageurs et
            hôtes.
          </p>
        </div>

        <form
          onSubmit={rechercher}
          className="mt-9 flex flex-col lg:flex-row gap-4 lg:items-end rounded-[2rem] bg-surface clay p-4"
        >
          <div className="flex-1">
            <label htmlFor="destination" className={etiquette}>
              Destination
            </label>
            <select
              id="destination"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className={champ}
            >
              <option value="">Toute la Tunisie</option>
              {villes.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="arrivee" className={etiquette}>
              Arrivée
            </label>
            <input
              id="arrivee"
              type="date"
              min={dansJours(0)}
              value={arrivee}
              onChange={(e) => setArrivee(e.target.value)}
              className={champ}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="depart" className={etiquette}>
              Départ
            </label>
            <input
              id="depart"
              type="date"
              min={arrivee || dansJours(0)}
              value={depart}
              onChange={(e) => setDepart(e.target.value)}
              className={champ}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="voyageurs" className={etiquette}>
              Voyageurs
            </label>
            <select
              id="voyageurs"
              value={voyageurs}
              onChange={(e) => setVoyageurs(Number(e.target.value))}
              className={champ}
            >
              {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} personne{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-terra clay px-7 py-3.5 text-base font-bold text-cream"
          >
            Rechercher
          </button>
        </form>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-semibold">Séjours en vedette</h2>
          <Link to="/recherche" className="text-sm font-bold text-inksoft hover:text-ink">
            Voir tout →
          </Link>
        </div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {listings.slice(0, 3).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex flex-col md:flex-row md:items-center gap-8 rounded-[2.5rem] bg-sage clay p-8 md:p-12">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
              Vous avez un bien à louer ?
            </h2>
            <p className="mt-3 max-w-md text-ink/80">
              Publiez votre annonce en quelques minutes, gérez votre calendrier et recevez des
              voyageurs. Commission uniquement à la réservation.
            </p>
          </div>
          <Link
            to="/devenir-hote"
            className="rounded-2xl bg-terra clay px-8 py-4 text-lg font-bold text-cream whitespace-nowrap"
          >
            Devenir hôte
          </Link>
        </div>
      </section>
    </div>
  );
}
