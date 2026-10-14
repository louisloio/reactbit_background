// Customise → Glow: every look setting of the AI input's Apple Intelligence-style glow.
// Settings live in localStorage and are applied as CSS variables / data attributes on <html>,
// which assets/appshell.css reads (defaults there match DEFAULTS below).
import { useState, useSyncExternalStore } from 'react';

import { Control, copyText, I, Icon } from './ui.jsx';

const KEY = 'core.glow.v1';

export const GLOW_DEFAULTS = {
  trigger: 'focus',
  colors: ['#0894ff', '#c959dd', '#ff2e54', '#ff9004', '#ffd23f'],
  spin: true,
  speed: 5,
  direction: 'normal',
  start: 0,
  edgeWidth: 2,
  edgeOpacity: 1,
  edgeBlur: 0,
  haloSize: 14,
  haloOffset: 6,
  haloBlur: 18,
  haloOpacity: 0.85,
  saturation: 1,
  blend: 'normal',
  fade: 0.6,
  bloom: true,
  bloomDuration: 1.4,
  breathe: true,
  breatheSpeed: 3.2,
  breatheDepth: 0.3
};

const PRESETS = {
  apple: { label: 'Apple Intelligence', colors: GLOW_DEFAULTS.colors },
  aurora: { label: 'Aurora', colors: ['#5eead4', '#38bdf8', '#818cf8', '#c084fc'] },
  sunset: { label: 'Sunset', colors: ['#f97316', '#ef4444', '#ec4899', '#f59e0b'] },
  ocean: { label: 'Ocean', colors: ['#0ea5e9', '#2563eb', '#14b8a6', '#06b6d4'] },
  neon: { label: 'Neon', colors: ['#22d3ee', '#a3e635', '#f472b6', '#facc15'] },
  mono: { label: 'Mono', colors: ['#ffffff', '#9ca3af', '#4b5563', '#e5e7eb'] }
};

const CONTROLS = [
  {
    section: 'Glow',
    items: [
      {
        key: 'trigger',
        label: 'Show',
        type: 'select',
        options: [
          ['focus', 'When typing (focus)'],
          ['hover', 'On hover or focus'],
          ['always', 'Always'],
          ['off', 'Never']
        ]
      },
      { key: 'preset', label: 'Colour Preset', type: 'select', options: Object.entries(PRESETS).map(([k, p]) => [k, p.label]) },
      { key: 'colors', label: 'Colours', type: 'colors', editable: true, minItems: 2, maxItems: 8 },
      { key: 'saturation', label: 'Saturation', type: 'range', min: 0, max: 2, step: 0.05 },
      {
        key: 'blend',
        label: 'Blend',
        type: 'select',
        options: [
          ['normal', 'Normal'],
          ['screen', 'Screen'],
          ['plus-lighter', 'Add (plus lighter)'],
          ['overlay', 'Overlay'],
          ['soft-light', 'Soft light'],
          ['color-dodge', 'Color dodge']
        ]
      },
      { key: 'fade', label: 'Fade In / Out', type: 'range', min: 0, max: 3, step: 0.05, unit: 's' }
    ]
  },
  {
    section: 'Rotation',
    items: [
      { key: 'spin', label: 'Rotate Colours', type: 'switch' },
      { key: 'speed', label: 'Turn Time', type: 'range', min: 0.5, max: 30, step: 0.5, unit: 's', when: s => s.spin },
      {
        key: 'direction',
        label: 'Direction',
        type: 'select',
        options: [
          ['normal', 'Clockwise'],
          ['reverse', 'Counter-clockwise'],
          ['alternate', 'Back and forth']
        ],
        when: s => s.spin
      },
      { key: 'start', label: 'Start Angle', type: 'range', min: 0, max: 360, step: 1, unit: '°' }
    ]
  },
  {
    section: 'Edge',
    items: [
      { key: 'edgeWidth', label: 'Width', type: 'range', min: 0, max: 12, step: 0.5, unit: 'px' },
      { key: 'edgeOpacity', label: 'Opacity', type: 'range', min: 0, max: 1, step: 0.05 },
      { key: 'edgeBlur', label: 'Softness', type: 'range', min: 0, max: 8, step: 0.5, unit: 'px' }
    ]
  },
  {
    section: 'Halo',
    items: [
      { key: 'haloSize', label: 'Size', type: 'range', min: 0, max: 80, step: 1, unit: 'px' },
      { key: 'haloOffset', label: 'Distance', type: 'range', min: -20, max: 60, step: 1, unit: 'px' },
      { key: 'haloBlur', label: 'Blur', type: 'range', min: 0, max: 80, step: 1, unit: 'px' },
      { key: 'haloOpacity', label: 'Opacity', type: 'range', min: 0, max: 1, step: 0.05 }
    ]
  },
  {
    section: 'Motion',
    items: [
      { key: 'bloom', label: 'Bloom When It Appears', type: 'switch' },
      { key: 'bloomDuration', label: 'Bloom Time', type: 'range', min: 0.2, max: 4, step: 0.1, unit: 's', when: s => s.bloom },
      { key: 'breathe', label: 'Breathe', type: 'switch' },
      { key: 'breatheSpeed', label: 'Breath Time', type: 'range', min: 0.5, max: 12, step: 0.1, unit: 's', when: s => s.breathe },
      { key: 'breatheDepth', label: 'Breath Depth', type: 'range', min: 0, max: 1, step: 0.05, when: s => s.breathe }
    ]
  }
];

// ---------- store ----------

const read = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    return saved && typeof saved === 'object' ? { ...GLOW_DEFAULTS, ...saved } : { ...GLOW_DEFAULTS };
  } catch {
    return { ...GLOW_DEFAULTS };
  }
};

let glow = read();
const listeners = new Set();

const cssVars = g => {
  const colors = g.colors?.length ? g.colors : GLOW_DEFAULTS.colors;
  const halo = [
    g.bloom ? `ai-glow-bloom ${g.bloomDuration}s ease-out both` : null,
    g.breathe ? `ai-glow-breathe ${g.breatheSpeed}s ease-in-out ${g.bloom ? g.bloomDuration : 0}s infinite` : null
  ].filter(Boolean);
  return {
    // repeat the first colour at the end so the rotating gradient has no seam
    '--glow-colors': [...colors, colors[0]].join(', '),
    '--glow-speed': `${g.speed}s`,
    '--glow-direction': g.direction,
    '--glow-start': `${g.start}deg`,
    '--glow-edge-width': `${g.edgeWidth}px`,
    '--glow-edge-opacity': g.edgeOpacity,
    '--glow-edge-blur': `${g.edgeBlur}px`,
    '--glow-halo-size': `${g.haloSize}px`,
    '--glow-halo-offset': `${g.haloOffset}px`,
    '--glow-halo-blur': `${g.haloBlur}px`,
    '--glow-halo-opacity': g.haloOpacity,
    '--glow-saturation': g.saturation,
    '--glow-blend': g.blend,
    '--glow-fade': `${g.fade}s`,
    '--glow-breathe-depth': g.breatheDepth,
    '--glow-halo-animation': halo.length ? halo.join(', ') : 'none'
  };
};

const apply = () => {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(cssVars(glow))) root.style.setProperty(k, String(v));
  root.dataset.glowTrigger = glow.trigger;
  root.dataset.glowSpin = glow.spin ? 'on' : 'off';
};
apply();

export const setGlow = patch => {
  glow = { ...glow, ...(typeof patch === 'function' ? patch(glow) : patch) };
  try {
    localStorage.setItem(KEY, JSON.stringify(glow));
  } catch {
    /* storage unavailable */
  }
  apply();
  listeners.forEach(l => l());
};
export const getGlow = () => glow;
const useGlow = () =>
  useSyncExternalStore(
    l => (listeners.add(l), () => listeners.delete(l)),
    () => glow
  );

// For looks / share links: only what differs from the defaults
export const getGlowLook = () =>
  Object.fromEntries(Object.entries(glow).filter(([k, v]) => k !== 'preset' && JSON.stringify(v) !== JSON.stringify(GLOW_DEFAULTS[k])));
export const applyGlowLook = look => {
  if (!look || typeof look !== 'object') return;
  const known = Object.fromEntries(Object.entries(look).filter(([k]) => k in GLOW_DEFAULTS));
  setGlow({ ...GLOW_DEFAULTS, ...known });
};

// ---------- tab ----------

const cssText = () =>
  `:root {\n${Object.entries(cssVars(glow))
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}\nhtml { /* data-glow-trigger="${glow.trigger}" data-glow-spin="${glow.spin ? 'on' : 'off'}" */ }`;

export function GlowTab() {
  const g = useGlow();
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState('');
  const isDefault = !Object.keys(getGlowLook()).length;
  const preset = Object.entries(PRESETS).find(([, p]) => JSON.stringify(p.colors) === JSON.stringify(g.colors))?.[0];

  const onChange = (key, value) => {
    if (key === 'preset') setGlow({ colors: [...PRESETS[value].colors] });
    else setGlow({ [key]: value });
  };

  return (
    <>
      <div className="pnl-body">
        {g.trigger === 'focus' && <p className="tx-note">Click into the question box to see the glow, or set Show to Always while you tune it.</p>}
        {CONTROLS.map(group => (
          <div key={group.section}>
            <p className="tx-section">{group.section}</p>
            {group.items
              .filter(c => !c.when || c.when(g))
              .map(c => (
                <Control key={c.key} idPrefix="glow" c={c} value={c.key === 'preset' ? preset : g[c.key]} onChange={v => onChange(c.key, v)} />
              ))}
          </div>
        ))}
      </div>
      {showCode && <pre className="pnl-code">{cssText()}</pre>}
      <footer className="pnl-foot">
        <button disabled={isDefault} onClick={() => setGlow({ ...GLOW_DEFAULTS })}>
          <Icon d={I.reset} />
          Reset
        </button>
        <button aria-pressed={showCode} onClick={() => setShowCode(v => !v)}>
          Show CSS
        </button>
        <button
          onClick={async () => {
            setCopied((await copyText(cssText())) ? 'Copied' : 'Failed');
            setTimeout(() => setCopied(''), 1400);
          }}
        >
          <Icon d={I.copy} />
          {copied || 'Copy CSS'}
        </button>
      </footer>
    </>
  );
}
