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
                // Puis le livrable juste sous la mindmap
                const livrableContainer = document.getElementById('livrable-container');
                LeMandatLivrable.render({ mandat: m, container: livrableContainer });
                showRelecture();
                mmContainer.scrollIntoView({ behavior: 'smooth' });
            }
        });
        // À chaque modif, mettre à jour la mindmap + le livrable s'ils sont déjà rendus
        LeMandatWizard.subscribe((m) => {
            const mmContainer = document.getElementById('mindmap-container');
            if (!mmContainer.hidden) LeMandatMindmap.update(m);
            const livrableContainer = document.getElementById('livrable-container');
            if (!livrableContainer.hidden) LeMandatLivrable.update(m);
        });
        wizardContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // --- CTAs ---
    ctaCreer.addEventListener('click', () => {
        const mandat = LeMandatStorage.load() || LeMandatStorage.emptyMandat();
        LeMandatStorage.save(mandat);  // initialise updatedAt
        startWizard(mandat);
    });

    // CTA de la démo avant/après : même parcours que « Créer mon mandat ».
    const demoCta = document.getElementById('demo-diff-cta');
    if (demoCta) demoCta.addEventListener('click', () => ctaCreer.click());

    // --- Mini-modale "Voir un exemple" ---
    const exempleModal = document.getElementById('exemple-modal');
    const exempleClose = document.getElementById('exemple-modal-close');

    ctaExemple.addEventListener('click', () => { exempleModal.hidden = false; });
    exempleClose.addEventListener('click', () => { exempleModal.hidden = true; });
    exempleModal.addEventListener('click', (e) => {
        if (e.target === exempleModal) exempleModal.hidden = true;
    });

    // Lien « Voir le mandat complet » sous l'aperçu : ouvre la modale et
    // déclenche directement la vue du cas RSE/BdP.
    const apercuVoirComplet = document.getElementById('apercu-voir-complet');
    if (apercuVoirComplet) {
        apercuVoirComplet.addEventListener('click', () => {
            exempleModal.hidden = false;
            const btnView = exempleModal.querySelector('[data-action="view"][data-exemple-id="rse-bdp"]');
            if (btnView) btnView.click();
        });
    }

    const EXEMPLE_FILES = {
        'meta': 'exemple-meta.json',
        'rse-bdp': 'exemple-rse-bdp.json',
        'recrutement': 'exemple-recrutement.json'
    };

    async function loadExemple(id) {
        const filename = EXEMPLE_FILES[id] || EXEMPLE_FILES['meta'];
        const res = await fetch('data/' + filename);
        const data = await res.json();
        return data.mandat;
    }

    exempleModal.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const action = btn.dataset.action;
            const id = btn.dataset.exempleId;

            if (action === 'prefill') {
                const existant = LeMandatStorage.load();
                if (existant && !LeMandatStorage.isEmpty(existant)) {
                    if (!confirm('Cela remplacera votre mandat en cours. Continuer ?')) {
                        return;
                    }
                }
            }

            const mandat = await loadExemple(id);
            const fullMandat = { version: 2, updatedAt: new Date().toISOString(), ...mandat };
            LeMandatStorage.save(fullMandat);
            exempleModal.hidden = true;

            if (action === 'prefill') {
                startWizard(fullMandat);
            } else if (action === 'view') {
                // Affiche directement la mindmap récap + le livrable
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
                const livrableContainer = document.getElementById('livrable-container');
                LeMandatLivrable.render({ mandat: fullMandat, container: livrableContainer });
                showRelecture();
                mmContainer.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Monte la relecture IA sous le livrable. Lit le mandat le plus à jour
    // (storage) au moment où l'utilisateur lance la relecture.
    function showRelecture() {
        if (!window.LeMandatRelecture) return;
        const container = document.getElementById('relecture-container');
        if (!container) return;
        LeMandatRelecture.render({
            container,
            getMandat: () => LeMandatStorage.load()
        });
    }

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
