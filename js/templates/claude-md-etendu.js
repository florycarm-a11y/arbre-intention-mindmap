// ========================================
// Le Mandat — Template format B : CLAUDE.md étendu
// ========================================
//
// Cible : racine d'un projet, trace écrite de gouvernance Article 4
// Inclut : intro Le Mandat, métadonnées, contexte, champs optionnels,
// diagnostic de complétion en bas

(function (root) {
    'use strict';

    function isFilled(s) { return typeof s === 'string' && s.trim().length > 0; }
    const NIVEAU_FR = { strategique: 'Stratégique', tactique: 'Tactique', operationnel: 'Opérationnelle' };
    function fmt(d) {
        return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function render(mandat) {
        const lines = [];
        const projet = mandat.projet.nom || '(projet non nommé)';

        // Header
        lines.push(`# Mandat de délégation IA — ${projet}`);
        lines.push('');
        lines.push('> Document produit avec **Le Mandat** (Article 4 EU AI Act —');
        lines.push(`> littératie IA en pratique) le ${fmt(mandat.updatedAt || new Date())}.`);
        lines.push('>');
        lines.push('> Ce mandat encadre la délégation à un système d\'IA pour ce projet.');
        lines.push('> Toute personne reprenant ce projet doit le lire avant d\'interagir');
        lines.push('> avec l\'IA, et le mettre à jour si les intentions changent.');
        lines.push('');

        // Projet
        lines.push('## Projet');
        lines.push(projet + '.');
        if (isFilled(mandat.projet.contexte)) {
            lines.push('');
            lines.push('### Contexte');
            lines.push(mandat.projet.contexte);
        }
        lines.push('');

        // Trois niveaux
        lines.push('## Trois niveaux d\'intention');
        lines.push('');
        renderNiveau(lines, 'stratégique', mandat.strategique);
        renderNiveau(lines, 'tactique', mandat.tactique);
        renderNiveau(lines, 'opérationnel', mandat.operationnel);

        // Tensions
        const tensionsRemplies = Object.entries(mandat.tensions).filter(([, v]) => isFilled(v));
        if (tensionsRemplies.length > 0) {
            lines.push('## Tensions identifiées');
            const labels = { stratTact: 'Stratégique ↔ Tactique', tactOp: 'Tactique ↔ Opérationnel', stratOp: 'Stratégique ↔ Opérationnel' };
            tensionsRemplies.forEach(([key, v]) => {
                lines.push(`### ${labels[key]}`);
                lines.push(v);
                lines.push('');
            });
        }

        // Arbitrages
        const arbs = Object.entries(mandat.arbitrages).filter(([key, a]) => a.prime);
        if (arbs.length > 0) {
            lines.push('## Arbitrages');
            const labels = { stratTact: 'Stratégique ↔ Tactique', tactOp: 'Tactique ↔ Opérationnel', stratOp: 'Stratégique ↔ Opérationnel' };
            arbs.forEach(([key, a]) => {
                lines.push(`### ${labels[key]}`);
                lines.push(`**Prime :** ${NIVEAU_FR[a.prime] || a.prime}`);
                if (isFilled(a.sacrifice)) {
                    lines.push(`**Sacrifice :** ${a.sacrifice}`);
                }
                lines.push('');
            });
        }

        // Garde-fous
        const gf = mandat.gardeFous;
        if (isFilled(gf.interdictions) || isFilled(gf.seuils) || isFilled(gf.test3phrases)) {
            lines.push('## Garde-fous');
            lines.push('');
            if (isFilled(gf.interdictions)) {
                lines.push('### L\'IA ne doit JAMAIS');
                lines.push(gf.interdictions);
                lines.push('');
            }
            if (isFilled(gf.seuils)) {
                lines.push('### L\'IA s\'arrête et demande quand');
                lines.push(gf.seuils);
                lines.push('');
            }
            if (isFilled(gf.test3phrases)) {
                lines.push('### Test des 3 phrases');
                lines.push(gf.test3phrases);
                lines.push('');
            }
        }

        // Diagnostic
        lines.push('---');
        lines.push('');
        lines.push('## Diagnostic de complétion');
        lines.push('');
        lines.push('**Essentiel**');
        const ess = [
            { label: 'Projet nommé', ok: isFilled(mandat.projet.nom) },
            { label: 'Intention stratégique', ok: isFilled(mandat.strategique.intention) },
            { label: 'Intention tactique', ok: isFilled(mandat.tactique.intention) },
            { label: 'Intention opérationnelle', ok: isFilled(mandat.operationnel.intention) }
        ];
        ess.forEach(e => lines.push(`- [${e.ok ? 'x' : ' '}] ${e.label}`));
        lines.push('');
        lines.push('**Important**');
        const imp = [
            { label: 'Au moins une tension nommée', ok: Object.values(mandat.tensions).some(isFilled) },
            { label: 'Au moins une tension arbitrée', ok: Object.values(mandat.arbitrages).some(a => a.prime) },
            { label: 'Interdictions posées', ok: isFilled(gf.interdictions) },
            { label: 'Test des 3 phrases formulé', ok: isFilled(gf.test3phrases) }
        ];
        imp.forEach(e => lines.push(`- [${e.ok ? 'x' : ' '}] ${e.label}`));

        return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    }

    function renderNiveau(lines, label, niveau) {
        lines.push(`### Niveau ${label}`);
        if (isFilled(niveau.porteur)) lines.push(`**Porté par** — ${niveau.porteur}`);
        if (isFilled(niveau.intention)) lines.push(`**Finalité** — ${niveau.intention}`);
        if (isFilled(niveau.testInvalidation)) lines.push(`**Test d'invalidation** — ${niveau.testInvalidation}`);
        lines.push('');
    }

    root.LeMandatTemplateClaudeMdEtendu = { render };

})(window);
