// ========================================
// Arbre d'Intention v2 — Mindmap (D3.js)
// ========================================

(function () {
    'use strict';

    const container = document.getElementById('mindmap-container');
    if (!container) return;

    // Skip on mobile
    function isMobile() {
        return window.innerWidth < 768;
    }

    if (isMobile()) return;

    // Wait for data from main.js
    function waitForData() {
        return new Promise(resolve => {
            function check() {
                if (window.arbreData) {
                    resolve(window.arbreData);
                } else {
                    setTimeout(check, 50);
                }
            }
            check();
        });
    }

    waitForData().then(data => {
        initMindmap(data);
    });

    function initMindmap(data) {
        // Build toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'mindmap-toolbar';
        toolbar.innerHTML = `
            <button id="mm-expand">Tout déplier</button>
            <button id="mm-collapse">Tout replier</button>
            <button id="mm-reset">Recentrer</button>
        `;
        toolbar.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-bottom:8px;';
        const btns = toolbar.querySelectorAll('button');
        btns.forEach(b => {
            b.style.cssText = 'font-family:inherit;font-size:12px;font-weight:500;padding:6px 14px;border:1px solid #D6D3D1;background:#FFF;color:#44403C;border-radius:8px;cursor:pointer;';
        });
        container.prepend(toolbar);

        const svg = d3.select(container).append('svg')
            .attr('xmlns', 'http://www.w3.org/2000/svg');

        const g = svg.append('g');

        const zoom = d3.zoom()
            .scaleExtent([0.3, 2.5])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        const dx = 52;
        const dy = 290;
        const tree = d3.tree().nodeSize([dx, dy]);

        // Build simplified data for mindmap (only root + level 1 names)
        const mindmapData = {
            name: data.name,
            color: data.color,
            isRoot: true,
            children: data.children.map(c => ({
                name: `${c.id} — ${c.name}`,
                color: c.color,
                id: c.id
            }))
        };

        const root = d3.hierarchy(mindmapData);
        root.x0 = 0;
        root.y0 = 0;

        root.descendants().forEach((d, i) => {
            d.nodeId = i;
            if (d.depth === 0) d.branchColor = '#1C1917';
            else d.branchColor = d.data.color || '#44403C';
        });

        let activeId = null;

        function update() {
            tree(root);

            // Links
            const links = root.links();
            const linkSel = g.selectAll('path.mindmap-link').data(links, d => d.target.nodeId);

            linkSel.enter().append('path')
                .attr('class', 'mindmap-link')
                .merge(linkSel)
                .attr('d', d => {
                    const sx = d.source.y + 90;
                    const sy = d.source.x;
                    const tx = d.target.y - 90;
                    const ty = d.target.x;
                    return `M${sx},${sy} C${(sx + tx) / 2},${sy} ${(sx + tx) / 2},${ty} ${tx},${ty}`;
                })
                .attr('stroke', d => d.target.branchColor)
                .attr('stroke-opacity', 0.5);

            linkSel.exit().remove();

            // Nodes
            const nodes = root.descendants();
            const nodeSel = g.selectAll('g.mindmap-node').data(nodes, d => d.nodeId);

            const nodeEnter = nodeSel.enter().append('g')
                .attr('class', d => 'mindmap-node' + (d.data.id === activeId ? ' mindmap-node--active' : ''));

            nodeEnter.append('rect')
                .attr('rx', 10)
                .attr('ry', 10)
                .attr('x', d => d.depth === 0 ? -90 : -100)
                .attr('y', d => d.depth === 0 ? -20 : -18)
                .attr('width', d => d.depth === 0 ? 180 : 200)
                .attr('height', d => d.depth === 0 ? 40 : 36)
                .attr('fill', d => d.depth === 0 ? '#1C1917' : d.branchColor)
                .attr('stroke', d => d.branchColor)
                .style('cursor', d => d.depth === 1 ? 'pointer' : 'default');

            nodeEnter.append('text')
                .attr('class', 'mindmap-label')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('font-size', d => d.depth === 0 ? '14px' : '12px')
                .attr('font-weight', '600')
                .attr('fill', '#FAFAF9')
                .text(d => d.data.name);

            // Click to scroll
            nodeEnter.filter(d => d.depth === 1).on('click', (event, d) => {
                const target = document.getElementById(`etape-${d.data.id}`);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });

            // Position
            const merged = nodeSel.merge(nodeEnter);
            merged.attr('transform', d => `translate(${d.y},${d.x})`);
            merged.attr('class', d => 'mindmap-node' + (d.data.id === activeId ? ' mindmap-node--active' : ''));

            nodeSel.exit().remove();
        }

        function fitToView() {
            const bounds = g.node().getBBox();
            const containerRect = container.getBoundingClientRect();
            const fw = containerRect.width;
            const fh = containerRect.height - 40; // toolbar offset

            if (bounds.width === 0 || bounds.height === 0) return;

            const scale = Math.min(0.95, Math.min(fw / bounds.width, fh / bounds.height) * 0.88);
            const tx = fw / 2 - scale * (bounds.x + bounds.width / 2);
            const ty = fh / 2 - scale * (bounds.y + bounds.height / 2) + 20;

            svg.transition().duration(600).call(
                zoom.transform,
                d3.zoomIdentity.translate(tx, ty).scale(scale)
            );
        }

        // Toolbar
        document.getElementById('mm-expand').addEventListener('click', () => {
            fitToView();
        });
        document.getElementById('mm-collapse').addEventListener('click', () => {
            fitToView();
        });
        document.getElementById('mm-reset').addEventListener('click', () => {
            fitToView();
        });

        // Expose highlight function
        window.highlightMindmapNode = function (id) {
            activeId = id;
            g.selectAll('g.mindmap-node').attr('class', d =>
                'mindmap-node' + (d.data.id === id ? ' mindmap-node--active' : '')
            );
        };

        // Initial render
        update();
        requestAnimationFrame(() => fitToView());

        // Resize
        window.addEventListener('resize', () => {
            clearTimeout(window._mmFit);
            window._mmFit = setTimeout(fitToView, 150);
        });
    }

})();
