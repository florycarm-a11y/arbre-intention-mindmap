// ========================================
// Le Mandat — Livrable module (onglets, copier, export)
// ========================================
//
// API publique :
//   LeMandatLivrable.render({ mandat, container })
//   LeMandatLivrable.update(mandat)

(function (root) {
    'use strict';

    let _mandat = null;
    let _container = null;
    let _activeFormat = 'A'; // 'A' ou 'B'

    function render({ mandat, container }) {
        _mandat = mandat;
        _container = container;
        _container.hidden = false;
        renderUI();
    }

    function update(mandat) {
        _mandat = mandat;
        if (_container) renderUI();
    }

    function renderUI() {
        const apercu = computeContent();
        _container.innerHTML = `
            <article class="livrable">
                <header class="livrable__header">
                    <p class="livrable__progress">Étape 8/8 — Votre mandat est prêt</p>
                    <h2 class="livrable__title">Votre mandat</h2>
                </header>
                <div class="livrable__tabs" role="tablist">
                    <button class="livrable__tab ${_activeFormat === 'A' ? 'livrable__tab--active' : ''}" data-format="A" role="tab" aria-selected="${_activeFormat === 'A'}">
                        Prompt système (court)
                    </button>
                    <button class="livrable__tab ${_activeFormat === 'B' ? 'livrable__tab--active' : ''}" data-format="B" role="tab" aria-selected="${_activeFormat === 'B'}">
                        CLAUDE.md (gouvernance)
                    </button>
                </div>
                <pre class="livrable__apercu" id="livrable-apercu">${escapeHtml(apercu)}</pre>
                <div class="livrable__actions">
                    <button class="livrable__btn" data-action="copy">📋 Copier</button>
                    <button class="livrable__btn" data-action="download-md">⬇ Télécharger .md</button>
                    ${_activeFormat === 'B' ? '<button class="livrable__btn" data-action="download-pdf">⬇ Télécharger .pdf</button>' : ''}
                </div>
                <details class="livrable__help">
                    <summary>↳ Comment l'utiliser ?</summary>
                    <p>${_activeFormat === 'A'
                        ? 'Collez ce prompt en début de session ChatGPT, Claude, Cursor, ou utilisez-le comme <code>system</code> d\'un appel API.'
                        : 'Déposez ce fichier à la racine de votre projet (Claude Code, Cursor, repo Git). Il sert à la fois d\'instruction pour l\'IA et de trace écrite de gouvernance, utilisable comme preuve de réflexion préalable au regard de l\'Article 4.'}</p>
                </details>
            </article>
        `;
        attachHandlers();
    }

    function computeContent() {
        if (_activeFormat === 'A') {
            return LeMandatTemplatePromptCourt.render(_mandat);
        }
        return LeMandatTemplateClaudeMdEtendu.render(_mandat);
    }

    function attachHandlers() {
        _container.querySelectorAll('[data-format]').forEach(btn => {
            btn.addEventListener('click', () => {
                _activeFormat = btn.dataset.format;
                renderUI();
            });
        });
        _container.querySelector('[data-action="copy"]').addEventListener('click', handleCopy);
        _container.querySelector('[data-action="download-md"]').addEventListener('click', handleDownloadMd);
        const pdfBtn = _container.querySelector('[data-action="download-pdf"]');
        if (pdfBtn) pdfBtn.addEventListener('click', handleDownloadPdf);
    }

    async function handleCopy() {
        const content = computeContent();
        try {
            await navigator.clipboard.writeText(content);
            showFlash('Copié ✓');
        } catch (e) {
            console.warn('clipboard failed', e);
            showFlash('Échec — sélectionnez et copiez manuellement');
        }
    }

    function handleDownloadMd() {
        const content = computeContent();
        const filename = buildFilename('md');
        downloadBlob(content, filename, 'text/markdown');
    }

    function handleDownloadPdf() {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('jsPDF non chargé. Vérifiez que le CDN est bien inclus.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const content = computeContent();
        const lines = doc.splitTextToSize(content, 180);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        let y = 15;
        const pageH = 297;
        lines.forEach(line => {
            if (y > pageH - 15) {
                doc.addPage();
                y = 15;
            }
            doc.text(line, 15, y);
            y += 5;
        });
        doc.save(buildFilename('pdf'));
    }

    function buildFilename(ext) {
        const slug = (_mandat.projet.nom || 'mandat')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 40);
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `mandat-${slug}-${date}.${ext}`;
    }

    function downloadBlob(content, filename, mime) {
        const blob = new Blob([content], { type: mime + ';charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    function showFlash(text) {
        const flash = document.createElement('div');
        flash.className = 'livrable__flash';
        flash.textContent = text;
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 2000);
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    root.LeMandatLivrable = { render, update };

})(window);
