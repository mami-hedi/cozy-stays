import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SITE_NAME } from "@/lib/site";
import { COMMISSION_VOYAGEUR } from "@/lib/listings";
import { COMMISSION_HOTE } from "@/lib/reservations";

export const Route = createFileRoute("/cgu")({
  head: () => ({
    meta: [
      { title: `Conditions d'utilisation — ${SITE_NAME}` },
      {
        name: "description",
        content: `Règles d'utilisation de ${SITE_NAME} pour les voyageurs et les hôtes : réservation, paiement, commissions, responsabilités.`,
      },
    ],
  }),
  component: () => (
    <LegalPage
      titre="Conditions générales d'utilisation"
      maj="[date]"
      sections={[
        {
          titre: "1. Objet",
          contenu: (
            <p>
              Ces conditions encadrent l'utilisation de {SITE_NAME} par les voyageurs, qui
              recherchent et réservent un logement, et par les hôtes, qui le proposent. En créant un
              compte ou en réservant, vous les acceptez.
            </p>
          ),
        },
        {
          titre: "2. Comptes",
          contenu: (
            <p>
              Vous devez être majeur et fournir des informations exactes. Vous êtes responsable de
              l'usage de votre compte et de la confidentialité de vos identifiants.
            </p>
          ),
        },
        {
          titre: "3. Annonces et hôtes",
          contenu: (
            <p>
              L'hôte garantit être en droit de louer le bien, décrit fidèlement le logement, ses
              équipements et ses règles, et respecte la réglementation applicable à la location
              saisonnière en Tunisie (déclarations, taxes, registre des voyageurs étrangers).{" "}
              {SITE_NAME} peut modérer, suspendre ou retirer une annonce non conforme.
            </p>
          ),
        },
        {
          titre: "4. Réservation et prix",
          contenu: (
            <p>
              Le prix total affiché avant la réservation comprend le prix des nuits, les frais de
              ménage et les frais de service. Les prix sont exprimés en dinars tunisiens (TND). Une
              réservation est confirmée lorsque le paiement est accepté et, le cas échéant, lorsque
              l'hôte l'a validée.
            </p>
          ),
        },
        {
          titre: "5. Commissions",
          contenu: (
            <p>
              {SITE_NAME} perçoit des frais de service de {Math.round(COMMISSION_VOYAGEUR * 100)} %
              auprès du voyageur et une commission de {Math.round(COMMISSION_HOTE * 100)} % auprès
              de l'hôte sur chaque réservation confirmée. Ces taux peuvent évoluer ; le taux
              applicable est celui affiché au moment de la réservation.
            </p>
          ),
        },
        {
          titre: "6. Annulation",
          contenu: (
            <p>
              Les règles d'annulation et de remboursement sont décrites dans la politique
              d'annulation.
            </p>
          ),
        },
        {
          titre: "7. Comportements interdits",
          contenu: (
            <p>
              Sont interdits : les fausses annonces ou faux avis, le contournement de la plateforme
              pour éviter les frais, le harcèlement, et toute activité illégale. Les manquements
              peuvent entraîner la suspension du compte.
            </p>
          ),
        },
        {
          titre: "8. Responsabilité",
          contenu: (
            <p>
              {SITE_NAME} agit comme intermédiaire. Sa responsabilité ne couvre pas l'état du
              logement ni le comportement des utilisateurs, sauf faute prouvée de sa part, dans les
              limites permises par la loi. Les litiges entre hôte et voyageur peuvent être signalés
              au support, qui tente une médiation.
            </p>
          ),
        },
        {
          titre: "9. Droit applicable",
          contenu: (
            <p>
              Ces conditions sont régies par le droit tunisien. Tribunaux compétents :
              [juridiction].
            </p>
          ),
        },
      ]}
    />
  ),
});
