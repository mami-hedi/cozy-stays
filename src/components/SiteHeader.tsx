import { Link } from "@tanstack/react-router";
import { useState } from "react";

const links = [
  { to: "/recherche", label: "Explorer" },
  { to: "/devenir-hote", label: "Devenir hôte" },
  { to: "/mes-annonces", label: "Mes annonces" },
  { to: "/aide", label: "Aide" },
] as const;

const navClass =
  "px-4 py-2 rounded-full text-inksoft text-sm font-semibold transition-colors hover:text-ink";
const navActiveClass = "px-4 py-2 rounded-full bg-terra text-cream text-sm font-semibold";

function NavLink({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <Link to={to} className={navClass} activeProps={{ className: navActiveClass }} onClick={onClick}>
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6">
      <nav className="flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-11 rounded-2xl bg-terra clay grid place-items-center">
            <span className="font-display text-lg font-bold text-cream">m</span>
          </div>
          <span className="font-display text-2xl font-semibold">Maison</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1 rounded-full bg-surface/70 clay-sm p-1.5">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} label={l.label} />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden sm:block rounded-2xl bg-surface clay-sm px-5 py-2.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
          >
            Se connecter
          </button>
          <div className="size-11 rounded-2xl bg-powder clay-sm grid place-items-center font-bold text-ink">
            S
          </div>
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
          <button
            type="button"
            className="mt-1 rounded-2xl bg-terra text-cream px-4 py-2.5 text-sm font-bold sm:hidden"
            onClick={() => setOpen(false)}
          >
            Se connecter
          </button>
        </div>
      )}
    </header>
  );
}
