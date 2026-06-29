// ========================================
// Le Mandat — Méthode entry (page /methode)
// ========================================
//
// Charge schema.json + methode-content.json + exemple-meta.json
// Rend les 8 sections narratives avec textes dégraissés et cas d'étude méta.

(async function () {
    'use strict';

    const container = document.getElementById('methode-sections');
    const autreCasContainer = document.getElementById('methode-autre-cas');
    const installationContainer = document.getElementById('methode-installation');

    let schema, content, exempleMeta, exempleRseBdp, exempleRecrutement;
    try {
        [schema, content, exempleMeta, exempleRseBdp, exempleRecrutement] = await Promise.all([
            fetch('data/schema.json').then(r => r.json()),
            fetch('data/methode-content.json').then(r => r.json()),
            fetch('data/exemple-meta.json').then(r => r.json()),
            fetch('data/exemple-rse-bdp.json').then(r => r.json()),
            fetch('data/exemple-recrutement.json').then(r => r.json())
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

    // Cas appliqués — Expert RSE / BdP et Recruteur RH / pré-tri.
    // Sources : data/exemple-rse-bdp.json et data/exemple-recrutement.json
    // (mêmes données que la modale d'accueil).
    autreCasContainer.innerHTML = [exempleRseBdp, exempleRecrutement]
        .map(ex => renderAutreCas(schema, ex))
        .join('');

    // Mode d'emploi de déploiement — passer du livrable individuel à la pratique d'équipe.
    // Source : clé « installation » de methode-content.json.
    if (installationContainer) {
        installationContainer.innerHTML = renderInstallation(content.installation);
    }

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
            <section class="methode__section" id="etape-${etape.id}" style="--etape-color: var(--step-${String(etape.id).padStart(2, '0')})">
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

    function renderAutreCas(schema, exemple) {
        const mandat = exemple.mandat;
        const blocsHtml = schema.etapes
            .filter(e => e.key !== 'synthese')
            .map(e => {
                const dl = buildExempleDl(e, mandat);
                if (!dl) return '';
                const colorVar = `--step-${String(e.id).padStart(2, '0')}`;
                return `
                    <article class="methode-autrecas__bloc" style="--etape-color: var(${colorVar})">
                        <header class="methode-autrecas__bloc-header">
                            <p class="methode-autrecas__bloc-numero">Étape ${e.id}</p>
                            <h3 class="methode-autrecas__bloc-titre">${escapeHtml(e.label)}</h3>
                        </header>
                        <dl class="methode-autrecas__dl">${dl}</dl>
                    </article>
                `;
            })
            .join('');

        const sectionId = `autre-cas-${exemple.id}`;
        const intro = exemple.introMethode || 'La même méthode, appliquée à un autre cas.';
        return `
            <section class="methode-autrecas" id="${sectionId}" aria-labelledby="${sectionId}-title">
                <header class="methode-autrecas__header">
                    <p class="methode-autrecas__pretitre">Autre cas appliqué</p>
                    <h2 class="methode-autrecas__title" id="${sectionId}-title">${escapeHtml(exemple.label)}</h2>
                    <p class="methode-autrecas__intro">${escapeHtml(intro)}</p>
                </header>
                <div class="methode-autrecas__grille">${blocsHtml}</div>
            </section>
        `;
    }

    function renderInstallation(install) {
        if (!install) return '';

        const leviersHtml = (install.leviers || []).map((lev, i) => {
            const colorVar = `--step-${lev.color}`;
            return `
                <article class="methode-install__levier" style="--etape-color: var(${colorVar})">
                    <header class="methode-install__levier-header">
                        <p class="methode-install__levier-numero">Levier ${i + 1}/4</p>
                        <h3 class="methode-install__levier-titre">${escapeHtml(lev.titre)}</h3>
                        <p class="methode-install__levier-question">${escapeHtml(lev.question)}</p>
                    </header>
                    <div class="methode-install__levier-corps">
                        <div class="methode-install__bloc">
                            <p class="methode-install__bloc-label">L'enjeu</p>
                            <p class="methode-install__bloc-text">${escapeHtml(lev.enjeu)}</p>
                        </div>
                        <div class="methode-install__bloc">
                            <p class="methode-install__bloc-label">En pratique</p>
                            <p class="methode-install__bloc-text">${escapeHtml(lev.pratique)}</p>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        const kit = install.kit || { titre: '', intro: '', items: [] };
        const kitItems = (kit.items || [])
            .map(it => `<li class="methode-install__kit-item">${escapeHtml(it)}</li>`)
            .join('');

        return `
            <section class="methode-install" id="installer-en-equipe" aria-labelledby="installer-en-equipe-title">
                <header class="methode-install__header">
                    <p class="methode-install__pretitre">${escapeHtml(install.pretitre)}</p>
                    <h2 class="methode-install__title" id="installer-en-equipe-title">${escapeHtml(install.titre)}</h2>
                    <p class="methode-install__intro">${escapeHtml(install.intro)}</p>
                </header>
                <div class="methode-install__grille">${leviersHtml}</div>
                <aside class="methode-install__kit" aria-label="${escapeHtml(kit.titre)}">
                    <p class="methode-install__kit-title">${escapeHtml(kit.titre)}</p>
                    <p class="methode-install__kit-intro">${escapeHtml(kit.intro)}</p>
                    <ul class="methode-install__kit-list">${kitItems}</ul>
                </aside>
            </section>
        `;
    }

    function buildExempleDl(etape, mandat) {
        const data = mandat[etape.key];
        if (!data) return '';
        if (etape.key === 'tensions') {
            const labels = { stratTact: 'Stratégique ↔ Tactique', tactOp: 'Tactique ↔ Opérationnel', stratOp: 'Stratégique ↔ Opérationnel' };
            return Object.entries(mandat.tensions).filter(([, v]) => v && v.trim())
                .map(([k, v]) => `<dt>${labels[k]}</dt><dd>${escapeHtml(v)}</dd>`).join('');
        }
        if (etape.key === 'arbitrages') {
            const labels = { stratTact: 'Stratégique ↔ Tactique', tactOp: 'Tactique ↔ Opérationnel', stratOp: 'Stratégique ↔ Opérationnel' };
            return Object.entries(mandat.arbitrages).filter(([, a]) => a.prime)
                .map(([k, a]) => `<dt>${labels[k]}</dt><dd><strong>Prime :</strong> ${escapeHtml(a.prime)}<br><strong>Sacrifice :</strong> ${escapeHtml(a.sacrifice)}</dd>`).join('');
        }
        return Object.entries(data).filter(([, v]) => v && v.trim())
            .map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join('');
    }

    function renderExempleEtape(etape, mandatMeta) {
        if (etape.key === 'synthese') return '';
        const valuesHtml = buildExempleDl(etape, mandatMeta);
        if (!valuesHtml) return '';

        return `
            <aside class="methode__exemple" style="border-left-color: var(--step-${String(etape.id).padStart(2, '0')})">
                <p class="methode__exemple-titre">Cas d'étude — Le Mandat construit avec sa propre démarche</p>
                <dl>${valuesHtml}</dl>
            </aside>
        `;
    }
})();
