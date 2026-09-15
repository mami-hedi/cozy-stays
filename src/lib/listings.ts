import villaOceane from "@/assets/villa-oceane.jpg";
import appartJardin from "@/assets/appart-jardin.jpg";
import loftPanorama from "@/assets/loft-panorama.jpg";
import maisonBleue from "@/assets/maison-bleue.jpg";
import darPatio from "@/assets/dar-patio.jpg";
import studioMedina from "@/assets/studio-medina.jpg";

export type Listing = {
  id: string;
  titre: string;
  ville: string;
  type: "Villa" | "Appartement" | "Maison" | "Studio";
  voyageurs: number;
  chambres: number;
  lits: number;
  sdb: number;
  prixNuit: number;
  fraisMenage: number;
  note: number;
  avis: number;
  image: string;
  hote: string;
  description: string;
  equipements: string[];
  regles: string[];
};

export const COMMISSION_VOYAGEUR = 0.1;

export const listings: Listing[] = [
  {
    id: "villa-oceane",
    titre: "Villa Océane",
    ville: "Sidi Bou Saïd",
    type: "Villa",
    voyageurs: 4,
    chambres: 2,
    lits: 3,
    sdb: 2,
    prixNuit: 120,
    fraisMenage: 40,
    note: 4.9,
    avis: 87,
    image: villaOceane,
    hote: "Leïla",
    description:
      "Une villa blanche aux portes bleues, à dix minutes à pied du port. La piscine entourée d'oliviers reste à l'ombre l'après-midi, et la terrasse du haut donne sur la baie.",
    equipements: ["Piscine", "Wifi fibre", "Climatisation", "Parking privé", "Cuisine équipée"],
    regles: ["Arrivée dès 15h", "Départ avant 11h", "Non-fumeur", "Animaux sur demande"],
  },
  {
    id: "appart-jardin",
    titre: "Appart Jardin",
    ville: "Carthage",
    type: "Appartement",
    voyageurs: 2,
    chambres: 1,
    lits: 1,
    sdb: 1,
    prixNuit: 65,
    fraisMenage: 25,
    note: 4.7,
    avis: 54,
    image: appartJardin,
    hote: "Karim",
    description:
      "Un appartement lumineux au premier étage, avec un balcon plein sud ouvert sur les collines. Parfait pour un séjour à deux, au calme mais à cinq minutes des cafés.",
    equipements: ["Wifi", "Balcon", "Climatisation", "Lave-linge"],
    regles: ["Arrivée dès 16h", "Départ avant 10h", "Non-fumeur", "Pas de fête"],
  },
  {
    id: "loft-panorama",
    titre: "Loft Panorama",
    ville: "La Marsa",
    type: "Appartement",
    voyageurs: 6,
    chambres: 3,
    lits: 4,
    sdb: 2,
    prixNuit: 180,
    fraisMenage: 55,
    note: 5,
    avis: 31,
    image: loftPanorama,
    hote: "Sonia",
    description:
      "Dernier étage, baies vitrées sur toute la façade et grande terrasse pour les soirées. Trois chambres, deux salles de bain, et un ascenseur direct depuis le parking.",
    equipements: ["Terrasse", "Wifi fibre", "Ascenseur", "Climatisation", "Parking"],
    regles: ["Arrivée dès 15h", "Départ avant 11h", "Non-fumeur", "Animaux non admis"],
  },
  {
    id: "maison-bleue",
    titre: "Maison Bleue",
    ville: "Hammamet",
    type: "Maison",
    voyageurs: 5,
    chambres: 3,
    lits: 3,
    sdb: 2,
    prixNuit: 140,
    fraisMenage: 45,
    note: 4.8,
    avis: 62,
    image: maisonBleue,
    hote: "Nadia",
    description:
      "Une maison de pêcheur restaurée, volets bleus et terrasse suspendue au-dessus de la mer. On entend les vagues depuis les chambres.",
    equipements: ["Vue mer", "Wifi", "Barbecue", "Climatisation"],
    regles: ["Arrivée dès 14h", "Départ avant 11h", "Non-fumeur"],
  },
  {
    id: "dar-patio",
    titre: "Dar du Patio",
    ville: "Tunis, Médina",
    type: "Maison",
    voyageurs: 8,
    chambres: 4,
    lits: 5,
    sdb: 3,
    prixNuit: 210,
    fraisMenage: 70,
    note: 4.9,
    avis: 44,
    image: darPatio,
    hote: "Youssef",
    description:
      "Une demeure traditionnelle organisée autour d'un patio carrelé, avec ses arcades et son olivier centenaire. Idéale pour une grande tablée en famille.",
    equipements: ["Patio", "Wifi", "Climatisation", "Cuisine équipée", "Petit-déjeuner inclus"],
    regles: ["Arrivée dès 15h", "Départ avant 11h", "Non-fumeur", "Pas de fête"],
  },
  {
    id: "studio-medina",
    titre: "Studio Arcade",
    ville: "Sousse",
    type: "Studio",
    voyageurs: 2,
    chambres: 1,
    lits: 1,
    sdb: 1,
    prixNuit: 55,
    fraisMenage: 20,
    note: 4.6,
    avis: 96,
    image: studioMedina,
    hote: "Amine",
    description:
      "Un studio clair avec grande fenêtre en arche, lit en lin et coin cuisine complet. Simple, calme, à deux rues de la plage.",
    equipements: ["Wifi", "Climatisation", "Cuisine équipée", "Lave-linge"],
    regles: ["Arrivée dès 15h", "Départ avant 10h", "Non-fumeur"],
  },
];

export function getListing(id: string) {
  return listings.find((l) => l.id === id);
}

export function prixSejour(listing: Listing, nuits: number) {
  const sousTotal = listing.prixNuit * nuits;
  const service = Math.round((sousTotal + listing.fraisMenage) * COMMISSION_VOYAGEUR);
  return {
    nuits,
    sousTotal,
    fraisMenage: listing.fraisMenage,
    service,
    total: sousTotal + listing.fraisMenage + service,
  };
}

export function formatTND(valeur: number) {
  return `${valeur.toLocaleString("fr-FR")} TND`;
}
