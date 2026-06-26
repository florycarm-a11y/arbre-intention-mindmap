# Le Mandat

**Cadrez votre délégation en 8 étapes, pour passer de l'usage à la délégation maîtrisée.**

Le Mandat est un instrument de littératie IA, en réponse à l'Article 4
de l'EU AI Act. Il fait pratiquer la réflexion structurée avant chaque
délégation à un système d'IA, et produit un livrable utilisable
directement (prompt système ou CLAUDE.md).

## Usage

Vous remplissez 8 étapes (projet, intentions stratégique / tactique /
opérationnelle, tensions, arbitrages, garde-fous, synthèse) et vous
repartez avec :

- un **prompt système court** à coller en début de session ChatGPT,
  Claude, Cursor, ou comme `system` d'une API call ;
- un **CLAUDE.md complet** à déposer à la racine d'un projet, qui
  sert aussi de trace écrite de gouvernance.

Accéder à l'outil : https://florycarm-a11y.github.io/le-mandat/

En local :

    python3 -m http.server 8080

## Contexte réglementaire

L'Article 4 de l'EU AI Act, applicable depuis février 2025, impose
à toute organisation utilisant un système d'IA de garantir la
littératie de ses équipes. Le Mandat est un instrument concret
de cette exigence : il ne remplace pas un programme de formation,
il en est un composant pratique qui transforme la réflexion
structurée en livrable réutilisable.

## Méthode

La méthode complète vit sur [/methode](https://florycarm-a11y.github.io/le-mandat/methode.html).

## Déployer en équipe

Produire un mandat est un acte individuel ; en faire un réflexe d'équipe
demande quatre décisions (déclencheur, lieu de vie, propriétaire, preuve).
Le mode d'emploi de déploiement vit en bas de
[/methode](https://florycarm-a11y.github.io/le-mandat/methode.html#installer-en-equipe),
avec un kit minimal en quatre points.

## Stack

HTML + CSS + JS vanilla, D3.js v7 (mindmap récap), jsPDF (export PDF).
Pas de build, pas de bundler, pas de tracking. Le mandat ne quitte
jamais votre navigateur.

## Régénération de l'OG cover

La source est `assets/og-cover.svg`. Pour produire le PNG :
ouvrir le SVG dans un éditeur vectoriel (Inkscape, Figma, Aperçu macOS)
et exporter en PNG 1200 × 630 vers `assets/og-cover.png`.

---

Auteur : [Floryan Leblanc](https://florycarm-a11y.github.io/PORTFOLIO/)
