# Cozy Stays

Cahier des Charges — Plateforme de Location de Logements (type Airbnb)

1. Présentation du projet

1.1 Contexte

Développement d'une plateforme web et mobile de mise en relation entre propriétaires de logements (villas, appartements) et voyageurs souhaitant les louer à court/moyen terme. La plateforme génère des revenus via une commission sur chaque transaction.

1.2 Objectif principal

Permettre aux hôtes de publier des annonces avec photos et détails, et aux voyageurs de rechercher, réserver et payer en ligne, avec la plateforme comme tiers de confiance qui prélève une commission.

1.3 Périmètre (Scope)

Application Web (responsive)

Application Mobile (iOS + Android)

Back-office administrateur

2. Utilisateurs et rôles

Rôle Description Actions principales Voyageur Cherche et réserve un logement S'inscrire, rechercher, réserver, payer, laisser un avis, messagerie Hôte Propriétaire qui loue son bien S'inscrire, publier une annonce, gérer calendrier/prix, accepter/refuser réservations, messagerie Admin Gère la plateforme Modération des annonces, gestion des litiges, suivi des commissions, statistiques, gestion des comptes

Note : un même utilisateur peut avoir les deux rôles (voyageur ET hôte), comme sur Airbnb.

3. Fonctionnalités — MVP (Version 1, à lancer en premier)

3.1 Authentification

Inscription/connexion (email + mot de passe)

Connexion via Google/Facebook (optionnel mais recommandé, augmente les conversions)

Vérification d'email

Récupération de mot de passe

3.2 Gestion des annonces (côté hôte)

Création d'annonce : titre, description, type de bien, adresse (avec géolocalisation), capacité (nb personnes, chambres, lits, salles de bain)

Upload multi-photos (min. 5 recommandé, avec compression automatique)

Liste d'équipements (wifi, piscine, climatisation, parking, etc.)

Définition du prix par nuit + frais de ménage + frais éventuels

Calendrier de disponibilité (bloquer/débloquer des dates)

Règles de la maison (fumeur, animaux, horaires check-in/out)

Statut de l'annonce (brouillon, publiée, désactivée)

3.3 Recherche et réservation (côté voyageur)

Recherche par ville/région + dates + nombre de voyageurs

Filtres : prix, type de bien, équipements, nombre de chambres

Fiche annonce détaillée avec galerie photos, carte, avis

Calcul automatique du prix total (nuits × prix + frais + commission)

Demande de réservation → confirmation instantanée OU validation manuelle par l'hôte (à décider)

Blocage automatique des dates réservées (anti double-booking)

3.4 Paiement

Intégration passerelle de paiement (voir section technique)

Paiement en ligne sécurisé au moment de la réservation

Répartition automatique : commission plateforme / montant hôte

Historique des transactions pour chaque utilisateur

3.5 Communication

Messagerie interne hôte ↔ voyageur (avant et après réservation)

Notifications (email + push mobile) : confirmation, rappel, message reçu

3.6 Avis et notation

Système d'avis bidirectionnel (voyageur note l'hôte/le logement, hôte note le voyageur)

Note affichée sur le profil et l'annonce

3.7 Back-office Admin

Liste des utilisateurs, annonces, réservations

Modération des annonces avant publication (anti-fraude/contenu inapproprié)

Suivi des commissions perçues

Gestion des litiges/signalements

Statistiques de base (nb réservations, revenus, croissance)

4. Fonctionnalités — Version 2 (évolutions futures)

Vérification d'identité (upload pièce d'identité)

Politique d'annulation configurable (flexible, modérée, stricte)

Système de séquestre (argent bloqué jusqu'à J+1 après check-in)

Multi-langue et multi-devise

Programme de fidélité / codes promo

Chat en temps réel (WebSocket) au lieu de messagerie asynchrone

Recommandations personnalisées (IA)

Réservation instantanée avec caution (carte bancaire pré-autorisée)

Export de calendrier iCal (sync avec Airbnb/Booking existants)

Application d'assistance hôte (statistiques de revenus, optimisation prix dynamique)

5. Modèle économique — Commission

À définir précisément, mais structure classique du marché :

Élément Exemple de référence (marché) Commission côté hôte 3% à 5% du montant de la réservation Commission côté voyageur 6% à 15% du montant de la réservation Frais de service additionnels Optionnel (assurance, support prioritaire)

Décisions à prendre :

Le paiement transite-t-il obligatoirement par la plateforme, ou peut-il y avoir un paiement hors-ligne (moins de contrôle, plus de fraude possible) ?

Reversement à l'hôte : immédiat, à J+1 après arrivée, ou à la fin du séjour ?

Politique de remboursement en cas d'annulation ?

⚠️ Point légal important : selon la Tunisie ou le pays ciblé, il peut y avoir des obligations réglementaires (déclaration d'activité, TVA sur commission, statut de prestataire de paiement). À vérifier avec un conseiller juridique/fiscal avant lancement commercial.

6. Modèle de données (entités principales)

User
 ├─ id, nom, email, téléphone, mot_de_passe_hash
 ├─ rôle (voyageur/hôte/admin)
 ├─ photo_profil, date_inscription, statut_vérification

Listing (Annonce)
 ├─ id, host_id (→ User)
 ├─ titre, description, type_bien, adresse, latitude, longitude
 ├─ capacité, nb_chambres, nb_lits, nb_sdb
 ├─ prix_nuit, frais_ménage, équipements[]
 ├─ statut (brouillon/publiée/désactivée)

ListingPhoto
 ├─ id, listing_id, url, ordre

Availability (Calendrier)
 ├─ id, listing_id, date, disponible (bool), prix_override

Booking (Réservation)
 ├─ id, listing_id, guest_id, date_debut, date_fin
 ├─ nb_voyageurs, prix_total, commission, statut
 ├─ statut_paiement, date_creation

Payment
 ├─ id, booking_id, montant, commission_plateforme, montant_host
 ├─ statut, méthode, date_transaction, id_transaction_externe

Review (Avis)
 ├─ id, booking_id, auteur_id, cible_id, note, commentaire, date

Message
 ├─ id, booking_id (ou conversation_id), expediteur_id, contenu, date, lu


7. Architecture technique recommandée

7.1 Vue d'ensemble

[App Mobile (iOS/Android)]  [App Web]
              \                /
               \              /
              [API REST/GraphQL]
                     |
         [Backend - logique métier]
                     |
        ┌────────────┼────────────┐
   [Base de données]  [Stockage fichiers]  [Services tiers]
   (PostgreSQL)        (S3 ou équivalent)  (Paiement, Email, SMS, Maps)


7.2 Stack technologique suggérée

Option recommandée pour un développeur solo (rapidité + coût maîtrisé) :

Composant Technologie suggérée Pourquoi Frontend Web Next.js (React) SEO-friendly, rapide, écosystème riche Mobile React Native (ou Flutter) Un seul code pour iOS + Android, gain de temps énorme pour un dev solo Backend/API Node.js (NestJS ou Express) ou Django (Python) NestJS si vous restez en JS partout ; Django si vous préférez Python (très robuste pour ce type d'app) Base de données PostgreSQL Fiable, gère bien les relations complexes (réservations, disponibilités) Stockage images AWS S3 ou Cloudinary Cloudinary est plus simple à démarrer (upload + redimensionnement auto inclus) Paiement Stripe (international) + solution locale si Tunisie (Flouci, Paymee, ClicToPay) Stripe est le plus simple à intégrer mais vérifier la disponibilité dans votre pays Authentification Auth0, Firebase Auth, ou système maison (JWT) Firebase Auth = gratuit jusqu'à un certain volume, rapide à mettre en place Notifications push Firebase Cloud Messaging (FCM) Standard, gratuit Cartes/géolocalisation Google Maps API ou Mapbox Mapbox souvent moins cher à volume élevé Hébergement backend Railway, Render, ou AWS/DigitalOcean Railway/Render = simple pour démarrer ; AWS = plus scalable mais plus complexe Emails transactionnels SendGrid ou Resend Confirmations, notifications

Pourquoi cette stack ? Elle minimise le nombre de technologies différentes à maîtriser, a une large communauté (facile de trouver de l'aide), et permet de développer web + mobile avec des compétences JavaScript/TypeScript communes (partage de logique entre Next.js et React Native).

7.3 Alternative "no-code / low-code" pour un MVP ultra-rapide

Si l'objectif est de valider le concept avant d'investir dans le développement complet :

Bubble.io ou FlutterFlow pour un prototype fonctionnel en quelques semaines

Utile pour tester le marché avant d'investir dans le "vrai" développement

8. Budget estimatif — Coûts de mise en place

Estimations à titre indicatif, en développant vous-même (donc hors coût de main-d'œuvre) :

Poste Coût estimé Fréquence Nom de domaine 10–15 € Annuel Hébergement backend (démarrage) 0–25 € Mensuel (gratuit au début sur Railway/Render, payant en scalant) Base de données managée 0–20 € Mensuel (souvent inclus dans l'hébergement au début) Stockage images (Cloudinary/S3) 0–15 € Mensuel (plans gratuits suffisent au début) Compte développeur Apple (App Store) ~99 $ Annuel (obligatoire pour publier sur iOS) Compte développeur Google Play ~25 $ Unique (paiement une seule fois) Passerelle de paiement (Stripe) ~2,9% + 0,30€ par transaction Par transaction (pas de frais fixe mensuel) Nom de domaine + certificat SSL Inclus généralement — Service email transactionnel 0–15 € Mensuel (plans gratuits jusqu'à un certain volume) Google Maps / Mapbox API 0–50 € Mensuel selon volume d'appels Total démarrage (avant trafic significatif) ~150–300 € Frais initiaux + premiers mois

⚠️ Les frais de passerelle de paiement locale (Tunisie) peuvent différer — à vérifier directement auprès des fournisseurs (Flouci, Paymee) car les taux et modalités changent.

9. Roadmap suggérée (phases de développement)

Phase Contenu Durée indicative (dev solo) Phase 0 Finalisation cahier des charges + maquettes (wireframes) 1–2 semaines Phase 1 Authentification + gestion des annonces (CRUD hôte) 3–4 semaines Phase 2 Recherche + fiche annonce + réservation (sans paiement) 3–4 semaines Phase 3 Intégration paiement + commission 2–3 semaines Phase 4 Messagerie + avis + notifications 2–3 semaines Phase 5 Back-office admin 2 semaines Phase 6 App mobile (si développée après le web) 4–6 semaines Phase 7 Tests, corrections, préparation publication stores 2 semaines

Total MVP complet estimé : environ 4 à 5 mois pour un développeur solo, à temps plein.

10. Points de vigilance / risques

Double-booking : bien verrouiller la logique de calendrier pour éviter que deux personnes réservent le même bien aux mêmes dates

Fraude : modération des annonces obligatoire avant publication

Paiement : ne jamais stocker les données de carte bancaire vous-même — toujours passer par le prestataire (Stripe, etc.) qui gère la conformité PCI-DSS

Aspect légal/fiscal : statut d'intermédiaire de paiement, TVA sur commission, CGU/CGV, politique de confidentialité (RGPD si utilisateurs européens) — à faire valider par un professionnel

Scalabilité : commencer simple (monolithe) puis découper en microservices seulement si le volume le justifie — ne pas sur-ingénierer dès le départ

11. Prochaines étapes concrètes

Valider/ajuster ce cahier des charges selon vos priorités

Créer des wireframes (Figma) pour les écrans clés (accueil, recherche, fiche annonce, réservation, paiement)

Choisir définitivement la stack technique

Mettre en place l'environnement de développement (repo Git, structure projet backend + frontend)

Commencer par la Phase 1 (authentification + gestion des annonces)

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8e6488f0-f7ed-4903-8236-12362d4dd21a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
