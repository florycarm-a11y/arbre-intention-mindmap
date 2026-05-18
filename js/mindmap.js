// ========================================
// Le Mandat — Mindmap récap (rendu D3 depuis objet mandat)
// ========================================
//
// API publique :
//   LeMandatMindmap.render({ schema, mandat, container, onNodeClick })
//   LeMandatMindmap.update(mandat)

(function (root) {
    'use strict';

    let _schema = null, _mandat = null, _container = null, _onNodeClick = null;

    // Phases : 4 colonnes horizontales
    const PHASES = [
        { label: 'CADRAGE',    steps: [0],       nums: '01' },
        { label: 'INTENTIONS', steps: [1, 2, 3], nums: '02 · 03 · 04' },
        { label: 'FRICTION',   steps: [4, 5],    nums: '05 · 06' },
        { label: 'SORTIE',     steps: [6, 7],    nums: '07 · 08' },
    ];

    // Arêtes fixes (indices 0-based dans etapes[])
    const EDGES = [
        { s: 0, t: 1, c: '#64748B' },
        { s: 0, t: 2, c: '#64748B' },
        { s: 0, t: 3, c: '#64748B' },
        { s: 1, t: 4, c: '#B91C1C' },
        { s: 2, t: 4, c: '#EA580C' },
        { s: 3, t: 4, c: '#047857' },
        { s: 1, t: 5, c: '#EA580C' },
        { s: 4, t: 5, c: '#7C3AED' },
        { s: 4, t: 6, c: '#7C3AED' },
        { s: 5, t: 7, c: '#4338CA' },
        { s: 6, t: 7, c: '#B45309' },
    ];

    // Étiquettes courtes (affichage sous les nœuds)
    const SHORT_LABELS = [
        'Le projet', 'Stratégie', 'Tactique', 'Opération',
        'Tensions', 'Arbitrages', 'Garde-fous', 'Synthèse',
    ];

    // Sous-label à l'intérieur des grands nœuds (01 et 08)
    const INNER_LABELS = ['CADRAGE', '', '', '', '', '', '', 'LIVRABLE'];

    // Position de chaque nœud : [bandIdx, xFrac, yFrac, isLarge]
    const LAYOUT = [
        [0, 0.50, 0.48, true ],  // 01
        [1, 0.28, 0.17, false],  // 02
        [1, 0.52, 0.65, false],  // 03
        [1, 0.80, 0.65, false],  // 04
        [2, 0.50, 0.20, false],  // 05
        [2, 0.50, 0.73, false],  // 06
        [3, 0.30, 0.16, false],  // 07
        [3, 0.62, 0.70, true ],  // 08
    ];

    function render({ schema, mandat, container, onNodeClick }) {
        _schema = schema; _mandat = mandat;
        _container = container; _onNodeClick = onNodeClick || (() => {});
        _container.hidden = false;
        _container.innerHTML = '';
        window.matchMedia('(max-width: 640px)').matches ? renderMobile() : renderDesktop();
    }

    function update(mandat) {
        _mandat = mandat;
        if (!_container) return;
        _container.innerHTML = '';
        window.matchMedia('(max-width: 640px)').matches ? renderMobile() : renderDesktop();
    }

    function isFilled(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }

    function isStepFilled(etape) {
        const data = _mandat[etape.key] || {};
        if (etape.key === 'tensions')   return Object.values(_mandat.tensions).some(isFilled);
        if (etape.key === 'arbitrages') return Object.values(_mandat.arbitrages).some(a => a.prime);
        if (etape.key === 'synthese')   return false;
        const obligatoires = (etape.champs || []).filter(c => c.obligatoire);
        if (obligatoires.length === 0)  return Object.values(data).some(isFilled);
        return obligatoires.every(c => isFilled(data[c.key]));
    }

    function shortValue(etape) {
        const data = _mandat[etape.key] || {};
        if (etape.key === 'tensions')   return Object.values(_mandat.tensions).filter(isFilled).length + ' nommée(s)';
        if (etape.key === 'arbitrages') return Object.values(_mandat.arbitrages).filter(a => a.prime).length + ' tranchée(s)';
        if (etape.key === 'synthese')   return '';
        const obligatoires = (etape.champs || []).filter(c => c.obligatoire);
        const champ = obligatoires[0] || (etape.champs || [])[0];
        if (!champ) return '';
        const v = data[champ.key] || '';
        return v.length > 40 ? v.slice(0, 37) + '…' : v;
    }

    function renderDesktop() {
        const W = Math.max(_container.clientWidth || 900, 640);
        const H = 580;
        const etapes = _schema.etapes;
        const filledCount = etapes.filter(e => isStepFilled(e)).length;

        // Zones verticales
        const TITLE_H  = 62;   // surtitle + titre principal
        const PH_HDR_H = 50;   // en-têtes des phases
        const FOOTER_H = 46;
        const TOP = TITLE_H + PH_HDR_H;
        const CH  = H - TOP - FOOTER_H;

        // Limites des bandes en fraction de W
        const BX = [0, 0.19, 0.48, 0.655, 1.0];

        const nodes = etapes.map((e, i) => {
            const [bi, xf, yf, large] = LAYOUT[i];
            const bx0 = BX[bi] * W, bw = (BX[bi + 1] - BX[bi]) * W;
            return {
                etape: e, idx: i, large,
                x: bx0 + bw * xf,
                y: TOP + CH * yf,
                r: large ? 44 : 34,
                filled: isStepFilled(e),
            };
        });

        const svg = d3.select(_container).append('svg')
            .attr('viewBox', `0 0 ${W} ${H}`)
            .attr('class', 'mindmap-recap__svg')
            .attr('role', 'img')
            .attr('aria-label', 'Architecture du mandat — récapitulatif');

        // ── Defs : marqueurs flèche (un par couleur unique) ──
        const defs = svg.append('defs');
        [...new Set(EDGES.map(e => e.c))].forEach(color => {
            defs.append('marker')
                .attr('id', 'mmarr' + color.slice(1))
                .attr('viewBox', '0 0 8 8')
                .attr('refX', 7).attr('refY', 4)
                .attr('markerWidth', 4).attr('markerHeight', 4)
                .attr('orient', 'auto')
                .append('path')
                .attr('d', 'M0,1.5 L7,4 L0,6.5 Z')
                .attr('fill', color).attr('fill-opacity', 0.75);
        });

        // ── Fond ──
        svg.append('rect')
            .attr('width', W).attr('height', H)
            .attr('fill', '#F5F4F0').attr('rx', 12);

        // ── Zone titre ──
        svg.append('text')
            .attr('x', 20).attr('y', 20)
            .attr('fill', '#A8A29E').attr('font-size', 10).attr('font-weight', 700)
            .attr('letter-spacing', '.1em')
            .text('RÉCAPITULATIF DU MANDAT');
        svg.append('text')
            .attr('x', 20).attr('y', 50)
            .attr('fill', '#1C1917').attr('font-size', 22).attr('font-weight', 700)
            .text("L'architecture du mandat");

        // Compteur haut-droite
        const ccx = W - 78, ccy = 32;
        svg.append('circle').attr('cx', ccx).attr('cy', ccy).attr('r', 18).attr('fill', '#1C1917');
        svg.append('text').attr('x', ccx).attr('y', ccy + 5.5)
            .attr('text-anchor', 'middle').attr('fill', '#fff')
            .attr('font-size', 14).attr('font-weight', 700).text(filledCount);
        svg.append('text').attr('x', ccx + 24).attr('y', ccy + 5)
            .attr('fill', '#44403C').attr('font-size', 12).attr('font-weight', 600)
            .text('/ ' + etapes.length + ' étapes');

        // ── Bandes de phases ──
        PHASES.forEach((ph, pi) => {
            const x0 = BX[pi] * W, x1 = BX[pi + 1] * W, mx = (x0 + x1) / 2;
            svg.append('rect')
                .attr('x', x0 + 4).attr('y', TITLE_H + 4)
                .attr('width', x1 - x0 - 8)
                .attr('height', H - TITLE_H - FOOTER_H - 8)
                .attr('fill', '#EAE8E4').attr('rx', 8).attr('opacity', 0.65);
            svg.append('text').attr('x', mx).attr('y', TITLE_H + 24)
                .attr('text-anchor', 'middle')
                .attr('fill', '#78716C').attr('font-size', 11).attr('font-weight', 700)
                .attr('letter-spacing', '.08em').text(ph.label);
            svg.append('text').attr('x', mx).attr('y', TITLE_H + 44)
                .attr('text-anchor', 'middle')
                .attr('fill', '#A8A29E').attr('font-size', 10).text(ph.nums);
        });

        // Séparateurs en tirets entre phases
        for (let i = 1; i < PHASES.length; i++) {
            const sx = BX[i] * W;
            svg.append('line')
                .attr('x1', sx).attr('y1', TITLE_H + 10)
                .attr('x2', sx).attr('y2', H - FOOTER_H - 4)
                .attr('stroke', '#D6D3D1').attr('stroke-width', 1)
                .attr('stroke-dasharray', '4 4');
        }

        // ── Arêtes ──
        const eLayer = svg.append('g');
        EDGES.forEach(({ s, t, c }) => {
            const ns = nodes[s], nt = nodes[t];
            const dx = nt.x - ns.x, dy = nt.y - ns.y;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len, uy = dy / len;
            const sx2 = ns.x + ns.r * ux,       sy2 = ns.y + ns.r * uy;
            const ex2 = nt.x - (nt.r + 6) * ux, ey2 = nt.y - (nt.r + 6) * uy;
            const mx2 = (sx2 + ex2) / 2;
            eLayer.append('path')
                .attr('d', `M${sx2},${sy2} C${mx2},${sy2} ${mx2},${ey2} ${ex2},${ey2}`)
                .attr('fill', 'none')
                .attr('stroke', c).attr('stroke-width', 1.8).attr('stroke-opacity', 0.65)
                .attr('marker-end', `url(#mmarr${c.slice(1)})`);
        });

        // ── Nœuds ──
        const ng = svg.selectAll('.mm-nd')
            .data(nodes).enter()
            .append('g').attr('class', 'mm-nd mindmap-recap__node')
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .style('cursor', 'pointer');

        // Anneau externe (nœuds 01 et 08)
        ng.filter(d => d.large).append('circle')
            .attr('r', d => d.r + 10)
            .attr('fill', 'none')
            .attr('stroke', d => d.etape.color)
            .attr('stroke-width', 2.5).attr('stroke-opacity', 0.3);

        ng.append('circle').attr('r', d => d.r)
            .attr('fill', d => d.etape.color)
            .attr('stroke', '#F5F4F0').attr('stroke-width', 2.5);

        // Numéro d'étape
        ng.append('text').attr('text-anchor', 'middle')
            .attr('y', d => INNER_LABELS[d.idx] ? -5 : 5)
            .attr('fill', '#fff')
            .attr('font-size', d => d.large ? 18 : 14).attr('font-weight', 700)
            .text(d => d.etape.id);

        // Sous-label intérieur (CADRAGE / LIVRABLE)
        ng.filter(d => !!INNER_LABELS[d.idx]).append('text')
            .attr('text-anchor', 'middle').attr('y', 13)
            .attr('fill', '#fff').attr('font-size', 9).attr('font-weight', 700)
            .attr('letter-spacing', '.05em').text(d => INNER_LABELS[d.idx]);

        // Étiquette externe (sous le cercle)
        ng.append('text').attr('text-anchor', 'middle')
            .attr('y', d => d.r + (d.large ? 20 : 16))
            .attr('fill', '#1C1917').attr('font-size', 12).attr('font-weight', 600)
            .text(d => SHORT_LABELS[d.idx]);

        // Badge coche conditionnel
        ng.filter(d => d.filled).each(function (d) {
            const g = d3.select(this);
            const bx = d.r * 0.67, by = -d.r * 0.67;
            g.append('circle').attr('cx', bx).attr('cy', by).attr('r', 9)
                .attr('fill', '#fff').attr('stroke', d.etape.color).attr('stroke-width', 1.5);
            g.append('text').attr('x', bx).attr('y', by + 4)
                .attr('text-anchor', 'middle')
                .attr('fill', d.etape.color).attr('font-size', 10).attr('font-weight', 700)
                .text('✓');
        });

        ng.on('click',     (ev, d) => _onNodeClick(d.idx))
          .on('mouseover', (ev, d) => showTooltip(ev, d.etape))
          .on('mouseout',  hideTooltip);

        // ── Légende bas ──
        const fy = H - FOOTER_H / 2 + 7;
        svg.append('text').attr('x', 16).attr('y', fy)
            .attr('fill', '#78716C').attr('font-size', 11)
            .text("Le projet alimente trois intentions ; leurs tensions s’arbitrent ; les garde-fous filtrent la sortie.");
        svg.append('text').attr('x', W - 16).attr('y', fy)
            .attr('text-anchor', 'end').attr('fill', '#A8A29E').attr('font-size', 11)
            .text('cliquer un nœud → modifier');
    }

    function showTooltip(event, etape) {
        hideTooltip();
        const data = _mandat[etape.key] || {};
        const filled = Object.entries(data).filter(([, v]) => isFilled(v));
        if (filled.length === 0) return;
        const tooltip = document.createElement('div');
        tooltip.className = 'mindmap-recap__tooltip';
        tooltip.id = 'mm-tooltip';
        tooltip.innerHTML = '<strong>' + escapeHtml(etape.label) + '</strong>' +
            filled.map(([k, v]) => '<p>' + escapeHtml(k) + ' : ' + escapeHtml(v) + '</p>').join('');
        document.body.appendChild(tooltip);
        tooltip.style.left = (event.clientX + 10) + 'px';
        tooltip.style.top  = (event.clientY + 10) + 'px';
    }

    function hideTooltip() {
        const t = document.getElementById('mm-tooltip');
        if (t) t.remove();
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ── Mobile : phases empilées en HTML ──
    function renderMobile() {
        const etapes = _schema.etapes;
        const filledCount = etapes.filter(e => isStepFilled(e)).length;

        const header = document.createElement('div');
        header.className = 'mm-header';
        header.innerHTML = `
            <div>
                <p class="mm-surtitle">RÉCAPITULATIF DU MANDAT</p>
                <h2 class="mm-title">L’architecture du mandat</h2>
            </div>
            <div class="mm-counter">
                <span class="mm-counter__num">${filledCount}</span>
                <span class="mm-counter__denom">/ ${etapes.length} étapes</span>
            </div>`;
        _container.appendChild(header);

        PHASES.forEach(ph => {
            const section = document.createElement('div');
            section.className = 'mm-phase';
            section.innerHTML = `
                <div class="mm-phase__hdr">
                    <span class="mm-phase__name">${ph.label}</span>
                    <span class="mm-phase__nums">${ph.nums}</span>
                </div>`;
            const row = document.createElement('div');
            row.className = 'mm-phase__row';
            ph.steps.forEach(si => {
                const e = etapes[si];
                const filled = isStepFilled(e);
                const btn = document.createElement('button');
                btn.className = 'mm-step-btn';
                btn.style.setProperty('--c', e.color);
                btn.setAttribute('aria-label', `Étape ${e.id} : ${SHORT_LABELS[si]}`);
                btn.innerHTML = `
                    <span class="mm-step-btn__circle">
                        <span class="mm-step-btn__id">${e.id}</span>
                        ${INNER_LABELS[si] ? `<span class="mm-step-btn__inner">${INNER_LABELS[si]}</span>` : ''}
                        ${filled ? '<span class="mm-step-btn__check" aria-label="complété">✓</span>' : ''}
                    </span>
                    <span class="mm-step-btn__label">${SHORT_LABELS[si]}</span>`;
                btn.addEventListener('click', () => _onNodeClick(si));
                row.appendChild(btn);
            });
            section.appendChild(row);
            _container.appendChild(section);
        });

        const leg = document.createElement('p');
        leg.className = 'mm-legend';
        leg.textContent = 'Le projet alimente trois intentions ; leurs tensions s’arbitrent ; les garde-fous filtrent la sortie.';
        _container.appendChild(leg);
    }

    root.LeMandatMindmap = { render, update };

})(window);
