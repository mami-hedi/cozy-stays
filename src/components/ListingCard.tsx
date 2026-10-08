import { Link } from "@tanstack/react-router";
import type { Listing } from "@/lib/listings";
import { useStore, reputationDe, formatNote } from "@/lib/reservations";

export function ListingCard({ listing }: { listing: Listing }) {
  const store = useStore();
  const { note, nombre } = reputationDe(store, listing);
  return (
    <Link
      to="/logement/$id"
      params={{ id: listing.id }}
      className="block rounded-[1.75rem] bg-surface clay p-3 transition-transform hover:-translate-y-1"
    >
      <img
        src={listing.image}
        alt={`${listing.titre} à ${listing.ville}`}
        loading="lazy"
        width={1088}
        height={800}
        className="w-full aspect-[4/3] rounded-3xl object-cover"
      />
      <div className="px-2 pt-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold">{listing.titre}</h3>
            <p className="text-sm text-inksoft">
              {listing.ville} · {listing.voyageurs} pers · {listing.chambres} ch.
            </p>
          </div>
          <span className="rounded-full bg-butter px-2.5 py-1 text-xs font-bold whitespace-nowrap">
            {nombre > 0 ? `★ ${formatNote(note)}` : "Nouveau"}
          </span>
        </div>
        {listing.exemple && (
          <p className="mt-2 text-xs font-semibold text-inksoft">Annonce d'exemple</p>
        )}
        <p className="mt-3 text-base font-bold">
          {listing.prixNuit} <span className="text-sm font-semibold text-inksoft">TND/nuit</span>
        </p>
      </div>
    </Link>
  );
}
