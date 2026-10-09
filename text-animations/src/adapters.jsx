// Per-component glue between the generated registry (demo defaults + controls)
// and how each React Bits component actually wants to be rendered.
//
// Each adapter may provide:
//   defaults   extra / overridden default values
//   controls   extra controls, placed before the generated ones
//   drop       generated control keys to remove
//   demoOnly   state keys that are not real component props (kept out of render + JSX)
//   remount    true → remount the component whenever a prop changes (demos do this with key={key})
//   children   state key whose value is rendered as children instead of a prop
//   map        (props, ctx) => props actually passed to the component
//   wrap       (element, props) => element, for demo framing (e.g. RotatingText prefix)
//   onSet      (key, value, props) => patch, for controls that change several props at once
//   scroll     true → the text area becomes a scroll container for ScrollTrigger-driven effects
//   fill       true → the component fills its parent's height (canvas / SVG), so it gets a fixed-height stage
//   hint       a short line shown at the top of the panel
import { createElement } from 'react';

const listControl = (key, label) => ({ key, label, type: 'list' });

const ASCII_PRESETS = {
  classic: {},
  terminal: { charset: ' .:-=+*#%@', colors: ['#b8f5c8', '#5ee08a', '#1f9d55'], blocks: 0, chroma: 0.3, hueShift: 0, asciiFontSize: 10 },
  blocks: { charset: ' ░▒▓█', colors: ['#ffffff', '#d4d4d8', '#a1a1aa'], blocks: 0.2, hueShift: 0, chroma: 0.6 },
  binary: { charset: ' 01', colors: ['#ffffff', '#bae6fd', '#38bdf8'], blocks: 0.35, hueShift: 0.4, asciiFontSize: 9 },
  mono: { colors: ['#ffffff', '#e4e4e7', '#a1a1aa'], blocks: 0.15, chroma: 0, hueShift: 0, waves: 0.6 }
};

const MASKED_MEDIA = {
  video: 'https://reactbits.dev/assets/video/masked-heading.mp4',
  image: 'https://images.unsplash.com/photo-1500673587002-1d2548cfba1b?q=80&w=1600&auto=format&fit=crop'
};

export const ADAPTERS = {
  ASCIIText: { fill: true,
    defaults: { textScale: 1.8, asciiFontSize: 4 },
    controls: [
      {
        key: 'preset',
        label: 'Preset',
        type: 'select',
        options: Object.keys(ASCII_PRESETS).map(k => [k, k[0].toUpperCase() + k.slice(1)])
      },
      { key: 'colors', label: 'Colors', type: 'colors' },
      { key: 'textColor', label: 'Text Color', type: 'color' }
    ],
    demoOnly: ['preset'],
    onSet: (key, value, props, defaults) =>
      key === 'preset' ? { ...defaults, ...ASCII_PRESETS[value], text: props.text, preset: value } : null
  },

  BlurText: { remount: true },

  CircularText: {
    defaults: { size: 96 },
    controls: [{ key: 'size', label: 'Size', type: 'range', min: 60, max: 320, step: 4, unit: 'px' }],
    demoOnly: ['size'],
    wrap: (el, p) => (
      <div className="tx-circular" style={{ '--tx-circle': p.size }}>
        {el}
      </div>
    )
  },

  CountUp: { remount: true },

  CurvedLoop: { remount: true, defaults: { curveAmount: 60 } },

  DecryptedText: {
    remount: true,
    defaults: { text: 'Hacking into the mainframe...' },
    controls: [{ key: 'text', label: 'Text', type: 'text' }]
  },

  EchoText: {
    remount: true,
    defaults: { tintEnabled: true },
    drop: ['tint:switch'],
    controls: [{ key: 'tintEnabled', label: 'Tint Echoes', type: 'switch' }],
    demoOnly: ['tintEnabled'],
    map: p => ({ ...p, tint: p.tintEnabled ? p.tint : false })
  },

  FallingText: { fill: true,
    remount: true,
    defaults: {
      text: 'React Bits is a library of animated and interactive React components.',
      highlightWords: ['React', 'Bits', 'animated', 'components'],
      fontSize: '1.4rem'
    },
    controls: [
      { key: 'text', label: 'Text', type: 'text' },
      listControl('highlightWords', 'Highlight Words'),
      { key: 'fontSize', label: 'Font Size', type: 'text' }
    ],
    map: p => ({ ...p, highlightClass: 'highlighted' })
  },

  FoldText: { remount: true },

  FuzzyText: {
    defaults: { text: 'Core', fontSize: 72, color: '#ffffff' },
    controls: [
      { key: 'text', label: 'Text', type: 'text' },
      { key: 'color', label: 'Color', type: 'color' },
      { key: 'fontSize', label: 'Font Size', type: 'range', min: 16, max: 200, step: 2, unit: 'px' }
    ],
    children: 'text',
    remount: true
  },

  GlitchText: {
    remount: true,
    defaults: { text: 'React Bits', fontSize: 64 },
    controls: [
      { key: 'text', label: 'Text', type: 'text' },
      { key: 'fontSize', label: 'Font Size', type: 'range', min: 16, max: 200, step: 2, unit: 'px' }
    ],
    demoOnly: ['fontSize'],
    children: 'text',
    wrap: (el, p) => (
      <div className="tx-glitch" style={{ '--tx-glitch-size': `${p.fontSize}px` }}>
        {el}
      </div>
    ),
    hint: 'The glitch slices are filled with the page colour, so they blend best on a solid background.'
  },

  GradientText: {
    defaults: { text: 'Gradient Magic' },
    controls: [
      { key: 'text', label: 'Text', type: 'text' },
      { key: 'colors', label: 'Colors', type: 'colors' }
    ],
    children: 'text'
  },

  MaskedHeading: {
    remount: true,
    defaults: { mediaType: 'image', textScale: 0.06 },
    controls: [{ key: 'text', label: 'Custom Text', type: 'text' }],
    map: p => ({ ...p, src: MASKED_MEDIA[p.mediaType] ?? MASKED_MEDIA.image })
  },

  ParticleText: { fill: true, remount: true },

  RotatingText: {
    remount: true,
    defaults: { prefix: 'Creative', texts: ['thinking', 'coding', 'components!'], pillColor: '#ffffff', pillTextColor: '#120f17' },
    controls: [
      { key: 'prefix', label: 'Prefix', type: 'text' },
      listControl('texts', 'Words'),
      { key: 'pillColor', label: 'Pill Color', type: 'color' },
      { key: 'pillTextColor', label: 'Pill Text', type: 'color' }
    ],
    demoOnly: ['prefix', 'pillColor', 'pillTextColor'],
    map: p => ({
      ...p,
      mainClassName: 'tx-rotating-main',
      splitLevelClassName: 'tx-rotating-split',
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '-120%' },
      transition: { type: 'spring', damping: 30, stiffness: 400 }
    }),
    wrap: (el, p) => (
      <div className="tx-rotating" style={{ '--tx-pill': p.pillColor, '--tx-pill-text': p.pillTextColor }}>
        {p.prefix ? <span>{p.prefix}&nbsp;</span> : null}
        {el}
      </div>
    )
  },

  ScrambledText: {
    defaults: { text: 'Hover over me to scramble the letters.' },
    controls: [{ key: 'text', label: 'Text', type: 'text' }],
    children: 'text',
    remount: true
  },

  ScrollFloat: {
    remount: true,
    scroll: true,
    defaults: { text: 'React Bits' },
    controls: [{ key: 'text', label: 'Text', type: 'text' }],
    children: 'text',
    map: (p, ctx) => ({ ...p, animationDuration: p.duration, scrollContainerRef: ctx.scrollRef }),
    demoOnly: ['duration'],
    hint: 'Scroll inside the text area to play the animation.'
  },

  ScrollReveal: {
    remount: true,
    scroll: true,
    defaults: { text: 'Words come alive as you scroll.' },
    controls: [{ key: 'text', label: 'Text', type: 'text' }],
    children: 'text',
    map: (p, ctx) => ({ ...p, scrollContainerRef: ctx.scrollRef }),
    hint: 'Scroll inside the text area to play the animation.'
  },

  ScrollVelocity: {
    defaults: { texts: ['React Bits', 'Scroll Down'] },
    controls: [listControl('texts', 'Rows')],
    remount: true
  },

  ShinyText: {
    defaults: { text: 'Shiny Text Effect' },
    controls: [{ key: 'text', label: 'Text', type: 'text' }]
  },

  Shuffle: {
    remount: true,
    defaults: { text: 'REACT BITS' },
    controls: [{ key: 'text', label: 'Text', type: 'text' }],
    map: p => ({ ...p, rootMargin: '0px' })
  },

  SplitFlapText: {
    drop: ['words'],
    controls: [listControl('words', 'Words')]
  },

  SplitText: {
    remount: true,
    drop: ['showCallback'],
    demoOnly: ['showCallback'],
    map: p => ({ ...p, rootMargin: '0px' })
  },

  StrokeText: { remount: true },

  TechText: { fill: true, remount: false },

  TextLoop: {
    fill: true,
    defaults: { shape: 'line' },
    // The SVG is 1200×520: a straight line reads best at natural size (cropped to the middle band),
    // curved shapes are scaled down to fit the whole path in the area
    wrap: (el, p) => <div className={`tx-loop tx-loop--${p.shape === 'line' ? 'band' : 'fit'}`}>{el}</div>
  },

  TextCursor: { fill: true, remount: true, hint: 'Move the pointer over the text area.' },

  TextPressure: { fill: true,
    remount: true,
    defaults: { minFontSize: 24 },
    wrap: (el, p, ctx) => (
      <div className="tx-pressure" style={{ width: Math.round(ctx.height * Math.max(1, Array.from(p.text).length) * 0.55) }}>
        {el}
      </div>
    )
  },

  TextType: {
    remount: true,
    controls: [listControl('texts', 'Sentences')],
    demoOnly: ['texts', 'variableSpeedEnabled', 'variableSpeedMin', 'variableSpeedMax'],
    map: p => ({
      ...p,
      text: p.texts,
      variableSpeed: p.variableSpeedEnabled ? { min: p.variableSpeedMin, max: p.variableSpeedMax } : undefined
    })
  },

  TrueFocus: {
    defaults: { sentence: 'True Focus', glowColor: '#5227ff99' },
    controls: [
      { key: 'sentence', label: 'Sentence', type: 'text' },
      { key: 'glowColor', label: 'Glow Color', type: 'color' }
    ],
    remount: true
  },

  VariableProximity: {
    defaults: {
      label: 'Hover me and watch the weight change',
      fromFontVariationSettings: "'wght' 400, 'opsz' 9",
      toFontVariationSettings: "'wght' 1000, 'opsz' 40"
    },
    controls: [{ key: 'label', label: 'Text', type: 'text' }],
    map: (p, ctx) => ({ ...p, containerRef: ctx.slotRef, className: 'tx-variable-proximity' })
  },

  WarpText: { fill: true,
    defaults: { fontSize: 72 },
    map: p => ({ ...p, letterSpacing: typeof p.letterSpacing === 'number' ? `${p.letterSpacing}em` : p.letterSpacing })
  }
};

export const renderWithAdapter = (Component, adapter, props, ctx) => {
  const { children: childKey, demoOnly = [], map, wrap } = adapter;
  const passed = map ? map(props, ctx) : { ...props };
  for (const k of demoOnly) delete passed[k];
  let children;
  if (childKey) {
    children = passed[childKey];
    delete passed[childKey];
  }
  const el = createElement(Component, passed, children);
  return wrap ? wrap(el, props, ctx) : el;
};
