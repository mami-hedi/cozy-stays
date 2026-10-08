import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export type Section = { titre: string; contenu: ReactNode };

/** Mise en page commune des pages légales. */
export function LegalPage({
  titre,
  maj,
  sections,
}: {
  titre: string;
  maj: string;
  sections: Section[];
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 pt-10 pb-16">
        <h1 className="text-4xl font-semibold">{titre}</h1>
        <p className="mt-2 text-sm font-semibold text-inksoft">Dernière mise à jour : {maj}</p>
        <p className="mt-6 rounded-2xl bg-butter px-4 py-3 text-sm font-semibold text-ink">
          Texte de travail à faire valider par un juriste avant la mise en production. Les éléments
          entre [crochets] sont à remplacer par vos informations réelles.
        </p>
        <div className="mt-8 space-y-8">
          {sections.map((s) => (
            <section key={s.titre}>
              <h2 className="text-xl font-semibold">{s.titre}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-ink/80">{s.contenu}</div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
