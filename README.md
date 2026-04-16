# L'Arbre d'Intention — Méthode de cadrage pour la délégation IA

Une méthode en 8 étapes pour structurer ce que vous attendez d'une IA avant de lui donner les clés.

## Aperçu

Page narrative interactive avec :
- **8 sections** expliquant chaque étape de la méthode
- **Cas d'étude concret** : la méthode appliquée à son propre développement
- **Mindmap D3.js** en vue d'ensemble et navigation (desktop)
- **Barre de progression** pour la navigation mobile
- **Toggle** Framework / Cas d'étude

## Utilisation

Ouvrir dans un navigateur :

```bash
open index.html
```

Ou servir localement (recommandé pour le chargement des JSON) :

```bash
python3 -m http.server 8080
# puis http://localhost:8080
```

## Stack

- HTML + CSS + JS (vanilla, pas de framework)
- D3.js v7 via CDN (mindmap uniquement)
- Données en JSON (`data/arbre.json`, `data/cas-etude.json`)
- Aucune dépendance locale, aucun build

## Structure

```
├── index.html          Page principale
├── css/style.css       Styles
├── js/main.js          Orchestration, toggle, sections
├── js/mindmap.js       Rendu D3.js de la mindmap
├── data/arbre.json     Structure du framework
├── data/cas-etude.json Cas d'étude concret
└── assets/             Images et OG cover
```

## Contexte

Ce projet s'inscrit dans une réflexion sur la **littératie IA** et l'**Article 4 de l'EU AI Act**, qui impose aux organisations de garantir la compétence de leurs équipes dans l'usage des systèmes d'IA.
