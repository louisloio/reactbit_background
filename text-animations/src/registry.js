// Generated imports for every React Bits text animation, merged with adapters.
import ASCIIText from './components/ASCIIText/ASCIIText.jsx';
import BlurText from './components/BlurText/BlurText.jsx';
import CircularText from './components/CircularText/CircularText.jsx';
import CountUp from './components/CountUp/CountUp.jsx';
import CurvedLoop from './components/CurvedLoop/CurvedLoop.jsx';
import DecryptedText from './components/DecryptedText/DecryptedText.jsx';
import DepthText from './components/DepthText/DepthText.jsx';
import EchoText from './components/EchoText/EchoText.jsx';
import FallingText from './components/FallingText/FallingText.jsx';
import FoldText from './components/FoldText/FoldText.jsx';
import FuzzyText from './components/FuzzyText/FuzzyText.jsx';
import GlitchText from './components/GlitchText/GlitchText.jsx';
import GradientText from './components/GradientText/GradientText.jsx';
import MaskedHeading from './components/MaskedHeading/MaskedHeading.jsx';
import ParticleText from './components/ParticleText/ParticleText.jsx';
import RotatingText from './components/RotatingText/RotatingText.jsx';
import ScrambledText from './components/ScrambledText/ScrambledText.jsx';
import ScrollFloat from './components/ScrollFloat/ScrollFloat.jsx';
import ScrollReveal from './components/ScrollReveal/ScrollReveal.jsx';
import ScrollVelocity from './components/ScrollVelocity/ScrollVelocity.jsx';
import ShinyText from './components/ShinyText/ShinyText.jsx';
import Shuffle from './components/Shuffle/Shuffle.jsx';
import SplitFlapText from './components/SplitFlapText/SplitFlapText.jsx';
import SplitText from './components/SplitText/SplitText.jsx';
import StrokeText from './components/StrokeText/StrokeText.jsx';
import TechText from './components/TechText/TechText.jsx';
import TextCursor from './components/TextCursor/TextCursor.jsx';
import TextLoop from './components/TextLoop/TextLoop.jsx';
import TextPressure from './components/TextPressure/TextPressure.jsx';
import TextType from './components/TextType/TextType.jsx';
import TrueFocus from './components/TrueFocus/TrueFocus.jsx';
import VariableProximity from './components/VariableProximity/VariableProximity.jsx';
import WarpText from './components/WarpText/WarpText.jsx';

import GENERATED from './registry.generated.json';
import { ADAPTERS } from './adapters.jsx';

const COMPONENTS = {
  ASCIIText, BlurText, CircularText, CountUp, CurvedLoop, DecryptedText, DepthText, EchoText, FallingText,
  FoldText, FuzzyText, GlitchText, GradientText, MaskedHeading, ParticleText, RotatingText, ScrambledText,
  ScrollFloat, ScrollReveal, ScrollVelocity, ShinyText, Shuffle, SplitFlapText, SplitText, StrokeText, TechText,
  TextCursor, TextLoop, TextPressure, TextType, TrueFocus, VariableProximity, WarpText
};

const NAMES = { ASCIIText: 'ASCII Text', TextCursor: 'Text Cursor' };

// ---------- extra controls from each demo's props table ----------
// The demos' Customize boxes only expose some props; the props table documents all of them.
// Props that can't be edited from a panel (callbacks, refs, styles, nodes, objects) are skipped.

const SKIP_TYPE = /function|=>|ref|cssproperties|reactnode|elementtype|object|\{|\(/i;
const SKIP_NAME = /^(className|style|children|as|tag|key)$|ClassName$|^on[A-Z]|Ref$/;
const TEXT_KEYS = ['text', 'texts', 'words', 'label', 'sentence', 'marqueeText'];

const parseDefault = src => {
  if (src == null) return undefined;
  const t = String(src).trim();
  if (!t || t === '-' || t === 'undefined' || t === 'null' || /^none$/i.test(t)) return undefined;
  try {
    return new Function(`return (${t});`)();
  } catch {
    return undefined;
  }
};

const titleOf = name => name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());
const isColor = v => typeof v === 'string' && /^(#[0-9a-f]{3,8}|rgba?\()/i.test(v);

// "'a' | 'b'" → ['a', 'b'] (only when every member is a quoted literal)
const literalUnion = type => {
  const parts = type.split('|').map(x => x.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const vals = parts.map(x => x.match(/^['"`](.*)['"`]$/)?.[1]);
  return vals.every(v => v !== undefined) ? vals : null;
};

const rangeFor = (name, d) => {
  const v = typeof d === 'number' ? d : 0;
  const decimalsOf = n => (String(n).split('.')[1] ?? '').length;
  const step = Number.isInteger(v) && Math.abs(v) >= 2 ? 1 : v === 0 ? 0.01 : Math.max(0.001, 10 ** -Math.max(2, decimalsOf(v)));
  let max = v <= 0 ? 1 : v <= 1 ? 1 : Math.ceil(v * 4);
  if (/opacity|threshold|alpha/i.test(name)) max = 1;
  const min = v < 0 ? Math.floor(v * 4) : 0;
  return { min, max, step };
};

const extraControl = (prop, existing) => {
  const { name, type = '' } = prop;
  if (existing.has(name) || SKIP_NAME.test(name) || SKIP_TYPE.test(type)) return null;
  const d = parseDefault(prop.default);
  const base = { key: name, label: titleOf(name), description: prop.description, extra: true };
  const union = literalUnion(type);
  if (union) return { ...base, type: 'select', options: union.map(v => [v, titleOf(v)]), default: d ?? union[0] };
  if (/^boolean$/i.test(type)) return { ...base, type: 'switch', default: d ?? false };
  if (/^number$/i.test(type)) return { ...base, type: 'range', ...rangeFor(name, d), default: d ?? 0 };
  if (/string\[\]|array/i.test(type)) {
    if (Array.isArray(d) && d.length && d.every(isColor)) return { ...base, type: 'colors', editable: true, minItems: 1, default: d };
    return { ...base, type: 'list', default: Array.isArray(d) ? d : [] };
  }
  if (/string|number/i.test(type)) {
    if (isColor(d) || (/colou?r/i.test(name) && (d === undefined || isColor(d)))) return { ...base, type: 'color', default: d ?? '#ffffff' };
    if (typeof d === 'string' || typeof d === 'number' || d === undefined) return { ...base, type: 'text', default: d == null ? '' : String(d) };
  }
  return null;
};

// The component's own parameter list is the complete set (some props tables miss props); the props
// table adds types (e.g. option lists) and descriptions. Without a documented type, infer it from
// the actual default.
const inferType = d =>
  typeof d === 'boolean' ? 'boolean' : typeof d === 'number' ? 'number' : typeof d === 'string' ? 'string' : Array.isArray(d) ? 'string[]' : 'object';

const allProps = entry => {
  const docs = Object.fromEntries((entry.propTable ?? []).map(p => [p.name, p]));
  return (entry.componentProps ?? []).map(({ name, default: src }) => {
    const doc = docs[name];
    const actual = parseDefault(src);
    // Undocumented with no default: type unknown (often an object), so no control
    const type = doc?.type && !/^any$/i.test(doc.type) ? doc.type : src === undefined ? 'object' : inferType(actual);
    return { name, type, default: src ?? doc?.default, description: doc?.description };
  });
};

export const TEXT_ANIMATIONS = GENERATED.map(entry => {
  const adapter = { ...(ADAPTERS[entry.id] ?? {}) };
  const drop = new Set(adapter.drop ?? []);
  const generated = entry.controls.filter(c => !drop.has(c.key) && !drop.has(`${c.key}:${c.type}`));
  const extra = adapter.controls ?? [];
  const defaults = { ...entry.defaults, ...adapter.defaults };

  // Adapter controls win over generated ones with the same key and type
  const controls = [...extra];
  for (const c of generated) if (!extra.some(e => e.key === c.key && e.type === c.type)) controls.push(c);
  // Any string "text"-like default without a control gets a text box
  for (const key of TEXT_KEYS)
    if (typeof defaults[key] === 'string' && !controls.some(c => c.key === key))
      controls.unshift({ key, label: 'Text', type: 'text' });

  // Presets (from the demo's PRESETS): picking one resets to defaults + the preset, keeping your text
  const presetControl = controls.find(c => c.key === 'preset' && c.presets);
  if (presetControl) {
    const { presets } = presetControl;
    const own = adapter.onSet;
    adapter.onSet = (key, value, props, defs) => {
      if (key !== 'preset') return own?.(key, value, props, defs) ?? null;
      const preset = presets[value] ?? {};
      const keep = Object.fromEntries(TEXT_KEYS.filter(k => !(k in preset) && k in props).map(k => [k, props[k]]));
      return { ...defs, ...preset, ...keep, preset: value };
    };
    adapter.demoOnly = [...new Set([...(adapter.demoOnly ?? []), 'preset'])];
    if (!('preset' in defaults)) defaults.preset = presetControl.options[0]?.[0];
  }

  // Everything else the component documents. These aren't passed until changed (some components
  // treat "not set" specially); the control shows the documented default meanwhile.
  const handled = new Set([
    ...controls.map(c => c.key),
    ...Object.keys(defaults),
    ...(adapter.demoOnly ?? []),
    ...(adapter.skipProps ?? []),
    ...(adapter.children ? [adapter.children] : [])
  ]);
  for (const prop of allProps(entry)) {
    const c = extraControl(prop, handled);
    if (!c) continue;
    handled.add(c.key);
    controls.push(c);
  }

  return {
    id: entry.id,
    name: NAMES[entry.id] ?? entry.name,
    slug: entry.id.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
    Component: COMPONENTS[entry.id],
    defaults,
    // What the component itself would use (for Copy JSX), before page-specific adjustments
    componentDefaults: entry.defaults,
    controls,
    adapter
  };
});
