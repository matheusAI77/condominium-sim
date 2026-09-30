// Desenho do prédio em corte lateral (SVG).

const SVG_NS = 'http://www.w3.org/2000/svg';

const LAYOUT = {
  aptW: 200,
  aptH: 130,
  gap: 8,
  wall: 14,
  roofH: 50,
  groundH: 24,
};

const LEVEL_COLORS = {
  vacant: 'var(--apt-vacant)',
  happy: 'var(--apt-happy)',
  neutral: 'var(--apt-neutral)',
  unhappy: 'var(--apt-unhappy)',
};

function svgEl(tag, attrs, text) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text !== undefined) el.textContent = text;
  return el;
}

function renderBuilding(svg, state, selectedApt, onSelect) {
  const { aptW, aptH, gap, wall, roofH, groundH } = LAYOUT;
  const cols = CONFIG.aptsPerFloor;
  const floors = CONFIG.floors;
  const bodyW = wall * 2 + cols * aptW + (cols - 1) * gap;
  const bodyH = wall * 2 + floors * aptH + (floors - 1) * gap;
  const width = bodyW + 40;
  const height = roofH + bodyH + groundH;
  const x0 = 20;
  const y0 = roofH;

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.replaceChildren();

  // Telhado, corpo e chão
  svg.appendChild(svgEl('polygon', {
    points: `${x0 - 10},${y0} ${x0 + bodyW / 2},${6} ${x0 + bodyW + 10},${y0}`,
    class: 'roof',
  }));
  svg.appendChild(svgEl('rect', { x: x0, y: y0, width: bodyW, height: bodyH, class: 'building' }));
  svg.appendChild(svgEl('rect', { x: 0, y: y0 + bodyH, width, height: groundH, class: 'ground' }));

  for (let i = 0; i < state.apartments.length; i++) {
    const tenant = state.apartments[i];
    const floor = aptFloor(i);
    const col = aptCol(i);
    const x = x0 + wall + col * (aptW + gap);
    const y = y0 + wall + (floors - 1 - floor) * (aptH + gap); // térreo embaixo

    const level = tenant ? satisfactionLevel(tenant.satisfacao) : 'vacant';
    const g = svgEl('g', {
      class: 'apt' + (i === selectedApt ? ' selected' : ''),
      role: 'button',
      tabindex: '0',
      'aria-label': tenant ? `Apartamento ${aptLabel(i)}: ${tenant.nome}` : `Apartamento ${aptLabel(i)}: vago`,
    });
    g.addEventListener('click', () => onSelect(i));
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(i);
      }
    });

    g.appendChild(svgEl('rect', {
      x, y, width: aptW, height: aptH, rx: 6,
      fill: LEVEL_COLORS[level],
      class: 'apt-box',
    }));
    g.appendChild(svgEl('text', { x: x + 10, y: y + 22, class: 'apt-label' }, aptLabel(i)));

    if (tenant) {
      g.appendChild(svgEl('text', { x: x + aptW / 2, y: y + 50, class: 'apt-name' }, tenant.nome));
      g.appendChild(svgEl('text', { x: x + aptW / 2, y: y + 82, class: 'apt-icons' }, tenantIcons(tenant).join('  ')));

      // Barra de satisfação
      const barW = aptW - 30;
      const bx = x + 15;
      const by = y + aptH - 26;
      g.appendChild(svgEl('rect', { x: bx, y: by, width: barW, height: 12, rx: 6, class: 'bar-bg' }));
      g.appendChild(svgEl('rect', {
        x: bx, y: by, width: Math.max(0, (barW * tenant.satisfacao) / 100), height: 12, rx: 6, class: 'bar-fill',
      }));
      g.appendChild(svgEl('text', { x: x + aptW - 12, y: y + 22, class: 'apt-sat' }, String(tenant.satisfacao)));
    } else {
      g.appendChild(svgEl('text', { x: x + aptW / 2, y: y + aptH / 2 + 8, class: 'apt-vacant-text' }, 'VAGO'));
    }

    svg.appendChild(g);
  }
}
