import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SITE_NAME, CONTACT_EMAIL } from "@/lib/site";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: `Politique de confidentialité — ${SITE_NAME}` },
      {
        name: "description",
        content: `Quelles données ${SITE_NAME} collecte, pourquoi, combien de temps, et comment exercer vos droits.`,
      },
    ],
  }),
  component: () => (
    <LegalPage
      titre="Politique de confidentialité"
      maj="[date]"
      sections={[
        {
          titre: "Responsable du traitement",
          contenu: <p>[Raison sociale], [adresse]. Contact : {CONTACT_EMAIL}.</p>,
        },
        {
          titre: "Données collectées",
          contenu: (
            <p>
              Identité et coordonnées (nom, courriel, téléphone), contenu des annonces,
              réservations, messages entre hôte et voyageur, avis, historique de recherche pour le
              Conseiller IA, et données techniques (appareil, pages consultées). Les données de
              carte bancaire sont traitées par le prestataire de paiement et ne sont jamais stockées
              par {SITE_NAME}.
            </p>
          ),
        },
        {
          titre: "Finalités",
          contenu: (
            <p>
              Gérer les comptes et les réservations, permettre la communication entre utilisateurs,
              prévenir la fraude, assurer le support, améliorer le service et personnaliser les
              recommandations.
            </p>
          ),
        },
        {
          titre: "Version de démonstration",
          contenu: (
            <p>
              Dans la version actuelle, vos réservations, messages et avis sont enregistrés
              uniquement dans le stockage local de votre navigateur et ne sont pas envoyés à nos
              serveurs. Le Conseiller IA transmet vos critères de recherche à un prestataire
              d'intelligence artificielle pour produire des recommandations.
            </p>
          ),
        },
        {
          titre: "Conservation et partage",
          contenu: (
            <p>
              Les données sont conservées pendant la durée du compte puis pendant [durée] pour
              répondre aux obligations légales. Elles sont partagées avec l'hôte ou le voyageur
              concerné par une réservation, et avec nos prestataires (hébergement, paiement,
              courriel), jamais vendues.
            </p>
          ),
        },
        {
          titre: "Vos droits",
          contenu: (
            <p>
              Vous pouvez demander l'accès, la rectification ou la suppression de vos données, et
              vous opposer à certains traitements, en écrivant à {CONTACT_EMAIL}. Vous pouvez aussi
              saisir l'Instance Nationale de Protection des Données Personnelles (INPDP)
              conformément à la loi organique n° 2004-63.
            </p>
          ),
        },
      ]}
    />
  ),
});
