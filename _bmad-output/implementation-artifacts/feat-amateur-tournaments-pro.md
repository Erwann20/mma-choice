# Feature: tournois amateurs, décision de passer pro, orgas amateur/pro (retour utilisateur)

Status: review

## Contexte
Retour d'Erwann : « IMMAF » était traité comme un palier/circuit, alors que ce sont des **tournois**. Il faut distinguer **tournois** (Championnat de France, IMMAF Europe/Monde) et **organisations** (amateur ou pro), avec une vraie **progression** : carrière amateur qu'on fait durer selon ses résultats, puis **décision de passer pro**.

## Changements
### Tournois amateurs (progression)
- `content/events/tournaments.json` : échelle amateur **progressive** — Tournoi régional → **Championnat de France** → **IMMAF Europe** → **IMMAF Monde**. Chaque tournoi est gaté par le titre précédent (flag), gagnable une fois.
- `schema` : `winFlag` sur un combat → drapeau posé en cas de **victoire** (titre). `resolveFight` pose le flag + prime de prestige (réputation).
- Titres suivis : `titre_regional_am`, `titre_france`, `titre_europe`, `titre_monde`.

### Décision de passer pro (explicite, mise en avant)
- `evt-passer-pro` (poids relevé) : signer une orga **régionale pro** quand on a fait ses preuves en amateur (victoires + réputation).
- `evt-passer-pro-star` : offre pro appuyée pour les **champions amateurs** (débloquée par un titre européen), pour ne pas rester amateur par défaut.
- Le joueur peut toujours **rester amateur** et viser le titre mondial.

### Organisations amateur vs pro
- `schema` : `Organization.level` = `amateur | pro` (+ `tier` optionnel pour le pro). Signer une orga **amateur** ne fait **pas** passer pro (palier inchangé) ; une orga **pro** oui.
- `content/organizations.json` : 1 orga amateur (Ligue Amateur Élite) + 5 pro (régionales/majeures). `evt-offre-amateur` pour signer en amateur.

### Clarté & récompenses
- `labels` : statut « Amateur » (fini « circuit IMMAF ») ; `careerStatus` gère l'orga amateur ; `amateurTitles(game)`.
- `StatsSheet` : ligne 🏅 des titres amateurs en cours de carrière.
- `awards` : trophées 🌍/🇪🇺/🇫🇷 pour les titres IMMAF/France.

## Tests
- `engine/tournaments.test.ts` (2) : `winFlag` pose le titre ; ladder progressive (Europe exige France).
- `store/organizations.test.ts` : signer une orga amateur ne passe pas pro.
- 96 tests ; `typecheck`/`lint`/`test`/`build` verts. 168 événements.

## Note
Rester amateur reste un **choix** (conforme à la demande). Les offres pro sont désormais assez saillantes (poids élevés, offre « star ») pour que la décision se présente clairement une fois les résultats obtenus.
