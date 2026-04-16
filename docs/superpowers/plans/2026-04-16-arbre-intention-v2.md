# Arbre d'Intention v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Arbre d'Intention from a single-file D3.js mindmap into a narrative page with embedded mindmap navigation, a Framework/Case Study toggle, responsive mobile support, and a self-referential case study.

**Architecture:** Multi-file vanilla JS project. `index.html` as entry point, CSS in `css/style.css`, JS split into `main.js` (orchestration, toggle, scroll sync) and `mindmap.js` (D3.js rendering). Content data in `data/arbre.json` (framework structure) and `data/cas-etude.json` (case study responses). The mindmap renders on desktop only; mobile uses a sticky progress bar.

**Tech Stack:** Vanilla HTML/CSS/JS, D3.js v7 via CDN, CSS custom properties, IntersectionObserver for scroll sync.

**Spec:** `docs/superpowers/specs/2026-04-16-arbre-intention-v2-design.md`

---

### Task 1: Create data files from v1 content

**Files:**
- Create: `data/arbre.json`
- Create: `data/cas-etude.json`

Extract the framework data from the v1 HTML into structured JSON, adding the new fields (`id`, `comprendre`) needed by v2. Write the case study content by applying the Arbre d'Intention to its own development.

- [ ] **Step 1: Create `data/arbre.json`**

```json
{
  "name": "L'Arbre d'Intention",
  "color": "#1C1917",
  "children": [
    {
      "id": "01",
      "name": "Le projet",
      "color": "#64748B",
      "quote": "Nommez-le précisément. Un projet mal nommé produit des intentions floues — et des IA qui travaillent à côté.",
      "comprendre": "Avant de déléguer quoi que ce soit à une IA, la première question est : sur quoi travaille-t-on exactement ? Un projet flou produit des instructions floues, qui produisent des résultats à côté. Nommer le projet, c'est poser le cadre. Un nom opérationnel — pas une catégorie — oblige à être précis sur ce qu'on construit.\n\nSi vous dites « refondre le site », l'IA ne sait pas si vous parlez d'un redesign visuel, d'une migration technique, ou d'une réécriture complète. Si vous dites « Arbre d'Intention v2 — page narrative interactive avec cas d'étude intégré », elle sait exactement où elle met les pieds.\n\nLe contexte est tout aussi critique : pourquoi ce projet existe maintenant, pas dans six mois ? L'IA n'a pas accès à votre historique. Ce que vous ne lui écrivez pas, elle ne le sait pas.",
      "champs": [
        { "name": "Nom du projet", "status": "obligatoire", "description": "Un nom opérationnel, pas une catégorie" },
        { "name": "Contexte", "status": "optionnel", "description": "Pourquoi ce projet existe maintenant ? L'IA ne l'aura pas si vous ne l'écrivez pas" }
      ]
    },
    {
      "id": "02",
      "name": "L'intention stratégique",
      "color": "#B91C1C",
      "quote": "Qui, au sommet, sera satisfait ou insatisfait — indépendamment de la qualité technique ?",
      "comprendre": "L'intention stratégique est la finalité ultime du projet. Pas un objectif chiffré, pas un livrable — la raison pour laquelle le projet existe. Si cette intention n'est pas satisfaite, rien d'autre ne compte, même si tout le reste est techniquement parfait.\n\nLe porteur stratégique est celui qui juge le succès ou l'échec du projet dans son ensemble. Dans une entreprise, c'est souvent le sponsor, le DG, le client final. Pour un projet personnel, c'est vous — mais dans votre rôle de décideur, pas d'exécutant.\n\nLe test d'invalidation est l'outil le plus puissant de cette étape : décrivez une situation où l'exécution est réussie mais l'intention stratégique est violée. Si vous ne trouvez pas ce scénario, votre intention est probablement trop vague.",
      "champs": [
        { "name": "Porteur", "status": "optionnel", "description": "Qui juge si le résultat global est un succès ou un échec ?" },
        { "name": "Intention", "status": "obligatoire", "description": "Pas un objectif chiffré. La finalité dont l'absence invalide tout" },
        { "name": "Test d'invalidation", "status": "optionnel", "description": "Exécution réussie mais intention violée" }
      ]
    },
    {
      "id": "03",
      "name": "L'intention tactique",
      "color": "#EA580C",
      "quote": "Qui pilote au quotidien ? Cette personne a sa propre définition du succès.",
      "comprendre": "L'intention tactique traduit la stratégie en plan d'action. Le porteur tactique est celui qui pilote au quotidien : il choisit les priorités, séquence les étapes, arbitre les compromis terrain. Sa définition du succès n'est pas la même que celle du stratégique — et c'est normal.\n\nLe danger : quand l'intention tactique n'est pas explicite, l'IA (ou l'équipe) optimise pour la stratégie sans tenir compte des contraintes de pilotage. Le résultat est techniquement aligné avec la vision mais ingouvernable en pratique.\n\nIci aussi, le test d'invalidation révèle les angles morts : le niveau stratégique est satisfait, mais le pilotage est un cauchemar. Ce scénario arrive plus souvent qu'on ne le pense.",
      "champs": [
        { "name": "Porteur", "status": "optionnel", "description": "Celui qui traduit la stratégie en plan d'action" },
        { "name": "Intention", "status": "obligatoire", "description": "La finalité dont l'absence invalide le résultat, même si l'exécution est parfaite" },
        { "name": "Test d'invalidation", "status": "optionnel", "description": "Le niveau stratégique est satisfait, mais celui-ci est violé" }
      ]
    },
    {
      "id": "04",
      "name": "L'intention opérationnelle",
      "color": "#047857",
      "quote": "Qui exécute ? Ses contraintes sont légitimes — les niveaux supérieurs ne les voient souvent pas.",
      "comprendre": "L'intention opérationnelle est celle de la personne (ou de l'IA) qui a les mains sur le clavier. Ses contraintes sont réelles : temps disponible, compétences techniques, outils accessibles, dette technique existante. Les ignorer, c'est produire un plan que personne ne peut exécuter.\n\nDans le contexte de la délégation IA, l'intention opérationnelle décrit ce que l'IA doit concrètement produire, dans quel périmètre, avec quelles contraintes. C'est la couche la plus proche de l'instruction — mais elle n'est pas l'instruction. Elle est le « pourquoi » derrière chaque ligne du prompt.\n\nSans intention opérationnelle explicite, l'IA fait des choix techniques arbitraires. Avec, elle comprend non seulement ce qu'elle doit faire, mais pourquoi — et peut adapter quand le terrain change.",
      "champs": [
        { "name": "Porteur", "status": "optionnel", "description": "Celui dont les mains sont sur le clavier" },
        { "name": "Intention", "status": "obligatoire", "description": "La finalité dont l'absence invalide le résultat, même si l'exécution est parfaite" },
        { "name": "Test d'invalidation", "status": "optionnel", "description": "Situation où l'exécution est réussie mais l'intention est violée" }
      ]
    },
    {
      "id": "05",
      "name": "Les tensions",
      "color": "#7C3AED",
      "quote": "Deux intentions légitimes qui prescrivent des actions incompatibles. Si vous n'en trouvez aucune, vous n'avez pas assez cherché.",
      "comprendre": "Une tension n'est pas un problème — c'est un signal que votre cadrage est réaliste. Dès que trois niveaux d'intention coexistent, des contradictions apparaissent. Le stratégique veut de l'ambition, le tactique veut de la maîtrise, l'opérationnel veut de la faisabilité. Ces trois demandes sont légitimes — et incompatibles à 100%.\n\nSi vous ne trouvez aucune tension, c'est que vos intentions sont soit trop vagues (elles ne prescrivent rien de concret), soit identiques (vous n'avez pas vraiment trois niveaux, vous avez le même reformulé trois fois).\n\nLe travail ici est de nommer la contradiction concrète : quelle action un niveau prescrit-il que l'autre interdit ? Cette précision est ce qui permet l'arbitrage à l'étape suivante.",
      "champs": [
        {
          "name": "Stratégique ↔ Tactique",
          "children": [
            { "name": "Contradiction concrète", "status": "optionnel", "description": "Quelle action l'une prescrit-elle que l'autre interdit ?" }
          ]
        },
        {
          "name": "Tactique ↔ Opérationnel",
          "children": [
            { "name": "Contradiction concrète", "status": "optionnel", "description": "Quelle action l'une prescrit-elle que l'autre interdit ?" }
          ]
        },
        {
          "name": "Stratégique ↔ Opérationnel",
          "children": [
            { "name": "Contradiction concrète", "status": "optionnel", "description": "Quelle action l'une prescrit-elle que l'autre interdit ?" }
          ]
        }
      ]
    },
    {
      "id": "06",
      "name": "Arbitrage",
      "color": "#4338CA",
      "quote": "Arbitrer signifie décider qui perd quelque chose. Si personne ne perd rien, vous n'avez pas tranché.",
      "comprendre": "L'arbitrage est l'étape que tout le monde veut éviter. Trancher signifie qu'une intention légitime va être sacrifiée — partiellement ou totalement — au profit d'une autre. Si personne ne perd rien, vous n'avez pas arbitré, vous avez reformulé le problème pour qu'il ait l'air résolu.\n\nPour chaque tension identifiée : quelle intention prime ? Et surtout : quel est le sacrifice ? Nommer ce qui est perdu est aussi important que nommer ce qui est gardé. L'IA (ou l'équipe) doit savoir ce qu'elle n'optimise PAS.\n\nSans arbitrage explicite, l'IA arbitre pour vous — silencieusement, sans vous prévenir, selon ses propres heuristiques. C'est exactement la situation que l'Arbre d'Intention cherche à éviter.",
      "champs": [
        {
          "name": "Stratégique ↔ Tactique",
          "children": [
            { "name": "Quelle intention prime ?", "status": "obligatoire", "description": "Tranchez — sans quoi l'IA choisira pour vous" },
            { "name": "Sacrifice", "status": "optionnel", "description": "Nommez ce qui est perdu" }
          ]
        },
        {
          "name": "Tactique ↔ Opérationnel",
          "children": [
            { "name": "Quelle intention prime ?", "status": "obligatoire", "description": "Tranchez — sans quoi l'IA choisira pour vous" },
            { "name": "Sacrifice", "status": "optionnel", "description": "Nommez ce qui est perdu" }
          ]
        },
        {
          "name": "Stratégique ↔ Opérationnel",
          "children": [
            { "name": "Quelle intention prime ?", "status": "obligatoire", "description": "Tranchez — sans quoi l'IA choisira pour vous" },
            { "name": "Sacrifice", "status": "optionnel", "description": "Nommez ce qui est perdu" }
          ]
        }
      ]
    },
    {
      "id": "07",
      "name": "Garde-fous",
      "color": "#B45309",
      "quote": "La délégation requiert des garde-fous de la même façon que l'aviation requiert des checklists.",
      "comprendre": "Les garde-fous ne sont pas des bonnes pratiques génériques (« ne pas introduire de bugs »). Ce sont les lignes rouges spécifiques à ce projet — les actions que l'IA ne doit jamais entreprendre, les situations où elle doit s'arrêter et demander.\n\nLes interdictions définissent le périmètre de la délégation : tout ce qui est en dehors est interdit. Les seuils d'arrêt définissent les frontières de l'autonomie : au-delà, l'IA rend la main.\n\nLe test des 3 phrases est l'outil de validation finale : 3 phrases qu'un observateur indépendant utiliserait pour juger si le résultat est conforme — sans avoir besoin de vous poser une seule question. Si vous ne pouvez pas les écrire, vos intentions ne sont pas assez claires.",
      "champs": [
        { "name": "L'IA ne doit JAMAIS…", "status": "obligatoire", "description": "Les lignes rouges spécifiques à ce projet, pas des bonnes pratiques génériques" },
        { "name": "L'IA s'arrête et demande quand…", "status": "obligatoire", "description": "Les frontières de la délégation" },
        { "name": "Test des 3 phrases", "status": "obligatoire", "description": "3 phrases qu'un observateur indépendant utiliserait pour valider le résultat, sans vous poser de question" }
      ]
    },
    {
      "id": "08",
      "name": "Synthèse",
      "color": "#1C1917",
      "quote": "La structure de vos décisions. Ce document est prêt à être encodé dans un CLAUDE.md ou un system prompt.",
      "comprendre": "La synthèse est le moment de vérité : votre arbre est-il complet ? Les champs essentiels (nom du projet, trois intentions) sont-ils remplis ? Les tensions sont-elles identifiées et arbitrées ? Les garde-fous sont-ils posés ?\n\nLe diagnostic distingue l'essentiel (sans quoi l'arbre ne tient pas) de l'important (qui renforce la qualité du cadrage). Un arbre avec uniquement les champs essentiels est utilisable. Un arbre avec tous les champs est robuste.\n\nLe résultat final est un document structuré, prêt à être intégré dans un CLAUDE.md, un system prompt, ou tout autre mécanisme d'instruction. C'est le pont entre votre réflexion et l'exécution par l'IA.",
      "champs": [
        { "name": "Visualisation de l'arbre", "description": "Les 3 nœuds : Stratégique / Tactique / Opérationnel" },
        { "name": "Tensions résolues", "description": "✓ résolu entre chaque paire de nœuds" },
        {
          "name": "Diagnostic — ESSENTIEL",
          "children": [
            { "name": "Projet nommé", "status": "obligatoire" },
            { "name": "Intention stratégique", "status": "obligatoire" },
            { "name": "Intention tactique", "status": "obligatoire" },
            { "name": "Intention opérationnelle", "status": "obligatoire" }
          ]
        },
        {
          "name": "Diagnostic — IMPORTANT",
          "children": [
            { "name": "Au moins une tension identifiée", "status": "optionnel" },
            { "name": "Tensions arbitrées", "status": "optionnel" },
            { "name": "Interdictions posées", "status": "optionnel" },
            { "name": "Critères de validation", "status": "optionnel" }
          ]
        }
      ]
    }
  ]
}
```

- [ ] **Step 2: Create `data/cas-etude.json`**

```json
{
  "titre": "Développer l'Arbre d'Intention avec sa propre méthode",
  "description": "Ce cas d'étude est particulier : le framework a été appliqué au projet de sa propre refonte. Chaque réponse ci-dessous a été produite avant de coder, en suivant les 8 étapes de la méthode.",
  "etapes": {
    "01": {
      "recit": "Le premier réflexe aurait été de foncer dans le code. Au lieu de cela, on a posé la question : qu'est-ce qu'on construit exactement ? Pas « améliorer la mindmap » — c'est une catégorie. Le vrai nom du projet a forcé une décision : ce n'est plus une mindmap, c'est une page narrative interactive qui démontre la méthode en l'appliquant à elle-même.",
      "reponses": {
        "Nom du projet": "Arbre d'Intention v2 — Page narrative interactive avec cas d'étude intégré",
        "Contexte": "La v1 est une mindmap D3.js fonctionnelle mais inutilisable sur mobile, sans explication du framework, et sans cas d'usage concret. Floryan cherche un stage/alternance et veut se positionner sur la gouvernance IA et la littératie IA (Article 4 EU AI Act). Le projet doit démontrer une pensée structurée, pas juste une compétence technique."
      }
    },
    "02": {
      "recit": "Qui juge si ce projet est un succès ? Pas un utilisateur technique — un recruteur, un décideur, quelqu'un qui ouvre un lien LinkedIn et qui doit comprendre en 30 secondes que Floryan sait penser la gouvernance IA. Si cette personne ne comprend rien, tout le reste est inutile.",
      "reponses": {
        "Porteur": "Floryan dans son rôle de candidat — jugé par des recruteurs et décideurs",
        "Intention": "Démontrer une pensée structurée sur la gouvernance de la délégation IA, matérialisée dans un outil concret",
        "Test d'invalidation": "L'outil est techniquement parfait mais un recruteur qui l'ouvre ne comprend pas en 30 secondes de quoi il s'agit ni pourquoi c'est pertinent"
      }
    },
    "03": {
      "recit": "Le pilotage au quotidien, c'est la question du comment. On a exploré trois approches (mindmap augmentée, page narrative, app deux panneaux) et tranché pour la page narrative. La raison tactique : un recruteur scrolle, il ne zoome pas dans une mindmap D3.js.",
      "reponses": {
        "Porteur": "Floryan dans son rôle de concepteur/développeur",
        "Intention": "Produire une page qui se lit naturellement (scroll), qui fonctionne sur mobile, et qui intègre le cas d'étude comme preuve — pas comme annexe",
        "Test d'invalidation": "La page est belle mais le cas d'étude est relégué dans un onglet secondaire que personne ne trouve"
      }
    },
    "04": {
      "recit": "Les contraintes opérationnelles sont réelles : vanilla JS uniquement, pas de build, fichier unique initialement (maintenant multi-fichiers), D3.js déjà en place. Le code existant de la mindmap v1 doit être adapté, pas réécrit from scratch.",
      "reponses": {
        "Porteur": "Claude Code — l'IA qui exécute le développement",
        "Intention": "Transformer le fichier HTML unique en architecture multi-fichiers propre, en réutilisant le code D3.js existant pour la mindmap et en ajoutant les sections narratives",
        "Test d'invalidation": "Le code est propre et bien structuré mais la page ne charge pas correctement sur GitHub Pages à cause d'un problème de chemins relatifs"
      }
    },
    "05": {
      "recit": "Les tensions sont apparues naturellement. Le stratégique veut impressionner en 30 secondes — le tactique veut du contenu riche et complet. Le tactique veut une navigation fluide avec mindmap — l'opérationnel sait que la mindmap D3.js est ingérable sur mobile. Le stratégique veut un positionnement sérieux/institutionnel — l'opérationnel travaille en vanilla JS sans designer.",
      "reponses": {
        "Stratégique ↔ Tactique": "Le stratégique veut un impact immédiat (30 secondes) ; le tactique veut 8 sections complètes avec textes explicatifs et cas d'étude. Les deux ne tiennent pas dans le même viewport.",
        "Tactique ↔ Opérationnel": "Le tactique veut la mindmap comme navigation synchronisée ; l'opérationnel constate que D3.js sur mobile est inutilisable et consomme des ressources.",
        "Stratégique ↔ Opérationnel": "Le stratégique veut un rendu professionnel/institutionnel ; l'opérationnel travaille sans designer, sans framework CSS, en vanilla uniquement."
      }
    },
    "06": {
      "recit": "Chaque tension a été arbitrée explicitement. Le contenu prime sur l'impact immédiat — le hero fait le travail d'accroche, le contenu fait le travail de conviction. Le mobile prime sur la mindmap — une barre de progression remplace l'arbre sur petit écran. Le sérieux du contenu prime sur le polish visuel — le thème clair et sobre compense l'absence de designer.",
      "reponses": {
        "Stratégique ↔ Tactique": {
          "prime": "Tactique (contenu complet)",
          "sacrifice": "L'impact immédiat repose entièrement sur le hero — si le hero rate, la suite n'est pas lue"
        },
        "Tactique ↔ Opérationnel": {
          "prime": "Opérationnel (faisabilité mobile)",
          "sacrifice": "Pas de mindmap sur mobile — remplacée par une barre de progression moins spectaculaire"
        },
        "Stratégique ↔ Opérationnel": {
          "prime": "Stratégique (rendu sérieux)",
          "sacrifice": "Le thème clair uniquement, pas de dark mode — réduit le scope technique au profit du ton"
        }
      }
    },
    "07": {
      "recit": "Les garde-fous ont été posés dès le début dans le CLAUDE.md du projet. Pour la v2, on en ajoute de spécifiques : ne pas introduire de jargon technique dans le hero, ne pas sacrifier le mobile pour le desktop, ne pas inventer de statistiques non sourcées (sauf le 80% Pareto, explicitement assumé).",
      "reponses": {
        "L'IA ne doit JAMAIS…": "Introduire du jargon technique (D3.js, LLM, API) dans le hero ou les accroches. Casser la compatibilité mobile pour embellir le desktop. Inventer des statistiques ou citations sans les qualifier.",
        "L'IA s'arrête et demande quand…": "Un choix de design impacte la lisibilité mobile. Le contenu éditorial (textes 'Comprendre', récits du cas d'étude) nécessite une validation de ton. Un changement structurel touche plus de 3 fichiers simultanément.",
        "Test des 3 phrases": "1. La page explique en 30 secondes ce qu'est la méthode et pourquoi elle existe. 2. Le cas d'étude montre la méthode appliquée à un vrai projet, avec des réponses concrètes. 3. La page fonctionne aussi bien sur mobile que sur desktop."
      }
    },
    "08": {
      "recit": "Le diagnostic est complet. Les 4 champs essentiels sont remplis : projet nommé, intentions stratégique, tactique et opérationnelle. Les 3 tensions sont identifiées et arbitrées. Les garde-fous sont posés. Le test des 3 phrases est formulé. L'arbre est prêt à guider le développement.",
      "reponses": {
        "diagnostic_essentiel": {
          "Projet nommé": true,
          "Intention stratégique": true,
          "Intention tactique": true,
          "Intention opérationnelle": true
        },
        "diagnostic_important": {
          "Au moins une tension identifiée": true,
          "Tensions arbitrées": true,
          "Interdictions posées": true,
          "Critères de validation": true
        }
      }
    }
  }
}
```

- [ ] **Step 3: Validate JSON files**

Run: `cd /Users/flolbc/Documents/GitHub/arbre-intention-mindmap && python3 -c "import json; json.load(open('data/arbre.json')); json.load(open('data/cas-etude.json')); print('OK')"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add data/arbre.json data/cas-etude.json
git commit -m "feat: add structured data files for framework and case study"
```

---

### Task 2: Create the HTML skeleton with OG meta

**Files:**
- Create: `index.html`

Build the complete HTML structure: `<head>` with OG/Twitter meta, `<nav>`, hero, mindmap container, 8 section placeholders (generated by JS from data), and footer. No styling yet — structure only.

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>L'Arbre d'Intention — Méthode de cadrage pour la délégation IA</title>
    <meta name="description" content="8 étapes pour structurer ce que vous attendez d'une IA avant de lui donner les clés. Méthode de cadrage avec cas d'étude concret.">
    <link rel="canonical" href="https://florycarm-a11y.github.io/arbre-intention-mindmap/">

    <!-- Open Graph -->
    <meta property="og:title" content="L'Arbre d'Intention — Méthode de cadrage pour la délégation IA">
    <meta property="og:description" content="8 étapes pour structurer ce que vous attendez d'une IA avant de lui donner les clés. Cas d'étude inclus.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://florycarm-a11y.github.io/arbre-intention-mindmap/">
    <meta property="og:image" content="https://florycarm-a11y.github.io/arbre-intention-mindmap/assets/og-cover.png">
    <meta property="og:locale" content="fr_FR">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="L'Arbre d'Intention — Méthode de cadrage pour la délégation IA">
    <meta name="twitter:description" content="8 étapes pour structurer ce que vous attendez d'une IA avant de lui donner les clés. Cas d'étude inclus.">
    <meta name="twitter:image" content="https://florycarm-a11y.github.io/arbre-intention-mindmap/assets/og-cover.png">

    <!-- JSON-LD -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "L'Arbre d'Intention",
        "description": "Méthode de cadrage en 8 étapes pour structurer la délégation à une IA",
        "author": {
            "@type": "Person",
            "name": "Floryan Leblanc",
            "url": "https://florycarm-a11y.github.io/PORTFOLIO/"
        }
    }
    </script>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"></noscript>

    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌳</text></svg>">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <a href="#main-content" class="skip-link">Passer au contenu</a>

    <!-- Navigation -->
    <nav class="nav" aria-label="Navigation principale">
        <a class="nav__logo" href="#">L'Arbre d'Intention</a>
        <div class="nav__toggle-wrapper">
            <button class="nav__toggle" id="mode-toggle" aria-label="Basculer entre mode Framework et Cas d'étude">
                <span class="nav__toggle-option nav__toggle-option--framework">Méthode</span>
                <span class="nav__toggle-option nav__toggle-option--casestudy nav__toggle-option--active">Cas d'étude</span>
            </button>
        </div>
    </nav>

    <!-- Hero -->
    <header class="hero">
        <h1 class="hero__title">L'Arbre d'Intention</h1>
        <p class="hero__subtitle">Une méthode de cadrage pour structurer ce que vous attendez d'une IA — avant de lui donner les clés.</p>
        <div class="hero__actions">
            <a class="hero__cta hero__cta--primary" href="#etape-01" data-mode="framework">Découvrir la méthode</a>
            <a class="hero__cta hero__cta--secondary" href="#etape-01" data-mode="casestudy">Voir le cas d'étude</a>
        </div>
        <p class="hero__context">Vous pouvez déléguer une tâche entière à une IA. Mais sans cadrage, elle optimise ce que vous avez dit — pas ce que vous vouliez. Ce qui se joue avant la première instruction détermine 80% du résultat.</p>
        <aside class="hero__aside">
            <p>L'Article 4 de l'EU AI Act impose aux organisations de garantir la littératie IA de leurs équipes. L'Arbre d'Intention est une réponse concrète : 8 étapes pour passer de <em>« j'utilise l'IA »</em> à <em>« je sais cadrer ce que je lui délègue »</em>.</p>
        </aside>
    </header>

    <main id="main-content">
        <!-- Mindmap (desktop) / Progress bar (mobile) -->
        <section class="overview" id="overview">
            <div class="overview__mindmap" id="mindmap-container" aria-hidden="true"></div>
            <nav class="overview__progress" id="progress-bar" aria-label="Navigation par étape"></nav>
        </section>

        <!-- Sections generated by JS from arbre.json -->
        <div id="sections-container"></div>
    </main>

    <!-- Floating "show map" button -->
    <button class="fab-map" id="fab-map" aria-label="Voir la carte">Carte</button>

    <!-- Footer -->
    <footer class="footer">
        <p>L'Arbre d'Intention — une méthode de cadrage par <a href="https://florycarm-a11y.github.io/PORTFOLIO/" target="_blank" rel="noopener noreferrer">Floryan Leblanc</a></p>
        <nav class="footer__links" aria-label="Liens">
            <a class="footer__link" href="https://florycarm-a11y.github.io/PORTFOLIO/" target="_blank" rel="noopener noreferrer">Portfolio</a>
            <a class="footer__link" href="https://github.com/florycarm-a11y/arbre-intention-mindmap" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a class="footer__link" href="https://www.linkedin.com/in/fleblanc17" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </nav>
        <p class="footer__credit">Construit avec Claude Code</p>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js"></script>
    <script src="js/mindmap.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify the file opens without errors**

Run: `open /Users/flolbc/Documents/GitHub/arbre-intention-mindmap/index.html`
Expected: blank page (no CSS/JS yet) with correct document title in browser tab, no console errors for the HTML itself.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add HTML skeleton with OG meta and semantic structure"
```

---

### Task 3: Create the CSS

**Files:**
- Create: `css/style.css`

Complete stylesheet: CSS variables (colors per branch, spacing, typography), nav, hero, overview (mindmap + progress bar), section template, toggle, footer, responsive breakpoints, animations, reduced-motion support.

- [ ] **Step 1: Create `css/style.css`**

```css
/* ========================================
   Arbre d'Intention v2 — Styles
   ======================================== */

/* --- Reset --- */
*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* --- Variables --- */
:root {
    --color-bg: #FAFAF9;
    --color-text: #1C1917;
    --color-muted: #57534E;
    --color-light: #78716C;
    --color-border: #E7E5E4;
    --color-card-bg: #FFFFFF;
    --color-casestudy-bg: #F5F5F4;
    --color-nav-bg: rgba(250, 250, 249, 0.92);

    --color-01: #64748B;
    --color-02: #B91C1C;
    --color-03: #EA580C;
    --color-04: #047857;
    --color-05: #7C3AED;
    --color-06: #4338CA;
    --color-07: #B45309;
    --color-08: #1C1917;

    --color-obligatoire: #DC2626;
    --color-optionnel: #A8A29E;

    --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --spacing-xs: 0.5rem;
    --spacing-sm: 1rem;
    --spacing-md: 2rem;
    --spacing-lg: 3rem;
    --spacing-xl: 4rem;
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --content-width: 760px;
    --transition: 0.3s ease;
    --blur-nav: 10px;
}

/* --- Skip link --- */
.skip-link {
    position: absolute;
    top: -100%;
    left: 0;
    padding: 0.75rem 1.5rem;
    background: var(--color-text);
    color: var(--color-bg);
    font-weight: 700;
    z-index: 200;
}

.skip-link:focus {
    top: 0;
}

/* --- Base --- */
html {
    scroll-behavior: smooth;
    scroll-padding-top: 80px;
}

body {
    background-color: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-family);
    font-size: clamp(1rem, 0.95rem + 0.25vw, 1.1rem);
    line-height: 1.7;
}

a {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: var(--color-border);
    text-underline-offset: 2px;
    transition: text-decoration-color var(--transition);
}

a:hover {
    text-decoration-color: currentColor;
}

/* --- Nav --- */
.nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-nav-bg);
    backdrop-filter: blur(var(--blur-nav));
    -webkit-backdrop-filter: blur(var(--blur-nav));
    border-bottom: 1px solid var(--color-border);
    z-index: 100;
}

.nav__logo {
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    color: var(--color-text);
    letter-spacing: -0.01em;
}

.nav__toggle-wrapper {
    display: flex;
    align-items: center;
}

.nav__toggle {
    display: flex;
    align-items: center;
    gap: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-card-bg);
    padding: 2px;
    cursor: pointer;
    font-family: inherit;
}

.nav__toggle-option {
    padding: 6px 14px;
    font-size: 0.8rem;
    font-weight: 500;
    border-radius: 6px;
    color: var(--color-light);
    transition: all var(--transition);
    user-select: none;
}

.nav__toggle-option--active {
    background: var(--color-text);
    color: var(--color-bg);
}

/* --- Hero --- */
.hero {
    max-width: var(--content-width);
    margin: 0 auto;
    padding: calc(80px + var(--spacing-xl)) var(--spacing-md) var(--spacing-xl);
    text-align: center;
}

.hero__title {
    font-size: clamp(2rem, 1.5rem + 2.5vw, 3rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin-bottom: var(--spacing-sm);
}

.hero__subtitle {
    font-size: clamp(1.1rem, 1rem + 0.5vw, 1.3rem);
    color: var(--color-muted);
    max-width: 600px;
    margin: 0 auto var(--spacing-md);
    line-height: 1.5;
}

.hero__actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: var(--spacing-lg);
}

.hero__cta {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-md);
    font-size: 0.95rem;
    font-weight: 600;
    text-decoration: none;
    transition: all var(--transition);
}

.hero__cta--primary {
    background: var(--color-text);
    color: var(--color-bg);
}

.hero__cta--primary:hover {
    opacity: 0.85;
}

.hero__cta--secondary {
    border: 1.5px solid var(--color-border);
    color: var(--color-text);
}

.hero__cta--secondary:hover {
    border-color: var(--color-text);
}

.hero__context {
    font-size: 1.05rem;
    color: var(--color-muted);
    max-width: 580px;
    margin: 0 auto var(--spacing-md);
}

.hero__aside {
    max-width: 560px;
    margin: 0 auto;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-casestudy-bg);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--color-light);
    font-size: 0.9rem;
    color: var(--color-muted);
    text-align: left;
}

/* --- Overview: Mindmap + Progress bar --- */
.overview {
    padding: var(--spacing-md);
    max-width: 100%;
}

.overview__mindmap {
    width: 100%;
    height: 420px;
    position: relative;
}

.overview__mindmap svg {
    width: 100%;
    height: 100%;
    cursor: grab;
}

.overview__mindmap svg:active {
    cursor: grabbing;
}

.overview__progress {
    display: none;
    overflow-x: auto;
    white-space: nowrap;
    padding: var(--spacing-xs) var(--spacing-sm);
    gap: 2px;
    -webkit-overflow-scrolling: touch;
}

.progress__step {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 600;
    border: 2px solid var(--color-border);
    background: var(--color-card-bg);
    color: var(--color-light);
    cursor: pointer;
    transition: all var(--transition);
    flex-shrink: 0;
    text-decoration: none;
}

.progress__step--active {
    border-color: var(--color-text);
    color: var(--color-bg);
    background: var(--color-text);
}

/* --- Sections --- */
.etape {
    max-width: var(--content-width);
    margin: 0 auto;
    padding: var(--spacing-xl) var(--spacing-md);
    border-top: 1px solid var(--color-border);
}

.etape__bandeau {
    padding: var(--spacing-md) var(--spacing-md);
    border-radius: var(--radius-lg);
    margin-bottom: var(--spacing-md);
    color: #FAFAF9;
}

.etape__numero {
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.8;
    margin-bottom: var(--spacing-xs);
}

.etape__titre {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: var(--spacing-sm);
}

.etape__citation {
    font-style: italic;
    font-size: 0.95rem;
    opacity: 0.85;
    line-height: 1.5;
}

.etape__comprendre {
    margin-bottom: var(--spacing-md);
}

.etape__comprendre-title {
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-light);
    margin-bottom: var(--spacing-sm);
}

.etape__comprendre p {
    color: var(--color-muted);
    margin-bottom: var(--spacing-sm);
}

.etape__comprendre p:last-child {
    margin-bottom: 0;
}

/* --- Case study block --- */
.etape__casestudy {
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    background: var(--color-casestudy-bg);
    border-left: 3px solid var(--color-border);
    margin-bottom: var(--spacing-md);
    transition: opacity var(--transition), max-height 0.4s ease, padding 0.4s ease, margin 0.4s ease;
    overflow: hidden;
}

.etape__casestudy-title {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--spacing-sm);
}

.etape__casestudy-recit {
    font-size: 0.95rem;
    color: var(--color-muted);
    margin-bottom: var(--spacing-sm);
    font-style: italic;
}

.etape__casestudy-reponses {
    list-style: none;
}

.etape__casestudy-reponse {
    padding: var(--spacing-xs) 0;
    border-top: 1px solid var(--color-border);
}

.etape__casestudy-reponse:first-child {
    border-top: none;
}

.etape__casestudy-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-light);
}

.etape__casestudy-value {
    font-size: 0.95rem;
    color: var(--color-text);
}

/* Hidden state for case study blocks (framework mode) */
body.mode-framework .etape__casestudy {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
    margin-bottom: 0;
    border-width: 0;
}

/* --- Champs --- */
.etape__champs-title {
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-light);
    margin-bottom: var(--spacing-sm);
}

.etape__champs-list {
    list-style: none;
}

.etape__champ {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) 0;
}

.etape__champ-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 6px;
}

.etape__champ-dot--obligatoire {
    background: var(--color-obligatoire);
}

.etape__champ-dot--optionnel {
    background: var(--color-optionnel);
}

.etape__champ-name {
    font-weight: 600;
    font-size: 0.95rem;
}

.etape__champ-badge {
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    font-weight: 500;
}

.etape__champ-badge--obligatoire {
    background: #FEF2F2;
    color: var(--color-obligatoire);
}

.etape__champ-badge--optionnel {
    background: #F5F5F4;
    color: var(--color-optionnel);
}

.etape__champ-desc {
    font-size: 0.85rem;
    color: var(--color-muted);
    margin-left: calc(8px + var(--spacing-xs));
    margin-bottom: var(--spacing-xs);
}

/* Sub-champs (for tensions/arbitrage nested fields) */
.etape__subgroup {
    margin-top: var(--spacing-sm);
    padding-left: var(--spacing-sm);
    border-left: 2px solid var(--color-border);
}

.etape__subgroup-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--color-text);
    margin-bottom: var(--spacing-xs);
}

/* --- FAB (floating map button) --- */
.fab-map {
    position: fixed;
    bottom: var(--spacing-md);
    right: var(--spacing-md);
    padding: 10px 18px;
    background: var(--color-text);
    color: var(--color-bg);
    border: none;
    border-radius: var(--radius-md);
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    z-index: 50;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition);
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
}

.fab-map--visible {
    opacity: 1;
    pointer-events: auto;
}

/* --- Footer --- */
.footer {
    text-align: center;
    padding: var(--spacing-lg) var(--spacing-md);
    font-size: 0.85rem;
    color: var(--color-light);
    border-top: 1px solid var(--color-border);
}

.footer__links {
    display: flex;
    justify-content: center;
    gap: var(--spacing-sm);
    margin: var(--spacing-xs) 0;
}

.footer__link {
    color: var(--color-light);
}

.footer__credit {
    font-size: 0.8rem;
    margin-top: var(--spacing-xs);
}

/* --- Fade-in --- */
.fade-in {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.fade-in--visible {
    opacity: 1;
    transform: translateY(0);
}

/* --- Mindmap node styles (inside overview) --- */
.mindmap-link {
    fill: none;
    stroke: #D6D3D1;
    stroke-width: 1.5px;
}

.mindmap-node rect {
    stroke-width: 1.5px;
    cursor: pointer;
    transition: filter 0.15s ease;
}

.mindmap-node:hover rect {
    filter: brightness(0.97);
}

.mindmap-node text {
    font-family: inherit;
    pointer-events: none;
    user-select: none;
}

.mindmap-node .mindmap-label {
    font-size: 13px;
    font-weight: 600;
    fill: #FAFAF9;
}

.mindmap-node--active rect {
    stroke-width: 3px;
    filter: brightness(1.08);
}

/* --- Reduced motion --- */
@media (prefers-reduced-motion: reduce) {
    html {
        scroll-behavior: auto;
    }

    *, *::before, *::after {
        transition: none !important;
        animation: none !important;
    }
}

/* ========================================
   Responsive
   ======================================== */

/* Mobile (< 768px) */
@media (max-width: 767px) {
    .overview__mindmap {
        display: none;
    }

    .overview__progress {
        display: flex;
        position: sticky;
        top: 57px;
        z-index: 90;
        background: var(--color-nav-bg);
        backdrop-filter: blur(var(--blur-nav));
        -webkit-backdrop-filter: blur(var(--blur-nav));
        border-bottom: 1px solid var(--color-border);
    }

    .fab-map {
        display: none;
    }

    .nav {
        padding: var(--spacing-sm) var(--spacing-sm);
    }

    .nav__logo {
        font-size: 0.85rem;
    }

    .nav__toggle-option {
        padding: 4px 10px;
        font-size: 0.75rem;
    }

    .hero {
        padding-top: calc(60px + var(--spacing-lg));
    }

    .etape__bandeau {
        padding: var(--spacing-sm) var(--spacing-sm);
    }

    .etape__titre {
        font-size: 1.25rem;
    }
}

/* Desktop (>= 768px) */
@media (min-width: 768px) {
    .overview__progress {
        display: none;
    }

    .overview__mindmap {
        display: block;
    }
}
```

- [ ] **Step 2: Open in browser and verify layout**

Run: `open /Users/flolbc/Documents/GitHub/arbre-intention-mindmap/index.html`
Expected: nav visible at top with toggle, hero centered, footer at bottom. No sections rendered yet (JS not written). Correct colors and typography.

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: add complete stylesheet with responsive breakpoints"
```

---

### Task 4: Build `main.js` — data loading, section rendering, toggle

**Files:**
- Create: `js/main.js`

This is the core orchestration file. It fetches both JSON files, renders the 8 sections from templates, manages the Framework/Case Study toggle, handles CTA clicks, builds the mobile progress bar, manages scroll sync (IntersectionObserver), controls the FAB button visibility, and applies fade-in animations.

- [ ] **Step 1: Create `js/main.js`**

```javascript
// ========================================
// Arbre d'Intention v2 — Main JS
// ========================================

(async function () {
    'use strict';

    // --- Load data ---
    const [arbreData, casEtudeData] = await Promise.all([
        fetch('data/arbre.json').then(r => r.json()),
        fetch('data/cas-etude.json').then(r => r.json())
    ]);

    const etapes = arbreData.children;
    const casEtude = casEtudeData.etapes;

    // --- DOM refs ---
    const sectionsContainer = document.getElementById('sections-container');
    const progressBar = document.getElementById('progress-bar');
    const modeToggle = document.getElementById('mode-toggle');
    const fabMap = document.getElementById('fab-map');
    const mindmapContainer = document.getElementById('mindmap-container');
    const optionFramework = modeToggle.querySelector('.nav__toggle-option--framework');
    const optionCasestudy = modeToggle.querySelector('.nav__toggle-option--casestudy');

    // --- State ---
    let currentMode = 'casestudy'; // default

    // --- Render sections ---
    function renderChamps(champs) {
        return champs.map(champ => {
            if (champ.children) {
                const subItems = champ.children.map(sub => {
                    const dotClass = sub.status === 'obligatoire' ? 'obligatoire' : 'optionnel';
                    const badgeClass = sub.status === 'obligatoire' ? 'obligatoire' : 'optionnel';
                    return `
                        <div class="etape__champ">
                            ${sub.status ? `<span class="etape__champ-dot etape__champ-dot--${dotClass}"></span>` : ''}
                            <span class="etape__champ-name">${sub.name}</span>
                            ${sub.status ? `<span class="etape__champ-badge etape__champ-badge--${badgeClass}">${sub.status}</span>` : ''}
                        </div>
                        ${sub.description ? `<p class="etape__champ-desc">${sub.description}</p>` : ''}
                    `;
                }).join('');

                return `
                    <div class="etape__subgroup">
                        <p class="etape__subgroup-name">${champ.name}</p>
                        ${subItems}
                    </div>
                `;
            }

            const dotClass = champ.status === 'obligatoire' ? 'obligatoire' : 'optionnel';
            const badgeClass = champ.status === 'obligatoire' ? 'obligatoire' : 'optionnel';
            return `
                <div class="etape__champ">
                    ${champ.status ? `<span class="etape__champ-dot etape__champ-dot--${dotClass}"></span>` : ''}
                    <span class="etape__champ-name">${champ.name}</span>
                    ${champ.status ? `<span class="etape__champ-badge etape__champ-badge--${badgeClass}">${champ.status}</span>` : ''}
                </div>
                ${champ.description ? `<p class="etape__champ-desc">${champ.description}</p>` : ''}
            `;
        }).join('');
    }

    function renderCaseStudy(etapeId, cas, color) {
        if (!cas) return '';
        const reponses = cas.reponses;
        let reponsesHtml = '';

        if (reponses) {
            const items = Object.entries(reponses).map(([key, val]) => {
                if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                    if (val.prime !== undefined) {
                        return `
                            <li class="etape__casestudy-reponse">
                                <p class="etape__casestudy-label">${key}</p>
                                <p class="etape__casestudy-value"><strong>Prime :</strong> ${val.prime}</p>
                                <p class="etape__casestudy-value"><strong>Sacrifice :</strong> ${val.sacrifice}</p>
                            </li>
                        `;
                    }
                    // diagnostic objects
                    const checks = Object.entries(val).map(([k, v]) =>
                        `<li class="etape__casestudy-reponse"><span class="etape__casestudy-label">${v ? '✓' : '✗'} ${k}</span></li>`
                    ).join('');
                    return `
                        <li class="etape__casestudy-reponse">
                            <p class="etape__casestudy-label">${key}</p>
                            <ul class="etape__casestudy-reponses">${checks}</ul>
                        </li>
                    `;
                }
                return `
                    <li class="etape__casestudy-reponse">
                        <p class="etape__casestudy-label">${key}</p>
                        <p class="etape__casestudy-value">${val}</p>
                    </li>
                `;
            }).join('');
            reponsesHtml = `<ul class="etape__casestudy-reponses">${items}</ul>`;
        }

        return `
            <div class="etape__casestudy" style="border-left-color: ${color}">
                <p class="etape__casestudy-title">Cas d'étude — Pour l'Arbre d'Intention</p>
                ${cas.recit ? `<p class="etape__casestudy-recit">« ${cas.recit} »</p>` : ''}
                ${reponsesHtml}
            </div>
        `;
    }

    function renderSection(etape) {
        const cas = casEtude[etape.id];
        const comprendre = etape.comprendre.split('\n\n').map(p => `<p>${p}</p>`).join('');

        return `
            <section class="etape fade-in" id="etape-${etape.id}" data-etape="${etape.id}">
                <div class="etape__bandeau" style="background-color: ${etape.color}">
                    <p class="etape__numero">Étape ${etape.id}</p>
                    <h2 class="etape__titre">${etape.name}</h2>
                    <p class="etape__citation">« ${etape.quote} »</p>
                </div>

                <div class="etape__comprendre">
                    <p class="etape__comprendre-title">Comprendre</p>
                    ${comprendre}
                </div>

                ${renderCaseStudy(etape.id, cas, etape.color)}

                <div class="etape__champs">
                    <p class="etape__champs-title">Champs</p>
                    <div class="etape__champs-list">
                        ${renderChamps(etape.champs)}
                    </div>
                </div>
            </section>
        `;
    }

    sectionsContainer.innerHTML = etapes.map(renderSection).join('');

    // --- Progress bar (mobile) ---
    progressBar.innerHTML = etapes.map(etape =>
        `<a class="progress__step" href="#etape-${etape.id}" data-etape="${etape.id}" style="--step-color: ${etape.color}">${etape.id}</a>`
    ).join('');

    // --- Toggle mode ---
    function setMode(mode) {
        currentMode = mode;
        if (mode === 'framework') {
            document.body.classList.add('mode-framework');
            optionFramework.classList.add('nav__toggle-option--active');
            optionCasestudy.classList.remove('nav__toggle-option--active');
        } else {
            document.body.classList.remove('mode-framework');
            optionCasestudy.classList.add('nav__toggle-option--active');
            optionFramework.classList.remove('nav__toggle-option--active');
        }
    }

    modeToggle.addEventListener('click', () => {
        setMode(currentMode === 'casestudy' ? 'framework' : 'casestudy');
    });

    // Hero CTAs set mode
    document.querySelectorAll('.hero__cta[data-mode]').forEach(cta => {
        cta.addEventListener('click', (e) => {
            setMode(e.currentTarget.dataset.mode);
        });
    });

    // --- Scroll sync: IntersectionObserver ---
    const sectionEls = document.querySelectorAll('.etape');
    const progressSteps = document.querySelectorAll('.progress__step');

    const scrollObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.dataset.etape;

                // Update progress bar
                progressSteps.forEach(step => {
                    step.classList.toggle('progress__step--active', step.dataset.etape === id);
                });

                // Update mindmap highlight (if function exists)
                if (window.highlightMindmapNode) {
                    window.highlightMindmapNode(id);
                }
            }
        });
    }, { threshold: 0.3 });

    sectionEls.forEach(el => scrollObserver.observe(el));

    // --- Fade-in on scroll ---
    const fadeObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in--visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

    // --- FAB map button ---
    if (mindmapContainer) {
        const mapObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                fabMap.classList.toggle('fab-map--visible', !entry.isIntersecting);
            });
        }, { threshold: 0 });

        mapObserver.observe(mindmapContainer);

        fabMap.addEventListener('click', () => {
            mindmapContainer.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- Expose data for mindmap.js ---
    window.arbreData = arbreData;
    window.arbreEtapes = etapes;

})();
```

- [ ] **Step 2: Open in browser with local server and verify sections render**

Run: `cd /Users/flolbc/Documents/GitHub/arbre-intention-mindmap && python3 -m http.server 8080 &` then open `http://localhost:8080`
Expected: nav with toggle visible, hero content displayed, 8 sections rendered with bandeaus, comprendre text, case study blocks, and champs. Toggle switches mode (case study blocks hide/show). Progress bar visible on narrow viewport. FAB button appears when scrolling past mindmap area.

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: add main.js — section rendering, toggle, scroll sync, progress bar"
```

---

### Task 5: Build `mindmap.js` — D3.js navigation mindmap

**Files:**
- Create: `js/mindmap.js`

Adapted from v1. Renders a simplified mindmap (level-1 nodes only by default) inside `#mindmap-container`. Clicking a node smooth-scrolls to the corresponding section. Exposes `window.highlightMindmapNode(id)` for scroll sync from `main.js`. Only renders on desktop (>= 768px). Includes toolbar buttons (expand/collapse/recenter).

- [ ] **Step 1: Create `js/mindmap.js`**

```javascript
// ========================================
// Arbre d'Intention v2 — Mindmap (D3.js)
// ========================================

(function () {
    'use strict';

    const container = document.getElementById('mindmap-container');
    if (!container) return;

    // Skip on mobile
    function isMobile() {
        return window.innerWidth < 768;
    }

    if (isMobile()) return;

    // Wait for data from main.js
    function waitForData() {
        return new Promise(resolve => {
            function check() {
                if (window.arbreData) {
                    resolve(window.arbreData);
                } else {
                    setTimeout(check, 50);
                }
            }
            check();
        });
    }

    waitForData().then(data => {
        initMindmap(data);
    });

    function initMindmap(data) {
        // Build toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'mindmap-toolbar';
        toolbar.innerHTML = `
            <button id="mm-expand">Tout déplier</button>
            <button id="mm-collapse">Tout replier</button>
            <button id="mm-reset">Recentrer</button>
        `;
        toolbar.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-bottom:8px;';
        const btns = toolbar.querySelectorAll('button');
        btns.forEach(b => {
            b.style.cssText = 'font-family:inherit;font-size:12px;font-weight:500;padding:6px 14px;border:1px solid #D6D3D1;background:#FFF;color:#44403C;border-radius:8px;cursor:pointer;';
        });
        container.prepend(toolbar);

        const svg = d3.select(container).append('svg')
            .attr('xmlns', 'http://www.w3.org/2000/svg');

        const g = svg.append('g');

        const zoom = d3.zoom()
            .scaleExtent([0.3, 2.5])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        const dx = 52;
        const dy = 290;
        const tree = d3.tree().nodeSize([dx, dy]);

        // Build simplified data for mindmap (only root + level 1 names)
        const mindmapData = {
            name: data.name,
            color: data.color,
            isRoot: true,
            children: data.children.map(c => ({
                name: `${c.id} — ${c.name}`,
                color: c.color,
                id: c.id
            }))
        };

        const root = d3.hierarchy(mindmapData);
        root.x0 = 0;
        root.y0 = 0;

        root.descendants().forEach((d, i) => {
            d.nodeId = i;
            if (d.depth === 0) d.branchColor = '#1C1917';
            else d.branchColor = d.data.color || '#44403C';
        });

        let activeId = null;

        function update() {
            tree(root);

            // Links
            const links = root.links();
            const linkSel = g.selectAll('path.mindmap-link').data(links, d => d.target.nodeId);

            linkSel.enter().append('path')
                .attr('class', 'mindmap-link')
                .merge(linkSel)
                .attr('d', d => {
                    const sx = d.source.y + 90;
                    const sy = d.source.x;
                    const tx = d.target.y - 90;
                    const ty = d.target.x;
                    return `M${sx},${sy} C${(sx + tx) / 2},${sy} ${(sx + tx) / 2},${ty} ${tx},${ty}`;
                })
                .attr('stroke', d => d.target.branchColor)
                .attr('stroke-opacity', 0.5);

            linkSel.exit().remove();

            // Nodes
            const nodes = root.descendants();
            const nodeSel = g.selectAll('g.mindmap-node').data(nodes, d => d.nodeId);

            const nodeEnter = nodeSel.enter().append('g')
                .attr('class', d => 'mindmap-node' + (d.data.id === activeId ? ' mindmap-node--active' : ''));

            nodeEnter.append('rect')
                .attr('rx', 10)
                .attr('ry', 10)
                .attr('x', d => d.depth === 0 ? -90 : -100)
                .attr('y', d => d.depth === 0 ? -20 : -18)
                .attr('width', d => d.depth === 0 ? 180 : 200)
                .attr('height', d => d.depth === 0 ? 40 : 36)
                .attr('fill', d => d.depth === 0 ? '#1C1917' : d.branchColor)
                .attr('stroke', d => d.branchColor)
                .style('cursor', d => d.depth === 1 ? 'pointer' : 'default');

            nodeEnter.append('text')
                .attr('class', 'mindmap-label')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('font-size', d => d.depth === 0 ? '14px' : '12px')
                .attr('font-weight', '600')
                .attr('fill', '#FAFAF9')
                .text(d => d.data.name);

            // Click to scroll
            nodeEnter.filter(d => d.depth === 1).on('click', (event, d) => {
                const target = document.getElementById(`etape-${d.data.id}`);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });

            // Position
            const merged = nodeSel.merge(nodeEnter);
            merged.attr('transform', d => `translate(${d.y},${d.x})`);
            merged.attr('class', d => 'mindmap-node' + (d.data.id === activeId ? ' mindmap-node--active' : ''));

            nodeSel.exit().remove();
        }

        function fitToView() {
            const bounds = g.node().getBBox();
            const containerRect = container.getBoundingClientRect();
            const fw = containerRect.width;
            const fh = containerRect.height - 40; // toolbar offset

            if (bounds.width === 0 || bounds.height === 0) return;

            const scale = Math.min(0.95, Math.min(fw / bounds.width, fh / bounds.height) * 0.88);
            const tx = fw / 2 - scale * (bounds.x + bounds.width / 2);
            const ty = fh / 2 - scale * (bounds.y + bounds.height / 2) + 20;

            svg.transition().duration(600).call(
                zoom.transform,
                d3.zoomIdentity.translate(tx, ty).scale(scale)
            );
        }

        // Toolbar
        document.getElementById('mm-expand').addEventListener('click', () => {
            // For now, only level 1 — no children to expand
            fitToView();
        });
        document.getElementById('mm-collapse').addEventListener('click', () => {
            fitToView();
        });
        document.getElementById('mm-reset').addEventListener('click', () => {
            fitToView();
        });

        // Expose highlight function
        window.highlightMindmapNode = function (id) {
            activeId = id;
            g.selectAll('g.mindmap-node').attr('class', d =>
                'mindmap-node' + (d.data.id === id ? ' mindmap-node--active' : '')
            );
        };

        // Initial render
        update();
        requestAnimationFrame(() => fitToView());

        // Resize
        window.addEventListener('resize', () => {
            clearTimeout(window._mmFit);
            window._mmFit = setTimeout(fitToView, 150);
        });
    }

})();
```

- [ ] **Step 2: Verify mindmap renders and clicking scrolls to sections**

Run: refresh `http://localhost:8080` in desktop browser (>= 768px wide)
Expected: mindmap shows root + 8 colored branches. Clicking a branch scrolls to the corresponding section. On mobile viewport, mindmap is hidden and progress bar is visible.

- [ ] **Step 3: Commit**

```bash
git add js/mindmap.js
git commit -m "feat: add mindmap.js — D3.js navigation with scroll-to-section"
```

---

### Task 6: Create OG image placeholder and update portfolio

**Files:**
- Create: `assets/og-cover.png` (placeholder — will need real design later)
- Modify: `/Users/flolbc/Documents/GitHub/PORTFOLIO/data/projects.json`

- [ ] **Step 1: Create a simple OG image placeholder**

Generate a 1200x630 placeholder PNG using an HTML-to-canvas approach or simple SVG:

```bash
cd /Users/flolbc/Documents/GitHub/arbre-intention-mindmap
mkdir -p assets
# Create a simple SVG as placeholder, convert later
cat > assets/og-cover.svg << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FAFAF9"/>
  <rect x="0" y="0" width="1200" height="6" fill="#1C1917"/>
  <text x="600" y="260" text-anchor="middle" font-family="Inter, sans-serif" font-size="56" font-weight="700" fill="#1C1917">L'Arbre d'Intention</text>
  <text x="600" y="330" text-anchor="middle" font-family="Inter, sans-serif" font-size="24" fill="#57534E">Méthode de cadrage pour la délégation IA</text>
  <text x="600" y="380" text-anchor="middle" font-family="Inter, sans-serif" font-size="20" fill="#78716C">8 étapes · Cas d'étude concret · EU AI Act</text>
  <text x="600" y="560" text-anchor="middle" font-family="Inter, sans-serif" font-size="18" fill="#A8A29E">par Floryan Leblanc</text>
  <!-- Color dots for the 8 steps -->
  <circle cx="370" cy="440" r="12" fill="#64748B"/>
  <circle cx="410" cy="440" r="12" fill="#B91C1C"/>
  <circle cx="450" cy="440" r="12" fill="#EA580C"/>
  <circle cx="490" cy="440" r="12" fill="#047857"/>
  <circle cx="530" cy="440" r="12" fill="#7C3AED"/>
  <circle cx="570" cy="440" r="12" fill="#4338CA"/>
  <circle cx="610" cy="440" r="12" fill="#B45309"/>
  <circle cx="650" cy="440" r="12" fill="#1C1917"/>
</svg>
SVGEOF
```

Then convert SVG to PNG (requires `rsvg-convert` or use the SVG directly — GitHub Pages serves SVGs with correct MIME type, but LinkedIn requires PNG for OG images):

```bash
# If rsvg-convert is available:
rsvg-convert assets/og-cover.svg -w 1200 -h 630 -o assets/og-cover.png

# If not, we'll use the SVG for now and convert later
# The HTML already references og-cover.png, so we need the PNG eventually
```

- [ ] **Step 2: Add project to portfolio's projects.json**

Edit `/Users/flolbc/Documents/GitHub/PORTFOLIO/data/projects.json` — add as the first entry (most impressive project first):

```json
{
    "name": "L'Arbre d'Intention",
    "description": "Méthode de cadrage en 8 étapes pour structurer la délégation à une IA. Page interactive avec cas d'étude intégré, en lien avec l'Article 4 de l'EU AI Act.",
    "tags": ["JavaScript", "D3.js", "Gouvernance IA", "EU AI Act"],
    "url": "https://github.com/florycarm-a11y/arbre-intention-mindmap",
    "homepage": "https://florycarm-a11y.github.io/arbre-intention-mindmap/"
}
```

- [ ] **Step 3: Commit both repos**

```bash
# Arbre repo
cd /Users/flolbc/Documents/GitHub/arbre-intention-mindmap
git add assets/
git commit -m "feat: add OG image placeholder for LinkedIn previews"

# Portfolio repo
cd /Users/flolbc/Documents/GitHub/PORTFOLIO
git add data/projects.json
git commit -m "feat: add Arbre d'Intention to portfolio projects"
```

---

### Task 7: End-to-end verification and cleanup

**Files:**
- Modify: `README.md` (update for v2 structure)

- [ ] **Step 1: Test full page locally**

Run: `cd /Users/flolbc/Documents/GitHub/arbre-intention-mindmap && python3 -m http.server 8080`
Then open `http://localhost:8080` and verify:

Checklist:
1. Nav displays with toggle (Méthode / Cas d'étude)
2. Hero renders with title, subtitle, context, CTA buttons, EU AI Act aside
3. Mindmap renders on desktop with 8 colored nodes
4. Clicking a mindmap node scrolls to the correct section
5. All 8 sections render with bandeau, comprendre, case study, champs
6. Toggle hides/shows case study blocks with smooth transition
7. On mobile viewport: mindmap hidden, progress bar visible and sticky
8. Progress bar highlights active section on scroll
9. FAB "Carte" button appears when mindmap scrolls out of view (desktop)
10. Footer links point to correct URLs
11. No console errors

- [ ] **Step 2: Update README.md**

```markdown
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
```

- [ ] **Step 3: Commit and push**

```bash
cd /Users/flolbc/Documents/GitHub/arbre-intention-mindmap
git add README.md
git commit -m "docs: update README for v2 architecture"
git push origin master
```

- [ ] **Step 4: Push portfolio changes**

```bash
cd /Users/flolbc/Documents/GitHub/PORTFOLIO
git push origin main
```

- [ ] **Step 5: Verify live deployment**

Wait 1-2 minutes for GitHub Pages, then:
```bash
curl -sI "https://florycarm-a11y.github.io/arbre-intention-mindmap/" | head -5
```
Expected: HTTP 200

---

## Task Summary

| Task | Description | Key files |
|------|-------------|-----------|
| 1 | Create data JSON files (framework + case study) | `data/arbre.json`, `data/cas-etude.json` |
| 2 | HTML skeleton with OG meta | `index.html` |
| 3 | Complete CSS | `css/style.css` |
| 4 | Main JS (sections, toggle, scroll sync) | `js/main.js` |
| 5 | Mindmap JS (D3.js navigation) | `js/mindmap.js` |
| 6 | OG image + portfolio integration | `assets/og-cover.png`, portfolio `projects.json` |
| 7 | E2E verification, README, push | `README.md` |
