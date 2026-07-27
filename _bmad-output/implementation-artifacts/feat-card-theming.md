# Feature: cartes claires + couleur par catégorie + animations (retour utilisateur)

Status: review

## Contexte
Retours d'Erwann : (1) l'écran de choix est trop statique/plat et « on s'ennuie » en choisissant ; (2) préférence pour des cartes claires façon Destiny Eleven ; (3) surtout : **différencier les contextes par la couleur** (combat, entraînement, argent, réseaux, santé…).

## Changements
### Catégories (data-driven)
- `schema` : champ `category` optionnel sur l'événement (`combat|training|money|social|health|career|general`). Les combats sont déduits de `fight`.
- **158 événements catégorisés** en masse (par fichier thématique + cas particuliers dans `meta.json`/`amateur.json`).
- `ui/labels.ts` : `eventCategory(event)` + `CATEGORY_META` (icône + libellé). Combat prime.

### Cartes claires + accent couleur
- `EventCard` : carte **blanche**, texte foncé, bordure gauche + en-tête (icône + libellé) **colorés selon la catégorie** (🥊 rouge combat, 🏋️ vert entraînement, 💰 or business, 📱 bleu réseaux, 🩹 orange santé, 📈 turquoise carrière, 📋 gris général).
- `ChoiceCard` / `ChoiceReveal` : cartes claires ; survol/tap teintés par la couleur de catégorie ; puces de conséquences vertes/rouges sur blanc.
- La classe `cat-*` est posée sur le `main` → choix et conséquences héritent de l'accent.

### Animations
- Entrée en cascade des choix, flèche animée, hover (lift + trait coloré), feedback au tap.
- Révélation des conséquences animée (slide-in) + puces en `pop-in` échelonné.
- Chiffres du bandeau qui « pulsent » quand ils changent ; barres de stats et jauge adverse en transition ; bannière de combat et vue palmarès animées.
- Tout respecte `prefers-reduced-motion` (règle globale).

## Tests
- 93 tests inchangés verts ; `typecheck`/`lint`/`build` verts. Le champ `category` est validé par Zod (contenu invalide → échec au chargement, AD-4).

## Note
Parti pris assumé : rompt avec le « tout sombre » (Direction B) sur la surface de jeu, au profit de cartes claires contrastées + code couleur contextuel. La barre du haut (identité + jauges) et les boutons restent sombres, façon Destiny Eleven.
