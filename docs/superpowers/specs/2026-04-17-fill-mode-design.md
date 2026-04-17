# Mode "À vous" — Design Spec

**Date :** 2026-04-17
**Statut :** Validé
**Auteur :** Floryan Leblanc + Claude Code
**Dépend de :** Arbre d'Intention v2 (spec 2026-04-16)

---

## 1. Objectif

Ajouter un mode interactif "À vous" permettant aux visiteurs de remplir leur propre Arbre d'Intention directement dans la page, avec sauvegarde locale (localStorage) et export en Markdown et PDF.

---

## 2. Activation du mode

### 2.1 CTA dans le hero

3e bouton ajouté à côté des deux existants :

```
[Découvrir la méthode]  [Voir le cas d'étude]  [Remplir mon arbre]
```

Style distinct (bordure pointillée ou couleur accent). Au clic : ajoute `body.mode-fill`, scrolle vers l'étape 01, bascule le toggle sur "Cas d'étude" pour que l'exemple soit visible pendant la saisie.

### 2.2 Bouton dans la nav

Bouton permanent à gauche du toggle :

```
[L'Arbre d'Intention]    [✏ Mon arbre]  [Méthode | Cas d'étude]
```

Même comportement au clic. Change d'état visuel quand le mode est actif. Un 2e clic désactive le mode.

### 2.3 Restauration (localStorage)

Si des données existent en localStorage au chargement, un bandeau apparaît sous le hero :

```
Vous avez un arbre en cours.  [Reprendre]  [Recommencer]
```

- "Reprendre" : active le mode, recharge les réponses dans les champs
- "Recommencer" : vide le localStorage, active le mode vierge
- Le bandeau disparaît après le choix

---

## 3. Champs de saisie

### 3.1 Emplacement

Quand `body.mode-fill` est actif, un bloc "VOTRE ARBRE" apparaît dans chaque section d'étape, après le bloc "Champs" existant.

### 3.2 Structure du bloc

```
┌── VOTRE ARBRE ─────────────────────┐
│                                     │
│  Nom du projet *                    │
│  [textarea auto-expansible]         │
│                                     │
│  Contexte                           │
│  [textarea auto-expansible]         │
│                                     │
│  ✓ Sauvegardé                       │
└─────────────────────────────────────┘
```

### 3.3 Détails

- Fond blanc, bordure fine, titre "VOTRE ARBRE" en petites capitales
- Bordure gauche = couleur de la branche (distincte du cas d'étude)
- Champs obligatoires marqués d'un astérisque `*`
- Textarea auto-expansibles (grandissent avec le contenu)
- Sauvegarde automatique localStorage debounced 500ms
- Indicateur "✓ Sauvegardé" apparaît brièvement après chaque sauvegarde
- Les étapes 05 (Tensions) et 06 (Arbitrage) : sous-groupes imbriqués avec leurs propres textarea

### 3.4 Masquage

Quand le mode est désactivé, les blocs "VOTRE ARBRE" disparaissent avec transition douce (même mécanique CSS que le cas d'étude en mode Framework : opacity + max-height).

---

## 4. Export

### 4.1 Bouton d'export

Bouton flottant en bas à droite, visible uniquement en mode "À vous" :

```
[📄 Exporter mon arbre]
```

Se positionne au-dessus du bouton "Carte" existant (qui se décale).

### 4.2 Overlay d'export

Au clic, ouvre un modal avec :

1. **Aperçu** : les réponses structurées par étape (lecture seule)
2. **Diagnostic** : calcul automatique des champs essentiels/importants remplis (logique étape 08)
3. **Deux boutons** : "Télécharger en Markdown" / "Télécharger en PDF"
4. **Bouton fermer**

### 4.3 Export Markdown

Fichier `.md` structuré, prêt à coller dans un CLAUDE.md :

```markdown
# L'Arbre d'Intention — [Nom du projet]

## 01 — Le projet
- **Nom du projet :** ...
- **Contexte :** ...

## 02 — L'intention stratégique
- **Porteur :** ...
- **Intention :** ...
- **Test d'invalidation :** ...

[... étapes 03-07 ...]

## Diagnostic
### Essentiel
- [x] Projet nommé
- [x] Intention stratégique
- [ ] Intention tactique
- [x] Intention opérationnelle

### Important
- [x] Au moins une tension identifiée
- [ ] Tensions arbitrées
- [ ] Interdictions posées
- [ ] Critères de validation
```

Téléchargement déclenché via `Blob` + `URL.createObjectURL`.

### 4.4 Export PDF

Généré via jsPDF (CDN). Document brandé :

- **En-tête** : "L'Arbre d'Intention" + nom du projet + date de génération
- **Sections** : bandeau couleur de branche pour chaque étape, réponses de l'utilisateur
- **Dernière page** : diagnostic avec checks visuels (✓/✗)
- **Pied de page** : "Généré avec L'Arbre d'Intention — florycarm-a11y.github.io/arbre-intention-mindmap/"

---

## 5. Architecture technique

### 5.1 Nouveau fichier

```
js/fill-mode.js    — mode "À vous" : injection champs, localStorage, export
```

### 5.2 Fichiers modifiés

```
index.html         — CTA hero, bouton nav, scripts jsPDF + fill-mode.js
css/style.css      — styles bloc "Votre arbre", overlay, bandeau, bouton nav
js/main.js         — aucun changement fonctionnel (window.arbreData déjà exposé)
```

### 5.3 Dépendance ajoutée

```html
<script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
```

### 5.4 Structure de fill-mode.js

```
init()              — vérifie localStorage, affiche bandeau si données existantes
activate()          — injecte blocs de saisie, ajoute body.mode-fill
deactivate()        — retire blocs, retire body.mode-fill
injectFields(etape) — génère textarea pour une étape (gère sous-groupes)
save()              — debounced 500ms, sérialise réponses → localStorage
load()              — désérialise localStorage → remplit textarea
clear()             — vide localStorage + réinitialise champs
getDiagnostic()     — calcule diagnostic essentiel/important
openExportModal()   — affiche overlay avec aperçu + diagnostic
exportMarkdown()    — génère .md, déclenche téléchargement
exportPDF()         — génère PDF brandé via jsPDF, déclenche téléchargement
```

### 5.5 Données

**Clé localStorage :** `arbre-intention-user-data`

**Format :**
```json
{
  "timestamp": "2026-04-17T10:30:00Z",
  "etapes": {
    "01": {
      "Nom du projet": "Mon projet",
      "Contexte": "..."
    },
    "02": {
      "Porteur": "...",
      "Intention": "...",
      "Test d'invalidation": "..."
    }
  }
}
```

Les noms de champs correspondent exactement à ceux de `arbre.json`. `fill-mode.js` lit `window.arbreData` pour connaître la structure. Aucune modification de `arbre.json` ni `cas-etude.json`.

---

## 6. Hors scope

- Partage d'arbre via URL
- Sauvegarde serveur (Supabase, etc.)
- Plusieurs arbres simultanés
- Mode collaboratif
