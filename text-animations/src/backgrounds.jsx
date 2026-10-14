// Background system: the React Bits backgrounds (+ a few effects) from Background Studio's registry,
// rendered into #bg-root, with their full settings, a Surface colour, and URL / storage sync.
//
// State lives in a small store (persisted in localStorage) and the selected id is mirrored in the
// URL hash (#letter-glitch) so links keep pointing at a background, as they always did.
import { lazy, Suspense, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import { BACKGROUNDS } from './bg-registry.js';
import { Boundary, BrowseRow, Control, copyText, I, Icon, jsxValue, toHex } from './ui.jsx';

// ---------- registry ----------

// Background Studio also lists these (from React Bits' Animations); shown as "Effects"
const EFFECT_IDS = new Set([
  'antigravity',
  'click-spark',
  'ghost-cursor',
  'image-trail',
  'laser-flow',
  'noise',
  'ribbons',
  'splash-cursor'
]);

export const SOLID = { id: 'solid', label: 'Solid colour', props: [] };
const byLabel = (a, b) => a.label.localeCompare(b.label);
const sorted = BACKGROUNDS.slice().sort(byLabel);
export const BG_LIST = [
  SOLID,
  ...sorted.filter(b => !EFFECT_IDS.has(b.id)),
  ...sorted.filter(b => EFFECT_IDS.has(b.id))
];
export const BG_BY_ID = Object.fromEntries(BG_LIST.map(b => [b.id, b]));

const norm = s => String(s ?? '').replace(/[^a-z0-9]/gi, '').toLowerCase();
const BY_NORM = Object.fromEntries(BG_LIST.flatMap(b => [[norm(b.id), b.id], [norm(b.label), b.id]]));
// Accepts current ids ('letter-glitch') and older ones ('LetterGlitch', '#letter-glitch')
export const resolveBgId = raw => (BG_BY_ID[raw] ? raw : BY_NORM[norm(raw)] ?? null);

export const bgDefaults = bg => Object.fromEntries((bg?.props ?? []).map(p => [p.name, p.default]));
const hasOwnSurface = bg => (bg?.props ?? []).some(p => p.name === 'backgroundColor' && p.type === 'color');

// Studio prop → panel control
const toControl = p => {
  switch (p.type) {
    case 'number':
      return { key: p.name, label: p.label, type: 'range', min: p.min ?? 0, max: p.max ?? 1, step: p.step ?? 0.01 };
    case 'boolean':
      return { key: p.name, label: p.label, type: 'switch' };
    case 'color':
      return { key: p.name, label: p.label, type: 'color' };
    case 'text':
      return { key: p.name, label: p.label, type: 'text' };
    case 'colorArray':
      return { key: p.name, label: p.label, type: 'colors', editable: true, minItems: p.minItems ?? 1, maxItems: p.maxItems };
    case 'select':
      return {
        key: p.name,
        label: p.label,
        type: 'select',
        options: (p.options ?? []).map(o => (o && typeof o === 'object' ? [o.value, o.label ?? String(o.value)] : [o, String(o)]))
      };
    default:
      return null;
  }
};
const CONTROLS = Object.fromEntries(BG_LIST.map(b => [b.id, (b.props ?? []).map(toControl).filter(Boolean)]));

// ---------- store ----------

const KEY = 'core.background.v2';
const OLD_KEY = 'core.background.v1';
const SURFACE_KEY = 'core.surface.v1';

const read = key => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
};

const load = () => {
  const saved = read(KEY) ?? {};
  // From the previous (precompiled) background system, only the backdrop carries over
  const old = saved.id ? null : read(OLD_KEY);
  const fromHash = resolveBgId(location.hash.slice(1));
  return {
    id: fromHash ?? resolveBgId(saved.id) ?? 'solid',
    backdrop: saved.backdrop ?? old?.backdrop ?? null,
    props: saved.props && typeof saved.props === 'object' ? saved.props : {},
    rev: 0
  };
};

let bg = load();
const listeners = new Set();

export const backdropOf = s => s.backdrop ?? (s.id === 'solid' ? '#5500ff' : '#120f17');

const sync = () => {
  document.documentElement.style.setProperty('--body-bg', backdropOf(bg));
  const hash = bg.id === 'solid' ? '' : `#${bg.id}`;
  if (location.hash !== hash) {
    const url = location.pathname + location.search + hash;
    try {
      history.replaceState(history.state, '', url);
    } catch {
      /* ignore */
    }
  }
};

export const setBg = patch => {
  bg = { ...bg, ...(typeof patch === 'function' ? patch(bg) : patch) };
  try {
    const { rev, ...persist } = bg;
    localStorage.setItem(KEY, JSON.stringify(persist));
  } catch {
    /* storage unavailable */
  }
  sync();
  listeners.forEach(l => l());
};
export const getBg = () => bg;
export const useBg = () =>
  useSyncExternalStore(
    l => (listeners.add(l), () => listeners.delete(l)),
    () => bg
  );

sync();
window.addEventListener('hashchange', () => {
  const id = resolveBgId(location.hash.slice(1));
  if (id && id !== bg.id) selectBg(id);
});

export const customOf = (s, id = s.id) => s.props[id] ?? {};
export const propsOf = (s, id = s.id) => ({ ...bgDefaults(BG_BY_ID[id]), ...customOf(s, id) });

// ---------- surface ----------
// One colour for what the animation sits on: the page backdrop, plus the background's own
// `backgroundColor` setting when it has one. It follows you to other backgrounds.

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

const withSurface = (s, id, color) => {
  if (!hasOwnSurface(BG_BY_ID[id])) return s.props;
  const custom = { ...customOf(s, id) };
  if (color) custom.backgroundColor = color;
  else delete custom.backgroundColor;
  return { ...s.props, [id]: custom };
};

// Changing the Surface also updates every background still on the previous Surface colour
// (those it set itself); colours you picked on a background's own Background row are kept.
export const applySurface = color => {
  const previous = loadSurface();
  setBg(s => {
    let props = withSurface(s, s.id, color);
    if (previous)
      for (const [id, custom] of Object.entries(props))
        if (id !== s.id && custom?.backgroundColor === previous) props = withSurface({ ...s, props }, id, color);
    return { backdrop: color, props };
  });
  saveSurface(color);
};

export function selectBg(id) {
  if (!BG_BY_ID[id]) return;
  setBg(s => {
    const surface = loadSurface();
    const follows = surface && hasOwnSurface(BG_BY_ID[id]) && customOf(s, id).backgroundColor === undefined;
    return { id, props: follows ? withSurface(s, id, surface) : s.props };
  });
}

export const stepBg = dir => {
  const i = BG_LIST.findIndex(b => b.id === bg.id);
  selectBg(BG_LIST[(i + dir + BG_LIST.length) % BG_LIST.length].id);
};

export function SurfaceRow() {
  const s = useBg();
  const entry = BG_BY_ID[s.id];
  const own = hasOwnSurface(entry);
  const value = own ? propsOf(s).backgroundColor : backdropOf(s);
  const changed = !!s.backdrop || (own && customOf(s).backgroundColor !== undefined);
  const label = s.id === 'solid' ? 'Colour' : 'Surface';
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

// ---------- picker + settings ----------

const PICKER_ITEMS = BG_LIST.map(b => ({
  id: b.id,
  name: b.label,
  group: b.id === 'solid' ? null : EFFECT_IDS.has(b.id) ? 'Effects' : 'Backgrounds'
}));

export function BgBrowse() {
  const s = useBg();
  return (
    <div className="cust-browse bg-browse">
      <BrowseRow
        items={PICKER_ITEMS}
        currentId={s.id}
        currentName={BG_BY_ID[s.id]?.label ?? 'Background'}
        icon={I.image}
        kind="background"
        onSelect={selectBg}
        onStep={stepBg}
      />
    </div>
  );
}

const componentName = entry => entry.label.replace(/[^a-z0-9]/gi, '');

export const bgJsx = s => {
  const entry = BG_BY_ID[s.id];
  if (!entry || entry.id === 'solid') return '';
  const lines = Object.entries(customOf(s)).map(([k, v]) => (v === true ? `  ${k}` : `  ${k}=${jsxValue(v)}`));
  return `<${componentName(entry)}${lines.length ? `\n${lines.join('\n')}\n` : ' '}/>`;
};

export function BgSettings() {
  const s = useBg();
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState('');
  const entry = BG_BY_ID[s.id];
  const controls = CONTROLS[s.id] ?? [];
  const props = propsOf(s);
  const custom = customOf(s);
  const isDefault = !Object.keys(custom).length;
  const code = bgJsx(s);

  const setProp = (key, value) =>
    setBg(st => {
      const next = { ...customOf(st), [key]: value };
      const def = bgDefaults(BG_BY_ID[st.id])[key];
      if (JSON.stringify(value) === JSON.stringify(def)) delete next[key];
      return { props: { ...st.props, [st.id]: next } };
    });

  return (
    <>
      <div className="pnl-body">
        {controls.length ? (
          controls.map(c => <Control key={c.key} idPrefix="bg" c={c} value={props[c.key]} onChange={v => setProp(c.key, v)} />)
        ) : (
          <p className="pnl-empty">
            {s.id === 'solid' ? 'A plain colour. Set it with the Colour row above.' : 'This background has no settings.'}
          </p>
        )}
      </div>
      {showCode && entry?.id !== 'solid' && <pre className="pnl-code">{code}</pre>}
      <footer className="pnl-foot">
        <button
          disabled={isDefault}
          onClick={() => setBg(st => ({ props: { ...st.props, [st.id]: {} }, rev: st.rev + 1 }))}
        >
          <Icon d={I.reset} />
          Reset
        </button>
        <button disabled={s.id === 'solid'} aria-pressed={showCode} onClick={() => setShowCode(v => !v)}>
          Show code
        </button>
        <button
          disabled={s.id === 'solid'}
          onClick={async () => {
            setCopied((await copyText(code)) ? 'Copied' : 'Failed');
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

// ---------- renderer ----------

const lazyCache = new Map();
const lazyFor = entry => {
  if (!lazyCache.has(entry.id)) lazyCache.set(entry.id, lazy(entry.component));
  return lazyCache.get(entry.id);
};

export function BackgroundStage() {
  const s = useBg();
  const entry = BG_BY_ID[s.id];
  const props = useMemo(() => (entry ? { ...propsOf(s), ...entry.fixedProps } : null), [s, entry]);

  // Some backgrounds only read their props when they mount: remount them (debounced) on change
  const remountKey = entry?.forceRemountOnPropChange ? JSON.stringify(customOf(s)) : '';
  const [debounced, setDebounced] = useState(remountKey);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(remountKey), 250);
    return () => clearTimeout(t);
  }, [remountKey]);

  if (!entry || entry.id === 'solid' || !entry.component) return null;
  const Component = lazyFor(entry);
  const key = `${entry.id}:${s.rev}:${debounced}`;
  return (
    <Boundary resetKey={key} label={entry.label}>
      <div key={key} className="bg-stage" style={entry.wrapperStyle}>
        <Suspense fallback={null}>
          <Component {...props} />
        </Suspense>
      </div>
    </Boundary>
  );
}

// ---------- looks (share links / saved looks) ----------

export const getBackgroundLook = () => {
  const out = { id: bg.id };
  if (bg.backdrop) out.backdrop = bg.backdrop;
  const custom = customOf(bg);
  if (Object.keys(custom).length) out.props = custom;
  return out;
};

export const applyBackgroundLook = look => {
  const id = resolveBgId(look?.id);
  if (!id) return;
  // Keep only settings this background still has (older looks may name removed ones)
  const known = new Set((BG_BY_ID[id].props ?? []).map(p => p.name));
  const props = Object.fromEntries(Object.entries(look.props ?? {}).filter(([k]) => known.has(k)));
  setBg(s => ({ id, backdrop: look.backdrop ?? null, props: { ...s.props, [id]: props }, rev: s.rev + 1 }));
};
