import { useState } from "react";
import {
  useStore,
  avisDe,
  avisDeReservation,
  sejoursTermines,
  laisserAvis,
  repondreAvis,
  formatNote,
  formatJour,
  reputationDe,
  type Avis,
} from "@/lib/reservations";
import type { Listing } from "@/lib/listings";

function Etoiles({ note }: { note: number }) {
  return (
    <span aria-label={`${formatNote(note)} sur 5`} className="text-base">
      {"★★★★★".slice(0, Math.round(note))}
      <span className="text-inksoft/40">{"★★★★★".slice(Math.round(note))}</span>
    </span>
  );
}

function CarteAvis({ avis, children }: { avis: Avis; children?: React.ReactNode }) {
  return (
    <li className="rounded-2xl bg-cream p-4">
      <div className="flex items-center justify-between gap-3">
        <Etoiles note={avis.note} />
        <span className="text-xs font-bold text-inksoft">{formatJour(avis.date.slice(0, 10))}</span>
      </div>
      {avis.commentaire && <p className="mt-2 text-sm font-semibold">{avis.commentaire}</p>}
      {avis.reponseHote && (
        <p className="mt-3 rounded-xl bg-surface px-3 py-2 text-sm font-semibold text-inksoft">
          Réponse de l'hôte : {avis.reponseHote}
        </p>
      )}
      {children}
    </li>
  );
}

/** Côté voyageur : noter un séjour terminé et lire les avis. */
export function AvisVoyageur({ listing }: { listing: Listing }) {
  const store = useStore();
  const { note, nombre, locaux } = reputationDe(store, listing);
  const termines = sejoursTermines(store, listing.id);
  const aNoter = termines.filter((r) => !avisDeReservation(store, r.id));
  const [etoiles, setEtoiles] = useState(5);
  const [texte, setTexte] = useState("");
  const [retour, setRetour] = useState<{ ok: boolean; texte: string } | null>(null);

  function envoyer(reservationId: string) {
    const res = laisserAvis({
      listingId: listing.id,
      reservationId,
      note: etoiles,
      commentaire: texte,
    });
    setRetour(
      res.ok ? { ok: true, texte: "Merci, votre avis est publié." } : { ok: false, texte: res.erreur },
    );
    if (res.ok) setTexte("");
  }

  return (
    <div className="rounded-[1.75rem] bg-surface clay p-6">
      <h2 className="text-xl font-semibold">
        Avis · ★ {formatNote(note)}{" "}
        <span className="text-base font-semibold text-inksoft">({nombre})</span>
      </h2>

      {aNoter.length > 0 ? (
        <div className="mt-4 rounded-2xl bg-cream p-4">
          <p className="text-sm font-bold">
            Vous avez séjourné ici du {formatJour(aNoter[0]!.debut)} au {formatJour(aNoter[0]!.fin)}.
            Notez votre séjour :
          </p>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                onClick={() => setEtoiles(n)}
                className={`text-2xl ${n <= etoiles ? "text-terra" : "text-inksoft/40"}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            rows={3}
            placeholder="Votre commentaire (facultatif)"
            className="mt-3 w-full rounded-2xl bg-surface px-4 py-3 text-sm font-semibold outline-none"
          />
          <button
            type="button"
            onClick={() => envoyer(aNoter[0]!.id)}
            className="mt-3 rounded-2xl bg-terra px-5 py-2.5 text-sm font-bold text-cream"
          >
            Publier mon avis
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm font-semibold text-inksoft">
          {termines.length > 0
            ? "Vous avez déjà noté vos séjours dans ce logement."
            : "Les avis sont ouverts aux voyageurs après leur séjour."}
        </p>
      )}

      {retour && (
        <p
          className={`mt-3 rounded-2xl px-4 py-3 text-sm font-semibold ${retour.ok ? "bg-sage" : "bg-butter"}`}
        >
          {retour.texte}
        </p>
      )}

      {locaux.length > 0 && (
        <ul className="mt-5 space-y-3">
          {locaux.map((a) => (
            <CarteAvis key={a.id} avis={a} />
          ))}
        </ul>
      )}
    </div>
  );
}

/** Côté hôte : réputation du logement et réponses aux avis. */
export function ReputationHote({ listing }: { listing: Listing }) {
  const store = useStore();
  const { note, nombre } = reputationDe(store, listing);
  const locaux = avisDe(store, listing.id);
  const cinq = [5, 4, 3, 2, 1];

  return (
    <div className="rounded-[1.75rem] bg-surface clay p-6">
      <h3 className="text-xl font-semibold">Réputation</h3>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <span className="rounded-2xl bg-butter px-4 py-3 text-2xl font-bold">
          ★ {formatNote(note)}
        </span>
        <span className="text-sm font-semibold text-inksoft">
          {nombre} avis au total · {locaux.length} depuis cet espace
        </span>
      </div>

      {locaux.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {cinq.map((n) => {
            const part = locaux.filter((a) => a.note === n).length;
            const pct = Math.round((part / locaux.length) * 100);
            return (
              <div key={n} className="flex items-center gap-3 text-xs font-bold text-inksoft">
                <span className="w-8">{n} ★</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream">
                  <span className="block h-full rounded-full bg-terra" style={{ width: `${pct}%` }} />
                </span>
                <span className="w-8 text-right">{part}</span>
              </div>
            );
          })}
        </div>
      )}

      {locaux.length === 0 ? (
        <p className="mt-3 text-sm font-semibold text-inksoft">
          Aucun avis reçu depuis cet espace pour le moment.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {locaux.map((a) => (
            <CarteAvis key={a.id} avis={a}>
              <ReponseHote avisId={a.id} existante={a.reponseHote} />
            </CarteAvis>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReponseHote({ avisId, existante }: { avisId: string; existante?: string }) {
  const [texte, setTexte] = useState("");
  if (existante) return null;
  return (
    <div className="mt-3 flex gap-2">
      <input
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        placeholder="Répondre publiquement…"
        className="min-w-0 flex-1 rounded-xl bg-surface px-3 py-2 text-sm font-semibold outline-none"
      />
      <button
        type="button"
        onClick={() => texte.trim() && repondreAvis(avisId, texte)}
        className="rounded-xl bg-terra px-4 py-2 text-sm font-bold text-cream"
      >
        Répondre
      </button>
    </div>
  );
}
