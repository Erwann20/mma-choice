---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
inputDocuments:
  - "_bmad-output/planning-artifacts/prds/prd-mma_choice-2026-07-27/prd.md"
  - "_bmad-output/planning-artifacts/architecture/architecture-mma_choice-2026-07-27/ARCHITECTURE-SPINE.md"
  - "_bmad-output/planning-artifacts/ux-designs/ux-mma_choice-2026-07-27/DESIGN.md"
  - "_bmad-output/planning-artifacts/ux-designs/ux-mma_choice-2026-07-27/EXPERIENCE.md"
---

# MMA Choice - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for MMA Choice V1, decomposing the requirements from the PRD, the UX design contract (DESIGN.md + EXPERIENCE.md), and the Architecture spine into implementable stories. V1 scope = the "Faire ma carrière" mode only; the other two Accueil modes are deferred.

## Requirements Inventory

### Functional Requirements

- **FR-1**: Le joueur peut choisir le Sexe (Homme/Femme), un pays et un âge de départ ; le Sexe restreint les Divisions proposées à la grille correspondante.
- **FR-2**: Le joueur peut choisir des critères de départ (origine, style, entourage) qui distribuent les Stats/Jauges initiales et posent des Flags.
- **FR-3**: Le joueur fixe une Division de poids de départ parmi les catégories officielles UFC correspondant au Sexe.
- **FR-4**: La Carrière se déroule année par année (une poignée d'Événements/an, ≥1 Combat quand le contexte s'y prête) et se termine automatiquement à l'âge-limite.
- **FR-5**: Le joueur progresse de Palier (IMMAF → Régional → Organisation majeure) selon résultats/Réputation et peut remporter la ceinture de sa Division.
- **FR-6**: Le joueur peut consulter à tout moment ses Stats de combat, Jauges méta, Division, Style, Palier et palmarès.
- **FR-7**: Le contenu (Événements, etc.) est entièrement piloté par la data (JSON) ; ajouter un Événement n'exige aucun changement de code ; un contenu invalide échoue au build/chargement.
- **FR-8**: Le moteur sélectionne l'Événement suivant par tirage pondéré dans le Pool éligible, en évitant les Événements déjà vus (anti-répétition).
- **FR-9**: Un Choix peut poser un Flag qui débloque/modifie des Événements ultérieurs, y compris de façon différée (délai en tours/années).
- **FR-10**: L'issue d'un Combat combine qualité des Choix et écart de niveau adverse, produisant un Degré de victoire (nette / médiocre / défaite / upset).
- **FR-11**: Le joueur gagne de l'Argent (bourses, sponsors débloqués par Réputation+Followers) et le réinvestit dans son camp pour améliorer Stats/Forme.
- **FR-12**: Le joueur gagne des Followers via victoires et Événements de trash talk/clash, avec risque de bad buzz (baisse Mental/Réputation).
- **FR-13**: La Forme/Santé se dégrade avec combats, blessures et coupes de poids ; changer de Division déclenche des Événements de coupe de poids.
- **FR-14**: À la retraite, le système calcule un Score de carrière /100 et affiche un récap classant le joueur.
- **FR-15**: Le Style du Combattant peut évoluer en cours de Carrière via l'entraînement et certains Événements.
- **FR-16**: Le système génère l'adversaire d'un Combat en calibrant son niveau sur Palier, Division et Réputation courants.

### NonFunctional Requirements

- **NFR-1** (Zéro-friction): Aucun compte/login, gratuit, sans pub ; le premier tap après « Faire ma carrière » est la création, jamais un mur.
- **NFR-2** (Mobile-first): Web app mobile-first, colonne unique, responsive, zones tactiles ≥ 44–48 px.
- **NFR-3** (Snackable): Une carrière complète se joue en quelques minutes.
- **NFR-4** (Persistance): Sauvegarde locale (localStorage) ; la carrière survit à la fermeture d'onglet/refresh et reprend sur l'événement exact.
- **NFR-5** (Déterminisme): Mêmes critères de départ + mêmes choix ⇒ même carrière et Score reproductible.
- **NFR-6** (Variété): Deux carrières aux mêmes critères partagent < 40 % d'Événements communs (SM-3) ; faible redondance.
- **NFR-7** (Ton & langue): Ton réaliste, sobre, 2ᵉ personne ; UI en français.
- **NFR-8** (Front-only): Déploiement statique, aucun backend, aucun appel réseau pour le gameplay.
- **NFR-9** (Volume de contenu): Le système supporte 200–400+ Événements sans changement de code.
- **NFR-10** (Accessibilité): Plancher a11y — contraste AA du texte, ordre de focus, reduced-motion, labels lecteur d'écran pour les variations de stats, mise à l'échelle du texte.

### Additional Requirements

*(from the Architecture spine — technical constraints that shape stories; ADs referenced)*

- **Scaffold / greenfield** (no external starter mandated): initialiser une app Vite 8 + React 19.2 + TanStack Router 1.170 + Zustand 5 + Zod 4.4 + pure-rand 8.4 + Vitest. UI = composants custom (React + tokens CSS), sans lib de composants à licence. → **Epic 1, Story 1**.
- **AD-1** Functional Core / Imperative Shell : `src/engine` pur (aucun import framework) ; `store`/`routes`/`ui` peuvent importer `engine`, jamais l'inverse. Règle ESLint de frontière d'import à mettre en place.
- **AD-2** État unique `GameState` + reducer ; unique voie de mutation (le store délègue au reducer).
- **AD-3** PRNG à graine, état sérialisable stocké dans `GameState` ; `Math.random()` banni dans `engine` (lint `no-restricted-globals`).
- **AD-4** Contenu = JSON validé par schéma Zod (type via `z.infer`) ; ids globalement uniques (rejet au chargement) ; validation au build/CI qui casse le build ; instances d'`Opponent` générées à partir d'archétypes authorés.
- **AD-5** Effets/conditions = enum de canaux fermé et versionné (`{target,op,value}` / `{target,cmp,value}`) ; jamais un interne moteur ; stats bornées 0–100.
- **AD-6** Pool trié par id avant tirage pondéré à graine ; flags « vu » ; Pool jamais vide (filler par phase) ; cooldown/cap sur les répétables.
- **AD-7** `persist` Zustand = seul écrivain de localStorage, clé versionnée `mmachoice.save.v1` ; `GameState` JSON-sérialisable ; contenu référencé par id uniquement ; champ `saveVersion` pour migration.
- **AD-8** TanStack Router possède la navigation entre écrans ; le store est la source de vérité, pas l'URL.
- **AD-9** Build statique (Vite) déployé sur hébergement statique/CDN ; pas de backend.

### UX Design Requirements

*(from DESIGN.md + EXPERIENCE.md — first-class inputs; each specific enough for a story)*

- **UX-DR1**: Implémenter le socle de tokens (couleurs Direction B, rampe typo Inter, spacing, rounded) en variables CSS/thème depuis DESIGN.md.
- **UX-DR2**: Composant `fighterHeader` (ancre d'identité statique ; métadonnées mises à jour en direct).
- **UX-DR3**: Rangée `dataChip` (cible tactile ouvrant le bottom-sheet ; une chip peut porter l'accent).
- **UX-DR4**: Composant `statBar` (jauges avec remplissage dégradé lime).
- **UX-DR5**: Composant `eventCard` (overline, drapeau de risque ambre, unité de lecture avec les choix).
- **UX-DR6**: Composant `choiceCard` (chips d'effet = effets déclarés/déterministes uniquement ; variante primaire ; 2–4 choix).
- **UX-DR7**: `buttonPrimary` / `buttonSecondary` (un seul primaire par vue ; hauteur ≥ 48 px).
- **UX-DR8**: `bottomSheet` du dashboard stats (remonte sur la Carrière, dismiss revient à la position de lecture, profondeur modale = 1).
- **UX-DR9**: `resultBanner` de combat gradué (couleurs victoire/défaite/upset).
- **UX-DR10**: Composant `toast` (ex. « Reprise sauvegardée »).
- **UX-DR11**: `confirmDialog` (« Abandonner cette carrière ? » — garde-fou de perte de données).
- **UX-DR12**: `skeleton` de chargement.
- **UX-DR13**: Écran Accueil, 3 modes (1 jouable, 2 « bientôt » avec ack inline sans navigation).
- **UX-DR14**: Flux Création multi-étapes (barre de progression, back non destructif, grille de divisions filtrée par sexe).
- **UX-DR15**: Écran Récap (score /100 en display, timeline, temps forts, « Partager mon score » via Web Share API + fallback presse-papiers).
- **UX-DR16**: Patterns d'état (loading / reprise / empty / error / win / loss / upset / blessure / vieillissement / fin de carrière).
- **UX-DR17**: Implémentation du plancher a11y (contraste AA, ordre de focus, cibles ≥ 44–48 px, reduced-motion, live regions pour les deltas de stats, mise à l'échelle texte).
- **UX-DR18**: Microcopie voix & ton (2ᵉ personne, sobre, français) sur toutes les chaînes système.
- **UX-DR19**: Layout mobile-first responsive (colonne unique, portrait).

### FR Coverage Map

- **FR-1** (identité: sexe/pays/âge): Epic 1 — écran de création, sexe filtrant les divisions.
- **FR-2** (critères de départ: origine/style/entourage): Epic 1 — création, distribution stats + flags.
- **FR-3** (division de poids UFC): Epic 1 — sélection division gated par sexe.
- **FR-4** (déroulé annuel + âge-out): Epic 1 — boucle année par année du moteur.
- **FR-5** (paliers & ceintures): Epic 3 — progression IMMAF → régional → org majeure.
- **FR-6** (tableau de bord des stats): Epic 1 — bottom-sheet stats.
- **FR-7** (schéma d'événement en data): Epic 1 — pipeline contenu JSON + Zod.
- **FR-8** (sélection pondérée + anti-répétition): Epic 1 — moteur de pool.
- **FR-9** (conséquences ramifiées/différées): Epic 1 — flags, effets différés.
- **FR-10** (issue graduée du combat): Epic 2 — résolution de combat.
- **FR-11** (économie: bourses/sponsors): Epic 4 — systèmes méta.
- **FR-12** (réseaux sociaux: followers/buzz): Epic 4 — systèmes méta.
- **FR-13** (santé/blessures/coupe de poids): Epic 4 — systèmes méta.
- **FR-14** (score de carrière & récap): Epic 1 (calcul + récap de base) ; Epic 5 (finition + partage).
- **FR-15** (évolution du style): Epic 3 — progression de carrière.
- **FR-16** (génération des adversaires): Epic 2 — combat.

## Epic List

### Epic 1: Fondation & boucle de carrière jouable
Le joueur peut créer un combattant (sexe, pays, âge, origine/style, entourage, division UFC) et vivre une carrière complète de choix narratifs, année après année, jusqu'à la retraite avec un score final ; la partie se sauvegarde et reprend à l'événement exact. Cette epic pose le socle technique : scaffold de la stack, moteur pur et déterministe (GameState + reducer + RNG à graine), pipeline de contenu JSON validé par Zod (pool pondéré, anti-répétition, flags), les tokens et composants UX de base, et la persistance localStorage. Livre une tranche verticale **jouable de bout en bout**.
**FRs covered:** FR-1, FR-2, FR-3, FR-4, FR-6, FR-7, FR-8, FR-9, FR-14

### Epic 2: Le combat
Les événements de combat produisent une **issue graduée** (victoire nette / médiocre / défaite / upset) qui combine la qualité des choix et l'écart de niveau avec l'adversaire, ce dernier étant généré et calibré par le moteur à partir d'archétypes. Rend la carrière authentiquement MMA.
**FRs covered:** FR-10, FR-16

### Epic 3: Progression & carrière longue
Le joueur gravit les paliers du circuit (IMMAF amateur → régional → organisation majeure), vise et remporte les ceintures de sa division, et voit son style de combat évoluer au fil de la carrière via l'entraînement et certains événements.
**FRs covered:** FR-5, FR-15

### Epic 4: Systèmes méta : argent, réseaux, santé
L'argent (bourses, sponsors débloqués par réputation + followers, réinvestissement dans le camp), les réseaux sociaux (followers, trash talk, bad buzz) et la santé (blessures, coupe de poids) ajoutent les leviers réalistes qui s'entrelacent avec les choix de carrière.
**FRs covered:** FR-11, FR-12, FR-13

### Epic 5: Finition, partage & accessibilité
L'accueil à 3 modes (« Faire ma carrière » jouable, les deux autres « bientôt »), le partage du score en fin de carrière (Web Share API + fallback presse-papiers), le plancher d'accessibilité (contraste AA, focus, reduced-motion, live regions), les patterns d'état soignés, et un premier lot de contenu suffisant pour la variété rendent le jeu prêt à sortir.
**FRs covered:** FR-14 (finition récap + partage) ; adresse NFR-6 (variété), NFR-9 (volume de contenu), NFR-10 (accessibilité) et les UX-DR de finition.

## Epic 1: Fondation & boucle de carrière jouable

Le joueur peut créer un combattant et vivre une carrière complète de choix narratifs, année par année, jusqu'à la retraite avec un score final ; la partie se sauvegarde et reprend. Cette epic pose le socle déterministe, le pipeline de contenu et l'UX de base. *(FR-1,2,3,4,6,7,8,9,14 ; AD-1..AD-9 ; UX-DR1..8,10,11,16,18,19)*

### Story 1.1: Scaffold du projet et garde-fous d'architecture

As a développeur,
I want une application Vite + React + TanStack Router + Zustand + Zod + pure-rand échafaudée avec des garde-fous de lint,
So that toutes les stories suivantes reposent sur une base conforme à la spine.

**Acceptance Criteria:**

**Given** un dépôt vide
**When** j'initialise le projet
**Then** `npm run dev`, `npm run build` et `npm run test` (Vitest) fonctionnent sur une page d'accueil vide
**And** les dépendances épinglées sont React 19.2, TanStack Router 1.170, Zustand 5, Zod 4.4, Vite 8, pure-rand 8.4 (UI custom, sans lib à licence)

**Given** la règle de pureté du moteur (AD-1)
**When** un fichier de `src/engine` tente d'importer React, le store, l'UI ou les routes
**Then** ESLint échoue avec une erreur de frontière d'import

**Given** la règle de déterminisme (AD-3)
**When** un fichier de `src/engine` utilise `Math.random`
**Then** ESLint échoue (`no-restricted-globals`)

### Story 1.2: Modèle d'état et moteur déterministe

As a joueur,
I want que l'état de ma carrière avance de façon déterministe,
So that mes choix produisent toujours le même résultat pour une même graine.

**Acceptance Criteria:**

**Given** le type `GameState` (combattant, âge, division, style, stats, jauges, RNG sérialisable, flags) et un `reduce(state, action)` pur
**When** je dispatche une action
**Then** un nouvel état est renvoyé sans mutation de l'ancien, l'unique voie de mutation étant le reducer (AD-2)

**Given** un PRNG à graine dont l'état (graine + compteur) vit dans `GameState` (AD-3)
**When** je rejoue la même séquence d'actions depuis la même graine
**Then** l'état final est identique au bit près

**Given** une action « avancer d'une année » (FR-4)
**When** je l'applique
**Then** l'âge augmente et, à l'âge-limite, la carrière passe en état « retraite »

### Story 1.3: Contrat de contenu et chargement validé

As a auteur de contenu,
I want écrire les Événements en JSON validés par un schéma Zod,
So that j'ajoute du contenu sans toucher au code et qu'un contenu invalide soit rejeté tôt.

**Acceptance Criteria:**

**Given** un schéma Zod pour Event/Choice/Effect/Condition avec un enum de canaux fermé et versionné (AD-4/5)
**When** je dérive le type via `z.infer` et charge les fichiers JSON
**Then** le moteur ne voit le contenu qu'à travers le type validé, sans définition de type dupliquée

**Given** deux Événements avec le même id
**When** le contenu est chargé (ou construit)
**Then** la validation échoue avec une erreur d'id dupliqué (unicité globale, AD-4)

**Given** un Événement dont un effet cible un interne du moteur (rng, saveVersion, flag « vu ») ou un canal inconnu
**When** il est validé
**Then** la validation échoue (canaux fermés, AD-5)

### Story 1.4: Sélection d'événements pondérée et anti-répétition

As a joueur,
I want que chaque année me propose des événements variés et non répétés,
So that deux carrières ne se ressemblent pas.

**Acceptance Criteria:**

**Given** le `GameState` courant et le catalogue d'Événements
**When** le moteur construit le Pool
**Then** il ne retient que les Événements dont les conditions de déclenchement sont remplies, exclut ceux au flag « vu » (sauf `repeatable`), trie par id, puis pioche par tirage pondéré à graine (AD-6, FR-8)

**Given** un Événement non répétable déjà joué
**When** le Pool est reconstruit plus tard dans la même carrière
**Then** il n'est plus sélectionné

**Given** un flag posé avec un délai (conséquence différée, FR-9)
**When** le délai en tours/années s'est écoulé
**Then** l'Événement de conséquence devient éligible — pas avant

**Given** un contexte où tous les Événements spécifiques sont épuisés
**When** le Pool est construit
**Then** il n'est jamais vide (au moins un Événement « filler » reste éligible) et aucun répétable ne boucle immédiatement (cooldown/cap)

### Story 1.5: Application des effets d'un choix

As a joueur,
I want que mes choix modifient mes stats et jauges de façon lisible,
So that je ressente le poids de chaque décision.

**Acceptance Criteria:**

**Given** un Choix portant des effets déclarés `{target, op, value}` sur des canaux valides
**When** je le valide
**Then** le moteur applique chaque effet, borne les stats/jauges à 0–100, et pose les flags déclarés (AD-5, FR-2)

**Given** un effet qui ferait dépasser les bornes
**When** il est appliqué
**Then** la valeur est clampée à 0 ou 100, jamais au-delà

### Story 1.6: Socle de tokens visuels (thème Fight night sombre)

As a joueur,
I want une interface sombre cohérente et lisible,
So that la lecture soit confortable sur mobile.

**Acceptance Criteria:**

**Given** les tokens de DESIGN.md (couleurs Direction B, rampe typo Inter, spacing, rounded — UX-DR1)
**When** ils sont implémentés en variables CSS/thème
**Then** fond charbon `#0C0D10`, texte clair, accent lime `#C7FF3D` et la typo Inter sont disponibles globalement et appliqués à la page

### Story 1.7: Écran de carrière / événement

As a joueur,
I want lire un événement et choisir parmi des options claires,
So that je fasse avancer ma carrière.

**Acceptance Criteria:**

**Given** un Événement courant
**When** l'écran de carrière s'affiche (mobile-first, colonne unique)
**Then** il montre le `fighterHeader`, la rangée de `dataChip`, l'`eventCard` (overline + texte) et la pile de `choiceCard` (2–4), en une seule unité de lecture (UX-DR2,3,5,6,19)

**Given** un Choix portant des effets déclarés
**When** la `choiceCard` s'affiche
**Then** ses chips d'effet ne prévisualisent que les effets déclarés/déterministes, jamais d'issue cachée (AD-5)

**Given** que je tape une `choiceCard`
**When** le choix est confirmé
**Then** les effets s'appliquent (Story 1.5), l'Événement suivant est sélectionné (Story 1.4) et l'écran se met à jour

### Story 1.8: Création du combattant (flux multi-étapes)

As a joueur,
I want créer mon combattant en quelques étapes,
So that je démarre une carrière qui me ressemble.

**Acceptance Criteria:**

**Given** le flux de création (sexe → pays/âge → origine/style → entourage → division)
**When** je le parcours
**Then** une barre de progression indique l'étape, le retour est non destructif, et chaque étape est commitée au store (UX-DR14, FR-1,2)

**Given** le Sexe choisi
**When** j'arrive à l'étape Division
**Then** seules les catégories UFC de la grille correspondante (hommes/femmes) sont proposées (FR-1,3)

**Given** des critères de départ (origine, style, entourage)
**When** je valide la création
**Then** ils distribuent les stats/jauges initiales et posent les flags de départ, puis la carrière démarre (FR-2)

### Story 1.9: Dashboard des stats en bottom-sheet

As a joueur,
I want consulter mes stats à tout moment sans perdre ma lecture,
So that je pilote ma progression.

**Acceptance Criteria:**

**Given** l'écran de carrière
**When** je tape la rangée de `dataChip` (ou l'affordance « Stats »)
**Then** un `bottomSheet` remonte avec les `statBar` (Frappe/Lutte/Sol/Cardio), les jauges méta, la division, le style, le palier et le palmarès (FR-6, UX-DR4,8)

**Given** le bottom-sheet ouvert
**When** je le referme
**Then** je reviens exactement à ma position de lecture, sans empilement d'un second sheet (profondeur modale = 1)

### Story 1.10: Persistance et reprise de carrière

As a joueur,
I want retrouver ma carrière en cours après avoir fermé l'onglet,
So that je ne perde jamais ma progression.

**Acceptance Criteria:**

**Given** le middleware `persist` de Zustand, seul écrivain de localStorage, clé versionnée `mmachoice.save.v1`, contenu référencé par id (AD-7, NFR-4)
**When** je ferme l'onglet en pleine carrière puis reviens
**Then** je reprends sur l'événement exact, l'état du RNG restauré, avec un toast « Reprise sauvegardée »

**Given** une carrière en cours
**When** je choisis de démarrer une nouvelle carrière
**Then** un `confirmDialog` (« Abandonner cette carrière ? ») exige une confirmation explicite avant de remplacer la sauvegarde (UX-DR11)

### Story 1.11: Fin de carrière, score et récap

As a joueur,
I want un score et un récapitulatif à la retraite,
So that je mesure ma carrière et j'aie envie de recommencer.

**Acceptance Criteria:**

**Given** un combattant qui atteint l'âge-limite (Story 1.2)
**When** la carrière se termine
**Then** l'écran de Récap affiche un Score /100 (formule de base dans `config`), une timeline de carrière et les temps forts (FR-14, UX-DR15-base)

**Given** une carrière donnée (mêmes critères + mêmes choix)
**When** je la rejoue
**Then** le Score obtenu est identique (reproductibilité, NFR-5)

**Given** l'écran de Récap
**When** je choisis « Nouvelle carrière »
**Then** je retourne au point de départ d'une nouvelle création (après confirmation si une carrière était en cours)

## Epic 2: Le combat

Les événements de combat produisent une issue graduée selon la qualité des choix et l'écart de niveau avec l'adversaire généré par le moteur. *(FR-10, FR-16 ; AD-3,4 ; UX-DR9)*

### Story 2.1: Génération d'adversaire calibrée

As a joueur,
I want affronter des adversaires crédibles pour mon niveau,
So that mes combats aient un enjeu juste.

**Acceptance Criteria:**

**Given** des archétypes d'adversaire authorés (data) et le `GameState` (palier, division, réputation)
**When** un combat démarre
**Then** le moteur génère une instance d'adversaire de façon déterministe (AD-3), calibrée sur le palier/division/réputation courants (FR-16)

**Given** le palier amateur vs un palier élevé
**When** des adversaires sont générés
**Then** la force moyenne des adversaires monte avec le palier et la réputation

### Story 2.2: Résolution graduée du combat

As a joueur,
I want que mes choix pendant le combat déterminent la manière de gagner ou perdre,
So that un bon combat rapporte plus qu'une victoire terne.

**Acceptance Criteria:**

**Given** la qualité de mes choix et l'écart de niveau avec l'adversaire
**When** le combat se résout
**Then** le moteur produit un Degré de victoire parmi : victoire nette / victoire médiocre / défaite / upset (FR-10)

**Given** un adversaire nettement plus faible + un mauvais choix
**When** le combat se résout
**Then** je gagne quand même mais « moche » (faible gain de Réputation/Followers)

**Given** un adversaire fort + de bons choix
**When** le combat se résout
**Then** je réalise un upset (fort bond de carrière) ; à l'inverse de mauvais choix mènent à la défaite et un risque de blessure

### Story 2.3: Écran de résultat de combat

As a joueur,
I want voir clairement le résultat de mon combat et ses conséquences,
So that je comprenne l'impact sur ma carrière.

**Acceptance Criteria:**

**Given** un combat résolu
**When** l'écran de résultat s'affiche
**Then** un `resultBanner` montre le Degré de victoire avec la couleur sémantique adaptée (victoire/défaite/upset) et les deltas de stats/jauges (UX-DR9)

**Given** le résultat affiché
**When** je tape « Continuer »
**Then** la carrière reprend son cours (événement/année suivant)

## Epic 3: Progression & carrière longue

Le joueur gravit les paliers du circuit, remporte des ceintures et voit son style évoluer. *(FR-5, FR-15)*

### Story 3.1: Paliers de carrière

As a joueur,
I want gravir les échelons du circuit MMA,
So that ma carrière ait une trajectoire ascendante.

**Acceptance Criteria:**

**Given** des seuils de progression (réputation, victoires) définis en data
**When** je les atteins
**Then** je passe de palier (IMMAF amateur → régional → organisation majeure) et de nouveaux adversaires/événements deviennent éligibles (FR-5)

**Given** mon palier courant
**When** le dashboard s'affiche
**Then** le palier est visible dans mes informations de carrière

### Story 3.2: Ceintures de division

As a joueur,
I want combattre pour et défendre des ceintures,
So that j'aie un objectif clair et prestigieux.

**Acceptance Criteria:**

**Given** un palier et une réputation suffisants
**When** un combat de titre se déclenche et je gagne
**Then** je remporte la ceinture de ma division, l'événement est enregistré au palmarès et compte dans le Score (FR-5, FR-14)

**Given** que je détiens une ceinture
**When** je perds un combat de titre
**Then** je perds la ceinture, ce qui est enregistré

### Story 3.3: Évolution du style de combat

As a joueur,
I want faire évoluer mon style au fil de la carrière,
So that mon combattant se transforme selon mes choix.

**Acceptance Criteria:**

**Given** mon Style de départ
**When** un choix d'entraînement dédié ou un événement le prévoit (règles en data)
**Then** le Style migre vers une autre orientation (FR-15)

**Given** un Style courant
**When** des événements sont sélectionnés ou un combat se résout
**Then** le Style influe sur les conditions de déclenchement et la résolution (AD-5/6)

## Epic 4: Systèmes méta : argent, réseaux, santé

Les leviers réalistes — argent, réseaux sociaux, santé — s'entrelacent avec les choix de carrière. *(FR-11, FR-12, FR-13)*

### Story 4.1: Économie — bourses, sponsors, réinvestissement

As a joueur,
I want gagner et dépenser de l'argent,
So that je puisse investir dans ma progression.

**Acceptance Criteria:**

**Given** des combats et une réputation/followers
**When** je combats ou signe un sponsor
**Then** je gagne des bourses ; les contrats sponsors sont débloqués par un seuil de Réputation ET de Followers (FR-11)

**Given** de l'argent disponible
**When** je réinvestis dans mon camp/entraînement
**Then** mes stats et/ou ma Forme s'améliorent selon des règles en data

### Story 4.2: Réseaux sociaux — followers et buzz

As a joueur,
I want gérer ma présence sur les réseaux,
So that je gagne en visibilité et en opportunités.

**Acceptance Criteria:**

**Given** des victoires et des événements de trash talk/clash
**When** ils se produisent
**Then** mes Followers augmentent, débloquant sponsors et plus gros combats (FR-12)

**Given** un événement de clash
**When** il s'affiche
**Then** au moins un choix propose un fort gain de Followers mais avec un risque de bad buzz (baisse Mental/Réputation)

### Story 4.3: Santé, blessures et coupe de poids

As a joueur,
I want gérer l'usure de mon corps,
So that mes décisions physiques aient un coût réaliste.

**Acceptance Criteria:**

**Given** des combats, blessures et coupes de poids
**When** ils surviennent
**Then** ma Forme/Santé se dégrade en conséquence et une blessure peut poser un flag (FR-13)

**Given** que je change de Division
**When** la transition a lieu
**Then** un événement de coupe de poids se déclenche avec un impact sur Forme/Santé

## Epic 5: Finition, partage & accessibilité

L'accueil, le partage, l'accessibilité, les états soignés et le volume de contenu rendent le jeu prêt à sortir. *(FR-14-partage ; NFR-6,9,10 ; UX-DR10,12,13,15,16,17,18)*

### Story 5.1: Écran d'accueil à 3 modes

As a joueur,
I want voir les modes de jeu dès l'ouverture,
So that je comprenne l'ambition du jeu et lance une carrière.

**Acceptance Criteria:**

**Given** l'écran d'accueil
**When** il s'affiche
**Then** les 3 modes sont visibles : « Faire ma carrière » (jouable, action primaire), « Revivre la carrière » et « Mission du jour » marqués *Bientôt* (UX-DR13)

**Given** un mode marqué *Bientôt*
**When** je le tape
**Then** un acquittement inline « Bientôt disponible » s'affiche sans navigation

### Story 5.2: Partage du score de fin de carrière

As a joueur,
I want partager mon score de carrière,
So that je puisse défier mes amis (moteur viral).

**Acceptance Criteria:**

**Given** l'écran de Récap
**When** je tape « Partager mon score »
**Then** une carte de score est partagée via Web Share API, avec fallback copie presse-papiers si l'API est indisponible (UX-DR15, FR-14)

**Given** aucun backend (AD-9)
**When** le partage s'exécute
**Then** tout se fait côté client, sans appel serveur

### Story 5.3: Plancher d'accessibilité

As a joueur en situation de handicap,
I want une interface accessible,
So that je puisse jouer confortablement.

**Acceptance Criteria:**

**Given** le thème et les composants
**When** l'a11y est auditée
**Then** le texte respecte le contraste AA, l'ordre de focus est logique, les cibles tactiles ≥ 44–48 px, et `prefers-reduced-motion` est respecté (NFR-10, UX-DR17)

**Given** un choix qui modifie des stats
**When** il est appliqué
**Then** les variations sont annoncées aux lecteurs d'écran via une live region

### Story 5.4: Patterns d'état soignés et microcopie

As a joueur,
I want des états de chargement/erreur clairs et une écriture cohérente,
So that l'expérience soit fluide et crédible.

**Acceptance Criteria:**

**Given** un chargement de contenu
**When** l'écran attend
**Then** un `skeleton` s'affiche ; les messages système utilisent le composant `toast` (UX-DR10,12,16)

**Given** toutes les chaînes visibles
**When** elles sont rédigées
**Then** elles suivent la voix sobre, 2ᵉ personne, en français (UX-DR18)

### Story 5.5: Premier lot de contenu et variété

As a joueur,
I want un contenu abondant et non répétitif,
So that mes carrières restent différentes et rejouables.

**Acceptance Criteria:**

**Given** l'objectif de variété (SM-3, NFR-6)
**When** un premier lot d'Événements est authoré (cible ~200–400) et validé
**Then** deux carrières aux mêmes critères de départ partagent moins de 40 % d'Événements communs (NFR-6, NFR-9)

**Given** chaque nouvel Événement JSON
**When** il est ajouté
**Then** aucune modification de code moteur/UI n'est nécessaire et il passe la validation Zod (FR-7, AD-4)
