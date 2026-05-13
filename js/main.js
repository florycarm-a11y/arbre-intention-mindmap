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
                console.log('Wizard completed', m);
                // P4 : afficher le livrable. Pour P2, on log seulement.
            }
        });
        wizardContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // --- CTAs ---
    ctaCreer.addEventListener('click', () => {
        const mandat = LeMandatStorage.load() || LeMandatStorage.emptyMandat();
        LeMandatStorage.save(mandat);  // initialise updatedAt
        startWizard(mandat);
    });

    ctaExemple.addEventListener('click', () => {
        // P3 : ouvrir la mini-modale. Pour P2, on log seulement.
        alert('« Voir un exemple » sera disponible en P3.');
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
