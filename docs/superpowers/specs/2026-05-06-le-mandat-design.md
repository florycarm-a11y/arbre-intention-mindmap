# Le Mandat — Design Spec

**Date :** 2026-05-06
**Statut :** Validé (en attente revue utilisateur sur le spec écrit)
**Auteur :** Floryan Leblanc + Claude Code
**Remplace :** Arbre d'Intention v2 (specs 2026-04-16, 2026-04-17)

---

## 1. Objectif

Refondre le projet existant *Arbre d'Intention* pour le rendre **concrètement utilisable** : le visiteur arrive, agit, repart avec un livrable réutilisable. Le projet est repositionné comme **Le Mandat — instrument de littératie IA**, en réponse à l'**Article 4 du EU AI Act**.

Le livrable utilisateur change de nature : ce n'est plus une mindmap navigable + un PDF récapitulatif, c'est **un prompt système ou un CLAUDE.md** prêt à coller dans une session IA.

---

## 2. Audit de l'existant — pourquoi refondre

L'existant a une méthode solide mais une mauvaise rampe d'accès.

| # | Friction | Symptôme |
|---|---|---|
| 1 | Le nom *Arbre d'Intention* est métaphorique. Il décrit la forme, pas la valeur. | Compréhension > 30 secondes |
| 2 | 8 étapes à lire avant d'agir. | Conversion lecture → action très faible |
| 3 | L'output final est un PDF récapitulatif, pas un prompt collable. | Pont vers l'action en pointillés |
| 4 | La mindmap D3 est désactivée sur mobile (où sont la majorité des visiteurs LinkedIn). | Mobile = barre de progression sans la signature visuelle |
| 5 | Vocabulaire dense (« intention stratégique », « test d'invalidation »). | Accessibilité grand public limitée |
| 6 | Pas d'aperçu de la valeur avant l'effort. | Hero conceptuel, pas d'amorce d'action |
| 7 | Le nom *Arbre d'Intention* existe déjà comme concept antérieur dont l'auteur s'est inspiré. | Confusion possible |

**Diagnostic :** la valeur (un prompt cadré, prêt à utiliser) est cachée derrière 8 étapes et un vocabulaire d'expert. Pour rendre concret, il faut **inverser la chaîne** : livrer le résultat d'abord, expliquer la méthode après.

---

## 3. Positionnement — Le Mandat

### 3.1 Nom et slug

| | Avant | Après |
|---|---|---|
| Nom du produit | L'Arbre d'Intention | **Le Mandat** |
| Slug GitHub | `arbre-intention-mindmap` | `le-mandat` |
| URL Pages | `florycarm-a11y.github.io/arbre-intention-mindmap/` | `florycarm-a11y.github.io/le-mandat/` |
| Méthode signature | « méthode Arbre d'Intention » | **abandonnée** — Le Mandat est à la fois la méthode et l'outil |

### 3.2 Hero — composition

```
H1   Le Mandat

H2   Cadrez votre délégation en 8 étapes —
     pour passer de l'usage à la maîtrise de l'IA.

ctx  Vous pouvez déléguer une tâche entière à une IA.
     Mais sans cadrage, elle optimise ce que vous avez dit —
     pas ce que vous vouliez. Ce qui se joue avant la
     première instruction détermine 80 % du résultat.

CTA  [Créer mon mandat]   [Voir un exemple]
```

**L'aside Article 4 ne vit pas dans le hero** ; elle apparaît en bande basse avant le footer (cf. § 4.6).

### 3.3 EU AI Act — positionnement défendable

**Article 4 (Littératie IA)** du Règlement (UE) 2024/1689 — applicable depuis le 2 février 2025.

> *« Les fournisseurs et les déployeurs de systèmes d'IA prennent des mesures pour garantir, dans toute la mesure du possible, un niveau suffisant de littératie en matière d'IA chez leur personnel et autres personnes s'occupant du fonctionnement et de l'utilisation des systèmes d'IA pour leur compte… »*

**Considérant 20** précise l'esprit : *« compétences, connaissances et compréhension qui permettent un déploiement éclairé des systèmes d'IA »*.

**Le Mandat se positionne comme :** un **instrument concret de mise en œuvre** de l'Article 4 — pas un produit de conformité au sens strict (audit, certification), mais un composant pratique qui transforme la réflexion structurée en livrable utilisable et auditable.

Formulation publique :
> *L'Article 4 du EU AI Act, applicable depuis février 2025, impose à toute organisation utilisant l'IA de garantir la littératie de ses équipes. Le Mandat est un instrument pratique de cette exigence : il fait pratiquer la réflexion structurée avant chaque délégation.*

---

## 4. Forme cible — parcours utilisateur

### 4.1 Architecture URL

| Route | Rôle |
|---|---|
| `/` (`index.html`) | Parcours d'action : hero → wizard → récap visuel → livrable → bande Article 4 → footer |
| `/methode` (`methode.html`) | Méthode complète : 8 sections narratives + cas d'étude méta, dégraissées (~100 mots par section au lieu de ~200) |

### 4.2 Structure de `/`

1. **Hero** (cf. § 3.2)
2. **Wizard** — 8 étapes inline, une par viewport logique (cf. § 5)
3. **Aperçu visuel** — mindmap récap (cf. § 6)
4. **Livrable** — onglets prompt court / CLAUDE.md étendu (cf. § 7)
5. **Bande Article 4** — explicitation gouvernance/littératie IA (cf. § 4.6)
6. **Pour aller plus loin** — lien vers `/methode`
7. **Footer**

### 4.3 « Voir un exemple » — mini-modale

Au clic du CTA secondaire `[Voir un exemple]` du hero, ouverture d'une **mini-modale** avec deux choix :

- **Charger un exemple modifiable** → pré-remplit le wizard avec un cas, l'utilisateur peut tout modifier
- **Voir un mandat fini** → navigue directement à la zone livrable préchargée d'un cas, sans passer par le wizard

### 4.4 Cas d'exemple disponibles

| ID | Cas | Rôle |
|---|---|---|
| `meta` | Le Mandat construit avec sa propre démarche | Cas principal — conceptuellement fort, met en abyme la méthode |
| `rse-bdp` | Expert RSE de la Banque de Polynésie (filiale Société Générale) accompagnant un client en transition énergétique de la détection du risque ESG jusqu'au plan d'action RSE chiffré | Cas universel — registre banque/conseil/gouvernance |

Les contenus complets des deux cas sont rédigés en **annexe A** (objets `mandat` v2 prêts à sérialiser). Toute reformulation éditoriale passe par l'annexe d'abord, puis répercussion dans les fichiers JSON en P3.

### 4.5 Modification depuis l'aperçu visuel

Quand l'utilisateur clique un nœud de la mindmap récap, il revient à l'étape correspondante du wizard. Sur l'étape, **un bouton « Retour à l'aperçu »** apparaît pour permettre un retour direct sans retraverser tout le wizard.

### 4.6 Bande Article 4 — emplacement et contenu

Bande discrète juste avant le footer :

```
┌──────────────────────────────────────────────────────────┐
│ POURQUOI CET OUTIL EXISTE                                │
│                                                          │
│ L'Article 4 du EU AI Act, applicable depuis février      │
│ 2025, impose à toute organisation utilisant un système   │
│ d'IA de garantir la littératie de ses équipes.           │
│                                                          │
│ Le Mandat est un instrument pratique de cette exigence : │
│ il fait pratiquer la réflexion structurée avant chaque   │
│ délégation, et produit une trace écrite réutilisable.    │
│                                                          │
│              [En savoir plus sur la méthode →]           │
└──────────────────────────────────────────────────────────┘
```

---

## 5. UX du wizard

### 5.1 Principe

**Un champ obligatoire visible par étape.** Les autres champs (porteurs, tests d'invalidation) sont disponibles sous un dépliant `+ détails`. Aucune fonctionnalité n'est perdue, la friction est divisée.

### 5.2 Champs par étape

| Étape | Champ obligatoire | Champs optionnels (sous « + détails ») |
|---|---|---|
| 01 · Projet | Nom du projet | Contexte |
| 02 · Stratégique | Pourquoi ce projet existe ? | Porteur, test d'invalidation |
| 03 · Tactique | Comment on s'y prend ? | Porteur, test d'invalidation |
| 04 · Opérationnel | Que doit produire l'IA, concrètement ? | Porteur, test d'invalidation |
| 05 · Tensions | 3 paires de tensions, **toutes optionnelles** | — |
| 06 · Arbitrage | Pour chaque tension remplie : qui prime ? (radio) | Sacrifice |
| 07 · Garde-fous | Ce que l'IA ne doit JAMAIS faire | Quand s'arrêter, test des 3 phrases |
| 08 · Synthèse | (lecture seule, auto-générée) | — |

### 5.3 Vocabulaire — registre hybride

Chaque étape affiche en **sur-titre** le label méthodologique (ex. *« 02 · L'intention stratégique »*) et en **dessous** la question simple en langage utilisateur (ex. *« Pourquoi ce projet existe ? »*). Les deux registres coexistent : sérieux gouvernance + clarté grand public.

### 5.4 Maquette d'une étape (étape 02)

```
┌────────────────────────────────────────────────────────┐
│ ÉTAPE 2/8 ·  L'intention stratégique                   │
│ ────────────────────────────────────────────────────── │
│                                                        │
│ Pourquoi ce projet existe ?                            │
│ La finalité ultime — celle qui, si elle est ratée,     │
│ rend le reste inutile.                                 │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Ex. Réduire le temps de saisie des managers        │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ▸ + détails (porteur, test d'invalidation)             │
│ ▸ ↳ Pourquoi cette étape ?                             │
│                                                        │
│            [← Retour]              [Suivant →]         │
└────────────────────────────────────────────────────────┘
```

### 5.5 Comportements

- **Validation** : bouton `Suivant` désactivé tant que le champ obligatoire est vide. Signalisation visuelle par point de couleur, pas par astérisque.
- **Aucune validation de format** sur le contenu (longueur, ponctuation, etc.) — c'est la délégation de l'utilisateur, il écrit ce qu'il veut.
- **Sauvegarde auto** en localStorage à chaque frappe (debounce 500 ms). Bandeau de reprise au chargement si données présentes.
- **Mobile** : une étape par viewport, scroll auto vers le haut au passage à l'étape suivante. Boutons Retour/Suivant sticky en bas. Champ texte auto-redimensionné.
- **Aide contextuelle** : `↳ Pourquoi cette étape ?` déplié à la demande, avec une explication courte (~50 mots, pas le texte de 200 mots actuel — ce dernier reste sur `/methode`).

### 5.6 Cas particulier — étapes 5 et 6

**Étape 5 (Tensions)** : 3 champs textuels (Stratégique↔Tactique, Tactique↔Opérationnel, Stratégique↔Opérationnel). Toutes optionnelles. Si l'utilisateur passe les 3, un avertissement doux apparaît : *« La méthode marche mieux si vous nommez au moins une tension — êtes-vous sûr ? »*. Aucun blocage.

**Étape 6 (Arbitrage)** : ne s'affiche que pour les tensions effectivement remplies à l'étape 5. Pour chacune : 3 boutons radio (Stratégique / Tactique / Opérationnel) + un champ texte « Sacrifice consenti » optionnel.

### 5.7 Étape 8 — Synthèse

Pas de saisie. Affiche un récapitulatif structuré, le diagnostic visuel (essentiel ✓✓✓✓ + important ✓/✗), et deux CTA : `[Voir mon mandat]` (ancre vers la zone livrable) et `[Modifier]` (revient à n'importe quelle étape).

---

## 6. Aperçu visuel — mindmap récap

### 6.1 Repositionnement du rôle

| | Avant | Après |
|---|---|---|
| Rôle | Navigation entre sections | **Récapitulatif visuel** du mandat rempli |
| Quand | En haut de page (desktop), masquée mobile | Après l'étape 8, avant la zone livrable |
| Contenu des nœuds | Nom de l'étape | Nom + valeur du champ obligatoire (max 40 car., ellipse) |
| État visuel | Toutes branches actives | Branche grisée si étape non-remplie |
| Clic | Scroll vers section | Retour à l'étape pour modifier |

### 6.2 Spécifications

- **Forme** : structure radiale D3.js v7 conservée, **8 couleurs de signature conservées** (gris ardoise, rouge, orange, vert, violet, indigo, ambre, noir)
- **Centre** : `Le Mandat · [nom du projet rempli]`
- **Survol (desktop)** : tooltip avec tous les champs remplis de l'étape
- **Clic (desktop)** : scroll fluide vers l'étape du wizard, focus sur le 1ᵉʳ champ. Bouton « Retour à l'aperçu » apparaît à l'étape modifiée.
- **Pas de zoom/pan** — la mindmap est statique en taille
- **Mobile** : version D3 simplifiée (sans interactivité, juste couleurs et noms), suivie d'un accordéon textuel des 8 étapes avec bouton « Modifier » par étape

### 6.3 Disparitions

| Élément actuel | Raison de la suppression |
|---|---|
| Mindmap dans l'overview en haut de page | Repositionnée comme récap après l'étape 8 |
| FAB « Carte » flottant | La mindmap est dans le flux, plus une vue alternative |
| Barre de progression mobile (navigation) | Remplacée par l'indicateur de progression du wizard (1/8 … 8/8) |
| Toggle Framework / Cas d'étude du nav | Le cas d'étude vit sur `/methode` |

---

## 7. Livrable — cœur de la refonte

### 7.1 Principes

1. Utilisable directement (collable dans une session IA, sans retouche)
2. Lisible par un humain (Markdown, pas de balisage technique)
3. Auto-suffisant (un destinataire qui ne connaît pas Le Mandat comprend ce qu'il a sous les yeux)

### 7.2 Format A — Prompt système court (par défaut)

**Cible** : à coller en début de session ChatGPT / Claude / Cursor, ou comme `system` d'une API call.
**Longueur** : 15-25 lignes selon remplissage.
**Registre** : **vous** (formel, aligné cible banque/conseil/gouvernance).
**Sections vides omises automatiquement.**
**Pas de signature « Le Mandat »** dans le prompt — il doit être pur.

**Maquette (avec cas RSE-BDP)** :

```markdown
# Mandat de délégation

**Projet** — Accompagnement client BdP en transition énergétique
(détection risque ESG → plan d'action RSE → réduction CO₂)

## Vous travaillez pour
Un expert RSE de la Banque de Polynésie (filiale Société Générale).

## Trois finalités, dans cet ordre de priorité
1. **Stratégique** — Démontrer un accompagnement de bout en bout,
   chiffré et auditable, pour rassurer le client et la maison-mère.
2. **Tactique** — Produire des livrables intermédiaires utilisables
   en réunion client, sans préparation supplémentaire.
3. **Opérationnelle** — Vous appuyer sur les données SG/BdP existantes
   et les référentiels CSRD ; ne pas inventer de chiffres.

## Quand les finalités s'opposent
- Stratégique > Tactique : si un livrable parfait fait perdre
  l'auditabilité, simplifiez le livrable.
- Tactique > Opérationnelle : si une donnée manque, proposez
  une fourchette sourcée plutôt qu'une absence.

## Vous ne devez JAMAIS
- Inventer de chiffres, de références réglementaires, ou de cas client.
- Produire un plan d'action sans préciser les hypothèses sous-jacentes.

## Vous vous arrêtez et demandez quand
- Une donnée client semble incohérente avec son secteur.
- Un livrable touche à un sujet juridique (RGPD, droit polynésien).

## Test de validation
1. Le client comprend ses risques ESG en lisant le livrable seul.
2. Un auditeur peut tracer chaque chiffre jusqu'à sa source.
3. Le plan d'action tient en une page.
```

### 7.3 Format B — CLAUDE.md étendu

**Cible** : à déposer à la racine d'un projet (Claude Code, Cursor, doc partagée), ou utilisé comme **trace écrite de gouvernance** (preuve de réflexion préalable, exigence Article 4).
**Longueur** : 60-80 lignes, structuré et documenté.
**Mention Le Mandat / EU AI Act en intro** (positionnement gouvernance).

**Différences clés vs format A** :

| | Format A | Format B |
|---|---|---|
| Métadonnées | Aucune | Date, auteur, version, projet |
| Contexte | Implicite | Section dédiée |
| Champs optionnels | Omis | Inclus si remplis |
| Diagnostic complétion | Absent | En bas (essentiel ✓✓✓✓ + important ✓✗) |
| Mention Le Mandat / Article 4 | Non | Oui en intro |
| Section « Comment lire ce document » | Non | Oui (2-3 lignes) |

**Maquette (extrait début)** :

```markdown
# Mandat de délégation IA — Accompagnement client BdP / RSE

> Document produit avec **Le Mandat** (Article 4 EU AI Act —
> littératie IA en pratique) le 6 mai 2026.
>
> Ce mandat encadre la délégation à un système d'IA pour ce projet.
> Toute personne reprenant ce projet doit le lire avant d'interagir
> avec l'IA, et le mettre à jour si les intentions changent.

## Projet
Accompagnement client BdP en transition énergétique, de la détection
du risque ESG jusqu'au plan d'action RSE chiffré.

### Contexte
La Banque de Polynésie, filiale SG, lance un service d'accompagnement
RSE pour ses clients PME polynésiennes. Le contexte réglementaire
(CSRD, taxonomie verte) impose une approche traçable.

## Trois niveaux d'intention

### Niveau stratégique
**Porté par** — le directeur RSE BdP
**Finalité** — Démontrer un accompagnement de bout en bout, chiffré
et auditable, pour rassurer le client et la maison-mère SG.
**Test d'invalidation** — Un livrable techniquement parfait, mais
non auditable par la maison-mère SG, est un échec.

### Niveau tactique
…
```

### 7.4 UX zone livrable

```
┌────────────────────────────────────────────────────────┐
│  ÉTAPE 8 — VOTRE MANDAT EST PRÊT                       │
│  ────────────────────────────────────────────────────  │
│                                                        │
│  ┌──────────────────────┬──────────────────────────┐   │
│  │ Prompt système       │  CLAUDE.md complet       │   │
│  │ (court · 20 lignes)  │  (gouvernance · 60 lg.)  │   │
│  └──────● actif ────────┴──── inactif ─────────────┘   │
│                                                        │
│  [Aperçu live monospace, défilable]                    │
│                                                        │
│  Format A : [📋 Copier]   [⬇ .md]                      │
│  Format B : [📋 Copier]   [⬇ .md]   [⬇ .pdf]           │
│                                                        │
│  ↳ Comment l'utiliser ?                                │
└────────────────────────────────────────────────────────┘
```

**Comportements** :
- Onglets côte à côte sur desktop, en stack sur mobile
- Aperçu live se met à jour en temps réel si l'utilisateur revient en arrière
- Bouton `📋 Copier` : feedback visuel `Copié ✓` 2 s
- Téléchargement Markdown nommé : `mandat-[nom-projet-slugifie]-[YYYYMMDD].md`
- **PDF disponible uniquement pour le format B** (le prompt court n'a pas vocation à être un PDF)
- 100 % côté client — le mandat ne quitte jamais le navigateur

### 7.5 Templates — organisation du code

```
js/templates/
  ├── prompt-court.js      → render(mandat) → string Markdown
  └── claude-md-etendu.js  → render(mandat) → string Markdown
```

Chaque fonction prend l'objet `mandat` et retourne le texte. La logique « quels champs inclure, dans quel ordre, avec quelle ponctuation » est isolée. Évolutivité d'un template sans toucher au reste.

---

## 8. Architecture technique

### 8.1 Arborescence cible

```
le-mandat/
├── index.html                    /         — parcours d'action
├── methode.html                  /methode  — méthode complète
├── README.md                     ← réécrit
├── css/
│   ├── style.css                 ← refactor de l'existant (~1015 → ~700 lignes)
│   └── methode.css               ← styles spécifiques /methode
├── js/
│   ├── main.js                   ← entry point /
│   ├── wizard.js                 ← état + UI du wizard
│   ├── mindmap.js                ← D3 récap (refactor)
│   ├── livrable.js               ← onglets + génération + export
│   ├── storage.js                ← localStorage encapsulé
│   ├── methode.js                ← entry point /methode
│   └── templates/
│       ├── prompt-court.js
│       └── claude-md-etendu.js
├── data/
│   ├── schema.json               ← ex. arbre.json, structure des étapes
│   ├── exemple-meta.json         ← cas Le Mandat (refondu depuis cas-etude.json)
│   └── exemple-rse-bdp.json      ← cas Banque de Polynésie (à rédiger)
├── docs/
│   └── superpowers/specs/
└── assets/
    ├── og-cover.svg              ← refait
    └── og-cover.png              ← regénéré manuellement depuis le SVG
```

### 8.2 Modules et responsabilités

| Module | Responsabilité unique | Dépend de |
|---|---|---|
| `storage.js` | Lire/écrire l'objet `mandat` en localStorage, gérer expiration 30 j | — |
| `wizard.js` | Afficher l'étape courante, transitions, validation des champs obligatoires | `storage.js`, `schema.json` |
| `mindmap.js` | Rendre l'arbre récap (D3 desktop, D3 simplifié mobile) à partir de `mandat` | D3.js, `storage.js` |
| `livrable.js` | Générer prompt court + CLAUDE.md depuis `mandat`, onglets, copier, exports MD/PDF | jsPDF (PDF B uniquement), `storage.js` |
| `main.js` | Orchestrer wizard ↔ mindmap ↔ livrable, charger schema, charger exemples à la demande | tous les ci-dessus |
| `methode.js` | Rendre les 8 sections narratives + cas méta sur `/methode` | `schema.json`, `exemple-meta.json` |

### 8.3 Objet `mandat` — état partagé

Source de vérité unique, en mémoire et en localStorage :

```js
{
  version: 2,
  updatedAt: "2026-05-06T...",
  projet: { nom: "...", contexte: "..." },
  strategique:  { porteur: "...", intention: "...", testInvalidation: "..." },
  tactique:     { porteur: "...", intention: "...", testInvalidation: "..." },
  operationnel: { porteur: "...", intention: "...", testInvalidation: "..." },
  tensions: {
    "strat-tact": "",
    "tact-op":    "",
    "strat-op":   ""
  },
  arbitrages: {
    "strat-tact": { prime: "tactique", sacrifice: "..." },
    "tact-op":    { prime: "...",      sacrifice: "..." },
    "strat-op":   { prime: "...",      sacrifice: "..." }
  },
  gardeFous: {
    interdictions: "...",
    seuils: "...",
    test3phrases: "..."
  }
}
```

**Séparation** : la structure de l'arbre (labels, ordre, descriptions des étapes) vit dans `schema.json`. Les données utilisateur vivent dans l'objet `mandat`. Pas de structure nestée à la `arbre.json` actuel.

### 8.4 Dépendances — aucune nouvelle

- D3.js v7 via CDN (mindmap récap)
- jsPDF v2.5 via CDN (export PDF format B uniquement)
- Inter via Google Fonts CDN

Pas de Node, pas de bundler, pas de build. GitHub Pages compatible direct.

### 8.5 Garde-fous techniques

1. Aucune dépendance build — vanilla JS reste la règle
2. Pas de framework CSS — variables CSS et classes BEM
3. Mobile-first dès la première ligne de chaque module
4. Pas de tracking — aucun analytics tiers
5. Le mandat ne quitte jamais le navigateur — argument de confiance + cohérence Article 4
6. Accessibilité — labels obligatoires, focus visibles, navigation clavier complète

---

## 9. Migration / branding / SEO / OG / README

### 9.1 Ordre de bascule

1. Refaire l'OG cover (SVG → PNG manuel) **avant** rename
2. Mettre à jour le code (titres, meta, README) sur la branche, commit + push
3. Renommer le repo GitHub `arbre-intention-mindmap` → `le-mandat` (Settings → Rename)
4. Mettre à jour le remote local (`git remote set-url origin …`)
5. Vérifier la nouvelle URL et les meta OG via View Source
6. Forcer le refresh OG via LinkedIn Post Inspector
7. À charge utilisateur : mettre à jour portfolio, CV, posts LinkedIn épinglés

### 9.2 OG cover — nouveau contenu

Composition cible (1200 × 630) :

```
▬▬▬▬▬▬▬▬▬▬▬▬ filet noir ▬▬▬▬▬▬▬▬▬▬▬▬▬

           Le Mandat                           [titre 72pt]

   Cadrez votre délégation en 8 étapes,
   pour passer de l'usage à la maîtrise         [sous-titre 28pt]
   de l'IA.

           ● ● ● ● ● ● ● ●                      [8 cercles colorés]

    EU AI Act · Article 4 · Littératie IA       [tagline 20pt]

                            par Floryan Leblanc [signature 18pt]
```

Le SVG est la **source de vérité** ; le PNG est un export figé. Le README documente la procédure de regénération du PNG (manuel via éditeur ou outil externe). Pas de script Node.

### 9.3 Favicon

📋 (clipboard) — symbolise le mandat (document écrit, autorité).

```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📋</text></svg>">
```

### 9.4 `index.html` — meta cibles

```html
<title>Le Mandat — Cadrer la délégation à une IA en 8 étapes</title>
<meta name="description" content="Le Mandat est un instrument de littératie IA. Cadrez votre délégation à un système d'IA en 8 étapes structurées et obtenez un prompt système ou un CLAUDE.md prêt à utiliser. Open source, dans l'esprit de l'Article 4 du EU AI Act.">
<link rel="canonical" href="https://florycarm-a11y.github.io/le-mandat/">
```

Idem `og:*` et `twitter:*` (titre, description, URL, image).

### 9.5 JSON-LD — passage de `WebPage` à `WebApplication`

```json
{
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Le Mandat",
    "alternateName": "Le Mandat — Cadrage de la délégation IA",
    "description": "Instrument de littératie IA pour cadrer la délégation à un système d'IA en 8 étapes. Produit un prompt système ou un CLAUDE.md à coller. Aligné avec l'Article 4 du EU AI Act.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "browserRequirements": "JavaScript",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
    "author": {
        "@type": "Person",
        "name": "Floryan Leblanc",
        "url": "https://florycarm-a11y.github.io/PORTFOLIO/"
    }
}
```

### 9.6 README cible

```markdown
# Le Mandat

**Cadrez votre délégation en 8 étapes — pour passer de l'usage à la maîtrise de l'IA.**

Le Mandat est un instrument de littératie IA, en réponse à l'Article 4
du EU AI Act. Il fait pratiquer la réflexion structurée avant chaque
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

L'Article 4 du EU AI Act, applicable depuis février 2025, impose
à toute organisation utilisant un système d'IA de garantir la
littératie de ses équipes. Le Mandat est un instrument concret
de cette exigence : il ne remplace pas un programme de formation,
il en est un composant pratique qui transforme la réflexion
structurée en livrable réutilisable.

## Méthode

La méthode complète vit sur `/methode`.

## Stack

HTML + CSS + JS vanilla, D3.js v7 (mindmap récap), jsPDF (export PDF).
Pas de build, pas de bundler, pas de tracking. Le mandat ne quitte
jamais votre navigateur.

## Régénération de l'OG cover

La source est `assets/og-cover.svg`. Pour produire le PNG :
ouvrir le SVG dans un éditeur vectoriel et exporter en PNG 1200 × 630
vers `assets/og-cover.png`.

---

Auteur : [Floryan Leblanc](https://florycarm-a11y.github.io/PORTFOLIO/)
```

### 9.7 Limites de la migration

- GitHub redirige automatiquement le repo URL `github.com/.../arbre-intention-mindmap` vers `.../le-mandat`, mais **GitHub Pages ne fournit pas de redirection sur le sous-domaine `*.github.io`**. L'ancien URL `florycarm-a11y.github.io/arbre-intention-mindmap/` renverra 404 après la bascule.
- Cache OG LinkedIn : TTL 7-30 jours, à forcer manuellement via Post Inspector si nécessaire.
- Indexation Google : 2-4 semaines de chevauchement avant que la nouvelle canonical soit prise en compte.

---

## 10. Plan en 5 phases livrables

Chaque phase est démontrable, déployable, et ne casse pas l'app.

| # | Phase | Contenu | Démontrable |
|---|---|---|---|
| **P1** | Rebrand + scaffolding | Repo renommé `le-mandat`, nouveaux titres / meta / OG cover / favicon, scaffold `index.html` minimal + `methode.html` qui héberge l'ancien contenu | Site fonctionne avec nouveau nom, ancienne UX préservée sur `/methode` |
| **P2** | Schéma + storage + wizard | `schema.json` + `storage.js` + `wizard.js` + UI du wizard 8 étapes | Wizard navigable, données persistées, pas encore de récap ni livrable |
| **P3** | Mindmap récap + cas exemples | Refactor `mindmap.js` en mode récap + 2 cas exemples (méta + RSE) + mini-modale « Voir un exemple » | Wizard → récap visuel, exemples préchargeables |
| **P4** | Livrable | `livrable.js` + 2 templates + onglets + copier + exports MD/PDF | Parcours complet de bout en bout |
| **P5** | Page `/methode` propre + bande Article 4 + polish | Reformatage `/methode` avec textes dégraissés (~100 mots/section), bande Article 4 sur `/`, revue accessibilité, perfs | Livrable fini, prêt pour partage public |

**Note sur P3 vs P4** : la mindmap récap est livrée *avant* le livrable. Conséquence : entre P3 et P4, l'app montre un récap visuel sans permettre l'export. C'est une étape démontrable, et cohérente avec la priorité visuelle (effet « wow » de la mindmap remplie).

---

## 11. Out of scope (explicite)

Pour rester focalisé, **ne sont pas dans cette refonte** :

- Authentification, comptes utilisateurs, partage en ligne entre utilisateurs
- Stockage serveur, base de données, API back-end
- Versioning des mandats (historique des modifications)
- Collaboration multi-utilisateurs (édition partagée)
- Internationalisation (i18n) — le projet reste en français
- Mode sombre / dark mode
- Analytics ou télémétrie
- Génération automatique du PNG OG via script (ce sera manuel)
- Déploiement ailleurs que sur GitHub Pages

Ces sujets pourront être traités dans des refontes ultérieures, projet par projet.

---

## 12. Risques et mitigations

| Risque | Mitigation |
|---|---|
| Le wizard simplifié perd des utilisateurs experts qui voulaient les champs détaillés | Les champs optionnels restent disponibles via `+ détails`, aucune fonctionnalité n'est perdue |
| La page `/` devient trop centrée sur l'outil et perd la dimension pédagogique | La bande Article 4 et la section « Pour aller plus loin » assument la pédagogie en aval |
| L'ancien URL `arbre-intention-mindmap.github.io` renvoie 404 | Documenter clairement, mettre à jour activement les liens publics ; le cas échéant, accepter la perte des liens partagés non maîtrisés |
| Les 2 cas exemples (méta + RSE) ne sont pas équivalents en qualité | Les deux cas sont rédigés intégralement en annexe A du design doc (objets `mandat` v2 prêts à sérialiser), permettant une validation conjointe avant implémentation |
| Maintenance du PNG OG (régénération manuelle après modif du SVG) oubliée | Documenter la procédure dans le README + rappel dans le commit message si modif du SVG |

---

## 13. Annexe A — Contenu complet des deux cas d'exemple

Les deux cas sont rédigés ici intégralement, au format de l'objet `mandat` v2 défini en § 8.3. Ils serviront de source à `data/exemple-meta.json` et `data/exemple-rse-bdp.json` lors de la phase P3.

### A.1 Cas méta — Le Mandat construit avec sa propre démarche

```json
{
  "id": "meta",
  "label": "Le Mandat construit avec sa propre démarche",
  "version": 2,
  "mandat": {
    "projet": {
      "nom": "Le Mandat — outil de cadrage de la délégation IA",
      "contexte": "Refonte d'un projet existant (Arbre d'Intention) pour le rendre concrètement utilisable. Le projet s'inscrit dans la recherche d'un stage ou d'une alternance sur la gouvernance IA, en réponse à l'Article 4 du EU AI Act applicable depuis février 2025."
    },
    "strategique": {
      "porteur": "Floryan Leblanc, dans son rôle de candidat positionné sur la gouvernance IA",
      "intention": "Démontrer une pensée structurée sur la gouvernance de la délégation à un système d'IA, matérialisée dans un outil concret et utilisable de bout en bout, aligné avec l'esprit de l'Article 4 du EU AI Act.",
      "testInvalidation": "L'outil est techniquement parfait, mais un recruteur ou un décideur qui l'ouvre ne comprend pas en moins d'une minute de quoi il s'agit, ni pourquoi c'est pertinent au regard de l'Article 4."
    },
    "tactique": {
      "porteur": "Floryan Leblanc, dans son rôle de concepteur et développeur",
      "intention": "Produire une page web qui se lit naturellement (scroll), fonctionne aussi bien sur mobile que desktop, et qui mène le visiteur à un livrable utilisable sans avoir à lire la méthode complète au préalable.",
      "testInvalidation": "La page est belle et la méthode est documentée, mais le visiteur n'arrive pas à produire un mandat utilisable parce que le parcours est confus ou la mindmap remplace l'action."
    },
    "operationnel": {
      "porteur": "Claude Code — l'IA qui exécute le développement",
      "intention": "Construire l'outil en JavaScript vanilla, sans build ni framework, en réutilisant D3.js et jsPDF déjà en place, et en garantissant que les données de l'utilisateur ne quittent jamais son navigateur.",
      "testInvalidation": "Le code est propre et bien architecturé, mais la page nécessite un build, ne charge pas correctement sur GitHub Pages, ou envoie des données utilisateur à un serveur tiers."
    },
    "tensions": {
      "strat-tact": "Le stratégique veut un positionnement gouvernance fort (institutionnel, sérieux, EU AI Act explicite) ; le tactique veut un parcours rapide et concret qui n'effraie pas un visiteur grand public.",
      "tact-op": "Le tactique veut un aperçu live riche et un effet « wow » à la fin du parcours ; l'opérationnel constate que la richesse visuelle augmente la complexité du code vanilla et le coût de maintenance.",
      "strat-op": "Le stratégique veut un rendu visuel professionnel proche d'une page institutionnelle ; l'opérationnel travaille sans designer, sans framework CSS, en vanilla."
    },
    "arbitrages": {
      "strat-tact": {
        "prime": "tactique",
        "sacrifice": "On accepte que la dimension gouvernance ne soit pas dans le hero. Elle vit dans une bande basse avant le footer. Le hero est 100 % orienté usage."
      },
      "tact-op": {
        "prime": "operationnel",
        "sacrifice": "Pas de live preview type SaaS moderne. L'aperçu est du Markdown brut formaté avec un soin minimaliste. Pas de framework de composants, pas d'animations complexes."
      },
      "strat-op": {
        "prime": "strategique",
        "sacrifice": "On accepte une palette minimaliste et une typographie unique (Inter). Le sérieux passe par la justesse du contenu, pas par le polish visuel."
      }
    },
    "gardeFous": {
      "interdictions": "Ne jamais introduire de jargon technique (D3.js, LLM, API) dans le hero ou les accroches. Ne jamais ajouter de tracking, d'analytics tiers, ou de stockage serveur. Ne jamais générer le PNG OG via un script Node — la procédure reste manuelle et documentée.",
      "seuils": "S'arrêter et demander quand un changement structurel touche plus de trois fichiers simultanément. S'arrêter et demander quand le ton institutionnel ou la formulation EU AI Act est en jeu. S'arrêter quand une dépendance externe (CDN ou autre) doit être ajoutée.",
      "test3phrases": "1) Le visiteur comprend en moins d'une minute ce qu'est Le Mandat et pourquoi il existe au regard de l'Article 4. 2) Il peut produire un mandat utilisable sans avoir lu la méthode complète. 3) La page fonctionne aussi bien sur mobile que sur desktop, sans dégradation."
    }
  }
}
```

### A.2 Cas RSE — Banque de Polynésie / Société Générale

```json
{
  "id": "rse-bdp",
  "label": "Expert RSE BdP accompagnant un client en transition énergétique",
  "version": 2,
  "mandat": {
    "projet": {
      "nom": "Accompagnement client BdP en transition énergétique",
      "contexte": "La Banque de Polynésie, filiale Société Générale, lance un service d'accompagnement RSE pour ses clients PME polynésiennes. Le contexte réglementaire (CSRD, taxonomie verte européenne, exigences groupe SG) impose une approche traçable et auditable. L'expert RSE accompagne le client de la détection du risque ESG jusqu'au plan d'action chiffré pour réduire les émissions de CO₂."
    },
    "strategique": {
      "porteur": "Le directeur RSE de la Banque de Polynésie, validateur de la démarche au nom de la maison-mère SG",
      "intention": "Démontrer un accompagnement de bout en bout, chiffré et auditable, qui rassure simultanément le client polynésien (sur le sérieux du conseil) et la maison-mère SG (sur le respect des standards groupe et des exigences CSRD).",
      "testInvalidation": "L'accompagnement est techniquement complet et le client est satisfait, mais un audit groupe SG ne peut pas tracer l'origine des chiffres ou la cohérence avec les référentiels CSRD."
    },
    "tactique": {
      "porteur": "L'expert RSE BdP qui pilote l'accompagnement au quotidien et anime les réunions client",
      "intention": "Produire à chaque étape des livrables intermédiaires (cartographie des risques ESG, plan d'action, tableau de bord CO₂) directement utilisables en réunion client, sans préparation supplémentaire de plus de quinze minutes.",
      "testInvalidation": "Le livrable est rigoureux et auditable, mais demande une heure de retraitement avant chaque réunion client pour être présentable."
    },
    "operationnel": {
      "porteur": "Le système d'IA assistant l'expert RSE dans la production des livrables intermédiaires",
      "intention": "S'appuyer exclusivement sur les données SG/BdP existantes et les référentiels CSRD officiels. Ne jamais inventer de chiffres, de cas client ou de références réglementaires. Quand une donnée locale manque, l'expliciter dans le livrable plutôt que la combler par estimation.",
      "testInvalidation": "Un livrable contient un chiffre, une référence ou un cas client qui ne peut être tracé jusqu'à sa source primaire."
    },
    "tensions": {
      "strat-tact": "Le stratégique veut un livrable exhaustif et auditable jusqu'à la note de bas de page ; le tactique veut un livrable directement présentable en réunion (concis, lisible, non technique).",
      "tact-op": "Le tactique veut couvrir beaucoup de terrain en réunion (livrables denses) ; l'opérationnel ne s'appuie que sur des données vérifiables, ce qui limite parfois la densité.",
      "strat-op": "Le stratégique veut s'aligner sur le standard groupe SG ; l'opérationnel constate que les données BdP locales sont parfois absentes des référentiels groupe."
    },
    "arbitrages": {
      "strat-tact": {
        "prime": "strategique",
        "sacrifice": "Quand un livrable parfait visuellement ne tient pas l'auditabilité, on simplifie le livrable. Lisibilité réunion ≤ exigence d'audit."
      },
      "tact-op": {
        "prime": "tactique",
        "sacrifice": "Quand une donnée manque, on propose une fourchette sourcée plutôt qu'une absence. La densité tactique l'emporte sur le purisme opérationnel, à condition que les hypothèses soient nommées."
      },
      "strat-op": {
        "prime": "strategique",
        "sacrifice": "Quand une donnée locale BdP n'est pas dans les référentiels groupe SG, on l'explicite comme exception documentée dans le livrable, plutôt que de l'aligner artificiellement sur une donnée groupe."
      }
    },
    "gardeFous": {
      "interdictions": "Ne jamais inventer de chiffres, de références réglementaires (CSRD, taxonomie verte, droit polynésien), ou de cas client. Ne jamais produire un plan d'action sans préciser explicitement les hypothèses sous-jacentes et leur source.",
      "seuils": "S'arrêter et demander quand une donnée client semble incohérente avec son secteur d'activité. S'arrêter et demander quand un livrable touche à un sujet juridique (RGPD, droit du travail polynésien, fiscalité ESG). S'arrêter quand une référence réglementaire n'est pas trouvable dans les sources officielles.",
      "test3phrases": "1) Le client comprend ses risques ESG et la logique du plan d'action en lisant le livrable seul, sans présentation orale. 2) Un auditeur SG peut tracer chaque chiffre du livrable jusqu'à sa source primaire. 3) Le plan d'action tient en une page A4."
    }
  }
}
```

### A.3 Note pour P3

Ces objets sont la **source de vérité éditoriale** des deux cas. La phase P3 :
1. Les sérialise dans `data/exemple-meta.json` et `data/exemple-rse-bdp.json`
2. Les charge à la demande quand l'utilisateur clique sur la mini-modale « Voir un exemple »
3. Les utilise pour démontrer les deux formats de livrable (prompt court A et CLAUDE.md étendu B)

Toute reformulation éditoriale future passe par une mise à jour de cette annexe d'abord, puis répercussion dans les fichiers JSON.

---

## 14. Suite

Une fois ce design doc validé par l'utilisateur, transition vers la skill `superpowers:writing-plans` pour produire le **plan d'implémentation** détaillé (tâches granulaires, dépendances, vérifications) couvrant les phases P1 à P5.
