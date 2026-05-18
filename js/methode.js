// ========================================
// Le Mandat — Méthode entry (page /methode)
// ========================================
//
// Charge schema.json + methode-content.json + exemple-meta.json
// Rend les 8 sections narratives avec textes dégraissés et cas d'étude méta.

(async function () {
    'use strict';

    const container = document.getElementById('methode-sections');

    let schema, content, exempleMeta;
    try {
        [schema, content, exempleMeta] = await Promise.all([
            fetch('data/schema.json').then(r => r.json()),
            fetch('data/methode-content.json').then(r => r.json()),
            fetch('data/exemple-meta.json').then(r => r.json())
        ]);
    } catch (e) {
        container.innerHTML = '<p class="methode-error">Impossible de charger la méthode. Veuillez réessayer.</p>';
        console.error(e);
        return;
    }

    container.innerHTML = schema.phases.map(phase => {
        const etapesPhase = schema.etapes.filter(e => e.phase === phase.key);
        const sectionsHtml = etapesPhase
            .map(e => renderSection(e, content.etapes[e.id], exempleMeta.mandat))
            .join('');
        return `
            <section class="methode__phase" id="phase-${phase.key}">
                <header class="methode__phase-header">
                    <p class="methode__phase-numero">Phase ${phase.numero}/4</p>
                    <h2 class="methode__phase-title">${escapeHtml(phase.label)}</h2>
                </header>
                ${sectionsHtml}
            </section>
        `;
    }).join('');

    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function renderSection(etape, contentEtape, mandatMeta) {
        const c = contentEtape || { comprendre: '', exemple: '' };
        const champsHtml = (etape.champs || []).map(champ => `
            <li class="methode__champ">
                <span class="methode__champ-dot ${champ.obligatoire ? 'methode__champ-dot--obligatoire' : 'methode__champ-dot--optionnel'}"></span>
                <span class="methode__champ-name">${escapeHtml(champ.label)}</span>
                ${champ.obligatoire ? '<span class="methode__champ-badge">obligatoire</span>' : ''}
                <p class="methode__champ-placeholder">${escapeHtml(champ.placeholder)}</p>
            </li>
        `).join('');

        const champsBlock = (etape.champs || []).length > 0
            ? `<aside class="methode__champs"><p class="methode__champs-title">Champs à remplir</p><ul>${champsHtml}</ul></aside>`
            : '';

        const exempleMandat = renderExempleEtape(etape, mandatMeta);

        return `
            <section class="methode__section" id="etape-${etape.id}" style="--etape-color: ${etape.color}">
                <header class="methode__section-header">
                    <p class="methode__section-numero">Étape ${etape.id}</p>
                    <h2 class="methode__section-title">${escapeHtml(etape.label)}</h2>
                    <p class="methode__section-question">${escapeHtml(etape.question)}</p>
                </header>
                <div class="methode__section-corps">
                    <div class="methode__comprendre">
                        <p class="methode__comprendre-title">Comprendre</p>
                        <p>${escapeHtml(c.comprendre)}</p>
                    </div>
                    ${exempleMandat}
                </div>
                ${champsBlock}
            </section>
        `;
    }

    function renderExempleEtape(etape, mandatMeta) {
        const data = mandatMeta[etape.key];
        if (!data) return '';

        let valuesHtml = '';
        if (etape.key === 'tensions') {
            const labels = { stratTact: 'Stratégique ↔ Tactique', tactOp: 'Tactique ↔ Opérationnel', stratOp: 'Stratégique ↔ Opérationnel' };
            valuesHtml = Object.entries(mandatMeta.tensions).filter(([, v]) => v && v.trim())
                .map(([k, v]) => `<dt>${labels[k]}</dt><dd>${escapeHtml(v)}</dd>`).join('');
        } else if (etape.key === 'arbitrages') {
            const labels = { stratTact: 'Stratégique ↔ Tactique', tactOp: 'Tactique ↔ Opérationnel', stratOp: 'Stratégique ↔ Opérationnel' };
            valuesHtml = Object.entries(mandatMeta.arbitrages).filter(([, a]) => a.prime)
                .map(([k, a]) => `<dt>${labels[k]}</dt><dd><strong>Prime :</strong> ${escapeHtml(a.prime)}<br><strong>Sacrifice :</strong> ${escapeHtml(a.sacrifice)}</dd>`).join('');
        } else if (etape.key === 'synthese') {
            return ''; // Pas d'exemple pour la synthèse
        } else {
            valuesHtml = Object.entries(data).filter(([, v]) => v && v.trim())
                .map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join('');
        }

        if (!valuesHtml) return '';

        return `
            <aside class="methode__exemple" style="border-left-color: ${etape.color}">
                <p class="methode__exemple-titre">Cas d'étude — Le Mandat construit avec sa propre démarche</p>
                <dl>${valuesHtml}</dl>
            </aside>
        `;
    }
})();
