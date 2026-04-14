# Arbre d'Intention — Mindmap Interactive

Visualisation interactive du framework **Arbre d'Intention**, un outil de cadrage pour structurer les intentions stratégiques, tactiques et opérationnelles d'un projet avant de déléguer à un agent IA.

## Apercu

Fichier HTML autonome utilisant **D3.js v7** (via CDN) pour rendre une arborescence horizontale collapsible.

### Contenu

L'arbre couvre les 8 étapes du framework :

1. **Le projet** — Nom et contexte
2. **L'intention stratégique** — Porteur, intention, test d'invalidation
3. **L'intention tactique** — Idem, niveau pilotage
4. **L'intention opérationnelle** — Idem, niveau exécution
5. **Les tensions** — Contradictions entre niveaux
6. **Arbitrage** — Quelle intention prime, quel sacrifice
7. **Garde-fous** — Interdictions, seuils d'arrêt, test des 3 phrases
8. **Synthèse** — Diagnostic de complétude

### Interactions

- Clic sur un noeud pour plier/déplier
- Molette pour zoomer, glisser pour panner
- Boutons : *Tout déplier* / *Tout replier* / *Recentrer*
- Badges rouge (obligatoire) et gris (optionnel) sur chaque champ

## Utilisation

Ouvrir dans un navigateur :

```bash
open arbre-intention-mindmap.html
```

Ou servir localement :

```bash
python3 -m http.server 8080
# puis http://localhost:8080/arbre-intention-mindmap.html
```

## Stack

- HTML + CSS + JS inline (fichier unique, ~700 lignes)
- D3.js v7 via CDN
- Aucune dépendance locale, aucun build

## Workflow multi-machine

Le repo est concu pour être travaillé depuis plusieurs machines via GitHub :

```bash
git clone git@github.com:florycarm-a11y/arbre-intention-mindmap.git
cd arbre-intention-mindmap
claude   # ouvrir Claude Code pour continuer le projet
```
