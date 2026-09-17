import { useSyncExternalStore } from "react";
import { listings as baseListings, type Listing } from "@/lib/listings";

export type Reservation = {
  id: string;
  listingId: string;
  debut: string; // yyyy-MM-dd (arrivée)
  fin: string; // yyyy-MM-dd (départ)
  nuits: number;
  voyageurs: number;
  total: number;
  cree: string;
};

export type ListingStatut = "brouillon" | "publiee" | "desactivee";

export type Auteur = "hote" | "voyageur";

export type Message = {
  id: string;
  listingId: string;
  auteur: Auteur;
  contenu: string;
  date: string;
  lu: boolean;
};

type Store = {
  reservations: Reservation[];
  annoncesPerso: Listing[];
  statuts: Record<string, ListingStatut>;
  bloquees: Record<string, string[]>; // dates bloquées manuellement par l'hôte
  messages: Message[];
};

const CLE = "maison.store.v1";

const vide: Store = {
  reservations: [],
  annoncesPerso: [],
  statuts: {},
  bloquees: {},
  messages: [],
};

let store: Store = vide;
let charge = false;
const abonnes = new Set<() => void>();

function lire(): Store {
  if (typeof window === "undefined") return vide;
  if (charge) return store;
  charge = true;
  try {
    const brut = window.localStorage.getItem(CLE);
    if (brut) store = { ...vide, ...(JSON.parse(brut) as Store) };
  } catch {
    store = vide;
  }
  return store;
}

function ecrire(suivant: Store) {
  store = suivant;
  charge = true;
  try {
    window.localStorage.setItem(CLE, JSON.stringify(suivant));
  } catch {
    /* quota ou mode privé : on garde l'état en mémoire */
  }
  abonnes.forEach((f) => f());
}

function abonner(f: () => void) {
  abonnes.add(f);
  return () => abonnes.delete(f);
}

export function useStore(): Store {
  return useSyncExternalStore(abonner, lire, () => vide);
}

/* ---------- dates ---------- */

export function isoDate(d: Date) {
  const mois = `${d.getMonth() + 1}`.padStart(2, "0");
  const jour = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${mois}-${jour}`;
}

export function depuisIso(s: string) {
  const [a, m, j] = s.split("-").map(Number);
  return new Date(a ?? 1970, (m ?? 1) - 1, j ?? 1);
}

/** Nuits occupées : de l'arrivée (incluse) au départ (exclu). */
export function nuitsEntre(debut: string, fin: string): string[] {
  const out: string[] = [];
  const d = depuisIso(debut);
  const f = depuisIso(fin);
  while (d < f) {
    out.push(isoDate(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function nombreNuits(debut: string, fin: string) {
  return nuitsEntre(debut, fin).length;
}

/** Toutes les nuits indisponibles d'une annonce (réservations + blocages hôte). */
export function datesIndisponibles(s: Store, listingId: string): string[] {
  const reservees = s.reservations
    .filter((r) => r.listingId === listingId)
    .flatMap((r) => nuitsEntre(r.debut, r.fin));
  return Array.from(new Set([...reservees, ...(s.bloquees[listingId] ?? [])]));
}

export function chevauche(s: Store, listingId: string, debut: string, fin: string) {
  const prises = new Set(datesIndisponibles(s, listingId));
  return nuitsEntre(debut, fin).some((n) => prises.has(n));
}

/* ---------- annonces ---------- */

export function toutesAnnonces(s: Store): Listing[] {
  const perso = new Map(s.annoncesPerso.map((l) => [l.id, l]));
  const base = baseListings.map((l) => perso.get(l.id) ?? l);
  const nouvelles = s.annoncesPerso.filter((l) => !baseListings.some((b) => b.id === l.id));
  return [...base, ...nouvelles];
}

export function annoncesVisibles(s: Store): Listing[] {
  return toutesAnnonces(s).filter((l) => statutDe(s, l.id) === "publiee");
}

export function statutDe(s: Store, id: string): ListingStatut {
  return s.statuts[id] ?? "publiee";
}

export function trouverAnnonce(s: Store, id: string): Listing | undefined {
  return toutesAnnonces(s).find((l) => l.id === id);
}

export function definirStatut(id: string, statut: ListingStatut) {
  const s = lire();
  ecrire({ ...s, statuts: { ...s.statuts, [id]: statut } });
}

export function enregistrerAnnonce(annonce: Listing) {
  const s = lire();
  const existe = s.annoncesPerso.some((l) => l.id === annonce.id);
  ecrire({
    ...s,
    annoncesPerso: existe
      ? s.annoncesPerso.map((l) => (l.id === annonce.id ? annonce : l))
      : [...s.annoncesPerso, annonce],
  });
}

export function supprimerAnnonce(id: string) {
  const s = lire();
  const { [id]: _statut, ...statuts } = s.statuts;
  const { [id]: _bloc, ...bloquees } = s.bloquees;
  ecrire({
    reservations: s.reservations.filter((r) => r.listingId !== id),
    annoncesPerso: s.annoncesPerso.filter((l) => l.id !== id),
    statuts,
    bloquees,
    messages: s.messages.filter((m) => m.listingId !== id),
  });
}

export function estAnnoncePerso(s: Store, id: string) {
  return s.annoncesPerso.some((l) => l.id === id);
}

/* ---------- calendrier hôte ---------- */

export function basculerBlocage(listingId: string, date: string) {
  const s = lire();
  const actuelles = s.bloquees[listingId] ?? [];
  const suivantes = actuelles.includes(date)
    ? actuelles.filter((d) => d !== date)
    : [...actuelles, date];
  ecrire({ ...s, bloquees: { ...s.bloquees, [listingId]: suivantes } });
}

export function definirBlocages(listingId: string, dates: string[]) {
  const s = lire();
  ecrire({ ...s, bloquees: { ...s.bloquees, [listingId]: Array.from(new Set(dates)) } });
}

/* ---------- réservations ---------- */

export function reserver(input: {
  listingId: string;
  debut: string;
  fin: string;
  voyageurs: number;
  total: number;
}): { ok: true; reservation: Reservation } | { ok: false; erreur: string } {
  const s = lire();
  const nuits = nombreNuits(input.debut, input.fin);
  if (nuits < 1) return { ok: false, erreur: "Choisissez au moins une nuit." };
  if (statutDe(s, input.listingId) !== "publiee")
    return { ok: false, erreur: "Cette annonce n'accepte pas de réservation." };
  if (chevauche(s, input.listingId, input.debut, input.fin))
    return { ok: false, erreur: "Ces dates viennent d'être prises. Choisissez d'autres nuits." };

  const reservation: Reservation = {
    id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    listingId: input.listingId,
    debut: input.debut,
    fin: input.fin,
    nuits,
    voyageurs: input.voyageurs,
    total: input.total,
    cree: new Date().toISOString(),
  };
  ecrire({ ...s, reservations: [...s.reservations, reservation] });
  return { ok: true, reservation };
}

export function annulerReservation(id: string) {
  const s = lire();
  ecrire({ ...s, reservations: s.reservations.filter((r) => r.id !== id) });
}

export function reservationsDe(s: Store, listingId: string) {
  return s.reservations
    .filter((r) => r.listingId === listingId)
    .sort((a, b) => a.debut.localeCompare(b.debut));
}

export function formatJour(iso: string) {
  return depuisIso(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ---------- messagerie ---------- */

export function messagesDe(s: Store, listingId: string): Message[] {
  return s.messages
    .filter((m) => m.listingId === listingId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function nonLusDe(s: Store, listingId: string, pour: Auteur) {
  return s.messages.filter(
    (m) => m.listingId === listingId && !m.lu && m.auteur !== pour,
  ).length;
}

export function totalNonLus(s: Store, pour: Auteur) {
  return s.messages.filter((m) => !m.lu && m.auteur !== pour).length;
}

export function envoyerMessage(listingId: string, auteur: Auteur, contenu: string): Message | null {
  const texte = contenu.trim();
  if (!texte) return null;
  const s = lire();
  const message: Message = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    listingId,
    auteur,
    contenu: texte,
    date: new Date().toISOString(),
    lu: false,
  };
  ecrire({ ...s, messages: [...s.messages, message] });
  return message;
}

/** Marque comme lus les messages reçus par `pour` dans cette conversation. */
export function marquerLu(listingId: string, pour: Auteur) {
  const s = lire();
  let change = false;
  const messages = s.messages.map((m) => {
    if (m.listingId === listingId && m.auteur !== pour && !m.lu) {
      change = true;
      return { ...m, lu: true };
    }
    return m;
  });
  if (change) ecrire({ ...s, messages });
}

export function formatHeure(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
