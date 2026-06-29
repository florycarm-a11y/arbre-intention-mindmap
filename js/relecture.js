// ========================================
// Le Mandat — Relecture IA (optionnelle, bring-your-own-key)
// ========================================
//
// API publique :
//   LeMandatRelecture.render({ container, getMandat })
//
// Principe : la relecture appelle directement l'API d'Anthropic depuis le
// navigateur, avec la clé de l'utilisateur. Aucun serveur du Mandat n'est
// impliqué ; la clé reste en localStorage sur l'appareil. Cohérent avec le
// principe « le mandat ne quitte jamais votre navigateur » — sauf appel
// explicite, à l'initiative de l'utilisateur, vers le fournisseur qu'il choisit.

(function (root) {
    'use strict';

    const KEY_STORAGE = 'le-mandat-cle-anthropic';
    const API_URL = 'https://api.anthropic.com/v1/messages';
    const MODEL = 'claude-opus-4-8';
    const MAX_TOKENS = 2000;

    const SYSTEM_PROMPT = [
        'Tu es un relecteur exigeant de « mandats de délégation à une IA » (méthode Le Mandat).',
        'On te fournit un mandat rédigé par un utilisateur. Ton rôle n\'est pas de réécrire son projet,',
        'mais de mettre le CADRAGE à l\'épreuve. Réponds en français, en Markdown, de façon concise et',
        'actionnable, avec exactement ces sections :',
        '',
        '## Points forts',
        '2 à 3 puces : ce qui est déjà solidement cadré.',
        '',
        '## Intentions trop vagues',
        'Pour chaque niveau concerné (stratégique / tactique / opérationnel) : pointe ce qui est trop',
        'flou pour servir de boussole, et propose une reformulation plus précise.',
        '',
        '## Contradictions et angles morts',
        'Tensions non nommées, arbitrages incohérents, ou conflits entre les intentions et les garde-fous.',
        '',
        '## Garde-fous manquants',
        'Risques propres à CE projet qui ne sont pas couverts par les interdictions ou les seuils.',
        '',
        '## Test des 3 phrases',
        'S\'il est absent ou faible : propose 3 critères de validation observables. Sinon, évalue ceux fournis.',
        '',
        'Sois direct mais bienveillant. Ne félicite pas pour la forme. N\'invente jamais d\'information sur',
        'le projet : si une donnée manque pour juger, dis-le explicitement.'
    ].join('\n');

    let _container = null;
    let _getMandat = null;
    let _busy = false;

    function render({ container, getMandat }) {
        _container = container;
        _getMandat = getMandat;
        _container.hidden = false;
        renderUI();
    }

    function renderUI(resultatHtml) {
        const hasKey = !!loadKey();
        _container.innerHTML = `
            <article class="relecture">
                <header class="relecture__header">
                    <p class="relecture__pretitre">Aller plus loin</p>
                    <h2 class="relecture__titre">Faire relire mon mandat par une IA</h2>
                    <p class="relecture__intro">
                        Une IA met votre cadrage à l'épreuve — intentions trop vagues, contradictions,
                        garde-fous manquants — et vous rend un avis. Elle ajoute un regard ; elle ne
                        réécrit pas votre projet.
                    </p>
                </header>
                <details class="relecture__confid">
                    <summary>Confidentialité & fonctionnement</summary>
                    <p>
                        La relecture appelle <strong>directement l'API d'Anthropic</strong> depuis votre
                        navigateur, avec <strong>votre propre clé</strong>. Votre mandat est envoyé à
                        Anthropic — le fournisseur que vous configurez —, pas à un serveur du Mandat.
                        La clé est stockée sur cet appareil (localStorage) et ne transite par aucun
                        serveur tiers. Vous pouvez l'oublier à tout moment.
                    </p>
                </details>
                <div class="relecture__form">
                    <label class="relecture__label" for="relecture-key">Clé API Anthropic</label>
                    <div class="relecture__row">
                        <input class="relecture__input" id="relecture-key" type="password"
                               placeholder="sk-ant-..." autocomplete="off" spellcheck="false">
                        <button class="relecture__btn" data-action="run" ${_busy ? 'disabled' : ''}>
                            ${_busy ? 'Relecture…' : 'Lancer la relecture'}
                        </button>
                    </div>
                    <div class="relecture__meta">
                        <p class="relecture__note">
                            Obtenez une clé sur
                            <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">console.anthropic.com</a>.
                            La relecture utilise ${MODEL} et coûte quelques centimes, facturés sur votre compte.
                        </p>
                        ${hasKey ? '<button class="relecture__forget" data-action="forget">Oublier ma clé</button>' : ''}
                    </div>
                </div>
                <div class="relecture__resultat" id="relecture-resultat" aria-live="polite">${resultatHtml || ''}</div>
            </article>
        `;
        const input = _container.querySelector('#relecture-key');
        if (input && hasKey) input.value = loadKey();
        attach();
    }

    function attach() {
        const runBtn = _container.querySelector('[data-action="run"]');
        if (runBtn) runBtn.addEventListener('click', handleRun);
        const forgetBtn = _container.querySelector('[data-action="forget"]');
        if (forgetBtn) forgetBtn.addEventListener('click', () => { clearKey(); renderUI(); });
    }

    function setResultat(html) {
        const el = _container.querySelector('#relecture-resultat');
        if (el) el.innerHTML = html;
    }

    async function handleRun() {
        if (_busy) return;
        const input = _container.querySelector('#relecture-key');
        const key = (input && input.value || '').trim();
        if (!key) {
            setResultat('<p class="relecture__erreur">Renseignez votre clé API pour lancer la relecture.</p>');
            return;
        }
        saveKey(key);

        const mandat = _getMandat && _getMandat();
        if (!mandat || !mandat.projet) {
            setResultat('<p class="relecture__erreur">Aucun mandat à relire pour le moment.</p>');
            return;
        }

        _busy = true;
        renderUI('<p class="relecture__chargement">Relecture en cours… (quelques secondes)</p>');
        try {
            const critique = await callAnthropic(key, mandat);
            _busy = false;
            renderUI('<div class="relecture__critique">' + mdToHtml(critique) + '</div>');
        } catch (e) {
            _busy = false;
            renderUI('<p class="relecture__erreur">' + escapeHtml(friendlyError(e)) + '</p>');
            console.error('Relecture IA — échec :', e);
        }
    }

    async function callAnthropic(key, mandat) {
        const markdown = root.LeMandatTemplateClaudeMdEtendu.render(mandat);
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-api-key': key,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: MAX_TOKENS,
                system: SYSTEM_PROMPT,
                messages: [
                    { role: 'user', content: 'Voici le mandat à relire :\n\n' + markdown }
                ]
            })
        });

        if (!res.ok) {
            let detail = '';
            try {
                const j = await res.json();
                detail = j && j.error && j.error.message ? j.error.message : '';
            } catch (_) { /* corps non-JSON */ }
            const err = new Error(detail || ('HTTP ' + res.status));
            err.status = res.status;
            throw err;
        }

        const data = await res.json();
        const text = (data.content || [])
            .filter(b => b.type === 'text')
            .map(b => b.text)
            .join('\n')
            .trim();
        return text || '(réponse vide)';
    }

    function friendlyError(e) {
        const s = e && e.status;
        if (s === 401) return 'Clé API invalide ou révoquée. Vérifiez-la sur console.anthropic.com.';
        if (s === 403) return 'Cette clé n\'a pas la permission d\'utiliser ce modèle.';
        if (s === 429) return 'Limite de débit atteinte. Réessayez dans un instant.';
        if (s === 400) return 'Requête refusée par l\'API : ' + (e.message || 'requête invalide') + '.';
        if (s >= 500) return 'Service momentanément indisponible. Réessayez dans quelques instants.';
        // Échec avant réponse : réseau, CORS, ou environnement qui bloque l'appel direct.
        return 'Échec de l\'appel (réseau ou navigateur). Vérifiez votre connexion ; certains environnements bloquent l\'appel direct à l\'API.';
    }

    // --- localStorage clé ---
    function loadKey() {
        try { return localStorage.getItem(KEY_STORAGE) || ''; } catch (_) { return ''; }
    }
    function saveKey(k) {
        try { localStorage.setItem(KEY_STORAGE, k); } catch (_) { /* mode privé */ }
    }
    function clearKey() {
        try { localStorage.removeItem(KEY_STORAGE); } catch (_) { /* */ }
    }

    // --- mini-rendu Markdown (sortie API échappée puis formatée) ---
    function mdToHtml(md) {
        const esc = escapeHtml(md);
        const lines = esc.split('\n');
        let html = '';
        let inList = false;
        const closeList = () => { if (inList) { html += '</ul>'; inList = false; } };
        lines.forEach(line => {
            if (/^###?\s+/.test(line)) {
                closeList();
                html += '<h3>' + inline(line.replace(/^###?\s+/, '')) + '</h3>';
            } else if (/^\s*[-*]\s+/.test(line)) {
                if (!inList) { html += '<ul>'; inList = true; }
                html += '<li>' + inline(line.replace(/^\s*[-*]\s+/, '')) + '</li>';
            } else if (line.trim() === '') {
                closeList();
            } else {
                closeList();
                html += '<p>' + inline(line) + '</p>';
            }
        });
        closeList();
        return html;
    }
    function inline(s) {
        return s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    }
    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    root.LeMandatRelecture = { render };

})(window);
