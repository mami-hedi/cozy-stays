/**
 * Accès aux espaces internes (back-office admin).
 *
 * Le site n'a pas encore de comptes utilisateurs ni de base de données : l'accès
 * ne peut donc pas être sécurisé réellement. En attendant l'authentification
 * (étape 2), l'espace admin n'est ouvert qu'en développement, ou si la variable
 * VITE_ACCES_DEMO vaut "true" (démonstration à des partenaires).
 *
 * Quand l'authentification existera, remplacer ce fichier par un contrôle de rôle
 * vérifié côté serveur.
 */
export const ACCES_DEMO: boolean =
  import.meta.env.DEV || import.meta.env["VITE_ACCES_DEMO"] === "true";
