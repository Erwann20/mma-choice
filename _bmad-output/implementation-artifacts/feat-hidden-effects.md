# Feature: effets cachés + découverte après le choix (retour utilisateur)

Status: review

## Contexte
Retour d'Erwann : afficher les gains d'un choix AVANT de le prendre rend le jeu trop facile / sans suspense. Sur Destiny Eleven, on **découvre** les effets APRÈS le choix, sur un écran de conséquences. Demande : masquer les effets sur les cartes de choix et les révéler après.

## Changements
### UI
- `ChoiceCard` : **suppression de la prévisualisation des effets** (plus de puces chiffrées). Il reste le libellé + un indice qualitatif optionnel (`hint`).
- `ChoiceReveal` (nouveau) : écran de **conséquences** qui révèle les deltas de canaux après coup (mêmes puces signées que le combat).
- `CareerScreen` : après un choix narratif, on s'arrête sur l'écran de conséquences (deltas + « Continuer ») avant de reprendre — symétrique au flux de combat (`ResultBanner`).

### Orchestration
- `store/session.ts` : `chooseInSession` n'avance plus jamais directement. Combat → `lastResult` ; narratif → `lastReveal` (deltas calculés par diff d'état). Un choix sans variation de canal avance directement (rien à révéler).
- `continueAfterFight` renommé/généralisé en **`continueSession`** (gère combat ET révélation narrative). `SavedSession` inclut `lastReveal` (persistance de la reprise exacte, AD-7).
- `store/game.ts` : action `continueFight` renommée en **`advance`**.

## Tests
- `ui/ChoiceReveal.test.tsx` (2) : la carte de choix ne montre pas les chiffres ; l'écran de conséquences les révèle.
- `store/session.test.ts` : nouveau test « un choix à effet passe par un écran de conséquences avant d'avancer » + helper `step` (choisir puis continuer).
- `variety.test.ts` adaptée au nouveau flux. 89 tests ; `typecheck`/`lint`/`test`/`build` verts.

## Note d'architecture
Ceci fait évoluer **UX-DR6** (qui prévoyait des puces d'effet déclarées sur la carte de choix) : parti pris produit d'Erwann pour le suspense « découverte ». Les effets restent 100 % déclarés/déterministes (AD-5) — ils sont juste **révélés après** au lieu d'avant.
