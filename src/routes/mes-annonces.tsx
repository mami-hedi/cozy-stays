import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { formatTND, type Listing } from "@/lib/listings";
import { Messagerie } from "@/components/Messagerie";
import villaOceane from "@/assets/villa-oceane.jpg";
import {
  useStore,
  toutesAnnonces,
  statutDe,
  definirStatut,
  enregistrerAnnonce,
  supprimerAnnonce,
  estAnnoncePerso,
  reservationsDe,
  annulerReservation,
  nuitsEntre,
  basculerBlocage,
  isoDate,
  formatJour,
  type ListingStatut,
} from "@/lib/reservations";

export const Route = createFileRoute("/mes-annonces")({
  head: () => ({
    meta: [
      { title: "Mes annonces — Maison" },
      {
        name: "description",
        content:
          "Gérez vos logements : prix, statut de publication, calendrier de disponibilité et réservations reçues.",
      },
      { property: "og:title", content: "Mes annonces — Maison" },
      {
        property: "og:description",
        content: "Calendrier, prix et réservations de vos logements, au même endroit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MesAnnonces,
});

const statutLabels: Record<ListingStatut, string> = {
  brouillon: "Brouillon",
  publiee: "Publiée",
  desactivee: "Désactivée",
};

function MesAnnonces() {
  const store = useStore();
  const annonces = toutesAnnonces(store);
  const [selection, setSelection] = useState<string | null>(null);
  const active = annonces.find((a) => a.id === (selection ?? annonces[0]?.id)) ?? annonces[0];

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16">
        <h1 className="text-4xl font-semibold">Mes annonces</h1>
        <p className="mt-2 text-lg text-inksoft">
          Publiez, bloquez des nuits et suivez vos réservations. Les dates réservées se bloquent
          automatiquement.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-[1.75rem] bg-surface clay p-4">
            <div className="space-y-2">
              {annonces.map((a) => {
                const statut = statutDe(store, a.id);
                const estActive = active?.id === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelection(a.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors ${
                      estActive ? "bg-terra text-cream" : "bg-cream"
                    }`}
                  >
                    <img
                      src={a.image}
                      alt=""
                      className="size-12 shrink-0 rounded-xl object-cover"
                      width={48}
                      height={48}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{a.titre}</span>
                      <span
                        className={`block text-xs font-semibold ${estActive ? "text-cream/80" : "text-inksoft"}`}
                      >
                        {statutLabels[statut]} · {a.prixNuit} TND
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <NouvelleAnnonce onCree={(id) => setSelection(id)} />
          </aside>

          {active ? <PanneauAnnonce key={active.id} listing={active} /> : null}
        </div>
      </section>
    </div>
  );
}

function PanneauAnnonce({ listing }: { listing: Listing }) {
  const store = useStore();
  const statut = statutDe(store, listing.id);
  const reservations = reservationsDe(store, listing.id);
  const perso = estAnnoncePerso(store, listing.id);

  const nuitsReservees = useMemo(
    () => new Set(reservations.flatMap((r) => nuitsEntre(r.debut, r.fin))),
    [reservations],
  );
  const nuitsBloquees = useMemo(
    () => new Set(store.bloquees[listing.id] ?? []),
    [store.bloquees, listing.id],
  );
  const aujourdhui = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] bg-surface clay p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{listing.titre}</h2>
            <p className="mt-1 text-inksoft">
              {listing.ville} · {listing.type} · {listing.voyageurs} voyageurs
            </p>
          </div>
          <Link
            to="/logement/$id"
            params={{ id: listing.id }}
            className="rounded-2xl bg-cream px-4 py-2 text-sm font-bold"
          >
            Voir la fiche
          </Link>
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-wide text-inksoft">Statut</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(statutLabels) as ListingStatut[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => definirStatut(listing.id, s)}
              className={
                s === statut
                  ? "rounded-2xl bg-terra px-4 py-2 text-sm font-bold text-cream"
                  : "rounded-2xl bg-cream px-4 py-2 text-sm font-semibold text-inksoft"
              }
            >
              {statutLabels[s]}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ChampPrix
            label="Prix par nuit (TND)"
            valeur={listing.prixNuit}
            onChange={(v) => enregistrerAnnonce({ ...listing, prixNuit: v })}
          />
          <ChampPrix
            label="Frais de ménage (TND)"
            valeur={listing.fraisMenage}
            onChange={(v) => enregistrerAnnonce({ ...listing, fraisMenage: v })}
          />
        </div>
        {!perso && (
          <p className="mt-3 text-xs font-semibold text-inksoft">
            Modifier le prix d'un logement de démonstration crée votre copie locale.
          </p>
        )}
        {perso && (
          <button
            type="button"
            onClick={() => supprimerAnnonce(listing.id)}
            className="mt-5 rounded-2xl bg-butter px-4 py-2 text-sm font-bold"
          >
            Supprimer cette annonce
          </button>
        )}
      </div>

      <div className="rounded-[1.75rem] bg-surface clay p-6">
        <h3 className="text-xl font-semibold">Calendrier de disponibilité</h3>
        <p className="mt-1 text-sm text-inksoft">
          Cliquez une nuit libre pour la bloquer. Les nuits réservées ne peuvent pas être
          débloquées.
        </p>
        <Calendar
          mode="single"
          locale={fr}
          numberOfMonths={1}
          selected={undefined}
          onDayClick={(jour) => {
            const iso = isoDate(jour);
            if (nuitsReservees.has(iso) || jour < aujourdhui) return;
            basculerBlocage(listing.id, iso);
          }}
          disabled={(date) => date < aujourdhui}
          modifiers={{
            reservee: (d) => nuitsReservees.has(isoDate(d)),
            bloquee: (d) => nuitsBloquees.has(isoDate(d)) && !nuitsReservees.has(isoDate(d)),
          }}
          modifiersClassNames={{
            reservee: "bg-terra text-cream rounded-md font-bold",
            bloquee: "bg-powder rounded-md line-through",
          }}
          className="mt-3 rounded-2xl bg-cream p-3 pointer-events-auto"
        />
        <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-inksoft">
          <span className="flex items-center gap-2">
            <span className="size-3 rounded bg-terra" /> Réservée
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3 rounded bg-powder" /> Bloquée par vous
          </span>
        </div>
      </div>

      <div className="rounded-[1.75rem] bg-surface clay p-6">
        <h3 className="text-xl font-semibold">Réservations ({reservations.length})</h3>
        {reservations.length === 0 ? (
          <p className="mt-2 text-inksoft">Aucune réservation pour le moment.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reservations.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3"
              >
                <span className="text-sm font-bold">
                  {formatJour(r.debut)} → {formatJour(r.fin)}
                  <span className="ml-2 font-semibold text-inksoft">
                    {r.nuits} nuit{r.nuits > 1 ? "s" : ""} · {formatTND(r.total)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => annulerReservation(r.id)}
                  className="rounded-xl bg-surface px-3 py-1.5 text-xs font-bold"
                >
                  Annuler
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ChampPrix({
  label,
  valeur,
  onChange,
}: {
  label: string;
  valeur: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-inksoft">{label}</span>
      <input
        type="number"
        min={0}
        value={valeur}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="mt-1.5 w-full rounded-2xl bg-cream px-4 py-3 text-base font-semibold outline-none"
      />
    </label>
  );
}

function NouvelleAnnonce({ onCree }: { onCree: (id: string) => void }) {
  const [ouvert, setOuvert] = useState(false);
  const [titre, setTitre] = useState("");
  const [ville, setVille] = useState("");
  const [prix, setPrix] = useState(90);

  function creer() {
    if (!titre.trim() || !ville.trim()) return;
    const id = `perso-${Date.now()}`;
    const annonce: Listing = {
      id,
      titre: titre.trim(),
      ville: ville.trim(),
      type: "Appartement",
      voyageurs: 4,
      chambres: 2,
      lits: 2,
      sdb: 1,
      prixNuit: prix,
      fraisMenage: 30,
      note: 5,
      avis: 0,
      image: villaOceane,
      hote: "Vous",
      description: "Nouvelle annonce créée depuis votre espace hôte.",
      equipements: ["Wifi", "Climatisation"],
      regles: ["Arrivée dès 15h", "Départ avant 11h", "Non-fumeur"],
    };
    enregistrerAnnonce(annonce);
    onCree(id);
    setTitre("");
    setVille("");
    setOuvert(false);
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="mt-3 w-full rounded-2xl bg-terra px-4 py-3 text-sm font-bold text-cream"
      >
        + Nouvelle annonce
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-2 rounded-2xl bg-cream p-3">
      <input
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        placeholder="Titre"
        className="w-full rounded-xl bg-surface px-3 py-2 text-sm font-semibold outline-none"
      />
      <input
        value={ville}
        onChange={(e) => setVille(e.target.value)}
        placeholder="Ville"
        className="w-full rounded-xl bg-surface px-3 py-2 text-sm font-semibold outline-none"
      />
      <input
        type="number"
        min={0}
        value={prix}
        onChange={(e) => setPrix(Math.max(0, Number(e.target.value)))}
        placeholder="Prix / nuit"
        className="w-full rounded-xl bg-surface px-3 py-2 text-sm font-semibold outline-none"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={creer}
          className="flex-1 rounded-xl bg-terra px-3 py-2 text-sm font-bold text-cream"
        >
          Créer
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="rounded-xl bg-surface px-3 py-2 text-sm font-bold"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
