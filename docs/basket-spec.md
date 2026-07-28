# Spec — Basket (2ᵉ sport de Sport Choice)

But : décliner la carrière « choix après choix » du MMA au **basket**, en réutilisant
au maximum ce qu'on a bâti, et en posant une base qui accueillera d'autres sports.

---

## 1. Ce qu'on RÉUTILISE tel quel (le socle)

Ces briques sont déjà génériques (ou presque) — on les partage entre sports :

- **RNG à graine** (`rng.ts`), déterminisme, persistance localStorage.
- **Schéma d'événements** (`schema/content.ts`) : `{id, weight, repeatable, cooldown, text, choices, conditions, fight?}`. Le format marche pour n'importe quel sport.
- **Moteur d'effets & canaux** (`effects.ts`, `channels.ts`) : `reputation/followers/money/health/mental` sont **communs à tous les sports**. On ajoute juste les canaux d'attributs du basket.
- **Boucle de saison** (`store/session.ts`) : plan d'année (1 moment vécu + reste simulé), bilan annuel, sprint « mission du jour », interpolation `{...}`.
- **Systèmes transverses** déjà écrits, à généraliser : **blessures durables**, **coach / coup signature**, **némésis** (rival récurrent), **streak quotidien**, **villes par pays**, **titre national**.
- **Coques UI** : `FighterHeader` (carte OVR + ressources), `StatsSheet`, `RecapScreen`, `YearReviewScreen`, `ChoiceCard`, `ResultBanner`, `HomeScreen` (le hub d'un sport), `SportSelectScreen` (déjà en place, Basket est déjà listé en « Bientôt »).

## 2. Ce qui est SPÉCIFIQUE au basket

| MMA | Basket |
|---|---|
| Stats : frappe / lutte / sol / cardio | **tir / dribble / passe / défense / athlétisme** |
| Division (poids) | **Poste** : meneur, arrière, ailier, ailier fort, pivot |
| Style : puncheur / lutteur / grappler / polyvalent | **Profil** : scoreur / meneur de jeu / défenseur / two-way / athlète |
| Paliers : IMMAF → régional → majeure | **Niveaux** : lycée → semi-pro/fac → **grande ligue** |
| Organisation (promotion) | **Franchise** (équipe) — avec la **Draft** comme moment fort du passage pro |
| Combat vécu (tactique) | **Grand match vécu** : attaquer au tir / percer / faire jouer l'équipe / verrouiller en défense |
| Ceinture / défenses de titre | **Bague de champion** / titres |
| Adversaire calibré | **Équipe/star adverse** calibrée sur ton niveau (on garde le fix d'équilibrage : écart borné) |
| Finitions (KO/soum) | **Perf** : points marqués / double‑double / game‑winner |
| Trophées : champion, GOAT, invaincu… | **MVP, All‑Star, meilleur marqueur, Rookie of the Year, bague, Hall of Fame, 1er choix de draft** |
| Icônes : 5 légendes MMA | **5 légendes basket** (surnoms/archétypes, pas de vrais noms) |

## 3. Modèle de données basket

- **Attributs** (0‑100) : `tir`, `dribble`, `passe`, `defense`, `athletisme`.
  (Le `mental`/QI et la `forme` restent dans `meta`, comme le cardio→meta au MMA.)
- **Méta** (commune) : forme (santé), sang‑froid (mental), réputation, followers, argent.
- **OVR** basket : pondération façon FIFA selon le poste (un pivot valorise défense/athlétisme, un meneur passe/dribble).
- **Poste** : biaise quelles stats comptent en match.
- **Profil** : bonus à la tactique correspondante (comme le style au MMA).
- **Match vécu** : `resolveGame(state, choice, opponent)` → issue graduée (large win / win / défaite serrée / défaite) + **perf** (points) qui nourrit réputation, followers et les récompenses (MVP…). Réutilise la logique du `resolveFight` (marge = perf tactique − niveau adverse + bruit), calibrage adverse **borné au niveau du joueur**.
- **Saison** : 1 grand match vécu/an + saison régulière simulée (bilan V‑D + moyenne de points) → bilan annuel + récompenses de fin de saison.

## 4. Architecture — la décision clé

Le moteur actuel est **spécifique MMA** sur 4 points : les clés de stats, `combat.ts`, `score.ts`, `awards.ts`. Deux chemins :

### Chemin A — Généraliser le cœur (recommandé)
Introduire une **définition de sport** (`SportDef`) qui décrit : clés d'attributs + libellés + poids OVR, postes, niveaux, valeurs de départ, `resolveMatch()`, `overall()`, `score()`, récompenses, jeu d'icônes, et le bundle de contenu. Un seul moteur + une seule boucle de saison, **paramétrés par le sport**. Le MMA devient `sports/mma.ts`, le basket `sports/basket.ts`.
- **+** Zéro duplication ; chaque sport suivant = un `SportDef` + du contenu JSON.
- **−** Refactor de fondation (stats → structure indexée) qui touche state/score/combat/UI, à faire **à iso‑comportement** (166 tests restent verts).

### Chemin B — Vertical parallèle (rapide)
Copier le vertical MMA en `engine/basket/*` + store/écrans dédiés, partager seulement rng/effets/schéma.
- **+** Basket jouable plus vite, **zéro risque** pour le MMA.
- **−** Deux bases qui divergent ; on repaie le coût à chaque nouveau sport.

> **Reco** : Chemin A, mais **par étapes**, en commençant par un refactor pur (extraire le `SportDef` du MMA sans changer le comportement) pour dé‑risquer la couture avant d'ajouter le basket.

## 5. Plan par jalons (cadence « une branche = une feature », comme le MMA)

- **J1 — Fondation (refactor pur, iso‑comportement)** : `sport` sur l'état, stats → structure indexée, registre `SportDef`, MMA extrait en `sports/mma.ts`. Tests verts inchangés. *(Chemin A uniquement.)*
- **J2 — Squelette basket jouable** : `SportDef` basket (attributs, postes, profils, niveaux, OVR, `resolveMatch` basique), création d'un basketteur, une saison bouclable, récap. Routage : la carte **Basket** du `SportSelectScreen` devient jouable.
- **J3 — Contenu de base** : événements vie/entraînement/business/réseaux + matchs (variantes) + événements de club/ville (réutilise villes par pays).
- **J4 — Franchises & Draft** : équipes (`teams.json`) par pays, signature, **soirée de draft**, bague de champion + titres.
- **J5 — Systèmes transverses branchés** : blessures (cheville/genou/dos), coach (tir/dribble signature), némésis (star rivale), streak quotidien.
- **J6 — Récompenses & icônes** : MVP, All‑Star, meilleur marqueur, RotY, Hall of Fame ; 5 légendes basket (mode « Revivre »).
- **J7 — Polish & équilibrage** : calibrage adverse, courbe de progression, formulation des choix.

Chaque jalon : `typecheck` + `lint` + `vitest` + `build`, commit + merge `--no-ff` + push, comme d'habitude.

## 6. Contenu à produire (pur JSON, extensible)

`events/basket/*.json` (matchs, vie, entraînement, business, réseaux, club, draft, blessures, coach, némésis, daily), `teams.json`, `positions.json` (postes), `basket-icons.json`, `basket-starting-criteria.json`. Villes : la banque par pays est **déjà partagée**.

## 7. Risques & garde‑fous

- **Risque n°1** : le refactor de fondation (J1) casse un test MMA. *Garde‑fou* : iso‑comportement strict, suite complète à chaque étape, un commit par sous‑étape réversible.
- **Impersonation** : icônes = **surnoms/archétypes**, jamais de vrais noms/logos (comme au MMA).
- **Sauvegardes** : la clé localStorage reste `mmachoice.save.v1` ; on ajoute `sport` avec défaut `'mma'` pour ne rien casser.
- **Périmètre** : on garde le MMA comme référence de « fini » ; le basket vise la même complétude, par jalons.
