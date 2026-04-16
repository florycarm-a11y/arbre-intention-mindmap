# Arbre d'Intention v2 — Design Spec

**Date :** 2026-04-16
**Statut :** Validé
**Auteur :** Floryan Leblanc + Claude Code

---

## 1. Contexte et objectif

L'Arbre d'Intention est une méthode de cadrage en 8 étapes pour structurer la délégation à une IA. La v1 est un fichier HTML unique avec une mindmap D3.js interactive — visuellement réussie mais inutilisable sur mobile, sans contexte explicatif, et sans cas d'usage concret.

**Objectif de la v2 :** transformer l'outil en une page narrative qui démontre la méthode en l'appliquant à son propre développement, pour servir de signal de compétence (recruteurs, décideurs) et d'outil de diffusion (LinkedIn, communauté IA).

**Priorités :** B (signal de compétence) > A (valeur utilitaire) > C (thought leadership).

**Contexte utilisateur :** Floryan cherche un stage/alternance, positionné sur la gouvernance IA, la littératie IA (Article 4 EU AI Act) et la souveraineté européenne en IA.

---

## 2. Approche retenue

**Approche B — Page narrative + mindmap embarquée.** Le contenu vit dans des sections scrollables (une par étape). La mindmap D3.js sert de vue d'ensemble et de navigation, pas de conteneur de contenu.

Approches écartées :
- A (mindmap augmentée) — rigide pour du contenu riche, mauvaise UX mobile
- C (app à deux panneaux) — trop technique, risque de ressembler à une doc

---

## 3. Structure de la page

```
Nav fixe : titre + toggle Framework/Cas d'étude
Hero : accroche + contexte + CTA
Mindmap D3.js (vue d'ensemble, navigation cliquable)
Section 01 — Le projet
Section 02 — L'intention stratégique
Section 03 — L'intention tactique
Section 04 — L'intention opérationnelle
Section 05 — Les tensions
Section 06 — Arbitrage
Section 07 — Garde-fous
Section 08 — Synthèse
Footer : crédits, liens portfolio/GitHub/LinkedIn
```

---

## 4. Hero

Contenu :
- **Titre :** "L'Arbre d'Intention"
- **Sous-titre :** "Une méthode de cadrage pour structurer ce que vous attendez d'une IA — avant de lui donner les clés."
- **Deux CTA :** "Découvrir la méthode" (mode Framework) / "Voir le cas d'étude" (mode Cas d'étude)
- **Paragraphe de contexte :** "Vous pouvez déléguer une tâche entière à une IA. Mais sans cadrage, elle optimise ce que vous avez dit — pas ce que vous vouliez. Ce qui se joue avant la première instruction détermine 80% du résultat."
- **Encadré EU AI Act :** "L'Article 4 de l'EU AI Act impose aux organisations de garantir la littératie IA de leurs équipes. L'Arbre d'Intention est une réponse concrète : 8 étapes pour passer de 'j'utilise l'IA' à 'je sais cadrer ce que je lui délègue'."

Principes :
- Pas de jargon technique dans le hero (pas de "D3.js", "mindmap", "LLM")
- On parle d'"IA" (pas LLM/agents)
- Ton direct, affirmatif, pas académique
- Le 80% est un Pareto assumé, pas une statistique sourcée

---

## 5. Mindmap — Vue d'ensemble

**Rôle :** carte de navigation visuelle. Pas de contenu détaillé dans les noeuds.

**Desktop :**
- Affichée après le hero, arbre au niveau 1 (8 branches visibles)
- Clic sur un noeud = smooth scroll vers la section correspondante
- Sync scroll : quand le visiteur scrolle dans les sections, le noeud correspondant se met en surbrillance
- Boutons conservés : Tout déplier / Tout replier / Recentrer
- Disparaît au scroll, rappelable via bouton flottant "Voir la carte"

**Mobile :**
- Remplacée par une barre de progression horizontale sticky sous la nav
- 8 étapes numérotées, cliquables, highlight sur l'étape active
- Pas de mindmap D3.js sur mobile

**Technique :** D3.js v7 via CDN, mêmes données que les sections (arbre.json).

---

## 6. Template d'une section d'étape

Chaque section (01 à 08) suit le même template :

### 6.1 Bandeau
Couleur de la branche. Titre (numéro + nom) + citation italique du framework. Sert d'ancre pour le scroll.

### 6.2 Comprendre
2-3 paragraphes explicatifs. Ton : "voici le problème que vous avez si vous sautez cette étape". Orienté conséquences concrètes de la non-application. C'est ici que la réflexion de Floryan se montre.

### 6.3 Cas d'étude
Encadré visuellement distinct (fond différent, bordure couleur de la branche). Intitulé : "Cas d'étude — Pour l'Arbre d'Intention". Montre les réponses réelles données en appliquant le framework à son propre développement + un récit narratif de ce qui s'est joué à cette étape.

- Mode "Cas d'étude" (défaut) : encadré visible
- Mode "Framework" : encadré masqué

### 6.4 Champs
Liste des champs du framework avec badges obligatoire (rouge) / optionnel (gris).

### 6.5 Mode "À vous" (futur)
Non implémenté dans ce scope. La structure HTML prévoit un emplacement pour un bloc interactif remplissable par l'utilisateur.

---

## 7. Toggle global

**Emplacement :** nav fixe, toujours visible (desktop et mobile).

**Deux modes :**
- **Cas d'étude** (défaut) — encadrés d'exemple visibles dans chaque section
- **Framework** — encadrés masqués, méthode pure

**Comportement :** switch animé, transition douce sur les encadrés (apparition/disparition). Pas de changement de page.

---

## 8. Navigation et progression

**Desktop :**
- Nav fixe : titre + toggle
- Mindmap : sync au scroll (highlight du noeud actif)
- Bouton flottant "Voir la carte" quand la mindmap est hors viewport

**Mobile :**
- Nav fixe : titre + toggle
- Barre de progression sticky sous la nav : 8 étapes numérotées, cliquables, highlight actif
- Scroll vertical naturel

---

## 9. Architecture technique

### 9.1 Structure des fichiers

```
arbre-intention-mindmap/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js              (orchestration, toggle, scroll sync, navigation)
│   └── mindmap.js            (rendu D3.js)
├── data/
│   ├── arbre.json            (structure framework : noeuds, couleurs, citations, champs, textes "Comprendre")
│   └── cas-etude.json        (réponses concrètes du cas d'étude, par étape)
├── assets/
│   └── og-cover.png          (image Open Graph pour previews LinkedIn)
├── arbre-intention-mindmap.html  (ancienne v1, conservée temporairement)
└── README.md
```

### 9.2 Choix techniques

- Vanilla JS, pas de framework ni bundler
- D3.js v7 via CDN (mindmap uniquement)
- CSS variables pour couleurs de branche, thème, spacings
- Thème clair uniquement (fond blanc/crème — ton sérieux/institutionnel)
- Pas de dark mode dans ce scope

### 9.3 Données

**arbre.json** — structure du framework :
```json
{
  "name": "L'Arbre d'Intention",
  "children": [
    {
      "id": "01",
      "name": "Le projet",
      "color": "#64748B",
      "quote": "Nommez-le précisément...",
      "comprendre": "Texte explicatif...",
      "champs": [
        { "name": "Nom du projet", "status": "obligatoire", "description": "..." }
      ]
    }
  ]
}
```

**cas-etude.json** — cas d'étude :
```json
{
  "titre": "Développer l'Arbre d'Intention avec sa propre méthode",
  "etapes": {
    "01": {
      "reponses": {
        "Nom du projet": "Arbre d'Intention — Méthode de cadrage interactive",
        "Contexte": "..."
      },
      "recit": "Paragraphe narratif..."
    }
  }
}
```

La séparation permet d'ajouter d'autres cas d'étude plus tard sans toucher au code.

---

## 10. Intégration écosystème

### 10.1 OG Meta (LinkedIn)
```html
<meta property="og:title" content="L'Arbre d'Intention — Méthode de cadrage pour la délégation IA">
<meta property="og:description" content="8 étapes pour structurer ce que vous attendez d'une IA avant de lui donner les clés. Cas d'étude inclus.">
<meta property="og:image" content="https://florycarm-a11y.github.io/arbre-intention-mindmap/assets/og-cover.png">
```

### 10.2 Portfolio
Ajout dans `projects.json` du portfolio :
```json
{
  "name": "L'Arbre d'Intention",
  "description": "Méthode de cadrage en 8 étapes pour structurer la délégation à une IA. Page interactive avec cas d'étude intégré.",
  "tags": ["JavaScript", "D3.js", "Gouvernance IA", "EU AI Act"],
  "url": "https://github.com/florycarm-a11y/arbre-intention-mindmap",
  "homepage": "https://florycarm-a11y.github.io/arbre-intention-mindmap/"
}
```

### 10.3 Footer
Nom linkable vers le portfolio, liens GitHub / LinkedIn. Mention "Construit avec Claude Code".

---

## 11. Hors scope (futur)

- Mode "À vous" — formulaire interactif pour remplir son propre arbre
- Export (markdown, PDF, prompt CLAUDE.md)
- Dark mode
- Autres cas d'étude
- Article de fond / post LinkedIn (contenu éditorial, pas technique)

---

## 12. Prérequis avant implémentation

Floryan doit **remplir le cas d'étude** — appliquer réellement l'Arbre d'Intention au projet de sa propre refonte. Les textes "Comprendre" et les réponses du cas d'étude sont du contenu éditorial, pas du code. Ils doivent exister avant de coder les sections.
