// Shared UI for the background + text panels: icons, form controls, the ‹ name ▾ › browse row,
// and an error boundary. Styling comes from the shell's .bgp / .pnl classes (assets/appshell.css).
import { Component as ReactComponent, useEffect, useRef, useState } from 'react';

// ---------- helpers ----------

export const disabledFn = expr => {
  try {
    // Demo expressions refer to props by bare name ("reveal !== 'area'") or through the demo's
    // own object names ("settings.order === 'together'", "props.loop"). A failing expression
    // never hides a control (and never breaks the panel).
    const fn = new Function('p', `with (p) { const settings = p, props = p; return (${expr}); }`);
    return p => {
      try {
        return !!fn(p);
      } catch {
        return false;
      }
    };
  } catch {
    return () => false;
  }
};

export const decimals = s => (String(s).includes('.') ? String(s).split('.')[1].length : 0);
export const pct = (c, v) => `${Math.min(100, Math.max(0, ((v - c.min) / (c.max - c.min)) * 100))}%`;
export const toHex = v => (/^#[0-9a-f]{6}/i.test(String(v)) ? String(v).slice(0, 7) : '#ffffff');

export const jsxValue = v =>
  typeof v === 'string'
    ? `"${v.replace(/"/g, '&quot;')}"`
    : `{${JSON.stringify(v)
        .replace(/"([a-zA-Z_$][\w$]*)":/g, '$1: ')
        .replace(/,(?=\S)/g, ', ')}}`;

export const copyText = async text => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// ---------- icons ----------

export const Icon = ({ d }) => (
  <span className="ico">
    <svg className="mi" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  </span>
);

export const I = {
  text: 'M5 4v3h5.5v12h3V7H19V4z',
  image:
    'M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9-4 5h12l-3-4-2.03 2.71L10 13zm7-4.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5zM20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 18h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z',
  prev: 'M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z',
  next: 'M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z',
  down: 'M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z',
  tune: 'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
  close:
    'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  reset:
    'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z',
  replay: 'M8 5v14l11-7z',
  copy: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
  // iOS-style share: box with an up arrow
  share:
    'M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z',
  // outlined bookmark
  saved: 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15-5-2.18L7 18V5h10v13z',
  link: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z',
  trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  check: 'M9 16.17 4.83 12l-1.42 1.42L9 19 21 7l-1.41-1.41z',
  add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  remove: 'M19 13H5v-2h14v2z',
  search:
    'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'
};

// ---------- browse row: ‹ [icon name ▾] › with a searchable list ----------

export function BrowseRow({ items, currentId, currentName, icon, onSelect, onStep, kind, className = '' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = e => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const q = query.trim().toLowerCase();
  const shown = items.filter(t => t.name.toLowerCase().includes(q));
  let lastGroup = null;

  return (
    <div className={`bgp ${className}`} ref={ref}>
      <button className="bgp-step" aria-label={`Previous ${kind}`} title={`Previous ${kind}`} onClick={() => onStep(-1)}>
        <Icon d={I.prev} />
      </button>
      <button className="bgp-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Icon d={icon} />
        <span className="bgp-name">{currentName}</span>
        <Icon d={I.down} />
      </button>
      <button className="bgp-step" aria-label={`Next ${kind}`} title={`Next ${kind}`} onClick={() => onStep(1)}>
        <Icon d={I.next} />
      </button>
      {open && (
        <div className="bgp-pop">
          <label className="bgp-search">
            <Icon d={I.search} />
            <input autoFocus placeholder={`Search ${kind}s`} value={query} onChange={e => setQuery(e.target.value)} />
          </label>
          <ul role="listbox" aria-label={`${kind}s`}>
            {shown.map(t => {
              const header = t.group && t.group !== lastGroup && !q;
              lastGroup = t.group;
              return [
                header ? (
                  <li key={`g-${t.group}`} className="bgp-group" role="presentation">
                    {t.group}
                  </li>
                ) : null,
                <li
                  key={t.id ?? 'none'}
                  role="option"
                  aria-selected={t.id === currentId}
                  onClick={() => {
                    onSelect(t.id);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <span>{t.name}</span>
                </li>
              ];
            })}
            {!shown.length && <li className="bgp-empty">No match</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------- form controls ----------

export function Control({ c, value, onChange, idPrefix = 'tx' }) {
  const id = `${idPrefix}-${c.key}-${c.type}`;
  switch (c.type) {
    case 'switch':
      return (
        <label className="pnl-row pnl-switch" htmlFor={id}>
          <span>{c.label}</span>
          <input id={id} role="switch" type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />
        </label>
      );
    case 'text':
      return (
        <div className="pnl-row pnl-stack">
          <label htmlFor={id}>
            <span>{c.label}</span>
          </label>
          <input
            id={id}
            className="pnl-text"
            type="text"
            value={value ?? ''}
            maxLength={c.maxLength ?? 400}
            onChange={e => onChange(e.target.value)}
          />
        </div>
      );
    case 'list':
      return (
        <div className="pnl-row pnl-stack">
          <label htmlFor={id}>
            <span>{c.label}</span>
            <em className="tx-hint-inline"> — one per line</em>
          </label>
          <textarea
            id={id}
            className="pnl-text tx-textarea"
            rows={Math.min(5, Math.max(2, (value ?? []).length))}
            value={(value ?? []).join('\n')}
            onChange={e => onChange(e.target.value.split('\n'))}
            onBlur={e => onChange(e.target.value.split('\n').filter(Boolean))}
          />
        </div>
      );
    case 'color':
      return (
        <label className="pnl-row" htmlFor={id}>
          <span>{c.label}</span>
          <span className="pnl-color">
            <code>{String(value)}</code>
            <input id={id} type="color" value={toHex(value)} onChange={e => onChange(e.target.value)} />
          </span>
        </label>
      );
    case 'colors': {
      const list = Array.isArray(value) ? value : [];
      const canAdd = c.maxItems == null || list.length < c.maxItems;
      const canRemove = list.length > (c.minItems ?? 1);
      return (
        <div className="pnl-row tx-colors-row">
          <span>{c.label}</span>
          <span className="pnl-color tx-colors">
            {list.map((col, i) => (
              <input
                key={i}
                type="color"
                aria-label={`${c.label} ${i + 1}`}
                value={toHex(col)}
                onChange={e => onChange(list.map((v, j) => (j === i ? e.target.value : v)))}
              />
            ))}
            {c.editable && canRemove && (
              <button className="cust-icon-btn" aria-label={`Remove a ${c.label} colour`} title="Remove last colour" onClick={() => onChange(list.slice(0, -1))}>
                <Icon d={I.remove} />
              </button>
            )}
            {c.editable && canAdd && (
              <button
                className="cust-icon-btn"
                aria-label={`Add a ${c.label} colour`}
                title="Add a colour"
                onClick={() => onChange([...list, list[list.length - 1] ?? '#ffffff'])}
              >
                <Icon d={I.add} />
              </button>
            )}
          </span>
        </div>
      );
    }
    case 'select': {
      const idx = c.options.findIndex(([v]) => v === value);
      return (
        <label className="pnl-row" htmlFor={id}>
          <span>{c.label}</span>
          <select id={id} value={idx < 0 ? '' : idx} onChange={e => onChange(c.options[e.target.value][0])}>
            {idx < 0 && <option value="">Custom</option>}
            {c.options.map(([v, label], i) => (
              <option key={i} value={i}>
                {label}
              </option>
            ))}
          </select>
        </label>
      );
    }
    case 'range': {
      const num = typeof value === 'number' ? value : parseFloat(value) || 0;
      return (
        <div className="pnl-row pnl-stack">
          <label htmlFor={id} className="pnl-slider-head">
            <span>{c.label}</span>
            <span className="pnl-num">
              <input
                aria-label={`${c.label} value`}
                type="number"
                step={c.step}
                min={c.min}
                max={c.max}
                value={num.toFixed(Math.min(4, decimals(c.step)))}
                onChange={e => {
                  const n = parseFloat(e.target.value);
                  if (!Number.isNaN(n)) onChange(n);
                }}
              />
              {c.unit && <em>{c.unit}</em>}
            </span>
          </label>
          <input
            id={id}
            type="range"
            min={c.min}
            max={c.max}
            step={c.step}
            value={num}
            style={{ '--pct': pct(c, num) }}
            onChange={e => onChange(parseFloat(e.target.value))}
          />
        </div>
      );
    }
    default:
      return null;
  }
}

// ---------- error boundary ----------

export class Boundary extends ReactComponent {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }
  render() {
    if (!this.state.error) return this.props.children;
    return <p className="tx-error">{this.props.label ?? 'This animation'} failed to render: {String(this.state.error.message)}</p>;
  }
}

// ---------- collapsible section ----------
// Remembers which sections are collapsed (per browser), by a stable id.

const SECTIONS_KEY = 'core.sections.v1';
const readCollapsed = () => {
  try {
    return JSON.parse(localStorage.getItem(SECTIONS_KEY) || '{}') ?? {};
  } catch {
    return {};
  }
};

export function Section({ id, title, children, actions = null, defaultOpen = true }) {
  const [open, setOpen] = useState(() => {
    const saved = readCollapsed()[id];
    return saved === undefined ? defaultOpen : !saved;
  });
  const toggle = () =>
    setOpen(o => {
      try {
        localStorage.setItem(SECTIONS_KEY, JSON.stringify({ ...readCollapsed(), [id]: o }));
      } catch {
        /* storage unavailable */
      }
      return !o;
    });
  return (
    <div className={`tx-group${open ? '' : ' is-collapsed'}`}>
      <div className="tx-section tx-section-head">
        <button className="tx-section-btn" aria-expanded={open} onClick={toggle}>
          <Icon d={I.down} />
          <span>{title}</span>
        </button>
        {actions}
      </div>
      {open && <div className="tx-group-body">{children}</div>}
    </div>
  );
}
