import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { DateRange } from "react-day-picker";
import { SiteHeader } from "@/components/SiteHeader";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { getListing, prixSejour, formatTND } from "@/lib/listings";
import { Messagerie } from "@/components/Messagerie";
import { AvisVoyageur } from "@/components/Avis";
import {
  useStore,
  trouverAnnonce,
  datesIndisponibles,
  statutDe,
  reserver,
  isoDate,
  nombreNuits,
  formatJour,
  reputationDe,
  formatNote,
} from "@/lib/reservations";

export const Route = createFileRoute("/logement/$id")({
  loader: ({ params }) => {
    const listing = getListing(params.id) ?? null;
    return { listing, id: params.id };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.listing) {
      return {
        meta: [{ title: "Logement — Maison" }, { name: "robots", content: "noindex" }],
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
  const { listing: base, id } = Route.useLoaderData();
  const store = useStore();
  const listing = trouverAnnonce(store, id) ?? base;

  const [plage, setPlage] = useState<DateRange | undefined>();
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);

  const indispo = useMemo(() => new Set(datesIndisponibles(store, id)), [store, id]);
  const aujourdhui = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  if (!listing) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-semibold">Ce logement n'existe pas</h1>
          <p className="mt-3 text-inksoft">Il a peut-être été supprimé par son hôte.</p>
          <Link
            to="/recherche"
            className="mt-6 inline-block rounded-2xl bg-terra clay px-6 py-3 font-bold text-cream"
          >
            Voir les logements
          </Link>
        </div>
      </div>
    );
  }

  const statut = statutDe(store, listing.id);
  const reputation = reputationDe(store, listing);
  const debut = plage?.from ? isoDate(plage.from) : null;
  const fin = plage?.to ? isoDate(plage.to) : null;
  const nuits = debut && fin ? nombreNuits(debut, fin) : 0;
  const prix = prixSejour(listing, Math.max(nuits, 0));

  function reserverMaintenant() {
    if (!debut || !fin || nuits < 1) {
      setMessage({ ok: false, texte: "Choisissez une date d'arrivée et une date de départ." });
      return;
    }
    const res = reserver({
      listingId: listing!.id,
      debut,
      fin,
      voyageurs: listing!.voyageurs,
      total: prix.total,
    });
    if (res.ok) {
      setPlage(undefined);
      setMessage({
        ok: true,
        texte: `Réservation confirmée du ${formatJour(debut)} au ${formatJour(fin)}. Ces nuits sont désormais bloquées.`,
      });
    } else {
      setMessage({ ok: false, texte: res.erreur });
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16">
        <Link to="/recherche" className="text-sm font-bold text-inksoft hover:text-ink">
          ← Retour aux résultats
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_380px]">
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
                ★ {formatNote(reputation.note)} · {reputation.nombre} avis
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

            <div className="mt-6">
              <AvisVoyageur listing={listing} />
            </div>

            <div className="mt-6">
              <Messagerie
                listingId={listing.id}
                role="voyageur"
                titre={`Contacter l'hôte · ${listing.hote}`}
              />
            </div>
          </div>


          <aside className="h-fit lg:sticky lg:top-8 rounded-[1.75rem] bg-surface clay p-6">
            <p className="text-2xl font-bold">
              {listing.prixNuit}{" "}
              <span className="text-base font-semibold text-inksoft">TND / nuit</span>
            </p>

            <p className="mt-5 text-xs font-bold uppercase tracking-wide text-inksoft">
              Vos dates de séjour
            </p>
            <Calendar
              mode="range"
              locale={fr}
              numberOfMonths={1}
              selected={plage}
              onSelect={(r) => {
                setPlage(r);
                setMessage(null);
              }}
              excludeDisabled
              disabled={(date) => date < aujourdhui || indispo.has(isoDate(date))}
              modifiers={{ prise: (date) => indispo.has(isoDate(date)) }}
              modifiersClassNames={{ prise: "line-through opacity-40" }}
              className="mt-2 rounded-2xl bg-cream p-3 pointer-events-auto"
            />
            <p className="mt-2 text-xs font-semibold text-inksoft">
              Les nuits barrées sont déjà réservées ou bloquées par l'hôte.
            </p>

            {debut && fin && nuits > 0 && (
              <p className="mt-3 text-sm font-bold">
                {formatJour(debut)} → {formatJour(fin)} · {nuits} nuit{nuits > 1 ? "s" : ""}
              </p>
            )}

            <div className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm">
              <div className="flex justify-between">
                <span className="text-inksoft">
                  {listing.prixNuit} TND × {nuits} nuit{nuits > 1 ? "s" : ""}
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
              onClick={reserverMaintenant}
              disabled={statut !== "publiee"}
              className="mt-6 w-full rounded-2xl bg-terra clay px-6 py-3.5 text-base font-bold text-cream transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {statut === "publiee" ? "Réserver" : "Annonce indisponible"}
            </button>
            <p className="mt-3 text-center text-xs font-semibold text-inksoft">
              Confirmation instantanée · démonstration, aucun paiement réel
            </p>
            {message && (
              <p
                className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold text-ink ${
                  message.ok ? "bg-sage" : "bg-butter"
                }`}
              >
                {message.texte}
              </p>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
