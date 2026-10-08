import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { formatTND, COMMISSION_VOYAGEUR } from "@/lib/listings";
import {
  useStore,
  toutesAnnonces,
  statutDe,
  moderationDe,
  definirModeration,
  commissionDe,
  COMMISSION_HOTE,
  ouvrirLitige,
  majLitige,
  formatJour,
  trouverAnnonce,
  type Moderation,
  type LitigeStatut,
} from "@/lib/reservations";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Back-office admin — Maison" },
      {
        name: "description",
        content: "Modération des annonces, litiges, commissions et statistiques de la plateforme Maison.",
      },
      { property: "og:title", content: "Back-office admin — Maison" },
      { property: "og:description", content: "Pilotez la plateforme : annonces, litiges, commissions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const onglets = [
  { id: "stats", label: "Statistiques" },
  { id: "moderation", label: "Modération" },
  { id: "litiges", label: "Litiges" },
  { id: "commissions", label: "Commissions" },
] as const;
type Onglet = (typeof onglets)[number]["id"];

const modLabels: Record<Moderation, string> = {
  approuvee: "Approuvée",
  signalee: "Signalée",
  suspendue: "Suspendue",
};
const modClass: Record<Moderation, string> = {
  approuvee: "bg-sage",
  signalee: "bg-butter",
  suspendue: "bg-terra text-cream",
};
const litLabels: Record<LitigeStatut, string> = {
  ouvert: "Ouvert",
  en_cours: "En cours",
  resolu: "Résolu",
  rejete: "Rejeté",
};

const carte = "rounded-[1.75rem] bg-surface clay p-6";
const chip = "rounded-2xl px-3.5 py-2 text-sm font-semibold";

function Admin() {
  const [onglet, setOnglet] = useState<Onglet>("stats");
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16">
        <span className="inline-block rounded-full bg-lilac px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-ink">
          Back-office
        </span>
        <h1 className="mt-4 text-4xl font-semibold">Administration</h1>
        <p className="mt-2 text-inksoft">Mode démonstration : données stockées dans ce navigateur.</p>
        <div role="tablist" aria-label="Sections admin" className="mt-8 flex flex-wrap gap-2">
          {onglets.map((o) => (
            <button
              key={o.id}
              role="tab"
              aria-selected={onglet === o.id}
              onClick={() => setOnglet(o.id)}
              className={`${chip} ${onglet === o.id ? "bg-terra text-cream font-bold" : "bg-cream text-inksoft"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="mt-8" role="tabpanel">
          {onglet === "stats" && <Stats />}
          {onglet === "moderation" && <ModerationPanel />}
          {onglet === "litiges" && <Litiges />}
          {onglet === "commissions" && <Commissions />}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, valeur }: { label: string; valeur: string | number }) {
  return (
    <div className={carte}>
      <p className="text-xs font-bold uppercase tracking-wide text-inksoft">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{valeur}</p>
    </div>
  );
}

function Barres({ data }: { data: { label: string; valeur: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.valeur));
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3 text-sm">
          <span className="w-32 shrink-0 truncate">{d.label}</span>
          <div className="h-3 flex-1 rounded-full bg-cream">
            <div className="h-3 rounded-full bg-terra" style={{ width: `${(d.valeur / max) * 100}%` }} />
          </div>
          <span className="w-8 text-right font-bold">{d.valeur}</span>
        </div>
      ))}
    </div>
  );
}

function Stats() {
  const s = useStore();
  const annonces = toutesAnnonces(s);
  const ca = s.reservations.reduce((a, r) => a + r.total, 0);
  const commissions = s.reservations.reduce((a, r) => a + commissionDe(r).plateforme, 0);
  const nuits = s.reservations.reduce((a, r) => a + r.nuits, 0);
  const nonLus = s.messages.filter((m) => !m.lu).length;

  const mois = new Map<string, number>();
  s.reservations.forEach((r) => {
    const k = r.debut.slice(0, 7);
    mois.set(k, (mois.get(k) ?? 0) + 1);
  });
  const parMois = [...mois.entries()].sort().map(([k, v]) => ({ label: k, valeur: v }));
  const parAnnonce = annonces
    .map((l) => ({
      label: l.titre,
      res: s.reservations.filter((r) => r.listingId === l.id).length,
      msg: s.messages.filter((m) => m.listingId === l.id).length,
    }))
    .filter((x) => x.res || x.msg);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Réservations" valeur={s.reservations.length} />
        <Kpi label="Volume d'affaires" valeur={formatTND(Math.round(ca))} />
        <Kpi label="Commissions" valeur={formatTND(commissions)} />
        <Kpi label="Nuits réservées" valeur={nuits} />
        <Kpi label="Messages" valeur={s.messages.length} />
        <Kpi label="Non lus" valeur={nonLus} />
        <Kpi label="Annonces" valeur={annonces.length} />
        <Kpi label="Litiges ouverts" valeur={s.litiges.filter((l) => l.statut === "ouvert" || l.statut === "en_cours").length} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={carte}>
          <h2 className="text-xl font-semibold">Réservations par mois d'arrivée</h2>
          <div className="mt-4">
            {parMois.length ? <Barres data={parMois} /> : <p className="text-inksoft">Aucune réservation.</p>}
          </div>
        </div>
        <div className={carte}>
          <h2 className="text-xl font-semibold">Messages par annonce</h2>
          <div className="mt-4">
            {parAnnonce.some((x) => x.msg) ? (
              <Barres data={parAnnonce.map((x) => ({ label: x.label, valeur: x.msg }))} />
            ) : (
              <p className="text-inksoft">Aucun message.</p>
            )}
          </div>
        </div>
        <div className={`${carte} lg:col-span-2`}>
          <h2 className="text-xl font-semibold">Réservations par annonce</h2>
          <div className="mt-4">
            {parAnnonce.some((x) => x.res) ? (
              <Barres data={parAnnonce.map((x) => ({ label: x.label, valeur: x.res }))} />
            ) : (
              <p className="text-inksoft">Aucune réservation.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModerationPanel() {
  const s = useStore();
  const [filtre, setFiltre] = useState<Moderation | "toutes">("toutes");
  const annonces = toutesAnnonces(s).filter((l) => filtre === "toutes" || moderationDe(s, l.id) === filtre);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["toutes", "approuvee", "signalee", "suspendue"] as const).map((f) => (
          <button
            key={f}
            aria-pressed={filtre === f}
            onClick={() => setFiltre(f)}
            className={`${chip} ${filtre === f ? "bg-sage font-bold text-ink" : "bg-cream text-inksoft"}`}
          >
            {f === "toutes" ? "Toutes" : modLabels[f]}
          </button>
        ))}
      </div>
      {annonces.length === 0 && <p className={carte}>Aucune annonce dans cette catégorie.</p>}
      {annonces.map((l) => {
        const m = moderationDe(s, l.id);
        return (
          <div key={l.id} className={`${carte} flex flex-col gap-4 md:flex-row md:items-center`}>
            <img src={l.image} alt="" className="h-20 w-28 rounded-2xl object-cover" />
            <div className="flex-1">
              <Link to="/logement/$id" params={{ id: l.id }} className="text-lg font-bold hover:underline">
                {l.titre}
              </Link>
              <p className="text-sm text-inksoft">
                {l.ville} · hôte {l.hote} · {l.prixNuit} TND/nuit · statut hôte : {statutDe(s, l.id)}
              </p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${modClass[m]}`}>
                {modLabels[m]}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {m !== "approuvee" && (
                <button onClick={() => definirModeration(l.id, "approuvee")} className={`${chip} bg-sage text-ink`}>
                  Approuver
                </button>
              )}
              {m !== "signalee" && (
                <button onClick={() => definirModeration(l.id, "signalee")} className={`${chip} bg-butter text-ink`}>
                  Signaler
                </button>
              )}
              {m !== "suspendue" && (
                <button onClick={() => definirModeration(l.id, "suspendue")} className={`${chip} bg-terra text-cream`}>
                  Suspendre
                </button>
              )}
            </div>
          </div>
        );
      })}
      <p className="text-sm text-inksoft">Une annonce suspendue disparaît de la recherche et de l'accueil.</p>
    </div>
  );
}

function Litiges() {
  const s = useStore();
  const [resId, setResId] = useState("");
  const [motif, setMotif] = useState("");
  const [desc, setDesc] = useState("");
  const [demandeur, setDemandeur] = useState<"voyageur" | "hote">("voyageur");

  function creer(e: React.FormEvent) {
    e.preventDefault();
    if (ouvrirLitige({ reservationId: resId, demandeur, motif, description: desc })) {
      setMotif("");
      setDesc("");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={creer} className={`${carte} grid gap-4 md:grid-cols-2`}>
        <h2 className="text-xl font-semibold md:col-span-2">Ouvrir un litige</h2>
        <label className="text-sm font-semibold">
          Réservation
          <select
            required
            value={resId}
            onChange={(e) => setResId(e.target.value)}
            className="mt-1 w-full rounded-2xl bg-cream px-4 py-3"
          >
            <option value="">— Choisir —</option>
            {s.reservations.map((r) => (
              <option key={r.id} value={r.id}>
                {trouverAnnonce(s, r.listingId)?.titre ?? r.listingId} · {formatJour(r.debut)} → {formatJour(r.fin)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Demandeur
          <select
            value={demandeur}
            onChange={(e) => setDemandeur(e.target.value as "voyageur" | "hote")}
            className="mt-1 w-full rounded-2xl bg-cream px-4 py-3"
          >
            <option value="voyageur">Voyageur</option>
            <option value="hote">Hôte</option>
          </select>
        </label>
        <label className="text-sm font-semibold md:col-span-2">
          Motif
          <input
            required
            maxLength={100}
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Ex. : logement non conforme"
            className="mt-1 w-full rounded-2xl bg-cream px-4 py-3"
          />
        </label>
        <label className="text-sm font-semibold md:col-span-2">
          Description
          <textarea
            rows={2}
            maxLength={1000}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="mt-1 w-full rounded-2xl bg-cream px-4 py-3"
          />
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={!s.reservations.length}
            className="rounded-2xl bg-terra clay px-6 py-3 font-bold text-cream disabled:opacity-50"
          >
            Ouvrir le litige
          </button>
          {!s.reservations.length && <p className="mt-2 text-sm text-inksoft">Aucune réservation existante.</p>}
        </div>
      </form>

      {s.litiges.length === 0 && <p className={carte}>Aucun litige pour le moment.</p>}
      {s.litiges.map((l) => (
        <LitigeCarte key={l.id} id={l.id} />
      ))}
    </div>
  );
}

function LitigeCarte({ id }: { id: string }) {
  const s = useStore();
  const l = s.litiges.find((x) => x.id === id)!;
  const r = s.reservations.find((x) => x.id === l.reservationId);
  const [note, setNote] = useState(l.noteAdmin);
  const [remb, setRemb] = useState(l.remboursement);
  return (
    <div className={carte}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-lg font-bold">{l.motif}</p>
          <p className="text-sm text-inksoft">
            {trouverAnnonce(s, l.listingId)?.titre ?? l.listingId} · par {l.demandeur === "hote" ? "l'hôte" : "le voyageur"} ·{" "}
            {new Date(l.cree).toLocaleDateString("fr-FR")}
            {r ? ` · payé ${formatTND(r.total)}` : ""}
          </p>
          {l.description && <p className="mt-2">{l.description}</p>}
        </div>
        <span className="rounded-full bg-butter px-3 py-1 text-xs font-bold">{litLabels[l.statut]}</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_160px]">
        <textarea
          aria-label="Note de l'administrateur"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note interne / décision"
          className="rounded-2xl bg-cream px-4 py-3"
        />
        <label className="text-sm font-semibold">
          Remboursement (TND)
          <input
            type="number"
            min={0}
            max={r?.total}
            value={remb}
            onChange={(e) => setRemb(Number(e.target.value))}
            className="mt-1 w-full rounded-2xl bg-cream px-4 py-2"
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(["en_cours", "resolu", "rejete"] as const).map((st) => (
          <button
            key={st}
            onClick={() =>
              majLitige(l.id, {
                statut: st,
                noteAdmin: note,
                remboursement: Math.min(remb, r?.total ?? remb),
              })
            }
            className={`${chip} ${st === "resolu" ? "bg-sage text-ink" : st === "rejete" ? "bg-terra text-cream" : "bg-lilac text-ink"}`}
          >
            {st === "en_cours" ? "Prendre en charge" : st === "resolu" ? "Résoudre" : "Rejeter"}
          </button>
        ))}
      </div>
    </div>
  );
}

function Commissions() {
  const s = useStore();
  const lignes = s.reservations
    .map((r) => ({ r, c: commissionDe(r), titre: trouverAnnonce(s, r.listingId)?.titre ?? r.listingId }))
    .sort((a, b) => b.r.cree.localeCompare(a.r.cree));
  const tot = lignes.reduce(
    (a, { r, c }) => ({
      total: a.total + r.total,
      voyageur: a.voyageur + c.voyageur,
      hote: a.hote + c.hote,
      versement: a.versement + c.versementHote,
    }),
    { total: 0, voyageur: 0, hote: 0, versement: 0 },
  );
  const rembourse = s.litiges.filter((l) => l.statut === "resolu").reduce((a, l) => a + l.remboursement, 0);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Encaissé" valeur={formatTND(Math.round(tot.total))} />
        <Kpi label={`Commission voyageurs (${Math.round(COMMISSION_VOYAGEUR * 100)} %)`} valeur={formatTND(tot.voyageur)} />
        <Kpi label={`Commission hôtes (${Math.round(COMMISSION_HOTE * 100)} %)`} valeur={formatTND(tot.hote)} />
        <Kpi label="Reversé aux hôtes" valeur={formatTND(tot.versement)} />
      </div>
      {rembourse > 0 && <p className="text-sm text-inksoft">Remboursements accordés via litiges : {formatTND(rembourse)}</p>}
      <div className={`${carte} overflow-x-auto`}>
        {lignes.length === 0 ? (
          <p className="text-inksoft">Aucune réservation pour le moment.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-inksoft">
                <th className="py-2">Logement</th>
                <th>Dates</th>
                <th className="text-right">Payé</th>
                <th className="text-right">Comm. voyageur</th>
                <th className="text-right">Comm. hôte</th>
                <th className="text-right">Plateforme</th>
                <th className="text-right">Versement hôte</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map(({ r, c, titre }) => (
                <tr key={r.id} className="border-t border-cream">
                  <td className="py-2 font-semibold">{titre}</td>
                  <td>
                    {formatJour(r.debut)} → {formatJour(r.fin)}
                  </td>
                  <td className="text-right">{formatTND(Math.round(r.total))}</td>
                  <td className="text-right">{formatTND(c.voyageur)}</td>
                  <td className="text-right">{formatTND(c.hote)}</td>
                  <td className="text-right font-bold">{formatTND(c.plateforme)}</td>
                  <td className="text-right">{formatTND(c.versementHote)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
