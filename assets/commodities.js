// Sample commodities dashboard for the Classic page's content area (#commodities).
// All numbers are generated (seeded) placeholder data, not market data.
(() => {
  const root = document.querySelector('#commodities');
  if (!root) return;

  // ---------- seeded data ----------
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  const today = new Date();
  const days = 90;
  const brent = [];
  let p = 78;
  for (let i = days - 1; i >= 0; i--) {
    p = Math.max(62, Math.min(96, p + (rand() - 0.47) * 1.8));
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    brent.push({ date: d, value: Math.round(p * 100) / 100 });
  }

  const tiles = [
    { name: 'Brent', unit: '$/bbl', value: brent[days - 1].value, prev: brent[days - 2].value },
    { name: 'WTI', unit: '$/bbl', value: 78.12, prev: 77.4 },
    { name: 'Henry Hub', unit: '$/MMBtu', value: 2.84, prev: 2.91 },
    { name: 'TTF', unit: '€/MWh', value: 38.6, prev: 37.95 },
    { name: 'JKM LNG', unit: '$/MMBtu', value: 12.47, prev: 12.62 },
    { name: 'Gold', unit: '$/oz', value: 2412.3, prev: 2398.1 }
  ];

  const storage = [
    { country: 'Germany', value: 82 },
    { country: 'Italy', value: 88 },
    { country: 'France', value: 76 },
    { country: 'Netherlands', value: 69 },
    { country: 'Austria', value: 91 },
    { country: 'Spain', value: 84 }
  ];

  const futures = [
    ['Brent Dec-26', 82.41, 0.97, '412k'],
    ['WTI Dec-26', 78.12, 0.72, '356k'],
    ['TTF Jan-27', 38.6, 0.65, '98k'],
    ['Henry Hub Jan-27', 2.84, -0.07, '221k'],
    ['Gasoil Dec-26', 742.5, -4.25, '64k'],
    ['Copper Mar-27', 9412, 58, '41k']
  ];

  const articles = [
    {
      tag: 'Shipping',
      title: 'Tanker traffic through the Strait of Hormuz returns to seasonal norms',
      text: 'Transit counts recovered over the week as insurers eased war-risk premiums for Gulf loadings.',
      time: '2h ago'
    },
    {
      tag: 'Gas',
      title: 'European storage injections slow as LNG cargoes divert to Asia',
      text: 'A widening JKM–TTF spread pulled flexible cargoes east, trimming the pace of EU stock builds.',
      time: '5h ago'
    },
    {
      tag: 'Crude',
      title: 'OPEC+ signals steady output into the first quarter',
      text: 'Delegates point to balanced inventories and firm refinery demand ahead of winter maintenance.',
      time: 'Yesterday'
    }
  ];

  // ---------- helpers ----------
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };
  const fmt = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtDate = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const signed = (v, d = 2) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${fmt(Math.abs(v), d)}`;
  const card = (title, sub) => {
    const c = el('section', 'cm-card');
    const h = el('header', 'cm-card__head');
    h.append(el('h3', 'cm-card__title', title));
    if (sub) h.append(el('span', 'cm-card__sub', sub));
    c.append(h);
    return c;
  };
  const tooltip = el('div', 'cm-tip');
  tooltip.setAttribute('role', 'status');
  tooltip.hidden = true;
  const showTip = (x, y, value, label) => {
    tooltip.replaceChildren(el('strong', null, value), el('span', null, label));
    tooltip.hidden = false;
    const r = root.getBoundingClientRect();
    tooltip.style.left = `${x - r.left + root.scrollLeft}px`;
    tooltip.style.top = `${y - r.top + root.scrollTop}px`;
  };
  const hideTip = () => (tooltip.hidden = true);

  // ---------- header ----------
  const head = el('header', 'cm-head');
  head.append(el('h2', 'cm-title', 'Commodities'));
  head.append(el('p', 'cm-meta', `Market overview · ${today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · Sample data`));
  root.append(head);

  // ---------- price tiles ----------
  const tileRow = el('div', 'cm-tiles');
  for (const t of tiles) {
    const chg = ((t.value - t.prev) / t.prev) * 100;
    const tile = el('div', 'cm-tile');
    tile.append(el('span', 'cm-tile__name', t.name));
    tile.append(el('strong', 'cm-tile__value', fmt(t.value)));
    const delta = el('span', `cm-tile__delta ${chg >= 0 ? 'is-up' : 'is-down'}`, `${chg >= 0 ? '▲' : '▼'} ${signed(chg)}%`);
    delta.setAttribute('aria-label', `${chg >= 0 ? 'Up' : 'Down'} ${fmt(Math.abs(chg))} percent`);
    tile.append(delta, el('span', 'cm-tile__unit', t.unit));
    tileRow.append(tile);
  }
  root.append(tileRow);

  // ---------- Brent line chart ----------
  const lineCard = card('Brent crude', '$/bbl · last 90 days');
  const W = 560;
  const H = 200;
  const pad = { l: 36, r: 8, t: 8, b: 22 };
  const vals = brent.map(d => d.value);
  const lo = Math.floor(Math.min(...vals) / 5) * 5;
  const hi = Math.ceil(Math.max(...vals) / 5) * 5;
  const xs = i => pad.l + (i / (days - 1)) * (W - pad.l - pad.r);
  const ys = v => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'cm-chart', role: 'img', 'aria-label': `Brent crude price over the last 90 days, from ${fmt(vals[0])} to ${fmt(vals[days - 1])} dollars per barrel` });
  for (let v = lo; v <= hi; v += 5) {
    svg.append(svgEl('line', { x1: pad.l, x2: W - pad.r, y1: ys(v), y2: ys(v), class: 'cm-grid' }));
    const t = svgEl('text', { x: pad.l - 6, y: ys(v) + 3, class: 'cm-axis', 'text-anchor': 'end' });
    t.textContent = v;
    svg.append(t);
  }
  for (let i = 0; i < days; i += 30) {
    const t = svgEl('text', { x: xs(i), y: H - 6, class: 'cm-axis', 'text-anchor': 'start' });
    t.textContent = fmtDate(brent[i].date);
    svg.append(t);
  }
  const path = brent.map((d, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${ys(d.value).toFixed(1)}`).join('');
  svg.append(svgEl('path', { d: `${path}L${xs(days - 1)},${H - pad.b}L${xs(0)},${H - pad.b}Z`, class: 'cm-area' }));
  svg.append(svgEl('path', { d: path, class: 'cm-line' }));
  const last = svgEl('circle', { cx: xs(days - 1), cy: ys(vals[days - 1]), r: 4, class: 'cm-dot' });
  svg.append(last);
  const cross = svgEl('line', { y1: pad.t, y2: H - pad.b, class: 'cm-cross', visibility: 'hidden' });
  const marker = svgEl('circle', { r: 4, class: 'cm-dot', visibility: 'hidden' });
  svg.append(cross, marker);
  const hit = svgEl('rect', { x: pad.l, y: 0, width: W - pad.l - pad.r, height: H, fill: 'transparent' });
  svg.append(hit);
  const onMove = e => {
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(days - 1, Math.round(((x - pad.l) / (W - pad.l - pad.r)) * (days - 1))));
    const cx = xs(i);
    const cy = ys(vals[i]);
    cross.setAttribute('x1', cx);
    cross.setAttribute('x2', cx);
    marker.setAttribute('cx', cx);
    marker.setAttribute('cy', cy);
    cross.setAttribute('visibility', 'visible');
    marker.setAttribute('visibility', 'visible');
    showTip(r.left + (cx / W) * r.width, r.top + (cy / H) * r.height, `$${fmt(vals[i])}`, fmtDate(brent[i].date));
  };
  hit.addEventListener('pointermove', onMove);
  hit.addEventListener('pointerleave', () => {
    cross.setAttribute('visibility', 'hidden');
    marker.setAttribute('visibility', 'hidden');
    hideTip();
  });
  lineCard.append(svg);

  // ---------- gas storage bars ----------
  const barCard = card('EU gas storage', '% full by country');
  const bars = el('div', 'cm-bars');
  for (const s of storage) {
    const row = el('div', 'cm-bar');
    row.append(el('span', 'cm-bar__label', s.country));
    const track = el('span', 'cm-bar__track');
    const fill = el('span', 'cm-bar__fill');
    fill.style.width = `${s.value}%`;
    fill.tabIndex = 0;
    fill.setAttribute('aria-label', `${s.country}: ${s.value}% full`);
    // Pointer: follow the cursor (the bar end can sit under the drawer); keyboard: anchor to the bar
    const showAt = (x, y) => showTip(x, y, `${s.value}%`, s.country);
    fill.addEventListener('pointermove', e => showAt(e.clientX, e.clientY));
    fill.addEventListener('focus', () => {
      const r = fill.getBoundingClientRect();
      showAt(r.left + Math.min(r.width, 120), r.top + r.height / 2);
    });
    fill.addEventListener('pointerleave', hideTip);
    fill.addEventListener('blur', hideTip);
    track.append(fill);
    row.append(track, el('span', 'cm-bar__value', `${s.value}%`));
    bars.append(row);
  }
  barCard.append(bars);

  const charts = el('div', 'cm-grid2');
  charts.append(lineCard, barCard);
  root.append(charts);

  // ---------- futures table ----------
  const tableCard = card('Front-month futures', 'Last · change · volume');
  const table = el('table', 'cm-table');
  const thead = el('thead');
  const hr = el('tr');
  for (const [h, num] of [['Contract'], ['Last', 1], ['Chg', 1], ['% Chg', 1], ['Volume', 1]]) {
    const th = el('th', num ? 'is-num' : null, h);
    th.scope = 'col';
    hr.append(th);
  }
  thead.append(hr);
  const tbody = el('tbody');
  for (const [name, lastV, chg, vol] of futures) {
    const tr = el('tr');
    const pct = (chg / (lastV - chg)) * 100;
    tr.append(el('td', null, name));
    tr.append(el('td', 'is-num', fmt(lastV)));
    tr.append(el('td', `is-num ${chg >= 0 ? 'is-up' : 'is-down'}`, signed(chg)));
    tr.append(el('td', `is-num ${chg >= 0 ? 'is-up' : 'is-down'}`, `${chg >= 0 ? '▲' : '▼'} ${signed(pct)}%`));
    tr.append(el('td', 'is-num', vol));
    tbody.append(tr);
  }
  table.append(thead, tbody);
  tableCard.append(table);
  root.append(tableCard);

  // ---------- article previews ----------
  const news = el('section', 'cm-news');
  news.append(el('h3', 'cm-card__title cm-news__title', 'Latest analysis'));
  const list = el('div', 'cm-articles');
  for (const a of articles) {
    const art = el('article', 'cm-article');
    art.tabIndex = 0;
    const meta = el('div', 'cm-article__meta');
    meta.append(el('span', 'cm-article__tag', a.tag), el('span', null, a.time));
    art.append(meta, el('h4', 'cm-article__title', a.title), el('p', 'cm-article__text', a.text));
    list.append(art);
  }
  news.append(list);
  root.append(news);

  root.append(tooltip);
})();
