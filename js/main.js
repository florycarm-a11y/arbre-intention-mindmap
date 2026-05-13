// ========================================
// Le Mandat — Main entry (page /)
// ========================================
//
// Orchestration : charge schema, instancie wizard, branche les CTAs hero.
// Mindmap récap (P3) et livrable (P4) seront branchés plus tard.

(async function () {
    'use strict';

    // --- DOM refs ---
    const ctaCreer = document.getElementById('cta-creer');
    const ctaExemple = document.getElementById('cta-exemple');
    const wizardContainer = document.getElementById('wizard-container');

    // --- Bandeau de reprise ---
    const existing = LeMandatStorage.load();
    if (existing && !LeMandatStorage.isEmpty(existing)) {
        showRestoreBanner(existing);
    }

    // --- Charger le schema ---
    let schema;
    try {
        const res = await fetch('data/schema.json');
        schema = await res.json();
    } catch (e) {
        console.error('Impossible de charger data/schema.json:', e);
        return;
    }

    // --- Démarrer le wizard ---
    function startWizard(mandat) {
        LeMandatWizard.init({
            schema,
            mandat: mandat || LeMandatStorage.emptyMandat(),
            container: wizardContainer,
            onComplete: (m) => {
                // Affiche la mindmap récap juste sous le wizard
                const mmContainer = document.getElementById('mindmap-container');
                LeMandatMindmap.render({
                    schema,
                    mandat: m,
                    container: mmContainer,
                    onNodeClick: (stepIdx) => {
                        LeMandatWizard.gotoStep(stepIdx);
                        // Active le mode "modification depuis l'aperçu"
                        window._returnToOverview = true;
                    }
                });
                mmContainer.scrollIntoView({ behavior: 'smooth' });
            }
        });
        // À chaque modif, mettre à jour la mindmap si elle est déjà rendue
        LeMandatWizard.subscribe((m) => {
            const mmContainer = document.getElementById('mindmap-container');
            if (!mmContainer.hidden) LeMandatMindmap.update(m);
        });
        wizardContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // --- CTAs ---
    ctaCreer.addEventListener('click', () => {
        const mandat = LeMandatStorage.load() || LeMandatStorage.emptyMandat();
        LeMandatStorage.save(mandat);  // initialise updatedAt
        startWizard(mandat);
    });

    // --- Mini-modale "Voir un exemple" ---
    const exempleModal = document.getElementById('exemple-modal');
    const exempleClose = document.getElementById('exemple-modal-close');

    ctaExemple.addEventListener('click', () => { exempleModal.hidden = false; });
    exempleClose.addEventListener('click', () => { exempleModal.hidden = true; });
    exempleModal.addEventListener('click', (e) => {
        if (e.target === exempleModal) exempleModal.hidden = true;
    });

    async function loadExemple(id) {
        const filename = id === 'meta' ? 'exemple-meta.json' : 'exemple-rse-bdp.json';
        const res = await fetch('data/' + filename);
        const data = await res.json();
        return data.mandat;
    }

    exempleModal.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const action = btn.dataset.action;
            const id = btn.dataset.exempleId;
            const mandat = await loadExemple(id);
            const fullMandat = { version: 2, updatedAt: new Date().toISOString(), ...mandat };
            LeMandatStorage.save(fullMandat);
            exempleModal.hidden = true;

            if (action === 'prefill') {
                startWizard(fullMandat);
            } else if (action === 'view') {
                // Affiche directement la mindmap récap (livrable arrive en P4)
                startWizard(fullMandat);
                // Va directement à l'étape 8 (synthèse) puis affiche la mindmap
                LeMandatWizard.gotoStep(7);
                const mmContainer = document.getElementById('mindmap-container');
                LeMandatMindmap.render({
                    schema, mandat: fullMandat, container: mmContainer,
                    onNodeClick: (idx) => {
                        LeMandatWizard.gotoStep(idx);
                        window._returnToOverview = true;
                    }
                });
                mmContainer.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    function showRestoreBanner(mandat) {
        const banner = document.createElement('div');
        banner.className = 'restore-banner';
        banner.innerHTML = `
            <p>Vous avez un mandat en cours.</p>
            <div class="restore-banner__actions">
                <button class="restore-banner__btn" data-action="reprendre">Reprendre</button>
                <button class="restore-banner__btn restore-banner__btn--secondary" data-action="recommencer">Recommencer</button>
            </div>
        `;
        document.querySelector('.hero').after(banner);
        banner.querySelector('[data-action="reprendre"]').addEventListener('click', () => {
            banner.remove();
            startWizard(mandat);
        });
        banner.querySelector('[data-action="recommencer"]').addEventListener('click', () => {
            LeMandatStorage.clear();
            banner.remove();
        });
    }
})();
