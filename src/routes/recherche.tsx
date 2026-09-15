import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { ListingCard } from "@/components/ListingCard";
import { listings } from "@/lib/listings";

export const Route = createFileRoute("/recherche")({
  head: () => ({
    meta: [
      { title: "Rechercher un logement — Maison" },
      {
        name: "description",
        content:
          "Filtrez villas, maisons et appartements par prix, type de bien, chambres et équipements.",
      },
      { property: "og:title", content: "Rechercher un logement — Maison" },
      {
        property: "og:description",
        content: "Villas, maisons et appartements vérifiés, filtrables en un clic.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Recherche,
});

const types = ["Tous", "Villa", "Maison", "Appartement", "Studio"] as const;
const chambresOptions = [1, 2, 3, 4] as const;
const equipements = ["Piscine", "Wifi", "Climatisation", "Vue mer", "Parking"] as const;

function Recherche() {
  const [type, setType] = useState<(typeof types)[number]>("Tous");
  const [prixMax, setPrixMax] = useState(220);
  const [chambresMin, setChambresMin] = useState(1);
  const [equipementsActifs, setEquipementsActifs] = useState<string[]>([]);

  const resultats = useMemo(
    () =>
      listings.filter((l) => {
        if (type !== "Tous" && l.type !== type) return false;
        if (l.prixNuit > prixMax) return false;
        if (l.chambres < chambresMin) return false;
        return equipementsActifs.every((e) =>
          l.equipements.some((eq) => eq.toLowerCase().includes(e.toLowerCase())),
        );
      }),
    [type, prixMax, chambresMin, equipementsActifs],
  );

  function toggleEquipement(e: string) {
    setEquipementsActifs((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16">
        <h1 className="text-4xl font-semibold">Explorer les logements</h1>
        <p className="mt-2 text-lg text-inksoft">
          {resultats.length} logement{resultats.length > 1 ? "s" : ""} disponible
          {resultats.length > 1 ? "s" : ""} · Tunisie
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-[1.75rem] bg-surface clay p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-inksoft">Type de bien</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={
                    t === type
                      ? "rounded-2xl bg-terra px-3.5 py-2 text-sm font-bold text-cream"
                      : "rounded-2xl bg-cream px-3.5 py-2 text-sm font-semibold text-inksoft"
                  }
                >
                  {t}
                </button>
              ))}
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-wide text-inksoft">
              Prix max / nuit
            </p>
            <input
              type="range"
              min={50}
              max={250}
              step={5}
              value={prixMax}
              onChange={(e) => setPrixMax(Number(e.target.value))}
              className="mt-3 w-full accent-terra"
              aria-label="Prix maximum par nuit"
            />
            <p className="mt-1 text-base font-bold">{prixMax} TND</p>

            <p className="mt-7 text-xs font-bold uppercase tracking-wide text-inksoft">Chambres</p>
            <div className="mt-3 flex gap-2">
              {chambresOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setChambresMin(c)}
                  className={
                    c === chambresMin
                      ? "size-10 rounded-2xl bg-terra font-bold text-cream"
                      : "size-10 rounded-2xl bg-cream font-semibold text-inksoft"
                  }
                >
                  {c}+
                </button>
              ))}
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-wide text-inksoft">
              Équipements
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {equipements.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => toggleEquipement(e)}
                  className={
                    equipementsActifs.includes(e)
                      ? "rounded-2xl bg-sage px-3.5 py-2 text-sm font-bold text-ink"
                      : "rounded-2xl bg-cream px-3.5 py-2 text-sm font-semibold text-inksoft"
                  }
                >
                  {e}
                </button>
              ))}
            </div>
          </aside>

          <div>
            {resultats.length === 0 ? (
              <div className="rounded-[1.75rem] bg-surface clay p-10 text-center">
                <p className="text-lg font-bold">Aucun logement ne correspond</p>
                <p className="mt-2 text-inksoft">
                  Essayez d'augmenter le prix maximum ou de retirer un filtre.
                </p>
              </div>
            ) : (
              <div className="grid gap-7 sm:grid-cols-2">
                {resultats.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
