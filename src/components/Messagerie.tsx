import { useEffect, useRef, useState } from "react";
import {
  useStore,
  messagesDe,
  envoyerMessage,
  marquerLu,
  nonLusDe,
  formatHeure,
  type Auteur,
} from "@/lib/reservations";
import { activerPush, etatPush, notifier, type EtatPush } from "@/lib/notifications";

const libellePush: Record<EtatPush, string> = {
  actif: "Notifications push activées",
  inactif: "Activer les notifications push",
  refuse: "Notifications bloquées dans votre navigateur",
  iframe: "Ouvrez l'aperçu dans un onglet pour activer les notifications",
  indisponible: "Notifications non prises en charge par ce navigateur",
};

export function Messagerie({
  listingId,
  role,
  titre,
}: {
  listingId: string;
  role: Auteur;
  titre: string;
}) {
  const store = useStore();
  const messages = messagesDe(store, listingId);
  const nonLus = nonLusDe(store, listingId, role);
  const [texte, setTexte] = useState("");
  const [push, setPush] = useState<EtatPush>("inactif");
  const fil = useRef<HTMLDivElement>(null);
  const dernierVu = useRef<string | null>(null);

  useEffect(() => {
    setPush(etatPush());
  }, []);

  // Notification push à l'arrivée d'un message de l'autre partie.
  useEffect(() => {
    const dernier = messages[messages.length - 1];
    if (!dernier) return;
    const premier = dernierVu.current === null;
    dernierVu.current = dernier.id;
    if (premier || dernier.auteur === role) return;
    notifier(
      dernier.auteur === "voyageur" ? "Nouveau message d'un voyageur" : "Nouveau message de l'hôte",
      dernier.contenu,
    );
  }, [messages, role]);

  useEffect(() => {
    fil.current?.scrollTo({ top: fil.current.scrollHeight });
  }, [messages.length]);

  function envoyer() {
    if (!texte.trim()) return;
    envoyerMessage(listingId, role, texte);
    setTexte("");
  }

  return (
    <div className="rounded-[1.75rem] bg-surface clay p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">
          {titre}
          {nonLus > 0 && (
            <span className="ml-2 rounded-full bg-terra px-2.5 py-1 text-xs font-bold text-cream">
              {nonLus} non lu{nonLus > 1 ? "s" : ""}
            </span>
          )}
        </h3>
        {nonLus > 0 && (
          <button
            type="button"
            onClick={() => marquerLu(listingId, role)}
            className="rounded-xl bg-cream px-3 py-1.5 text-xs font-bold"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div
        ref={fil}
        className="mt-4 max-h-72 space-y-3 overflow-y-auto rounded-2xl bg-cream p-4"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <p className="text-sm font-semibold text-inksoft">
            Aucun message pour l'instant. Écrivez le premier.
          </p>
        ) : (
          messages.map((m) => {
            const moi = m.auteur === role;
            return (
              <div key={m.id} className={moi ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    moi ? "bg-terra text-cream" : "bg-surface"
                  }`}
                >
                  <p className="text-sm font-semibold">{m.contenu}</p>
                  <p className={`mt-1 text-[11px] font-bold ${moi ? "text-cream/70" : "text-inksoft"}`}>
                    {m.auteur === "hote" ? "Hôte" : "Voyageur"} · {formatHeure(m.date)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") envoyer();
          }}
          placeholder={role === "hote" ? "Répondre au voyageur…" : "Écrire à l'hôte…"}
          className="min-w-0 flex-1 rounded-2xl bg-cream px-4 py-3 text-sm font-semibold outline-none"
        />
        <button
          type="button"
          onClick={envoyer}
          className="rounded-2xl bg-terra px-5 py-3 text-sm font-bold text-cream"
        >
          Envoyer
        </button>
      </div>

      <button
        type="button"
        disabled={push !== "inactif"}
        onClick={async () => setPush(await activerPush())}
        className="mt-3 w-full rounded-2xl bg-cream px-4 py-2.5 text-xs font-bold text-inksoft disabled:opacity-70"
      >
        🔔 {libellePush[push]}
      </button>
    </div>
  );
}
