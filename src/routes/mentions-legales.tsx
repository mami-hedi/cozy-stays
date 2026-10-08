import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SITE_NAME, CONTACT_EMAIL } from "@/lib/site";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: `Mentions légales — ${SITE_NAME}` },
      { name: "description", content: `Éditeur, hébergeur et contact du site ${SITE_NAME}.` },
    ],
  }),
  component: () => (
    <LegalPage
      titre="Mentions légales"
      maj="[date]"
      sections={[
        {
          titre: "Éditeur du site",
          contenu: (
            <p>
              {SITE_NAME} est édité par [raison sociale], [forme juridique] au capital de [montant]
              TND, immatriculée au registre du commerce de [ville] sous le numéro [numéro RC],
              matricule fiscal [numéro]. Siège social : [adresse complète]. Directeur de la
              publication : [nom].
            </p>
          ),
        },
        {
          titre: "Contact",
          contenu: (
            <p>
              Courriel : {CONTACT_EMAIL} · Téléphone : [numéro]. Nous répondons sous [2] jours
              ouvrés.
            </p>
          ),
        },
        {
          titre: "Hébergement",
          contenu: <p>Le site est hébergé par [nom de l'hébergeur], [adresse de l'hébergeur].</p>,
        },
        {
          titre: "Nature du service",
          contenu: (
            <p>
              {SITE_NAME} met en relation des hôtes proposant des logements et des voyageurs. La
              plateforme n'est pas propriétaire des logements et n'est pas partie au contrat de
              location conclu entre l'hôte et le voyageur, sauf mention contraire dans les
              conditions d'utilisation.
            </p>
          ),
        },
        {
          titre: "Propriété intellectuelle",
          contenu: (
            <p>
              Les textes, logos, graphismes et photographies du site sont protégés. Toute
              reproduction sans autorisation écrite est interdite. Les photographies des annonces
              restent la propriété de leurs auteurs, qui en autorisent l'affichage sur la
              plateforme.
            </p>
          ),
        },
      ]}
    />
  ),
});
