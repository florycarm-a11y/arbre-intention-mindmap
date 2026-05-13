// ========================================
// Le Mandat — Mindmap récap (rendu D3 depuis objet mandat)
// ========================================
//
// API publique :
//   LeMandatMindmap.render({ schema, mandat, container, onNodeClick })
//   LeMandatMindmap.update(mandat)         // re-render même container

(function (root) {
    'use strict';

    let _schema = null;
    let _mandat = null;
    let _container = null;
    let _onNodeClick = null;

    function render({ schema, mandat, container, onNodeClick }) {
        _schema = schema;
        _mandat = mandat;
        _container = container;
        _onNodeClick = onNodeClick || (() => {});
        _container.hidden = false;

        if (window.matchMedia('(max-width: 720px)').matches) {
            renderMobile();
        } else {
            renderDesktop();
        }
    }

    function update(mandat) {
        _mandat = mandat;
        if (!_container) return;
        _container.innerHTML = '';
        if (window.matchMedia('(max-width: 720px)').matches) {
            renderMobile();
        } else {
            renderDesktop();
        }
    }

    function isFilled(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }

    function isStepFilled(etape) {
        const data = _mandat[etape.key] || {};
        if (etape.key === 'tensions') return Object.values(_mandat.tensions).some(isFilled);
        if (etape.key === 'arbitrages') return Object.values(_mandat.arbitrages).some(a => a.prime);
        if (etape.key === 'synthese') return false; // pas de saisie
        const obligatoires = (etape.champs || []).filter(c => c.obligatoire);
        if (obligatoires.length === 0) return Object.values(data).some(isFilled);
        return obligatoires.every(c => isFilled(data[c.key]));
    }

    function shortValue(etape) {
        const data = _mandat[etape.key] || {};
        if (etape.key === 'tensions') return Object.values(_mandat.tensions).filter(isFilled).length + ' nommée(s)';
        if (etape.key === 'arbitrages') return Object.values(_mandat.arbitrages).filter(a => a.prime).length + ' tranchée(s)';
        if (etape.key === 'synthese') return '';
        const obligatoires = (etape.champs || []).filter(c => c.obligatoire);
        const champ = obligatoires[0] || (etape.champs || [])[0];
        if (!champ) return '';
        const v = data[champ.key] || '';
        return v.length > 40 ? v.slice(0, 37) + '…' : v;
    }

    function fadedColor(color) {
        // Retourne la même couleur en plus claire (alpha approximé via mix avec blanc)
        return color + '55'; // hex8 : 33% alpha
    }

    function renderDesktop() {
        const W = _container.clientWidth || 800;
        const H = 480;
        const cx = W / 2, cy = H / 2;
        const radius = Math.min(W, H) / 2 - 80;
        const etapes = _schema.etapes;

        const svg = d3.select(_container).append('svg')
            .attr('viewBox', `0 0 ${W} ${H}`)
            .attr('class', 'mindmap-recap__svg');

        // Layout circulaire des étapes
        const angleStep = (2 * Math.PI) / etapes.length;
        const nodes = etapes.map((e, i) => ({
            etape: e,
            x: cx + radius * Math.cos(i * angleStep - Math.PI / 2),
            y: cy + radius * Math.sin(i * angleStep - Math.PI / 2)
        }));

        // Liens
        const linksLayer = svg.append('g');
        linksLayer.selectAll('line')
            .data(nodes)
            .enter()
            .append('line')
            .attr('x1', cx).attr('y1', cy)
            .attr('x2', d => d.x).attr('y2', d => d.y)
            .attr('stroke', d => isStepFilled(d.etape) ? d.etape.color : fadedColor(d.etape.color))
            .attr('stroke-width', 2);

        // Centre
        const centre = svg.append('g').attr('class', 'mindmap-recap__centre');
        centre.append('circle')
            .attr('cx', cx).attr('cy', cy).attr('r', 56)
            .attr('fill', '#1C1917');
        centre.append('text')
            .attr('x', cx).attr('y', cy - 4)
            .attr('text-anchor', 'middle')
            .attr('fill', '#FFFFFF')
            .attr('font-size', 14)
            .attr('font-weight', 700)
            .text('Le Mandat');
        centre.append('text')
            .attr('x', cx).attr('y', cy + 14)
            .attr('text-anchor', 'middle')
            .attr('fill', '#A8A29E')
            .attr('font-size', 11)
            .text((_mandat.projet.nom || '(non nommé)').slice(0, 20));

        // Nœuds
        const nodeGroups = svg.selectAll('.mindmap-recap__node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'mindmap-recap__node')
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .attr('data-step-idx', (d, i) => i)
            .style('cursor', 'pointer');

        nodeGroups.append('circle')
            .attr('r', 32)
            .attr('fill', d => isStepFilled(d.etape) ? d.etape.color : fadedColor(d.etape.color))
            .attr('stroke', '#FFFFFF')
            .attr('stroke-width', 3);

        nodeGroups.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 4)
            .attr('fill', '#FFFFFF')
            .attr('font-size', 14)
            .attr('font-weight', 700)
            .text(d => d.etape.id);

        nodeGroups.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 50)
            .attr('fill', '#1C1917')
            .attr('font-size', 12)
            .attr('font-weight', 600)
            .text(d => d.etape.label);

        nodeGroups.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 66)
            .attr('fill', '#57534E')
            .attr('font-size', 10)
            .text(d => shortValue(d.etape) || (isStepFilled(d.etape) ? '' : 'À remplir'));

        // Tooltip + clic
        nodeGroups.on('click', function (event, d) {
            const idx = etapes.indexOf(d.etape);
            _onNodeClick(idx);
        });

        nodeGroups.on('mouseover', function (event, d) {
            showTooltip(event, d.etape);
        });
        nodeGroups.on('mouseout', hideTooltip);
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
        tooltip.style.top = (event.clientY + 10) + 'px';
    }

    function hideTooltip() {
        const t = document.getElementById('mm-tooltip');
        if (t) t.remove();
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function renderMobile() {
        // Mindmap simplifiée (SVG statique) + accordéon
        const etapes = _schema.etapes;
        const W = 320, H = 320, cx = W / 2, cy = H / 2;
        const radius = 110;
        const angleStep = (2 * Math.PI) / etapes.length;

        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        svg.setAttribute('class', 'mindmap-recap__svg mindmap-recap__svg--mobile');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Aperçu de votre mandat');

        etapes.forEach((e, i) => {
            const x = cx + radius * Math.cos(i * angleStep - Math.PI / 2);
            const y = cy + radius * Math.sin(i * angleStep - Math.PI / 2);
            const filled = isStepFilled(e);
            const color = filled ? e.color : fadedColor(e.color);

            const line = document.createElementNS(svgNS, 'line');
            line.setAttribute('x1', cx); line.setAttribute('y1', cy);
            line.setAttribute('x2', x); line.setAttribute('y2', y);
            line.setAttribute('stroke', color); line.setAttribute('stroke-width', 1.5);
            svg.appendChild(line);

            const circle = document.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', x); circle.setAttribute('cy', y); circle.setAttribute('r', 18);
            circle.setAttribute('fill', color);
            svg.appendChild(circle);

            const text = document.createElementNS(svgNS, 'text');
            text.setAttribute('x', x); text.setAttribute('y', y + 4);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#FFFFFF');
            text.setAttribute('font-size', 11);
            text.setAttribute('font-weight', 700);
            text.textContent = e.id;
            svg.appendChild(text);
        });

        // Centre noir
        const cc = document.createElementNS(svgNS, 'circle');
        cc.setAttribute('cx', cx); cc.setAttribute('cy', cy); cc.setAttribute('r', 32);
        cc.setAttribute('fill', '#1C1917');
        svg.appendChild(cc);
        const ct = document.createElementNS(svgNS, 'text');
        ct.setAttribute('x', cx); ct.setAttribute('y', cy + 4);
        ct.setAttribute('text-anchor', 'middle');
        ct.setAttribute('fill', '#FFFFFF');
        ct.setAttribute('font-size', 11);
        ct.setAttribute('font-weight', 700);
        ct.textContent = 'Mandat';
        svg.appendChild(ct);

        _container.appendChild(svg);

        // Accordéon textuel
        const accordion = document.createElement('div');
        accordion.className = 'mindmap-recap__accordion';
        etapes.forEach((e, i) => {
            const data = _mandat[e.key] || {};
            const filled = Object.entries(data).filter(([, v]) => isFilled(v));
            const filledMark = isStepFilled(e) ? '✓' : '○';
            const det = document.createElement('details');
            det.innerHTML = `
                <summary><span style="color:${e.color}">${filledMark}</span> ${escapeHtml(e.id)} · ${escapeHtml(e.label)}</summary>
                ${filled.length === 0 ? '<p><em>Non rempli</em></p>' : filled.map(([k, v]) => `<p><strong>${escapeHtml(k)}</strong> : ${escapeHtml(v)}</p>`).join('')}
                <button class="mindmap-recap__modify-btn" data-step-idx="${i}">Modifier cette étape</button>
            `;
            accordion.appendChild(det);
        });
        _container.appendChild(accordion);

        accordion.querySelectorAll('.mindmap-recap__modify-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.stepIdx, 10);
                _onNodeClick(idx);
            });
        });
    }

    root.LeMandatMindmap = { render, update };

})(window);
