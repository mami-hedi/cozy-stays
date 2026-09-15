import { Link } from "@tanstack/react-router";

const navClass =
  "px-4 py-2 rounded-full text-inksoft text-sm font-semibold transition-colors hover:text-ink";
const navActiveClass = "px-4 py-2 rounded-full bg-terra text-cream text-sm font-semibold";

export function SiteHeader() {
  return (
    <header className="mx-auto max-w-6xl px-6 pt-6">
      <nav className="flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-11 rounded-2xl bg-terra clay grid place-items-center">
            <span className="font-display text-lg font-bold text-cream">m</span>
          </div>
          <span className="font-display text-2xl font-semibold">Maison</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 rounded-full bg-surface/70 clay-sm p-1.5">
          <Link to="/recherche" className={navClass} activeProps={{ className: navActiveClass }}>
            Explorer
          </Link>
          <Link to="/devenir-hote" className={navClass} activeProps={{ className: navActiveClass }}>
            Devenir hôte
          </Link>
          <Link to="/aide" className={navClass} activeProps={{ className: navActiveClass }}>
            Aide
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-2xl bg-surface clay-sm px-5 py-2.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
          >
            Se connecter
          </button>
          <div className="size-11 rounded-2xl bg-powder clay-sm grid place-items-center font-bold text-ink">
            S
          </div>
        </div>
      </nav>
    </header>
  );
}
