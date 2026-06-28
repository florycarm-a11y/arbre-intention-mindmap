// ========================================
// Le Mandat — Template format A : prompt système court
// ========================================
//
// Cible : à coller en début de session ChatGPT/Claude/Cursor
// Registre : "vous" (formel)
// Sections vides omises automatiquement
// Pas de signature Le Mandat dans le prompt — il doit être pur

(function (root) {
    'use strict';

    function isFilled(s) { return typeof s === 'string' && s.trim().length > 0; }

    const NIVEAU_FR = { strategique: 'Stratégique', tactique: 'Tactique', operationnel: 'Opérationnelle' };
    const TENSION_PAIR = {
        stratTact: ['strategique', 'tactique'],
        tactOp: ['tactique', 'operationnel'],
        stratOp: ['strategique', 'operationnel']
    };

    function render(mandat) {
        const lines = [];
        lines.push('# Mandat de délégation');
        lines.push('');

        // Projet
        const projet = mandat.projet.nom || '(projet non nommé)';
        lines.push('**Projet** — ' + projet);
        if (isFilled(mandat.projet.contexte)) {
            lines.push(mandat.projet.contexte);
        }
        lines.push('');

        // Vous travaillez pour (porteurs)
        const porteurs = [];
        if (isFilled(mandat.strategique.porteur)) porteurs.push(mandat.strategique.porteur);
        if (porteurs.length > 0) {
            lines.push('## Vous travaillez pour');
            lines.push(porteurs[0] + '.');
            lines.push('');
        }

        // Trois finalités
        const intentions = [
            { label: 'Stratégique', value: mandat.strategique.intention },
            { label: 'Tactique', value: mandat.tactique.intention },
            { label: 'Opérationnelle', value: mandat.operationnel.intention }
        ].filter(i => isFilled(i.value));

        if (intentions.length > 0) {
            lines.push('## Trois finalités, dans cet ordre de priorité');
            intentions.forEach((i, idx) => {
                lines.push(`${idx + 1}. **${i.label}** — ${i.value}`);
            });
            lines.push('');
        }

        // Arbitrages
        const arbs = Object.entries(mandat.arbitrages)
            .filter(([key, a]) => a.prime && isFilled(mandat.tensions[key]));
        if (arbs.length > 0) {
            lines.push('## Quand les finalités s\'opposent');
            arbs.forEach(([key, a]) => {
                const sides = TENSION_PAIR[key] || [];
                const loser = a.prime === sides[0] ? sides[1] : sides[0];
                const head = `${NIVEAU_FR[a.prime] || capitalize(a.prime)} prime sur ${(NIVEAU_FR[loser] || loser || '').toLowerCase()}`;
                if (isFilled(a.sacrifice)) {
                    lines.push(`- **${head}** — ${a.sacrifice.trim()}`);
                } else {
                    lines.push(`- **${head}.**`);
                }
            });
            lines.push('');
        }

        // Garde-fous interdictions
        if (isFilled(mandat.gardeFous.interdictions)) {
            lines.push('## Vous ne devez JAMAIS');
            mandat.gardeFous.interdictions.split(/\.\s+|\n/).filter(s => s.trim()).forEach(s => {
                lines.push('- ' + s.trim().replace(/\.$/, '') + '.');
            });
            lines.push('');
        }

        // Garde-fous seuils
        if (isFilled(mandat.gardeFous.seuils)) {
            lines.push('## Vous vous arrêtez et demandez quand');
            mandat.gardeFous.seuils.split(/\.\s+|\n/).filter(s => s.trim()).forEach(s => {
                lines.push('- ' + s.trim().replace(/\.$/, '') + '.');
            });
            lines.push('');
        }

        // Test de validation
        if (isFilled(mandat.gardeFous.test3phrases)) {
            lines.push('## Test de validation');
            const phrases = mandat.gardeFous.test3phrases.split(/\d+\)\s*|\d+\.\s*|\n/).filter(s => s.trim());
            phrases.forEach((p, i) => {
                lines.push(`${i + 1}. ${p.trim().replace(/\.$/, '')}.`);
            });
        }

        return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    }

    function capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    root.LeMandatTemplatePromptCourt = { render };

})(window);
