# Feature: Passage pro explicite + organisations (retour utilisateur)

Status: review

## Contexte
Retour d'Erwann : (1) le passage amateur → pro se faisait tout seul (promotion automatique) ; (2) aucune notion d'organisation, ni d'offres à choisir. Demande : pouvoir passer pro par choix, choisir son organisation et recevoir des offres.

## Changements
### Modèle & moteur
- `GameState` : ajout `pro: boolean` (amateur/pro) et `organization: string | null`.
- **Suppression de la promotion automatique de palier** (`reducer` n'appelle plus `promoteTier`). Le palier ne monte plus qu'en signant une organisation.
- `progression.ts` : `promoteTier` retiré ; `earnedTier` conservé comme helper PUR d'éligibilité (« à quel palier tes résultats donnent droit »).

### Contenu (data-driven)
- `content/organizations.json` : 3 régionales (Hexagone MMA, Cage Battle, Brave Arena) + 2 majeures (Apex Championship, Global Fight League) ; schéma `OrganizationSchema` + `loadOrganizations`.
- `schema` : choix enrichis de `signOrg` (id d'orga) et `turnPro`.
- `content/events/career.json` : `evt-passer-pro` (signer une régionale, gaté victoires+réputation, amateur only), `evt-offre-regionale` (débauchage entre régionales), `evt-offre-majeure` (le grand saut, gaté réputation≥55/8 V), `evt-offre-majeure-rivale` (guerre des géants). Chaque orga a un bonus de signature distinct (prestige/argent/mental/followers) ⇒ vrai choix.
- Combat amateur `fight-amateur-carte-locale` restreint au palier amateur (`tier lte 0`).

### Orchestration & UI
- `store/session.ts` : `applyCareerMove` applique la signature (fixe `organization`, cale `tier`, passe `pro`) après le choix.
- `ui/labels.ts` : `organizationLabel`, `careerStatus(game)` (« Amateur · circuit IMMAF » / « Pro · Apex Championship (majeure) »).
- `FighterHeader`, `StatsSheet`, `RecapScreen` affichent le statut pro + l'organisation.

## Tests
- `store/organizations.test.ts` (4) : départ amateur, gating du passage pro, signature ⇒ pro/orga/palier, présence orgas majeures/régionales.
- `progression.test.ts` réécrit : `earnedTier` comme éligibilité + **plus de promotion auto** au bilan annuel.
- 86 tests ; `typecheck`/`lint`/`test`/`build` verts. 162 événements.

## Note
Le choix d'orga passe par des **événements-offres** (pattern établi) plutôt qu'un menu dédié : plusieurs offres arrivent au fil de la carrière, on signe qui on veut. Un vrai « bureau des contrats » (menu listant toutes les orgas dispo à tout moment) serait une évolution UI ultérieure.
