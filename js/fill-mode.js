// ========================================
// Arbre d'Intention v2 — Fill Mode ("À vous")
// ========================================

(function () {
    'use strict';

    const STORAGE_KEY = 'arbre-intention-user-data';
    let isActive = false;
    let saveTimeout = null;

    // --- Wait for arbreData from main.js ---
    function waitForData() {
        return new Promise(resolve => {
            function check() {
                if (window.arbreData) resolve(window.arbreData);
                else setTimeout(check, 50);
            }
            check();
        });
    }

    waitForData().then(data => {
        init(data);
    });

    function init(data) {
        const etapes = data.children;

        // DOM refs
        const fillToggle = document.getElementById('fill-toggle');
        const fillCta = document.getElementById('fill-cta');
        const restoreBanner = document.getElementById('restore-banner');
        const restoreResume = document.getElementById('restore-resume');
        const restoreRestart = document.getElementById('restore-restart');
        const fabExport = document.getElementById('fab-export');
        const exportModal = document.getElementById('export-modal');
        const modalClose = document.getElementById('modal-close');
        const modalPreview = document.getElementById('modal-preview');
        const modalDiagnostic = document.getElementById('modal-diagnostic');
        const exportMdBtn = document.getElementById('export-md');
        const exportPdfBtn = document.getElementById('export-pdf');

        // Check localStorage on load
        const saved = loadFromStorage();
        if (saved) {
            restoreBanner.hidden = false;
        }

        // --- Restore banner handlers ---
        restoreResume.addEventListener('click', () => {
            restoreBanner.hidden = true;
            activate(etapes);
            fillFieldsFromData(saved, etapes);
        });

        restoreRestart.addEventListener('click', () => {
            restoreBanner.hidden = true;
            clearStorage();
            activate(etapes);
        });

        // --- Activation buttons ---
        fillToggle.addEventListener('click', () => {
            if (isActive) {
                deactivate();
            } else {
                const saved = loadFromStorage();
                if (saved) {
                    activate(etapes);
                    fillFieldsFromData(saved, etapes);
                } else {
                    activate(etapes);
                }
            }
        });

        fillCta.addEventListener('click', (e) => {
            e.preventDefault();
            restoreBanner.hidden = true;
            const saved = loadFromStorage();
            // Switch to case study mode so example is visible
            if (window.arbreEtapes) {
                document.body.classList.remove('mode-framework');
                const optCasestudy = document.querySelector('.nav__toggle-option--casestudy');
                const optFramework = document.querySelector('.nav__toggle-option--framework');
                if (optCasestudy) optCasestudy.classList.add('nav__toggle-option--active');
                if (optFramework) optFramework.classList.remove('nav__toggle-option--active');
            }
            if (saved) {
                activate(etapes);
                fillFieldsFromData(saved, etapes);
            } else {
                activate(etapes);
            }
            document.getElementById('etape-01').scrollIntoView({ behavior: 'smooth' });
        });

        // --- Export handlers ---
        fabExport.addEventListener('click', () => openExportModal(etapes));
        modalClose.addEventListener('click', () => { exportModal.hidden = true; });
        exportModal.addEventListener('click', (e) => {
            if (e.target === exportModal) exportModal.hidden = true;
        });
        exportMdBtn.addEventListener('click', () => exportMarkdown(etapes));
        exportPdfBtn.addEventListener('click', () => exportPDF(etapes));

        // --- Activate ---
        function activate(etapes) {
            isActive = true;
            document.body.classList.add('mode-fill');
            fillToggle.classList.add('nav__fill-btn--active');

            // Inject fill blocks if not already present
            etapes.forEach(etape => {
                const section = document.getElementById(`etape-${etape.id}`);
                if (!section || section.querySelector('.etape__fill')) return;

                const fillBlock = createFillBlock(etape);
                section.appendChild(fillBlock);
            });
        }

        // --- Deactivate ---
        function deactivate() {
            isActive = false;
            document.body.classList.remove('mode-fill');
            fillToggle.classList.remove('nav__fill-btn--active');
        }

        // --- Create fill block for an étape ---
        function createFillBlock(etape) {
            const block = document.createElement('div');
            block.className = 'etape__fill';
            block.style.borderLeftColor = etape.color;

            let html = '<p class="etape__fill-title">Votre arbre</p>';

            // Étape 08 has no user-fillable fields (diagnostic is computed)
            if (etape.id === '08') {
                html += '<p style="font-size:0.85rem;color:var(--color-muted);">Le diagnostic est calculé automatiquement à partir de vos réponses aux étapes précédentes. Utilisez le bouton "Exporter" pour voir le résultat.</p>';
                block.innerHTML = html;
                return block;
            }

            html += buildFieldsHtml(etape.champs, etape.id, '');
            html += '<p class="etape__fill-saved" id="saved-' + etape.id + '">✓ Sauvegardé</p>';

            block.innerHTML = html;

            // Auto-expand textareas
            block.querySelectorAll('.etape__fill-textarea').forEach(ta => {
                ta.addEventListener('input', () => {
                    autoExpand(ta);
                    debouncedSave(etapes);
                    showSavedIndicator(etape.id);
                });
            });

            return block;
        }

        // --- Build HTML for fields (handles nested subgroups) ---
        function buildFieldsHtml(champs, etapeId, prefix) {
            return champs.map(champ => {
                if (champ.children) {
                    // Subgroup (tensions, arbitrage)
                    const subHtml = champ.children.map(sub => {
                        const fieldId = 'fill-' + etapeId + '-' + prefix + champ.name + '-' + sub.name;
                        const isRequired = sub.status === 'obligatoire';
                        return '<div class="etape__fill-field">' +
                            '<label class="etape__fill-label' + (isRequired ? ' etape__fill-label--required' : '') + '" for="' + fieldId + '">' + sub.name + '</label>' +
                            '<textarea class="etape__fill-textarea" id="' + fieldId + '" data-etape="' + etapeId + '" data-group="' + champ.name + '" data-field="' + sub.name + '" placeholder="' + (sub.description || '') + '"></textarea>' +
                            '</div>';
                    }).join('');

                    return '<div class="etape__fill-subgroup">' +
                        '<p class="etape__fill-subgroup-name">' + champ.name + '</p>' +
                        subHtml +
                        '</div>';
                }

                // Skip fields without status and without description that are display-only (étape 08)
                if (!champ.status && !champ.description) return '';

                const fieldId = 'fill-' + etapeId + '-' + champ.name;
                const isRequired = champ.status === 'obligatoire';
                return '<div class="etape__fill-field">' +
                    '<label class="etape__fill-label' + (isRequired ? ' etape__fill-label--required' : '') + '" for="' + fieldId + '">' + champ.name + '</label>' +
                    '<textarea class="etape__fill-textarea" id="' + fieldId + '" data-etape="' + etapeId + '" data-field="' + champ.name + '" placeholder="' + (champ.description || '') + '"></textarea>' +
                    '</div>';
            }).join('');
        }

        // --- Auto-expand textarea ---
        function autoExpand(ta) {
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
        }

        // --- Save indicator ---
        function showSavedIndicator(etapeId) {
            const el = document.getElementById('saved-' + etapeId);
            if (!el) return;
            el.classList.add('etape__fill-saved--visible');
            setTimeout(() => el.classList.remove('etape__fill-saved--visible'), 1500);
        }

        // --- Debounced save ---
        function debouncedSave(etapes) {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => saveToStorage(etapes), 500);
        }

        // --- Collect all field values ---
        function collectData(etapes) {
            const result = { timestamp: new Date().toISOString(), etapes: {} };

            etapes.forEach(etape => {
                if (etape.id === '08') return;
                const section = document.getElementById('etape-' + etape.id);
                if (!section) return;

                const etapeData = {};
                section.querySelectorAll('.etape__fill-textarea').forEach(ta => {
                    const val = ta.value.trim();
                    if (!val) return;

                    const group = ta.dataset.group;
                    const field = ta.dataset.field;

                    if (group) {
                        if (!etapeData[group]) etapeData[group] = {};
                        etapeData[group][field] = val;
                    } else {
                        etapeData[field] = val;
                    }
                });

                if (Object.keys(etapeData).length > 0) {
                    result.etapes[etape.id] = etapeData;
                }
            });

            return result;
        }

        // --- localStorage ---
        function saveToStorage(etapes) {
            const data = collectData(etapes);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }

        function loadFromStorage() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (!raw) return null;
                return JSON.parse(raw);
            } catch {
                return null;
            }
        }

        function clearStorage() {
            localStorage.removeItem(STORAGE_KEY);
        }

        // --- Fill fields from saved data ---
        function fillFieldsFromData(saved, etapes) {
            if (!saved || !saved.etapes) return;

            etapes.forEach(etape => {
                const etapeData = saved.etapes[etape.id];
                if (!etapeData) return;

                const section = document.getElementById('etape-' + etape.id);
                if (!section) return;

                section.querySelectorAll('.etape__fill-textarea').forEach(ta => {
                    const group = ta.dataset.group;
                    const field = ta.dataset.field;

                    let val = '';
                    if (group && etapeData[group]) {
                        val = etapeData[group][field] || '';
                    } else if (!group) {
                        val = etapeData[field] || '';
                    }

                    if (val) {
                        ta.value = val;
                        autoExpand(ta);
                    }
                });
            });
        }

        // --- Diagnostic ---
        function getDiagnostic(etapes) {
            const data = collectData(etapes);
            const e = data.etapes;

            const essentiel = {
                'Projet nommé': !!(e['01'] && e['01']['Nom du projet']),
                'Intention stratégique': !!(e['02'] && e['02']['Intention']),
                'Intention tactique': !!(e['03'] && e['03']['Intention']),
                'Intention opérationnelle': !!(e['04'] && e['04']['Intention'])
            };

            const hasTension = !!(e['05'] && Object.keys(e['05']).length > 0);
            const hasArbitrage = !!(e['06'] && Object.keys(e['06']).length > 0);
            const hasGardefous = !!(e['07'] && e['07']["L'IA ne doit JAMAIS\u2026"]);
            const hasValidation = !!(e['07'] && e['07']['Test des 3 phrases']);

            const important = {
                'Au moins une tension identifiée': hasTension,
                'Tensions arbitrées': hasArbitrage,
                'Interdictions posées': hasGardefous,
                'Critères de validation': hasValidation
            };

            return { essentiel, important };
        }

        // --- Export modal ---
        function openExportModal(etapes) {
            const data = collectData(etapes);
            const diag = getDiagnostic(etapes);

            // Preview
            let previewHtml = '';
            etapes.forEach(etape => {
                if (etape.id === '08') return;
                const ed = data.etapes[etape.id];
                if (!ed) return;

                previewHtml += '<h3>' + etape.id + ' — ' + etape.name + '</h3>';
                Object.entries(ed).forEach(([key, val]) => {
                    if (typeof val === 'object') {
                        Object.entries(val).forEach(([subKey, subVal]) => {
                            previewHtml += '<p><strong>' + key + ' › ' + subKey + ' :</strong> ' + subVal + '</p>';
                        });
                    } else {
                        previewHtml += '<p><strong>' + key + ' :</strong> ' + val + '</p>';
                    }
                });
            });

            if (!previewHtml) {
                previewHtml = '<p style="color:var(--color-light)">Aucun champ rempli pour le moment.</p>';
            }

            modalPreview.innerHTML = previewHtml;

            // Diagnostic
            let diagHtml = '<p class="modal__diagnostic-title">Diagnostic</p>';
            diagHtml += '<p class="modal__diagnostic-title" style="font-size:0.8rem;margin-top:var(--spacing-xs)">Essentiel</p>';
            Object.entries(diag.essentiel).forEach(([k, v]) => {
                diagHtml += '<p class="modal__diagnostic-item modal__diagnostic-item--' + (v ? 'pass' : 'fail') + '">' + (v ? '✓' : '✗') + ' ' + k + '</p>';
            });
            diagHtml += '<p class="modal__diagnostic-title" style="font-size:0.8rem;margin-top:var(--spacing-xs)">Important</p>';
            Object.entries(diag.important).forEach(([k, v]) => {
                diagHtml += '<p class="modal__diagnostic-item modal__diagnostic-item--' + (v ? 'pass' : 'fail') + '">' + (v ? '✓' : '✗') + ' ' + k + '</p>';
            });

            modalDiagnostic.innerHTML = diagHtml;
            exportModal.hidden = false;
        }

        // --- Export Markdown ---
        function exportMarkdown(etapes) {
            const data = collectData(etapes);
            const diag = getDiagnostic(etapes);
            const projectName = (data.etapes['01'] && data.etapes['01']['Nom du projet']) || 'Mon projet';

            let md = "# L'Arbre d'Intention — " + projectName + "\n\n";

            etapes.forEach(etape => {
                if (etape.id === '08') return;
                md += '## ' + etape.id + ' — ' + etape.name + '\n';
                const ed = data.etapes[etape.id];
                if (ed) {
                    Object.entries(ed).forEach(([key, val]) => {
                        if (typeof val === 'object') {
                            md += '\n### ' + key + '\n';
                            Object.entries(val).forEach(([subKey, subVal]) => {
                                md += '- **' + subKey + ' :** ' + subVal + '\n';
                            });
                        } else {
                            md += '- **' + key + ' :** ' + val + '\n';
                        }
                    });
                }
                md += '\n';
            });

            md += '## Diagnostic\n\n### Essentiel\n';
            Object.entries(diag.essentiel).forEach(([k, v]) => {
                md += '- [' + (v ? 'x' : ' ') + '] ' + k + '\n';
            });
            md += '\n### Important\n';
            Object.entries(diag.important).forEach(([k, v]) => {
                md += '- [' + (v ? 'x' : ' ') + '] ' + k + '\n';
            });

            downloadFile('arbre-intention-' + slugify(projectName) + '.md', md, 'text/markdown');
        }

        // --- Export PDF ---
        function exportPDF(etapes) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: 'mm', format: 'a4' });
            const data = collectData(etapes);
            const diag = getDiagnostic(etapes);
            const projectName = (data.etapes['01'] && data.etapes['01']['Nom du projet']) || 'Mon projet';
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const contentWidth = pageWidth - margin * 2;
            let y = margin;

            // Helper: add text with word wrap, auto page break
            function addText(text, fontSize, fontStyle, color, indent) {
                indent = indent || 0;
                doc.setFontSize(fontSize);
                doc.setFont('helvetica', fontStyle || 'normal');
                if (color) doc.setTextColor(color[0], color[1], color[2]);
                else doc.setTextColor(28, 25, 23);

                const lines = doc.splitTextToSize(text, contentWidth - indent);
                lines.forEach(line => {
                    if (y > 270) {
                        addFooter(doc, pageWidth);
                        doc.addPage();
                        y = margin;
                    }
                    doc.text(line, margin + indent, y);
                    y += fontSize * 0.45;
                });
                y += 2;
            }

            function addFooter(d, pw) {
                d.setFontSize(7);
                d.setTextColor(168, 162, 158);
                d.text("Généré avec L'Arbre d'Intention — florycarm-a11y.github.io/arbre-intention-mindmap/", pw / 2, 290, { align: 'center' });
            }

            // --- Header ---
            doc.setFillColor(28, 25, 23);
            doc.rect(0, 0, pageWidth, 4, 'F');
            y = 20;
            addText("L'Arbre d'Intention", 22, 'bold');
            addText(projectName, 14, 'normal', [87, 83, 78]);
            addText(new Date().toLocaleDateString('fr-FR'), 10, 'normal', [120, 113, 108]);
            y += 6;

            // --- Sections ---
            etapes.forEach(etape => {
                if (etape.id === '08') return;
                const ed = data.etapes[etape.id];

                // Section header with color bar
                if (y > 240) {
                    addFooter(doc, pageWidth);
                    doc.addPage();
                    y = margin;
                }

                const rgb = hexToRgb(etape.color);
                doc.setFillColor(rgb[0], rgb[1], rgb[2]);
                doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(250, 250, 249);
                doc.text(etape.id + ' — ' + etape.name, margin + 4, y + 7);
                y += 16;

                if (ed) {
                    Object.entries(ed).forEach(([key, val]) => {
                        if (typeof val === 'object') {
                            addText(key, 10, 'bold', [87, 83, 78]);
                            Object.entries(val).forEach(([subKey, subVal]) => {
                                addText(subKey + ' : ' + subVal, 9, 'normal', null, 6);
                            });
                        } else {
                            addText(key + ' :', 9, 'bold');
                            addText(val, 9, 'normal', [87, 83, 78], 4);
                        }
                    });
                } else {
                    addText('(non rempli)', 9, 'italic', [168, 162, 158]);
                }
                y += 4;
            });

            // --- Diagnostic page ---
            addFooter(doc, pageWidth);
            doc.addPage();
            y = margin;
            addText('Diagnostic', 16, 'bold');
            y += 4;

            addText('Essentiel', 11, 'bold');
            Object.entries(diag.essentiel).forEach(([k, v]) => {
                addText((v ? '✓' : '✗') + '  ' + k, 10, 'normal', v ? [22, 163, 74] : [220, 38, 38]);
            });
            y += 4;

            addText('Important', 11, 'bold');
            Object.entries(diag.important).forEach(([k, v]) => {
                addText((v ? '✓' : '✗') + '  ' + k, 10, 'normal', v ? [22, 163, 74] : [220, 38, 38]);
            });

            addFooter(doc, pageWidth);
            doc.save('arbre-intention-' + slugify(projectName) + '.pdf');
        }

        // --- Helpers ---
        function downloadFile(filename, content, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }

        function slugify(text) {
            return text.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
                .substring(0, 40);
        }

        function hexToRgb(hex) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return [r, g, b];
        }
    }

})();
