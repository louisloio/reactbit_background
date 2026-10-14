// Text animation picker for the Core appshell.
// Mounts three pieces with one React root (via portals):
//   - three icon buttons in the header: Saved looks, Share, Customise
//   - one settings panel (.pnl) with Background | Text tabs. The Background tab hosts the
//     existing background picker and its settings panel (moved in from the header), the
//     Text tab browses and tunes the React Bits text animations
//   - the text area above the AI input, rendering the selected React Bits component
//
// On the Classic page (body.layout-panel) the settings are always visible instead: the
// background picker/settings and the Text settings render into fixed columns, the header
// only gets Saved looks + Share, and the text area sits in the Chat AI drawer.
import { Component as ReactComponent, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { TEXT_ANIMATIONS } from './registry.js';
import { renderWithAdapter } from './adapters.jsx';
import {
  applyBackground,
  getBackground,
  loadSavedLooks,
  lookUrl,
  persistBackground,
  storeSavedLooks,
  takeLookFromUrl
} from './looks.js';
import './app.css';

const STORAGE_KEY = 'core.textAnimations.v1';
const BY_ID = Object.fromEntries(TEXT_ANIMATIONS.map(t => [t.id, t]));

const BASE_DEFAULTS = {
  fontFamily: '',
  fontSize: 8,
  fontWeight: 700,
  color: '#ffffff',
  letterSpacing: 0,
  align: 'center'
};
const PAGE_DEFAULTS = { id: 'TechText', height: 100, base: BASE_DEFAULTS, props: {}, tab: 'background' };

const FONTS = [
  ['', 'Inherit'],
  ['Inter, sans-serif', 'Inter'],
  ['system-ui, sans-serif', 'System UI'],
  ['"Helvetica Neue", Helvetica, Arial, sans-serif', 'Helvetica'],
  ['Georgia, "Times New Roman", serif', 'Serif'],
  ['ui-monospace, SFMono-Regular, Menlo, monospace', 'Monospace']
];

const AREA_CONTROLS = [{ key: 'height', label: 'Canvas Height', type: 'range', min: 40, max: 400, step: 4, unit: 'px' }];
const BASE_CONTROLS = [
  { key: 'fontFamily', label: 'Font', type: 'select', options: FONTS },
  { key: 'fontSize', label: 'Font Size', type: 'range', min: 1, max: 30, step: 0.5, unit: 'vh' },
  { key: 'fontWeight', label: 'Font Weight', type: 'range', min: 100, max: 900, step: 100 },
  { key: 'color', label: 'Color', type: 'color' },
  { key: 'letterSpacing', label: 'Letter Spacing', type: 'range', min: -0.1, max: 0.5, step: 0.01, unit: 'em' },
  {
    key: 'align',
    label: 'Align',
    type: 'select',
    options: [
      ['center', 'Center'],
      ['left', 'Left'],
      ['right', 'Right']
    ]
  }
];

// ---------- store ----------

const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return structuredClone(PAGE_DEFAULTS);
    return {
      ...PAGE_DEFAULTS,
      ...saved,
      id: saved.id === null || BY_ID[saved.id] ? saved.id : PAGE_DEFAULTS.id,
      base: { ...BASE_DEFAULTS, ...saved.base, ...(saved.base?.fontSize > 30 ? { fontSize: BASE_DEFAULTS.fontSize } : {}) },
      props: saved.props ?? {}
    };
  } catch {
    return structuredClone(PAGE_DEFAULTS);
  }
};

let state = { ...load(), panel: false, replay: 0 };
const listeners = new Set();
const setState = patch => {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
  try {
    const { panel, replay, ...persist } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
  } catch {
    /* storage unavailable: settings last for this visit only */
  }
  listeners.forEach(l => l());
};
const useStore = () =>
  useSyncExternalStore(
    l => (listeners.add(l), () => listeners.delete(l)),
    () => state
  );

const propsFor = (s, id) => ({ ...BY_ID[id].defaults, ...s.props[id] });

const selectAnimation = id => setState({ id });
const step = dir => {
  const ids = [null, ...TEXT_ANIMATIONS.map(t => t.id)];
  const i = ids.indexOf(state.id);
  selectAnimation(ids[(i + dir + ids.length) % ids.length]);
};

// ---------- helpers ----------

const disabledFn = expr => {
  try {
    // Demo expressions refer to props by bare name, e.g. "reveal !== 'area'"
    return new Function('p', `with (p) { return (${expr}); }`);
  } catch {
    return () => false;
  }
};

const decimals = s => (String(s).includes('.') ? String(s).split('.')[1].length : 0);
const pct = (c, v) => `${Math.min(100, Math.max(0, ((v - c.min) / (c.max - c.min)) * 100))}%`;
const toHex = v => (/^#[0-9a-f]{6}/i.test(String(v)) ? String(v).slice(0, 7) : '#ffffff');

const jsxValue = v =>
  typeof v === 'string'
    ? `"${v.replace(/"/g, '&quot;')}"`
    : `{${JSON.stringify(v)
        .replace(/"([a-zA-Z_$][\w$]*)":/g, '$1: ')
        .replace(/,(?=\S)/g, ', ')}}`;

const toJsx = (entry, props, ctx) => {
  const { adapter } = entry;
  const strip = p => {
    const out = adapter.map ? adapter.map(p, ctx) : { ...p };
    for (const k of adapter.demoOnly ?? []) delete out[k];
    for (const [k, v] of Object.entries(out))
      if (typeof v === 'function' || (v && typeof v === 'object' && 'current' in v)) delete out[k];
    return out;
  };
  const current = strip(props);
  const base = strip({ ...entry.defaults, ...entry.componentDefaults });
  const childKey = adapter.children;
  const children = childKey ? current[childKey] : null;
  const lines = Object.entries(current)
    .filter(([k, v]) => k !== childKey && v !== undefined)
    .filter(([k, v]) => ['text', 'texts', 'words', 'label', 'sentence', 'marqueeText'].includes(k) || JSON.stringify(v) !== JSON.stringify(base[k]))
    .map(([k, v]) => `  ${k}=${jsxValue(v)}`);
  const refs = Object.keys(adapter.map ? adapter.map(props, ctx) : {}).filter(k => /Ref$/.test(k));
  const refLines = refs.map(k => `  ${k}={${k}}`);
  const all = [...lines, ...refLines];
  const open = `<${entry.id}${all.length ? `\n${all.join('\n')}\n` : ' '}`;
  return children != null ? `${open}>\n  ${children}\n</${entry.id}>` : `${open}/>`;
};

// ---------- icons ----------

const Icon = ({ d }) => (
  <span className="ico">
    <svg className="mi" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  </span>
);
const I = {
  text: 'M5 4v3h5.5v12h3V7H19V4z',
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
  search:
    'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'
};

// ---------- text picker (browse row of the Text tab) ----------

function Picker() {
  const s = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const current = s.id ? BY_ID[s.id] : null;

  useEffect(() => {
    if (!open) return undefined;
    const close = e => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const items = [{ id: null, name: 'None' }, ...TEXT_ANIMATIONS].filter(t =>
    t.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="bgp tx-picker" ref={ref}>
      <button className="bgp-step" aria-label="Previous text animation (Alt+↑)" title="Previous (Alt+↑)" onClick={() => step(-1)}>
        <Icon d={I.prev} />
      </button>
      <button className="bgp-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Icon d={I.text} />
        <span className="bgp-name">{current ? current.name : 'No text'}</span>
        <Icon d={I.down} />
      </button>
      <button className="bgp-step" aria-label="Next text animation (Alt+↓)" title="Next (Alt+↓)" onClick={() => step(1)}>
        <Icon d={I.next} />
      </button>
      {open && (
        <div className="bgp-pop">
          <label className="bgp-search">
            <Icon d={I.search} />
            <input autoFocus placeholder="Search text animations" value={query} onChange={e => setQuery(e.target.value)} />
          </label>
          <ul role="listbox" aria-label="Text animations">
            {items.map(t => (
              <li
                key={t.id ?? 'none'}
                role="option"
                aria-selected={t.id === s.id}
                onClick={() => {
                  selectAnimation(t.id);
                  setOpen(false);
                  setQuery('');
                }}
              >
                <span>{t.name}</span>
              </li>
            ))}
            {!items.length && <li className="bgp-empty">No match</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------- panel controls ----------

function Control({ c, value, onChange }) {
  const id = `tx-${c.key}-${c.type}`;
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
            maxLength={c.maxLength ?? 160}
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
    case 'colors':
      return (
        <div className="pnl-row">
          <span>{c.label}</span>
          <span className="pnl-color tx-colors">
            {(value ?? []).map((col, i) => (
              <input
                key={i}
                type="color"
                aria-label={`${c.label} ${i + 1}`}
                value={toHex(col)}
                onChange={e => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
              />
            ))}
          </span>
        </div>
      );
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
                value={num.toFixed(decimals(c.step))}
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

function TextTab({ ctx }) {
  const s = useStore();
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState('');
  const entry = s.id ? BY_ID[s.id] : null;
  const props = entry ? propsFor(s, s.id) : null;

  const isDefault =
    s.height === PAGE_DEFAULTS.height &&
    JSON.stringify(s.base) === JSON.stringify(BASE_DEFAULTS) &&
    (!entry || !s.props[entry.id] || !Object.keys(s.props[entry.id]).length);

  const setProp = (key, value) =>
    setState(st => {
      const current = propsFor(st, st.id);
      const patch = entry.adapter.onSet?.(key, value, current, entry.defaults) ?? { [key]: value };
      return { props: { ...st.props, [st.id]: { ...st.props[st.id], ...patch } } };
    });

  const visible = entry
    ? entry.controls.filter(c => !c.disabledWhen || !disabledFn(c.disabledWhen)(props))
    : [];

  const code = entry ? toJsx(entry, props, ctx) : '';

  return (
    <>
      <div className="cust-browse">
        <Picker />
      </div>
      <div className="pnl-body">
        {entry?.adapter.hint && <p className="tx-note">{entry.adapter.hint}</p>}
        {(entry?.adapter.fill || entry?.adapter.scroll) && <p className="tx-section">Area</p>}
        {(entry?.adapter.fill || entry?.adapter.scroll ? AREA_CONTROLS : []).map(c => (
          <Control key={c.key} c={c} value={s[c.key]} onChange={v => setState({ [c.key]: v })} />
        ))}
        <p className="tx-section">Text style</p>
        {BASE_CONTROLS.map(c => (
          <Control key={c.key} c={c} value={s.base[c.key]} onChange={v => setState(st => ({ base: { ...st.base, [c.key]: v } }))} />
        ))}
        {entry ? (
          <>
            <p className="tx-section">{entry.name}</p>
            {visible.map(c => (
              <Control key={`${c.key}-${c.type}`} c={c} value={props[c.key]} onChange={v => setProp(c.key, v)} />
            ))}
          </>
        ) : (
          <p className="pnl-empty">Pick a text animation from the list to see its settings.</p>
        )}
      </div>
      {showCode && entry && <pre className="pnl-code">{code}</pre>}
      <footer className="pnl-foot">
        <button
          disabled={isDefault}
          onClick={() =>
            setState(st => ({
              height: PAGE_DEFAULTS.height,
              base: BASE_DEFAULTS,
              props: entry ? { ...st.props, [entry.id]: {} } : st.props
            }))
          }
        >
          <Icon d={I.reset} />
          Reset
        </button>
        <button disabled={!entry} onClick={() => setState(st => ({ replay: st.replay + 1 }))}>
          <Icon d={I.replay} />
          Replay
        </button>
        <button disabled={!entry} aria-pressed={showCode} onClick={() => setShowCode(v => !v)}>
          Code
        </button>
        <button
          disabled={!entry}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied('Copied');
            } catch {
              setCopied('Failed');
            }
            setTimeout(() => setCopied(''), 1400);
          }}
        >
          <Icon d={I.copy} />
          {copied || 'Copy JSX'}
        </button>
      </footer>
    </>
  );
}

// ---------- background surface ----------
// One colour for what the background animation sits on: the bundle's backdrop, plus the
// background's own `backgroundColor` setting when it has one (Beams, Orb, Radar, …).

const SURFACE_KEY = 'core.surface.v1';
const bgApi = () => window.__coreBg;
const bgSubscribe = l => bgApi()?.subscribe(l) ?? (() => {});
const useBackground = () => useSyncExternalStore(bgSubscribe, () => bgApi()?.get() ?? null);
const loadSurface = () => {
  try {
    return localStorage.getItem(SURFACE_KEY);
  } catch {
    return null;
  }
};
const saveSurface = v => {
  try {
    if (v) localStorage.setItem(SURFACE_KEY, v);
    else localStorage.removeItem(SURFACE_KEY);
  } catch {
    /* storage unavailable */
  }
};
const fallbackBackdrop = id => (id === 'solid' ? '#5500ff' : '#120f17');

// Effective colour of the current background's own surface setting (null when it has none)
const ownSurface = s => {
  const defaults = bgApi()?.defaults(s.id);
  if (!defaults || !('backgroundColor' in defaults)) return null;
  return { value: (s.demo[s.id] ?? defaults).backgroundColor ?? defaults.backgroundColor, defaults };
};

const applySurface = color => {
  const api = bgApi();
  const s = api?.get();
  if (!s) return;
  const own = ownSurface(s);
  const patch = { backdrop: color };
  if (own) {
    const props = { ...(s.demo[s.id] ?? own.defaults), backgroundColor: color ?? own.defaults.backgroundColor };
    patch.demo = { ...s.demo, [s.id]: props };
  }
  api.set(patch);
  saveSurface(color);
};

function SurfaceRow() {
  const bg = useBackground();
  const id = bg?.id;

  // A chosen surface follows you to backgrounds that still use their default colour
  useEffect(() => {
    const surface = loadSurface();
    const s = bgApi()?.get();
    if (!surface || !s) return;
    const own = ownSurface(s);
    if (own && own.value === own.defaults.backgroundColor && own.value !== surface) applySurface(surface);
  }, [id]);

  if (!bg) return null;
  const own = ownSurface(bg);
  const value = own ? own.value : bg.backdrop ?? fallbackBackdrop(bg.id);
  const changed = !!bg.backdrop || (own && own.value !== own.defaults.backgroundColor);
  const label = bg.id === 'solid' ? 'Colour' : 'Surface';

  return (
    <div className="tx-surface">
      <label className="pnl-row" htmlFor="tx-surface" title="The colour behind the background animation">
        <span>{label}</span>
        <span className="pnl-color">
          <code>{String(value)}</code>
          <input id="tx-surface" type="color" value={toHex(value)} onChange={e => applySurface(e.target.value)} />
          <button
            className="cust-icon-btn"
            aria-label={`Reset ${label.toLowerCase()}`}
            title="Back to the default"
            disabled={!changed}
            onClick={e => {
              e.preventDefault();
              applySurface(null);
            }}
          >
            <Icon d={I.reset} />
          </button>
        </span>
      </label>
    </div>
  );
}

// ---------- unified customise panel ----------

// ---------- looks: share + saved ----------

const currentLook = () => {
  const s = state;
  return {
    v: 1,
    bg: getBackground(),
    text: { id: s.id, height: s.height, base: s.base, props: s.id ? s.props[s.id] ?? {} : {} }
  };
};

const applyLook = look => {
  if (!look || typeof look !== 'object') return;
  if (look.bg) applyBackground(look.bg);
  const t = look.text;
  if (t && (t.id === null || BY_ID[t.id]))
    setState(st => ({
      id: t.id,
      height: typeof t.height === 'number' ? t.height : st.height,
      base: { ...BASE_DEFAULTS, ...t.base },
      props: t.id ? { ...st.props, [t.id]: t.props ?? {} } : st.props
    }));
};

const copyText = async text => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const lookTitle = look => {
  const bgName = document.querySelector('#bg-picker .bgp-name')?.textContent || look.bg?.id || 'Background';
  const textName = look.text?.id ? BY_ID[look.text.id]?.name : null;
  return textName ? `${bgName} + ${textName}` : bgName;
};

function ShareButton() {
  const [status, setStatus] = useState('');
  return (
    <button
      className="bgp-tune cust-toggle"
      aria-label="Copy share link"
      title={status || 'Copy a link to this background + text'}
      data-status={status ? 'done' : undefined}
      onClick={async () => {
        const ok = await copyText(await lookUrl(currentLook()));
        setStatus(ok ? 'Link copied' : 'Copy failed');
        setTimeout(() => setStatus(''), 1600);
      }}
    >
      <Icon d={status === 'Link copied' ? I.check : I.share} />
      {status && <span className="cust-toast" role="status">{status}</span>}
    </button>
  );
}

function SavedLooks() {
  const [open, setOpen] = useState(false);
  const [looks, setLooks] = useState(loadSavedLooks);
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = e => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const update = list => {
    setLooks(list);
    storeSavedLooks(list);
  };

  const save = () => {
    const look = currentLook();
    const entry = { id: Date.now().toString(36), name: name.trim() || lookTitle(look), look };
    update([entry, ...looks]);
    setName('');
  };

  return (
    <div className="bgp cust-saved" ref={ref}>
      <button
        className="bgp-tune cust-toggle"
        aria-pressed={open}
        aria-haspopup="dialog"
        aria-label="Saved looks"
        title="Saved looks"
        onClick={() => setOpen(o => !o)}
      >
        <Icon d={I.saved} />
      </button>
      {open && (
        <div className="bgp-pop cust-saved-pop" role="dialog" aria-label="Saved looks">
          <form
            className="bgp-search cust-saved-new"
            onSubmit={e => {
              e.preventDefault();
              save();
            }}
          >
            <input placeholder="Name this look" value={name} maxLength={60} onChange={e => setName(e.target.value)} />
            <button type="submit" className="cust-icon-btn" aria-label="Save current look" title="Save current look">
              <Icon d={I.add} />
            </button>
          </form>
          <ul>
            {looks.map(l => (
              <li key={l.id} onClick={() => applyLook(l.look)} title="Load this look">
                <span>{l.name}</span>
                <button
                  className="cust-icon-btn"
                  aria-label={`Copy link to ${l.name}`}
                  title={copied === l.id ? 'Link copied' : 'Copy share link'}
                  onClick={async e => {
                    e.stopPropagation();
                    if (await copyText(await lookUrl(l.look))) {
                      setCopied(l.id);
                      setTimeout(() => setCopied(null), 1400);
                    }
                  }}
                >
                  <Icon d={copied === l.id ? I.check : I.link} />
                </button>
                <button
                  className="cust-icon-btn"
                  aria-label={`Delete ${l.name}`}
                  title="Delete"
                  onClick={e => {
                    e.stopPropagation();
                    update(looks.filter(x => x.id !== l.id));
                  }}
                >
                  <Icon d={I.trash} />
                </button>
              </li>
            ))}
            {!looks.length && <li className="bgp-empty">No saved looks yet. Name the current look and press +.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

function HeaderButton() {
  const s = useStore();
  return (
    <button
      className="bgp-tune cust-toggle"
      aria-pressed={s.panel}
      aria-label="Customise background and text"
      title="Customise background & text (Alt+C)"
      onClick={() => setState({ panel: !s.panel })}
    >
      <Icon d={I.tune} />
    </button>
  );
}

const TABS = [
  ['background', 'Background'],
  ['text', 'Text']
];

function CustomisePanel({ ctx, surfaceHost }) {
  const s = useStore();
  const bgTab = useRef(null);

  // The background picker + its settings panel come from the page's own bundle:
  // move their containers into the Background tab once (their React roots keep working)
  useEffect(() => {
    const picker = document.querySelector('#bg-picker');
    const panel = document.querySelector('#bg-panel');
    if (!bgTab.current || !picker) return;
    picker.classList.add('cust-browse');
    bgTab.current.append(picker, surfaceHost);
    if (panel) bgTab.current.append(panel);
  }, []);

  // Keep the background settings open exactly while the Background tab is showing
  useEffect(() => {
    const want = s.panel && s.tab === 'background';
    const tune = document.querySelector('#bg-picker .bgp-tune');
    if (tune && (tune.getAttribute('aria-pressed') === 'true') !== want) tune.click();
  }, [s.panel, s.tab]);

  return (
    <aside className="pnl glass cust-panel" aria-label="Customise" hidden={!s.panel}>
      <header className="pnl-head cust-head">
        <div className="segmented cust-tabs" role="tablist">
          {TABS.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={s.tab === id} aria-pressed={s.tab === id} onClick={() => setState({ tab: id })}>
              {label}
            </button>
          ))}
        </div>
        <button className="pnl-icon" aria-label="Close settings" onClick={() => setState({ panel: false })}>
          <Icon d={I.close} />
        </button>
      </header>
      <div className="cust-tab" ref={bgTab} hidden={s.tab !== 'background'} />
      {s.tab === 'text' && (
        <div className="cust-tab">
          <TextTab ctx={ctx} />
        </div>
      )}
    </aside>
  );
}

// ---------- Classic page: fixed columns ----------

function BackgroundColumn({ host, surfaceHost }) {
  // Move the bundle's settings panel next to its picker, then keep it open
  useEffect(() => {
    document.querySelector('#bg-picker')?.after(surfaceHost);
    const keepOpen = () => {
      const panel = document.querySelector('body > #bg-panel');
      if (panel) host.append(panel);
      const tune = document.querySelector('#bg-picker .bgp-tune');
      if (tune && tune.getAttribute('aria-pressed') !== 'true') tune.click();
    };
    keepOpen();
    // The bundle closes its panel on some actions (e.g. Esc); reopen it
    return window.__coreBg?.subscribe(s => {
      if (!s.panel) setTimeout(keepOpen);
    });
  }, [host]);
  return null;
}

// ---------- text area ----------

class Boundary extends ReactComponent {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }
  render() {
    return this.state.error ? <p className="tx-error">This animation failed to render: {String(this.state.error.message)}</p> : this.props.children;
  }
}

function Stage({ slot, ctx }) {
  const s = useStore();
  const entry = s.id ? BY_ID[s.id] : null;
  const props = entry ? propsFor(s, s.id) : null;

  useEffect(() => {
    slot.hidden = !entry;
    slot.style.setProperty('--tx-height', `${s.height}px`);
    const b = s.base;
    slot.style.fontFamily = b.fontFamily || '';
    slot.style.fontSize = `${b.fontSize}vh`;
    slot.style.fontWeight = b.fontWeight;
    slot.style.color = b.color;
    slot.style.letterSpacing = `${b.letterSpacing}em`;
    slot.style.setProperty('--tx-align', b.align);
    slot.classList.toggle('is-scroll', !!entry?.adapter.scroll);
    slot.classList.toggle('is-fill', !!entry?.adapter.fill);
    slot.dataset.anim = entry?.slug ?? '';
  }, [slot, entry, s.height, s.base]);

  // Components whose demos remount on change get a fresh instance per settings change
  const remountKey = useMemo(
    () => (entry?.adapter.remount ? JSON.stringify(props) : ''),
    [entry, props]
  );
  const [debouncedKey, setDebouncedKey] = useState(remountKey);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKey(remountKey), 220);
    return () => clearTimeout(t);
  }, [remountKey]);

  const key = entry ? `${entry.id}:${s.replay}:${debouncedKey}` : '';

  // Scroll-driven effects: play once by gliding the area to the text after each (re)mount
  useEffect(() => {
    slot.scrollTop = 0;
    if (!entry?.adapter.scroll) return undefined;
    let raf = 0;
    const t = setTimeout(() => {
      const text = slot.querySelector('.tx-stage--scroll > *');
      if (!text) return;
      const target = text.offsetTop + text.offsetHeight / 2 - slot.clientHeight / 2;
      const from = slot.scrollTop;
      const t0 = performance.now();
      const tick = now => {
        const k = Math.min(1, (now - t0) / 2200);
        slot.scrollTop = from + (target - from) * (1 - Math.pow(1 - k, 3));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, 400);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [entry, key, slot]);

  if (!entry) return null;
  const el = renderWithAdapter(entry.Component, entry.adapter, props, { ...ctx, height: s.height });
  return (
    <Boundary resetKey={key}>
      <div className={`tx-stage${entry.adapter.scroll ? ' tx-stage--scroll' : ''}`} key={key}>
        {el}
      </div>
    </Boundary>
  );
}

// ---------- mount ----------

function App({ buttonHost, panelHost, slot, layout, surfaceHost }) {
  const s = useStore();
  const isPanel = layout?.panel;
  const ctx = useMemo(() => ({ scrollRef: { current: slot }, slotRef: { current: slot } }), [slot]);

  useEffect(() => {
    document.documentElement.classList.toggle('tx-open', s.panel);
  }, [s.panel]);

  useEffect(() => {
    const onKey = e => {
      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        step(e.key === 'ArrowUp' ? -1 : 1);
      }
      if (e.altKey && e.code === 'KeyC' && !document.body.classList.contains('layout-panel')) {
        e.preventDefault();
        setState({ panel: !state.panel });
      }
      if (e.key === 'Escape' && state.panel) setState({ panel: false });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {createPortal(
        <>
          <SavedLooks />
          <ShareButton />
          {!isPanel && <HeaderButton />}
        </>,
        buttonHost
      )}
      {isPanel ? (
        <>
          <BackgroundColumn host={layout.bgHost} surfaceHost={surfaceHost} />
          {createPortal(<TextTab ctx={ctx} />, layout.textHost)}
        </>
      ) : (
        createPortal(<CustomisePanel ctx={ctx} surfaceHost={surfaceHost} />, panelHost)
      )}
      {createPortal(<SurfaceRow />, surfaceHost)}
      {createPortal(<Stage slot={slot} ctx={ctx} />, slot)}
    </>
  );
}

const start = () => {
  const aiInput = document.querySelector('.ai-input');
  const bgPicker = document.querySelector('#bg-picker');
  if (!aiInput || !bgPicker) return;

  const slot = document.createElement('div');
  slot.className = 'tx-slot';
  aiInput.parentNode.insertBefore(slot, aiInput);

  // The Classic page places these hosts in its own markup
  const panelLayout = document.body.classList.contains('layout-panel');
  let buttonHost = document.querySelector('#cust-button');
  if (!buttonHost) {
    buttonHost = document.createElement('div');
    buttonHost.id = 'cust-button';
    bgPicker.parentNode.insertBefore(buttonHost, bgPicker);
  }
  const layout = panelLayout
    ? { panel: true, bgHost: document.querySelector('#bg-column-body'), textHost: document.querySelector('#text-column-body') }
    : null;

  const surfaceHost = document.createElement('div');
  surfaceHost.id = 'bg-surface';

  const panelHost = document.createElement('div');
  panelHost.id = 'cust-panel';
  document.body.appendChild(panelHost);

  const rootEl = document.createElement('div');
  rootEl.id = 'tx-root';
  rootEl.hidden = true;
  document.body.appendChild(rootEl);

  createRoot(rootEl).render(
    <App buttonHost={buttonHost} panelHost={panelHost} slot={slot} layout={layout} surfaceHost={surfaceHost} />
  );

  // Restore background settings from the last visit, then apply a shared look if the URL has one
  persistBackground();
  takeLookFromUrl().then(applyLook);
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
