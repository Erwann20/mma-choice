---
title: "MMA Choice — PRD"
status: final
created: 2026-07-27
updated: 2026-07-27
---

# PRD : MMA Choice
*Titre de travail — à confirmer.*

## 0. Objet du document

Ce PRD cadre la **V1** de MMA Choice, un jeu de carrière de combattant MMA piloté par les choix, jouable dans le navigateur. Il s'adresse au porteur du projet (Erwann) et aux workflows aval (UX, architecture, découpage en epics/stories). Le vocabulaire est ancré par un glossaire (§3), les capacités sont regroupées par feature avec des exigences fonctionnelles (FR) numérotées globalement, et les hypothèses sont taguées `[HYPOTHÈSE]` puis indexées (§9). Projet greenfield : aucun input préexistant. Ambition : **side-project / test** — PRD volontairement léger, centré sur le cœur du jeu, le **moteur d'événements**.

## 1. Vision

MMA Choice fait vivre au joueur **le fantasme d'une carrière de combattant MMA, du néant au sommet** — ou à la médiocrité. On crée un combattant, on choisit son pays, son âge de départ, son origine et son entourage, puis on **façonne sa carrière année après année par une longue série de choix**. Les décisions déterminent si l'on devient un tocard, un bon combattant, ou **le meilleur de tous les temps**.

L'expérience est celle de Destiny Eleven transposée au MMA : de la **fiction interactive à choix**, avec une couche de simulation par stats en dessous. Une carrière complète se joue en **quelques minutes** — pensé pour le « allez, encore une » et le partage. Le ton est **réaliste et crédible** : vraies divisions de poids, circuit amateur puis grandes organisations, carrière dure, coupes de poids, blessures, sponsors et réseaux sociaux (le côté « callout façon McGregor »).

Le différenciateur central : **beaucoup plus de choix** que la référence, et surtout **deux carrières ne doivent jamais se ressembler**. Toute la valeur du produit repose donc sur un **moteur d'événements riche et bien organisé** — c'est la priorité n°1 et le vrai défi (la data).

## 2. Joueur cible

### 2.1 Jobs To Be Done
- **Émotionnel** : vivre l'ascension d'un underdog jusqu'à la ceinture, ressentir le poids de ses choix.
- **Fonctionnel** : tuer 5 minutes avec une partie complète et satisfaisante.
- **Social** : comparer sa carrière, partager un run improbable ou un score élevé.
- **Rejouabilité** : recommencer encore et encore sans revivre la même histoire.

### 2.2 Non-joueurs (V1)
- Les amateurs de **simulation de matchs temps réel** ou de gestion façon manager sportif détaillé — MMA Choice est du récit à choix, pas un moteur de combat.

### 2.3 Parcours clés

- **UJ-1. Karim crée sa légende dans le métro.**
  > Karim, 19 ans, fan d'UFC, tombe sur MMA Choice via un lien TikTok et l'ouvre sur son téléphone. Sans créer de compte, il choisit « Faire ma carrière », sélectionne un pays, un âge de départ, une origine (*bagarreur de rue*) et un entourage (*coach mentor*). La carrière démarre sur le circuit amateur **IMMAF** : un premier choix s'affiche (participer à un tournoi vs continuer à s'entraîner). Année après année, des événements le confrontent à des décisions — un combat risqué, une coupe de poids, un clash sur les réseaux. Ses stats évoluent visiblement. Après quelques minutes, son combattant vieillit et prend sa retraite : un **récap final** affiche son **score /100** et son classement (« 7e meilleur combattant de tous les temps »). Karim relance aussitôt une nouvelle carrière, différente.

- **UJ-2. (Fast-follow) Le défi de la semaine et la mission du jour.** *Voir §6.2 — hors V1.*

## 3. Glossaire

- **Combattant** — Le personnage incarné par le joueur. Possède un Sexe, des Stats de combat, des Jauges méta, une Division de poids, un Style et un âge.
- **Sexe** — Homme ou Femme. Fixé à la création ; détermine les Divisions de poids disponibles (grilles hommes / femmes) et une partie du contenu.
- **Style** — Orientation de combat du Combattant (puncheur / lutteur / grappler / polyvalent). Fixé à la création mais **évolutif** en cours de Carrière via l'entraînement et certains Événements.
- **Carrière** — Une partie complète, de la création à la retraite du Combattant. Déroulée **année par année**.
- **Événement** — Une situation présentée au joueur, composée d'un texte et de 2 à 4 Choix. Unité de contenu de base du jeu.
- **Choix** — Une option d'un Événement. Applique des Effets (Stats, Jauges méta) et peut poser des Flags ou déclencher des conséquences ultérieures.
- **Pool d'événements** — Ensemble des Événements éligibles à un instant donné ; on y pioche selon des poids et des Conditions de déclenchement.
- **Condition de déclenchement** — Prérequis d'un Événement : âge, Stats, Palier, Division, style, entourage, Flags posés.
- **Flag** — Marqueur d'état posé par un Choix (ex. « a déjà eu une blessure grave ») ; sert aux Conditions de déclenchement et évite les répétitions.
- **Palier de carrière** — Niveau du circuit : Amateur (IMMAF) → Régional → Organisation majeure. Chaque Palier ouvre de nouveaux adversaires et objectifs.
- **Division de poids** — Catégorie de poids du Combattant, suivant les grilles **officielles UFC** ; détermine les adversaires et la ceinture visée. Grilles distinctes hommes / femmes.
- **Stat de combat** — Frappe, Lutte, Sol, Cardio.
- **Jauge méta** — Forme/Santé, Mental, Réputation, Followers, Argent.
- **Combat** — Événement spécial dont l'issue combine la qualité des Choix et l'écart de niveau avec l'adversaire, produisant un Degré de victoire.
- **Degré de victoire** — Résultat gradué d'un Combat (victoire nette / victoire médiocre / défaite / upset), qui alimente différemment Réputation et Followers.
- **Score de carrière** — Note finale /100 calculée à la retraite (ceintures, qualité des victoires, divisions conquises, longévité, legacy).

## 4. Features

### 4.1 Création du combattant
**Description :** Point d'entrée de « Faire ma carrière ». Le joueur configure son Combattant sans créer de compte. Chaque critère de départ **distribue les Stats initiales et débloque/bloque certains Événements**. Réalise UJ-1.

**Functional Requirements :**

#### FR-1 : Identité — sexe, pays et âge de départ
Le joueur peut choisir le **Sexe** (Homme / Femme), un pays et un âge de départ (jeune espoir ~16-18 ans par défaut). Réalise UJ-1.
**Consequences (testables) :**
- Le Sexe, le pays et l'âge sont enregistrés sur le Combattant et visibles dans le récap final.
- Le Sexe restreint les Divisions de poids proposées à la grille correspondante (hommes / femmes).
- L'âge de départ conditionne la durée potentielle de carrière avant l'âge-limite.

#### FR-2 : Critères de départ (origine, style, entourage)
Le joueur peut choisir une **origine** (ex. bagarreur de rue, lutteur universitaire, famille de combattants), un **style de départ** (puncheur / lutteur / grappler / polyvalent) et un **entourage** (coach mentor, seul, manager véreux, famille toxique).
**Consequences (testables) :**
- Chaque critère applique une distribution de Stats/Jauges initiales définie en data.
- Chaque critère pose un ou plusieurs Flags utilisables comme Conditions de déclenchement d'Événements.

#### FR-3 : Sélection de la division de poids (grilles UFC)
Le joueur (ou le système, selon les critères) fixe une Division de poids de départ parmi les **catégories officielles UFC** correspondant au Sexe choisi.
**Consequences (testables) :**
- Les Divisions proposées suivent la grille UFC : hommes (Flyweight 125 lb → Heavyweight 265 lb, 8 catégories) ; femmes (Strawweight 115, Flyweight 125, Bantamweight 135, avec Featherweight 145 en option — cf. §8 Q6).
- La Division détermine le vivier d'adversaires et la ceinture visée au Palier courant.

### 4.2 Progression de carrière
**Description :** La Carrière se déroule **année par année**. À chaque tour, le joueur affronte des Événements et voit ses Stats évoluer. Il gravit les Paliers (IMMAF → Régional → Organisation majeure) et vise les ceintures de sa Division. Réalise UJ-1.

#### FR-4 : Déroulé annuel
Le joueur avance sa Carrière année par année ; chaque année présente une séquence d'Événements (dont au moins un Combat quand le contexte s'y prête).
**Consequences (testables) :**
- Chaque année présente une poignée d'Événements (ordre de grandeur : ~2-5), dont au moins un Combat quand le contexte s'y prête.
- Chaque passage d'année met à jour l'âge et peut faire évoluer Forme/Santé.
- La Carrière se termine automatiquement quand le Combattant atteint l'âge-limite de combat (âge-out).

#### FR-5 : Paliers et ceintures
Le joueur peut progresser de Palier lorsque ses résultats et sa Réputation le permettent, et peut remporter la ceinture de sa Division.
**Consequences (testables) :**
- Le passage de Palier est conditionné par des seuils (Réputation, victoires) définis en data.
- Gagner/perdre une ceinture est enregistré et compte dans le Score de carrière.

#### FR-6 : Tableau de bord des stats
Le joueur peut consulter à tout moment ses Stats de combat, ses Jauges méta, sa Division, son Style, son Palier et son palmarès.
**Consequences (testables) :** L'écran reflète en temps réel les Effets du dernier Choix.

#### FR-15 : Évolution du style en cours de carrière
Le Style du Combattant, fixé à la création, peut **évoluer** au fil de la Carrière via l'entraînement et certains Événements (ex. un puncheur qui développe son jeu au sol).
**Consequences (testables) :**
- Un Choix ou un investissement d'entraînement dédié peut faire migrer le Style vers une autre orientation selon des règles en data.
- Le Style courant influe sur les Conditions de déclenchement d'Événements et sur la résolution des Combats.

### 4.3 Moteur d'événements *(cœur du produit)*
**Description :** Le système qui garantit richesse et **non-répétition**. Un Événement = un texte + 2 à 4 Choix ; chaque Choix a des Effets et peut poser des Flags ou armer des conséquences différées. À chaque tour, le système constitue le **Pool d'événements** éligibles selon les Conditions de déclenchement, puis pioche de façon **pondérée** en excluant ce qui a déjà été joué. C'est ce qui fait que **deux carrières ne se ressemblent pas**. Réalise UJ-1.

#### FR-7 : Schéma d'événement en data
Le contenu doit être **entièrement piloté par la data** (pas en dur dans le code), chaque Événement décrivant : texte, Choix, Effets, Conditions de déclenchement, poids, Flags posés, caractère unique/répétable, tags de catégorie.
**Consequences (testables) :**
- Ajouter un Événement = ajouter une entrée data, sans changement de code.
- Un Événement dont les Conditions ne sont pas remplies n'apparaît jamais dans le Pool.

#### FR-8 : Sélection pondérée et anti-répétition
Le système peut sélectionner l'Événement suivant en piochant dans le Pool éligible selon les poids, en évitant les Événements déjà vus dans la Carrière courante (sauf ceux marqués répétables).
**Consequences (testables) :**
- Un Événement unique déjà joué ne réapparaît pas dans la même Carrière.
- Deux Carrières lancées avec les mêmes critères de départ présentent des séquences d'Événements sensiblement différentes.

#### FR-9 : Conséquences ramifiées et différées (flags)
Un Choix peut poser un Flag qui débloque ou modifie des Événements ultérieurs, y compris de façon **différée** (un Flag peut programmer l'apparition d'un Événement de conséquence après un délai en tours/années).
**Consequences (testables) :**
- Un Événement de conséquence n'est éligible que si son Flag prérequis a été posé plus tôt.
- Un Flag peut porter un délai : l'Événement associé n'entre dans le Pool qu'une fois le délai écoulé.

### 4.4 Résolution des combats
**Description :** Un Combat est un Événement spécial. L'issue combine **la qualité des Choix** du joueur et **l'écart de niveau avec l'adversaire** (Stats + Palier), produisant un **Degré de victoire** plutôt qu'un simple gagné/perdu. Réalise UJ-1.

#### FR-10 : Issue graduée du combat
Le système peut produire un Degré de victoire parmi : victoire nette (KO/soumission), victoire médiocre, défaite, upset.
**Consequences (testables) :**
- Contre un adversaire nettement plus faible, un mauvais Choix peut tout de même donner une victoire, mais « moche » (faible gain de Followers/Réputation).
- Contre un adversaire fort, de bons Choix peuvent produire un upset (fort bond de carrière) ; de mauvais Choix mènent à la défaite et à un risque de blessure.

#### FR-16 : Génération des adversaires
Le système peut générer l'adversaire d'un Combat en calibrant son niveau sur le Palier, la Division et la Réputation courants du Combattant.
**Consequences (testables) :**
- Au Palier amateur, les adversaires sont majoritairement faibles ; le niveau moyen monte avec le Palier et la Réputation.
- Chaque adversaire a une force qui alimente le calcul de l'écart de niveau utilisé par FR-10.

### 4.5 Systèmes méta : argent, sponsors, réseaux sociaux, santé
**Description :** Les leviers qui donnent de la profondeur réaliste. Réalise UJ-1.

#### FR-11 : Économie (bourses, sponsors, réinvestissement)
Le joueur gagne de l'Argent via les bourses et des contrats sponsors (débloqués par Réputation **et** Followers), et peut le réinvestir dans son camp/entraînement pour améliorer ses Stats et récupérer sa Forme.
**Consequences (testables) :** Un investissement dans le camp applique un gain de Stats/Forme selon des règles en data.

#### FR-12 : Réseaux sociaux (followers, buzz, bad buzz)
Le joueur peut gagner des Followers via ses victoires et des Événements de trash talk / clash, avec un **risque de bad buzz** (baisse de Mental/Réputation).
**Consequences (testables) :** Un Événement de clash propose au moins un Choix à fort gain de Followers mais à risque de Réputation.

#### FR-13 : Santé, blessures et coupe de poids
La Forme/Santé se dégrade avec les combats, les blessures et les coupes de poids ; changer de Division déclenche des Événements de coupe de poids.
**Consequences (testables) :** Une coupe de poids applique un impact sur Forme/Santé et peut poser un Flag de blessure.

### 4.6 Fin de carrière et score
**Description :** À l'âge-limite, la Carrière se conclut par un récap et un Score. Réalise UJ-1.

#### FR-14 : Score de carrière et récap
À la retraite, le système calcule un Score de carrière /100 (ceintures gagnées, qualité des victoires, divisions conquises, longévité, legacy = Followers/Réputation) et affiche un récap classant le joueur (« Nᵉ meilleur combattant de tous les temps »).
**Consequences (testables) :**
- Le Score est reproductible pour une même Carrière donnée.
- Le récap liste les temps forts (ceintures, upsets, meilleurs combats).

**Notes :** `[NOTE FOR PM]` La formule exacte de pondération du Score est à caler avec les premières données de contenu.

## 5. Non-Goals (explicites)
- Pas de **simulation de combat temps réel** ni de commentaires round par round animés — l'issue est narrative + stats.
- Pas de **mode carrière multi-personnages / gestion d'écurie**.
- Pas de **comptes obligatoires, classements en ligne, multijoueur** en V1.
- Pas de **monétisation** en V1 (gratuit, sans pub).

## 6. Périmètre MVP

### 6.1 Dans le périmètre (V1)
- Mode **« Faire ma carrière »** complet (création → carrière annuelle → combats → systèmes méta → score final).
- **Moteur d'événements** data-driven avec sélection pondérée et anti-répétition (§4.3).
- Web app **mobile-friendly**, **zéro friction** (pas de compte), sauvegarde locale navigateur, **gratuit**.
- Un **premier lot de contenu** d'Événements suffisant pour qu'une carrière soit variée et rejouable.

### 6.2 Hors périmètre MVP *(fast-follow)*
- Mode **« Revivre la carrière »** (rejouer un combattant réel, rotation hebdomadaire). *Réutilise le moteur ; contenu + config en plus.* `[NOTE FOR PM]` fort potentiel viral, à revisiter tôt.
- Mode **« Mission du jour »** (combattant à critères imposés, défi quotidien). *Réutilise le moteur.*
- Dimension **sociale / classements** (« Panthéon »), badges, défis entre amis.
- **Comptes** et synchronisation multi-appareils.

## 7. Métriques de succès

**Primaire**
- **SM-1** : Rejouabilité — un joueur enchaîne en moyenne **≥ 3 carrières** par session. Valide FR-8 (variété).

**Secondaire**
- **SM-2** : Complétion — **≥ 70 %** des carrières lancées vont jusqu'à la retraite. Valide FR-4, FR-14.
- **SM-3** : Variété perçue — deux carrières aux mêmes critères partagent **< 40 %** d'Événements communs. Valide FR-7, FR-8.

**Contre-métriques (à ne pas optimiser)**
- **SM-C1** : Ne pas gonfler le nombre de carrières en **raccourcissant** la carrière au point de la vider de sens. Contrebalance SM-1.
- **SM-C2** : Ne pas maximiser la variété au prix d'Événements **incohérents** avec le contexte (réalisme). Contrebalance SM-3.

*(Cible side-project : « je relance le jeu régulièrement et je ne m'en lasse pas au bout d'une semaine ».)*

## 8. Questions ouvertes
1. **Volume de contenu V1.** Le joueur veut « beaucoup » d'Événements. Une carrière dure ~15-20 tours × quelques Événements ≈ 40-80 slots ; pour tenir la cible de variété (SM-3, < 40 % de recouvrement), viser un **premier lot de l'ordre de 200-400 Événements**, enrichi en continu. `[HYPOTHÈSE]` cible à valider — c'est le **chemin critique** du projet.
2. **Pipeline de contenu.** Produire et maintenir ce volume implique probablement un **format d'authoring simple** (voire un outil/éditeur ou une génération assistée) pour saisir les Événements en masse sans toucher au code. À arbitrer avec l'architecture.
3. Formule exacte du Score de carrière /100.
4. Format de sauvegarde locale et comportement si le joueur ferme l'onglet en pleine carrière (reprise ou perte ?).
5. Existe-t-il un « mode difficile » ou la difficulté émerge-t-elle seulement des choix de départ ?
6. Les Divisions féminines de l'UFC incluent-elles Featherweight (peu active) en V1, ou se limite-t-on aux 3 catégories principales ?

*Résolues :* les Divisions suivent les grilles UFC (FR-3) ; le Style est évolutif (FR-15) ; le Sexe est un critère de création (FR-1).

## 9. Index des hypothèses
- `[HYPOTHÈSE]` Web app mobile-friendly, **zéro friction** (pas de compte obligatoire), sauvegarde navigateur, **gratuit** — modèle calqué sur Destiny Eleven. *(à confirmer)*
- `[HYPOTHÈSE]` Âge de départ ~16-18 ans par défaut ; carrière bornée par un âge-limite de combat. *(à confirmer)*
- `[HYPOTHÈSE]` Équipe = build solo/perso (Erwann, éventuellement un dev). *(à confirmer)*
- `[HYPOTHÈSE]` Les 4 Stats de combat et les 5 Jauges méta proposées constituent le modèle de départ. *(à confirmer / ajuster à l'usage)*
- `[HYPOTHÈSE]` Premier lot de contenu de l'ordre de **200-400 Événements** pour atteindre la variété cible ; nécessite un format/outil d'authoring de masse. *(à valider — chemin critique)*
