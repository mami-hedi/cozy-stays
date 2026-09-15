import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/devenir-hote")({
  head: () => ({
    meta: [
      { title: "Devenir hôte — Maison" },
      {
        name: "description",
        content:
          "Publiez votre villa ou votre appartement, gérez votre calendrier et recevez des voyageurs vérifiés. Commission uniquement à la réservation.",
      },
      { property: "og:title", content: "Devenir hôte — Maison" },
      {
        property: "og:description",
        content: "Publiez votre bien en quelques minutes et recevez des voyageurs vérifiés.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DevenirHote,
});

const etapes = [
  {
    titre: "Décrivez votre bien",
    texte: "Titre, adresse, capacité, chambres et équipements. Cinq photos suffisent pour démarrer.",
    couleur: "bg-peach",
  },
  {
    titre: "Fixez votre prix",
    texte: "Prix par nuit, frais de ménage et dates bloquées. Modifiable à tout moment.",
    couleur: "bg-butter",
  },
  {
    titre: "Recevez vos voyageurs",
    texte: "Confirmation instantanée, paiement sécurisé, versement après l'arrivée.",
    couleur: "bg-powder",
  },
];

function DevenirHote() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16">
        <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05]">
          Votre bien mérite <span className="text-terra">de belles rencontres</span>
        </h1>
        <p className="mt-5 max-w-lg text-lg text-inksoft">
          Publiez gratuitement. Nous prélevons une commission de 3 % côté hôte, uniquement quand une
          réservation est confirmée.
        </p>

        <div className="mt-10 grid gap-7 sm:grid-cols-3">
          {etapes.map((e, i) => (
            <article key={e.titre} className="rounded-[1.75rem] bg-surface clay p-6">
              <div
                className={`size-11 rounded-2xl ${e.couleur} clay-sm grid place-items-center font-display text-lg font-bold`}
              >
                {i + 1}
              </div>
              <h2 className="mt-4 text-xl font-semibold">{e.titre}</h2>
              <p className="mt-2 text-inksoft">{e.texte}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col md:flex-row md:items-center gap-8 rounded-[2.5rem] bg-sage clay p-8 md:p-12">
          <div className="flex-1">
            <h2 className="text-3xl font-semibold">Prêt à publier votre annonce ?</h2>
            <p className="mt-3 max-w-md text-ink/80">
              Regardez d'abord comment les voyageurs découvrent les logements sur Maison.
            </p>
          </div>
          <Link
            to="/recherche"
            className="rounded-2xl bg-terra clay px-8 py-4 text-lg font-bold text-cream whitespace-nowrap"
          >
            Voir les annonces
          </Link>
        </div>
      </section>
    </div>
  );
}
