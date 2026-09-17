import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { ListingCard } from "@/components/ListingCard";
import { useStore, annoncesVisibles } from "@/lib/reservations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison — Location de villas et appartements en Tunisie" },
      {
        name: "description",
        content:
          "Réservez des villas et appartements vérifiés en Tunisie : confirmation instantanée, prix tout compris, hôtes de confiance.",
      },
      { property: "og:title", content: "Maison — Location de villas et appartements" },
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

function Index() {
  const store = useStore();
  const listings = annoncesVisibles(store);

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
            Villas, appartements et refuges d'exception, réservés simplement entre voyageurs de
            confiance.
          </p>
        </div>

        <div className="mt-9 flex flex-col lg:flex-row gap-4 lg:items-end rounded-[2rem] bg-surface clay p-4">
          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-wide text-inksoft">
              Destination
            </label>
            <div className="mt-1.5 rounded-2xl bg-cream px-4 py-3 text-base font-semibold">
              Tunis, Tunisie
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-wide text-inksoft">Dates</label>
            <div className="mt-1.5 rounded-2xl bg-cream px-4 py-3 text-base font-semibold">
              12 – 18 juin
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-wide text-inksoft">
              Voyageurs
            </label>
            <div className="mt-1.5 rounded-2xl bg-cream px-4 py-3 text-base font-semibold">
              4 personnes
            </div>
          </div>
          <div className="lg:w-auto">
            <div className="flex items-center gap-1">
              <span className="size-11 rounded-2xl bg-lilac clay-sm grid place-items-center">
                <span className="text-lg text-ink">⌕</span>
              </span>
              <Link
                to="/recherche"
                className="rounded-2xl bg-terra clay px-7 py-3.5 text-base font-bold text-cream"
              >
                Rechercher
              </Link>
            </div>
          </div>
        </div>
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
              voyageurs vérifiés. Commission uniquement à la réservation.
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
