import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/annulation")({
  head: () => ({
    meta: [
      { title: `Politique d'annulation — ${SITE_NAME}` },
      {
        name: "description",
        content: `Délais d'annulation et remboursements applicables aux réservations sur ${SITE_NAME}.`,
      },
    ],
  }),
  component: () => (
    <LegalPage
      titre="Politique d'annulation"
      maj="[date]"
      sections={[
        {
          titre: "Annulation par le voyageur",
          contenu: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Plus de 7 jours avant l'arrivée : remboursement intégral.</li>
              <li>Entre 7 et 2 jours avant l'arrivée : remboursement de 50 % du prix des nuits.</li>
              <li>Moins de 48 heures avant l'arrivée ou départ anticipé : aucun remboursement.</li>
              <li>Les frais de service ne sont remboursés qu'en cas d'annulation intégrale.</li>
            </ul>
          ),
        },
        {
          titre: "Annulation par l'hôte",
          contenu: (
            <p>
              Si l'hôte annule, le voyageur est remboursé intégralement et {SITE_NAME} l'aide à
              trouver un logement équivalent. Les annulations répétées par un hôte peuvent entraîner
              la suspension de ses annonces.
            </p>
          ),
        },
        {
          titre: "Problème à l'arrivée",
          contenu: (
            <p>
              Si le logement ne correspond pas à l'annonce, signalez-le dans les 24 heures suivant
              l'arrivée avec des photos. Le support étudie la demande et peut proposer un
              remboursement partiel ou total.
            </p>
          ),
        },
        {
          titre: "Délai de remboursement",
          contenu: (
            <p>
              Les remboursements sont émis sous [5 à 10] jours ouvrés par le même moyen de paiement.
            </p>
          ),
        },
      ]}
    />
  ),
});
