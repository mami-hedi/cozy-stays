import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { SITE_NAME } from "@/lib/site";
import { ACCES_DEMO } from "@/lib/access";
import { useStore } from "@/lib/reservations";

const liensPublics = [
  { to: "/recherche", label: "Explorer" },
  { to: "/conseiller", label: "Conseiller IA" },
  { to: "/devenir-hote", label: "Devenir hôte" },
  { to: "/aide", label: "Aide" },
] as const;

const navClass =
  "px-4 py-2 rounded-full text-inksoft text-sm font-semibold transition-colors hover:text-ink";
const navActiveClass = "px-4 py-2 rounded-full bg-terra text-cream text-sm font-semibold";

function NavLink({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <Link
      to={to}
      className={navClass}
      activeProps={{ className: navActiveClass }}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const store = useStore();
  // « Mes annonces » n'apparaît qu'une fois une annonce créée ; « Admin » seulement en accès démo.
  const aDesAnnonces = store.annoncesPerso.length > 0;
  const links = [
    ...liensPublics.slice(0, 3),
    ...(aDesAnnonces || ACCES_DEMO
      ? ([{ to: "/mes-annonces", label: "Mes annonces" }] as const)
      : []),
    liensPublics[3],
    ...(ACCES_DEMO ? ([{ to: "/admin", label: "Admin" }] as const) : []),
  ];

  return (
    <header className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6">
      <nav className="flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-11 rounded-2xl bg-terra clay grid place-items-center">
            <span className="font-display text-lg font-bold text-cream">
              {SITE_NAME.charAt(0).toLowerCase()}
            </span>
          </div>
          <span className="font-display text-2xl font-semibold">{SITE_NAME}</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1 rounded-full bg-surface/70 clay-sm p-1.5">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} label={l.label} />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden size-11 rounded-2xl bg-surface clay-sm grid place-items-center text-ink"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden mt-3 rounded-3xl bg-surface clay-sm p-3 flex flex-col gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} label={l.label} onClick={() => setOpen(false)} />
          ))}
        </div>
      )}
    </header>
  );
}
