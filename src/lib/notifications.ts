/** Notifications push du navigateur (démonstration, sans serveur). */

export type EtatPush = "indisponible" | "iframe" | "refuse" | "actif" | "inactif";

export function etatPush(): EtatPush {
  if (typeof window === "undefined" || !("Notification" in window)) return "indisponible";
  if (window.top !== window.self) return "iframe";
  if (Notification.permission === "granted") return "actif";
  if (Notification.permission === "denied") return "refuse";
  return "inactif";
}

/** À appeler depuis un clic : les navigateurs exigent une action de l'utilisateur. */
export async function activerPush(): Promise<EtatPush> {
  const etat = etatPush();
  if (etat !== "inactif") return etat;
  const permission = await Notification.requestPermission();
  return permission === "granted" ? "actif" : "refuse";
}

export function notifier(titre: string, corps: string) {
  if (etatPush() !== "actif") return;
  try {
    new Notification(titre, { body: corps, tag: "maison-message" });
  } catch {
    /* certains navigateurs exigent un service worker : on ignore en démo */
  }
}
