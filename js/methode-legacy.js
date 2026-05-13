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
