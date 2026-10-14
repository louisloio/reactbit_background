// Core appshell: React Bits backgrounds + text animations.
// Mounts with one React root (via portals):
//   - icon buttons in the header: Saved looks, Share, Customise
//   - one settings panel (.pnl) with Background | Text tabs
//   - the background into #bg-root and the text area above the AI input
//
// On the Classic page (body.layout-panel) the settings are always visible instead: Background and
// Text render into fixed columns, the header only gets Saved looks + Share, and the background +
// text area sit in the Chat AI drawer.
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { TEXT_ANIMATIONS } from './registry.js';
import { renderWithAdapter } from './adapters.jsx';
import {
  applyBackgroundLook,
  BackgroundStage,
  BG_BY_ID,
  BgBrowse,
  BgSettings,
  getBackgroundLook,
  getBg,
  stepBg,
  SurfaceRow
} from './backgrounds.jsx';
import { Boundary, BrowseRow, Control, copyText, disabledFn, I, Icon, jsxValue } from './ui.jsx';
import { loadSavedLooks, lookUrl, storeSavedLooks, takeLookFromUrl } from './looks.js';
import { applyGlowLook, getGlowLook, GlowTab } from './glow.jsx';
import { applyTrameLook, getTrameLook, keepWebGLFramesReadable, TrameLayer } from './trame.jsx';

// Before any background creates its WebGL context, so the pattern overlay can read its frames
keepWebGLFramesReadable();
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

// ---------- text picker (browse row of the Text tab) ----------

const TEXT_ITEMS = [{ id: null, name: 'None' }, ...TEXT_ANIMATIONS.map(t => ({ id: t.id, name: t.name }))];

function Picker() {
  const s = useStore();
  return (
    <BrowseRow
      className="tx-picker"
      items={TEXT_ITEMS}
      currentId={s.id}
      currentName={s.id ? BY_ID[s.id].name : 'No text'}
      icon={I.text}
      kind="text animation"
      onSelect={selectAnimation}
      onStep={step}
    />
  );
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
            {visible.map((c, i) => (
              <div key={`${c.key}-${c.type}`} title={c.description} className="tx-control">
                {c.extra && !visible[i - 1]?.extra && <p className="tx-section">More settings</p>}
                <Control c={c} value={props[c.key] ?? c.default} onChange={v => setProp(c.key, v)} />
              </div>
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

// ---------- unified customise panel ----------

// ---------- looks: share + saved ----------

const currentLook = () => {
  const s = state;
  return {
    v: 1,
    bg: getBackgroundLook(),
    glow: getGlowLook(),
    trame: getTrameLook(),
    text: { id: s.id, height: s.height, base: s.base, props: s.id ? s.props[s.id] ?? {} : {} }
  };
};

const applyLook = look => {
  if (!look || typeof look !== 'object') return;
  if (look.bg) applyBackgroundLook(look.bg);
  if (look.glow) applyGlowLook(look.glow);
  if (look.trame) applyTrameLook(look.trame);
  const t = look.text;
  if (t && (t.id === null || BY_ID[t.id]))
    setState(st => ({
      id: t.id,
      height: typeof t.height === 'number' ? t.height : st.height,
      base: { ...BASE_DEFAULTS, ...t.base },
      props: t.id ? { ...st.props, [t.id]: t.props ?? {} } : st.props
    }));
};

const lookTitle = look => {
  const bgName = BG_BY_ID[look.bg?.id]?.label ?? 'Background';
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
  ['text', 'Text'],
  ['glow', 'Glow']
];

function BackgroundTab() {
  return (
    <>
      <BgBrowse />
      <div id="bg-surface">
        <SurfaceRow />
      </div>
      <BgSettings />
    </>
  );
}

function CustomisePanel({ ctx }) {
  const s = useStore();

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
      {s.tab === 'background' && (
        <div className="cust-tab">
          <BackgroundTab />
        </div>
      )}
      {s.tab === 'text' && (
        <div className="cust-tab">
          <TextTab ctx={ctx} />
        </div>
      )}
      {s.tab === 'glow' && (
        <div className="cust-tab">
          <GlowTab />
        </div>
      )}
    </aside>
  );
}

// ---------- text area ----------

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

function App({ buttonHost, panelHost, slot, layout, bgRoot }) {
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
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        stepBg(e.key === 'ArrowLeft' ? -1 : 1);
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
          {createPortal(<BackgroundTab />, layout.bgHost)}
          {createPortal(<TextTab ctx={ctx} />, layout.textHost)}
          {layout.glowHost && createPortal(<GlowTab />, layout.glowHost)}
        </>
      ) : (
        createPortal(<CustomisePanel ctx={ctx} />, panelHost)
      )}
      {bgRoot &&
        createPortal(
          <>
            <BackgroundStage />
            <TrameLayer root={bgRoot} />
          </>,
          bgRoot
        )}
      {createPortal(<Stage slot={slot} ctx={ctx} />, slot)}
    </>
  );
}

const start = () => {
  const aiInput = document.querySelector('.ai-input');
  if (!aiInput) return;

  const slot = document.createElement('div');
  slot.className = 'tx-slot';
  aiInput.parentNode.insertBefore(slot, aiInput);

  // The Classic page places these hosts in its own markup
  const panelLayout = document.body.classList.contains('layout-panel');
  let buttonHost = document.querySelector('#cust-button');
  if (!buttonHost) {
    buttonHost = document.createElement('div');
    buttonHost.id = 'cust-button';
    document.querySelector('.header-actions')?.before(buttonHost);
  }
  const layout = panelLayout
    ? {
        panel: true,
        bgHost: document.querySelector('#bg-column-body'),
        textHost: document.querySelector('#text-column-body'),
        glowHost: document.querySelector('#glow-column-body')
      }
    : null;

  const panelHost = document.createElement('div');
  panelHost.id = 'cust-panel';
  document.body.appendChild(panelHost);

  const rootEl = document.createElement('div');
  rootEl.id = 'tx-root';
  rootEl.hidden = true;
  document.body.appendChild(rootEl);

  createRoot(rootEl).render(
    <App buttonHost={buttonHost} panelHost={panelHost} slot={slot} layout={layout} bgRoot={document.querySelector('#bg-root')} />
  );

  // Apply a shared look if the URL has one
  takeLookFromUrl().then(applyLook);
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
