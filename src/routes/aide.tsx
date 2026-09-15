import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/aide")({
  head: () => ({
    meta: [
      { title: "Aide et questions fréquentes — Maison" },
      {
        name: "description",
        content:
          "Réservation, paiement, annulation, commission : les réponses aux questions les plus fréquentes sur Maison.",
      },
      { property: "og:title", content: "Aide et questions fréquentes — Maison" },
      {
        property: "og:description",
        content: "Réservation, paiement, annulation et commission expliqués simplement.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Aide,
});

const questions = [
  {
    q: "Comment fonctionne la réservation ?",
    a: "Les logements sont en confirmation instantanée : dès que vous réservez, les dates sont bloquées et l'hôte est prévenu. Aucune validation manuelle n'est nécessaire.",
  },
  {
    q: "Quels frais s'ajoutent au prix par nuit ?",
    a: "Les frais de ménage fixés par l'hôte, puis 10 % de frais de service côté voyageur. Le total est affiché avant la réservation, sans surprise.",
  },
  {
    q: "Quand l'hôte est-il payé ?",
    a: "Le versement est déclenché le lendemain de l'arrivée du voyageur, déduction faite de la commission de 3 % côté hôte.",
  },
  {
    q: "Puis-je annuler ?",
    a: "Une annulation plus de 7 jours avant l'arrivée est remboursée intégralement, hors frais de service. Ensuite, la première nuit reste due.",
  },
  {
    q: "Cette version est-elle réelle ?",
    a: "Non : il s'agit d'une démonstration avec des logements d'exemple. Aucun paiement n'est encaissé.",
  },
];

function Aide() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-6 pt-10 pb-16">
        <h1 className="text-4xl font-semibold">Questions fréquentes</h1>
        <div className="mt-8 space-y-4">
          {questions.map((item) => (
            <article key={item.q} className="rounded-[1.75rem] bg-surface clay p-6">
              <h2 className="text-xl font-semibold">{item.q}</h2>
              <p className="mt-2 text-inksoft">{item.a}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
