// ========================================
// Le Mandat — Wizard module (8 étapes en série)
// ========================================
//
// Responsabilité unique : afficher l'étape courante, gérer la navigation,
// valider les champs obligatoires, persister via storage.js.
//
// API publique :
//   LeMandatWizard.init({ schema, mandat, container, onComplete })
//   LeMandatWizard.gotoStep(idx)         // 0-7
//   LeMandatWizard.getMandat()
//   LeMandatWizard.subscribe(fn)         // notifié à chaque save

(function (root) {
    'use strict';

    let _schema = null;
    let _mandat = null;
    let _container = null;
    let _currentIdx = 0;
    let _onComplete = null;
    const _subscribers = [];

    function init({ schema, mandat, container, onComplete }) {
        _schema = schema;
        _mandat = mandat;
        _container = container;
        _onComplete = onComplete || (() => {});
        _currentIdx = 0;
        render();
    }

    function gotoStep(idx) {
        if (idx < 0 || idx >= _schema.etapes.length) return;
        _currentIdx = idx;
        render();
        _container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function getMandat() {
        return _mandat;
    }

    function subscribe(fn) {
        _subscribers.push(fn);
    }

    function notify() {
        _subscribers.forEach(fn => fn(_mandat));
    }

    // --- Validation : un champ obligatoire est rempli si non vide après trim ---
    function isFieldFilled(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }

    // Échappe le contenu utilisateur avant injection en HTML brut (XSS).
    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function isStepValid(etape) {
        if (etape.lectureSeule) return true;
        const champsObligatoires = (etape.champs || []).filter(c => c.obligatoire);
        return champsObligatoires.every(c => {
            const val = (_mandat[etape.key] || {})[c.key];
            return isFieldFilled(val);
        });
    }

    // --- Render orchestrator ---
    function render() {
        const etape = _schema.etapes[_currentIdx];
        _container.hidden = false;
        _container.innerHTML = renderStep(etape);
        attachHandlers(etape);
    }

    function renderStep(etape) {
        const totalSteps = _schema.etapes.length;
        const numero = _currentIdx + 1;
        const colorStyle = `style="--etape-color: ${etape.color}"`;

        if (etape.lectureSeule) {
            return renderSynthese(etape, numero, totalSteps, colorStyle);
        }
        if (etape.dynamique === 'arbitragesDepuisTensions') {
            return renderArbitrages(etape, numero, totalSteps, colorStyle);
        }
        return renderStandard(etape, numero, totalSteps, colorStyle);
    }

    function renderStandard(etape, numero, totalSteps, colorStyle) {
        const champsObligatoires = (etape.champs || []).filter(c => c.obligatoire);
        const champsOptionnels = (etape.champs || []).filter(c => !c.obligatoire);
        const data = _mandat[etape.key] || {};

        const fieldsHtml = champsObligatoires.map(c => fieldHtml(etape.key, c, data[c.key], true)).join('');
        const optionnelsHtml = champsOptionnels.length
            ? `<details class="wizard__optionnels"><summary>+ détails (${champsOptionnels.map(c => c.label.toLowerCase()).join(', ')})</summary>${champsOptionnels.map(c => fieldHtml(etape.key, c, data[c.key], false)).join('')}</details>`
            : '';

        return `
            <article class="wizard__etape" ${colorStyle}>
                <header class="wizard__etape-header">
                    <p class="wizard__progress">Étape ${numero}/${totalSteps}</p>
                    <p class="wizard__label-meta">${etape.id} · ${etape.label}</p>
                    <h2 class="wizard__question">${etape.question}</h2>
                    <p class="wizard__soustitre">${etape.soustitre}</p>
                </header>
                <div class="wizard__champs">
                    ${fieldsHtml}
                    ${optionnelsHtml}
                </div>
                <details class="wizard__explication"><summary>↳ Pourquoi cette étape ?</summary><p>${etape.explication}</p></details>
                <footer class="wizard__nav">
                    ${navButtonsHtml(etape)}
                </footer>
            </article>
        `;
    }

    function fieldHtml(stepKey, champ, value, obligatoire) {
        const safeValue = escapeHtml(value);
        return `
            <label class="wizard__field ${obligatoire ? 'wizard__field--obligatoire' : ''}">
                ${obligatoire ? '<span class="wizard__field-dot"></span>' : ''}
                <span class="wizard__field-label">${champ.label}</span>
                <textarea
                    class="wizard__field-input"
                    data-step="${stepKey}"
                    data-field="${champ.key}"
                    placeholder="${champ.placeholder.replace(/"/g, '&quot;')}"
                    rows="3"
                >${safeValue}</textarea>
            </label>
        `;
    }

    function navButtonsHtml(etape) {
        const isFirst = _currentIdx === 0;
        const isLast = _currentIdx === _schema.etapes.length - 1;
        const valid = isStepValid(etape);
        const nextLabel = isLast ? 'Terminer' : 'Suivant →';
        const nextDisabled = valid ? '' : 'disabled';
        const retourApercu = window._returnToOverview
            ? '<button class="wizard__btn wizard__btn--retour-apercu" data-action="back-to-overview">↑ Retour à l\'aperçu</button>'
            : '';
        return `
            ${retourApercu}
            ${isFirst ? '' : '<button class="wizard__btn wizard__btn--retour" data-action="prev">← Retour</button>'}
            <button class="wizard__btn wizard__btn--suivant" data-action="next" ${nextDisabled}>${nextLabel}</button>
        `;
    }

    function renderArbitrages(etape, numero, totalSteps, colorStyle) {
        const tensionsRemplies = Object.entries(_mandat.tensions).filter(([, v]) => isFieldFilled(v));
        if (tensionsRemplies.length === 0) {
            return `
                <article class="wizard__etape" ${colorStyle}>
                    <header class="wizard__etape-header">
                        <p class="wizard__progress">Étape ${numero}/${totalSteps}</p>
                        <p class="wizard__label-meta">${etape.id} · ${etape.label}</p>
                        <h2 class="wizard__question">${etape.question}</h2>
                        <p class="wizard__soustitre">Aucune tension nommée — rien à arbitrer ici.</p>
                    </header>
                    <footer class="wizard__nav">${navButtonsHtml(etape)}</footer>
                </article>
            `;
        }

        const labelsTension = {
            stratTact: 'Stratégique ↔ Tactique',
            tactOp: 'Tactique ↔ Opérationnel',
            stratOp: 'Stratégique ↔ Opérationnel'
        };
        const optionsPrime = [
            { value: 'strategique', label: 'Stratégique' },
            { value: 'tactique', label: 'Tactique' },
            { value: 'operationnel', label: 'Opérationnel' }
        ];

        const blocsHtml = tensionsRemplies.map(([key, tensionTexte]) => {
            const arb = _mandat.arbitrages[key] || { prime: '', sacrifice: '' };
            const radios = optionsPrime.map(opt => `
                <label class="wizard__radio">
                    <input type="radio" name="arb-${key}" value="${opt.value}" data-arb="${key}" data-arb-field="prime" ${arb.prime === opt.value ? 'checked' : ''}>
                    <span>${opt.label}</span>
                </label>
            `).join('');
            return `
                <fieldset class="wizard__arbitrage-bloc">
                    <legend class="wizard__arbitrage-legend">${labelsTension[key]}</legend>
                    <p class="wizard__arbitrage-tension">« ${escapeHtml(tensionTexte)} »</p>
                    <p class="wizard__arbitrage-prompt">Qui prime ?</p>
                    <div class="wizard__radios">${radios}</div>
                    <label class="wizard__field">
                        <span class="wizard__field-label">Sacrifice consenti (optionnel)</span>
                        <textarea class="wizard__field-input" data-arb="${key}" data-arb-field="sacrifice" rows="2">${escapeHtml(arb.sacrifice)}</textarea>
                    </label>
                </fieldset>
            `;
        }).join('');

        return `
            <article class="wizard__etape" ${colorStyle}>
                <header class="wizard__etape-header">
                    <p class="wizard__progress">Étape ${numero}/${totalSteps}</p>
                    <p class="wizard__label-meta">${etape.id} · ${etape.label}</p>
                    <h2 class="wizard__question">${etape.question}</h2>
                    <p class="wizard__soustitre">${etape.soustitre}</p>
                </header>
                <div class="wizard__arbitrages">${blocsHtml}</div>
                <details class="wizard__explication"><summary>↳ Pourquoi cette étape ?</summary><p>${etape.explication}</p></details>
                <footer class="wizard__nav">${navButtonsHtml(etape)}</footer>
            </article>
        `;
    }

    function renderSynthese(etape, numero, totalSteps, colorStyle) {
        const diag = computeDiagnostic();
        const recapHtml = renderRecap();
        return `
            <article class="wizard__etape wizard__etape--synthese" ${colorStyle}>
                <header class="wizard__etape-header">
                    <p class="wizard__progress">Étape ${numero}/${totalSteps}</p>
                    <h2 class="wizard__question">${etape.question}</h2>
                    <p class="wizard__soustitre">${etape.soustitre}</p>
                </header>
                <div class="wizard__diagnostic">
                    <p class="wizard__diagnostic-titre">Diagnostic — Essentiel</p>
                    <ul>${diag.essentiel.map(d => `<li>${d.ok ? '✓' : '✗'} ${d.label}</li>`).join('')}</ul>
                    <p class="wizard__diagnostic-titre">Diagnostic — Important</p>
                    <ul>${diag.important.map(d => `<li>${d.ok ? '✓' : '✗'} ${d.label}</li>`).join('')}</ul>
                </div>
                <div class="wizard__recap">
                    <p class="wizard__recap-titre">Récapitulatif</p>
                    ${recapHtml}
                </div>
                <footer class="wizard__nav">
                    ${_currentIdx > 0 ? '<button class="wizard__btn wizard__btn--retour" data-action="prev">← Modifier</button>' : ''}
                    <button class="wizard__btn wizard__btn--suivant" data-action="complete">Voir mon mandat ↓</button>
                </footer>
            </article>
        `;
    }

    function computeDiagnostic() {
        return {
            essentiel: [
                { label: 'Projet nommé', ok: isFieldFilled(_mandat.projet.nom) },
                { label: 'Intention stratégique', ok: isFieldFilled(_mandat.strategique.intention) },
                { label: 'Intention tactique', ok: isFieldFilled(_mandat.tactique.intention) },
                { label: 'Intention opérationnelle', ok: isFieldFilled(_mandat.operationnel.intention) }
            ],
            important: [
                { label: 'Au moins une tension nommée', ok: Object.values(_mandat.tensions).some(isFieldFilled) },
                { label: 'Au moins une tension arbitrée', ok: Object.values(_mandat.arbitrages).some(a => a.prime) },
                { label: 'Interdictions posées', ok: isFieldFilled(_mandat.gardeFous.interdictions) },
                { label: 'Test des 3 phrases formulé', ok: isFieldFilled(_mandat.gardeFous.test3phrases) }
            ]
        };
    }

    function renderRecap() {
        const projet = _mandat.projet.nom || '(non nommé)';
        const strat = _mandat.strategique.intention || '(non rempli)';
        const tact = _mandat.tactique.intention || '(non rempli)';
        const op = _mandat.operationnel.intention || '(non rempli)';
        return `
            <dl class="wizard__recap-liste">
                <dt>Projet</dt><dd>${escapeHtml(projet)}</dd>
                <dt>Stratégique</dt><dd>${escapeHtml(strat)}</dd>
                <dt>Tactique</dt><dd>${escapeHtml(tact)}</dd>
                <dt>Opérationnel</dt><dd>${escapeHtml(op)}</dd>
            </dl>
        `;
    }

    // --- Event handlers ---
    function attachHandlers(etape) {
        // Champs textarea standards
        _container.querySelectorAll('textarea[data-step]').forEach(input => {
            input.addEventListener('input', debounce(() => {
                const stepKey = input.dataset.step;
                const fieldKey = input.dataset.field;
                _mandat[stepKey][fieldKey] = input.value;
                LeMandatStorage.save(_mandat);
                notify();
                updateNextBtnState(etape);
            }, 300));
        });

        // Arbitrages — radios et sacrifice
        _container.querySelectorAll('[data-arb]').forEach(el => {
            const key = el.dataset.arb;
            const field = el.dataset.arbField;
            const handler = () => {
                _mandat.arbitrages[key][field] = el.value;
                LeMandatStorage.save(_mandat);
                notify();
            };
            if (el.type === 'radio') {
                el.addEventListener('change', handler);
            } else {
                el.addEventListener('input', debounce(handler, 300));
            }
        });

        // Boutons nav
        _container.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'prev') gotoStep(_currentIdx - 1);
                else if (action === 'next') handleNext(etape);
                else if (action === 'complete') _onComplete(_mandat);
                else if (action === 'back-to-overview') {
                    window._returnToOverview = false;
                    document.getElementById('mindmap-container').scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    function handleNext(etape) {
        // Avertissement doux pour l'étape 5 si aucune tension
        if (etape.key === 'tensions' && etape.avertissement) {
            const aucune = !Object.values(_mandat.tensions).some(isFieldFilled);
            if (aucune && !confirm(etape.avertissement)) return;
        }
        gotoStep(_currentIdx + 1);
    }

    function updateNextBtnState(etape) {
        const btn = _container.querySelector('[data-action="next"]');
        if (!btn) return;
        if (isStepValid(etape)) btn.removeAttribute('disabled');
        else btn.setAttribute('disabled', '');
    }

    function debounce(fn, ms) {
        let timer = null;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(fn, ms);
        };
    }

    root.LeMandatWizard = { init, gotoStep, getMandat, subscribe };

})(window);
