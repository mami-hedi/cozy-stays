import { Link } from "@tanstack/react-router";
import { SITE_NAME } from "@/lib/site";

const liens = [
  { to: "/mentions-legales", label: "Mentions légales" },
  { to: "/cgu", label: "Conditions d'utilisation" },
  { to: "/confidentialite", label: "Confidentialité" },
  { to: "/annulation", label: "Politique d'annulation" },
  { to: "/aide", label: "Aide" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-6 pb-10 pt-6">
      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-inksoft">
          © {new Date().getFullYear()} {SITE_NAME}. Version de démonstration.
        </p>
        <nav aria-label="Informations légales" className="flex flex-wrap gap-x-5 gap-y-2">
          {liens.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-semibold text-inksoft hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
