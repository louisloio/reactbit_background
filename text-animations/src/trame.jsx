// Pattern overlay ("trame") drawn on top of the animated background.
//
// A small WebGL layer renders a repeating pattern (dots, squares, plus, cross, rings, lines, grid)
// in a fragment shader. To react to the background, ~30 times a second it copies the background's
// canvas into a small texture: each pattern cell can then take the background's colour and grow or
// shrink with its brightness (halftone), and it can also react to the cursor, drift and twinkle.
//
// Background canvases are created with preserveDrawingBuffer so their last frame can be read
// (see keepWebGLFramesReadable below, installed before any background loads).
import { useEffect, useRef, useSyncExternalStore } from 'react';

import { Control, I, Icon } from './ui.jsx';
import { readView, seedViews, writeView } from './layout.js';

// ---------- make WebGL frames readable ----------

let patched = false;
export const keepWebGLFramesReadable = () => {
  if (patched) return;
  patched = true;
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
      attrs = { ...(attrs || {}), preserveDrawingBuffer: true };
    }
    return original.call(this, type, attrs);
  };
};

// ---------- settings ----------

const KEY = 'core.trame.v1';

export const TRAME_DEFAULTS = {
  show: true,
  shape: 'dot',
  colorMode: 'mix',
  color: '#ffffff',
  mix: 0.5,
  opacity: 0.35,
  blend: 'normal',
  spacing: 12,
  size: 0.5,
  thickness: 0.12,
  rotation: 0,
  response: 'brightness',
  responseAmount: 0.8,
  contrast: 1.2,
  cursor: true,
  cursorRadius: 160,
  cursorStrength: 0.6,
  drift: false,
  driftSpeed: 12,
  driftAngle: 45,
  twinkle: 0,
  edgeFade: 0
};

const SHAPES = [
  ['dot', 'Dots'],
  ['square', 'Squares'],
  ['plus', 'Plus'],
  ['cross', 'Cross'],
  ['ring', 'Rings'],
  ['hline', 'Horizontal lines'],
  ['vline', 'Vertical lines'],
  ['diagonal', 'Diagonal lines'],
  ['grid', 'Grid']
];
const SHAPE_INDEX = Object.fromEntries(SHAPES.map(([k], i) => [k, i]));
const STROKE_SHAPES = new Set(['plus', 'cross', 'ring', 'hline', 'vline', 'diagonal', 'grid']);

const CONTROLS = [
  { key: 'show', label: 'Show Pattern', type: 'switch' },
  { key: 'shape', label: 'Pattern', type: 'select', options: SHAPES, when: s => s.show },
  {
    key: 'colorMode',
    label: 'Colour From',
    type: 'select',
    options: [
      ['custom', 'Custom colour'],
      ['background', 'The background'],
      ['mix', 'Mix of both']
    ],
    when: s => s.show
  },
  { key: 'color', label: 'Colour', type: 'color', when: s => s.show && s.colorMode !== 'background' },
  { key: 'mix', label: 'Background Share', type: 'range', min: 0, max: 1, step: 0.05, when: s => s.show && s.colorMode === 'mix' },
  { key: 'opacity', label: 'Opacity', type: 'range', min: 0, max: 1, step: 0.05, when: s => s.show },
  {
    key: 'blend',
    label: 'Blend',
    type: 'select',
    options: [
      ['normal', 'Normal'],
      ['screen', 'Screen'],
      ['overlay', 'Overlay'],
      ['soft-light', 'Soft light'],
      ['multiply', 'Multiply'],
      ['difference', 'Difference'],
      ['plus-lighter', 'Add']
    ],
    when: s => s.show
  },
  { key: 'spacing', label: 'Spacing', type: 'range', min: 4, max: 64, step: 1, unit: 'px', when: s => s.show },
  { key: 'size', label: 'Size', type: 'range', min: 0.05, max: 1, step: 0.01, when: s => s.show },
  { key: 'thickness', label: 'Thickness', type: 'range', min: 0.02, max: 0.5, step: 0.01, when: s => s.show && STROKE_SHAPES.has(s.shape) },
  { key: 'rotation', label: 'Rotation', type: 'range', min: 0, max: 180, step: 1, unit: '°', when: s => s.show },
  { section: 'Reacts to the background', when: s => s.show },
  {
    key: 'response',
    label: 'Size Follows',
    type: 'select',
    options: [
      ['off', 'Nothing (even pattern)'],
      ['brightness', 'Brightness (halftone)'],
      ['inverse', 'Darkness (inverse)']
    ],
    when: s => s.show
  },
  { key: 'responseAmount', label: 'Strength', type: 'range', min: 0, max: 1, step: 0.05, when: s => s.show && s.response !== 'off' },
  { key: 'contrast', label: 'Contrast', type: 'range', min: 0.3, max: 3, step: 0.05, when: s => s.show && s.response !== 'off' },
  { section: 'Motion', when: s => s.show },
  { key: 'cursor', label: 'React to Cursor', type: 'switch', when: s => s.show },
  { key: 'cursorRadius', label: 'Cursor Radius', type: 'range', min: 20, max: 600, step: 10, unit: 'px', when: s => s.show && s.cursor },
  { key: 'cursorStrength', label: 'Cursor Effect', type: 'range', min: -1, max: 1, step: 0.05, when: s => s.show && s.cursor },
  { key: 'drift', label: 'Drift', type: 'switch', when: s => s.show },
  { key: 'driftSpeed', label: 'Drift Speed', type: 'range', min: 1, max: 120, step: 1, unit: 'px/s', when: s => s.show && s.drift },
  { key: 'driftAngle', label: 'Drift Direction', type: 'range', min: 0, max: 360, step: 1, unit: '°', when: s => s.show && s.drift },
  { key: 'twinkle', label: 'Twinkle', type: 'range', min: 0, max: 1, step: 0.05, when: s => s.show },
  { key: 'edgeFade', label: 'Fade Edges', type: 'range', min: 0, max: 1, step: 0.05, when: s => s.show }
];

// Kept per view (full page / drawer)
seedViews(KEY);
const read = () => {
  const saved = readView(KEY);
  return saved && typeof saved === 'object' ? { ...TRAME_DEFAULTS, ...saved } : { ...TRAME_DEFAULTS };
};

let trame = read();
const listeners = new Set();
export const setTrame = patch => {
  trame = { ...trame, ...(typeof patch === 'function' ? patch(trame) : patch) };
  writeView(KEY, trame);
  listeners.forEach(l => l());
};
const useTrame = () =>
  useSyncExternalStore(
    l => (listeners.add(l), () => listeners.delete(l)),
    () => trame
  );

export const getTrameLook = () =>
  Object.fromEntries(Object.entries(trame).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify(TRAME_DEFAULTS[k])));
export const applyTrameLook = look => {
  if (!look || typeof look !== 'object') return;
  setTrame({ ...TRAME_DEFAULTS, ...Object.fromEntries(Object.entries(look).filter(([k]) => k in TRAME_DEFAULTS)) });
};

// ---------- settings UI (placed after the background's own settings) ----------

export function TrameSettings() {
  const t = useTrame();
  const isDefault = !Object.keys(getTrameLook()).length;
  return (
    <div className="trame-settings">
      <div className="tx-section trame-head">
        <span>Pattern overlay</span>
        <button className="cust-icon-btn" title="Reset the pattern" aria-label="Reset the pattern" disabled={isDefault} onClick={() => setTrame({ ...TRAME_DEFAULTS })}>
          <Icon d={I.reset} />
        </button>
      </div>
      {CONTROLS.filter(c => !c.when || c.when(t)).map(c =>
        c.section ? (
          <p key={c.section} className="tx-section">
            {c.section}
          </p>
        ) : (
          <Control key={c.key} idPrefix="trame" c={c} value={t[c.key]} onChange={v => setTrame({ [c.key]: v })} />
        )
      )}
    </div>
  );
}

// ---------- renderer ----------

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;          // canvas size, device px
uniform float uDpr;
uniform sampler2D uTex;     // small copy of the background
uniform float uHasTex;
uniform float uSpacing;     // css px
uniform float uSize;        // 0..1 of the cell
uniform float uThick;       // 0..0.5 of the cell
uniform float uAngle;       // radians
uniform int uShape;
uniform vec3 uColor;
uniform float uColorMode;   // 0 custom, 1 background, 2 mix
uniform float uMix;
uniform float uOpacity;
uniform float uResponse;    // 0 off, 1 brightness, 2 inverse
uniform float uResponseAmt;
uniform float uContrast;
uniform vec2 uMouse;        // css px, y down; negative = none
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform vec2 uDrift;        // css px offset
uniform float uTwinkle;
uniform float uEdgeFade;
uniform float uTime;
out vec4 outColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float box(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;   // css px, y down
  vec2 res = uRes / uDpr;
  float c = cos(uAngle), s = sin(uAngle);
  mat2 rot = mat2(c, -s, s, c);
  vec2 q = rot * (frag - res * 0.5) + uDrift;
  vec2 cell = floor(q / uSpacing);
  vec2 local = (q - (cell + 0.5) * uSpacing) / uSpacing;        // -0.5..0.5 within the cell
  vec2 centre = transpose(rot) * ((cell + 0.5) * uSpacing - uDrift) + res * 0.5;
  vec2 uv = clamp(centre / res, 0.0, 1.0);

  vec4 bg = uHasTex > 0.5 ? texture(uTex, vec2(uv.x, uv.y)) : vec4(0.5, 0.5, 0.5, 1.0);
  vec3 bgc = bg.a > 0.001 ? bg.rgb / bg.a : vec3(0.0);
  float lum = pow(clamp(dot(bgc, vec3(0.299, 0.587, 0.114)) * bg.a, 0.0, 1.0), 1.0 / max(uContrast, 0.01));
  float drive = uResponse < 0.5 ? 1.0 : (uResponse < 1.5 ? lum : 1.0 - lum);
  float scale = mix(1.0, drive, uResponseAmt);

  if (uMouse.x >= 0.0) {
    float d = distance(centre, uMouse);
    float f = exp(-(d * d) / (uMouseRadius * uMouseRadius));
    scale = max(0.0, scale + uMouseStrength * f * 1.2);
  }
  if (uTwinkle > 0.0) {
    float t = hash(cell) * 6.2831 + uTime * (1.0 + hash(cell + 7.0) * 2.0);
    scale *= 1.0 - uTwinkle * (0.5 + 0.5 * sin(t));
  }

  float r = 0.5 * uSize * scale;
  float th = uThick * clamp(scale, 0.0, 2.0);
  vec2 p = local;
  float d;
  if (uShape == 0) d = length(p) - r;
  else if (uShape == 1) d = box(p, vec2(r));
  else if (uShape == 2) d = min(box(p, vec2(r, th * 0.5)), box(p, vec2(th * 0.5, r)));
  else if (uShape == 3) { vec2 pr = mat2(0.7071, -0.7071, 0.7071, 0.7071) * p; d = min(box(pr, vec2(r, th * 0.5)), box(pr, vec2(th * 0.5, r))); }
  else if (uShape == 4) d = abs(length(p) - r) - th * 0.5;
  else if (uShape == 5) d = abs(p.y) - th * 0.5 * (uSize * 2.0);
  else if (uShape == 6) d = abs(p.x) - th * 0.5 * (uSize * 2.0);
  else if (uShape == 7) { float k = fract((p.x + p.y) + 0.5) - 0.5; d = abs(k) * 0.7071 - th * 0.5 * (uSize * 2.0); }
  else d = min(abs(p.x), abs(p.y)) - th * 0.5 * (uSize * 2.0);

  float aa = 1.0 / uSpacing;
  float a = smoothstep(aa, -aa, d) * uOpacity;

  if (uEdgeFade > 0.0) {
    vec2 e = min(frag, res - frag) / (min(res.x, res.y) * 0.5);
    a *= smoothstep(0.0, uEdgeFade, min(e.x, e.y));
  }

  vec3 col = uColorMode < 0.5 ? uColor : (uColorMode < 1.5 ? bgc : mix(uColor, bgc, uMix));
  outColor = vec4(col * a, a);
}`;

const hexToRgb = hex => {
  const h = String(hex || '#ffffff').replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, x => x + x) : h.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

// The background's drawing surface: the largest canvas inside the stage
const findSource = root => {
  let best = null;
  let area = 0;
  for (const c of root.querySelectorAll('.bg-stage canvas')) {
    const a = c.width * c.height;
    if (a > area) {
      area = a;
      best = c;
    }
  }
  return best;
};

export function TrameLayer({ root }) {
  const t = useTrame();
  const canvasRef = useRef(null);
  const settings = useRef(t);
  settings.current = t;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !t.show) return undefined;
    const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return undefined;

    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn('Pattern overlay shader:', gl.getShaderInfoLog(sh));
      return sh;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = name => gl.getUniformLocation(prog, name);
    const u = Object.fromEntries(
      [
        'uRes', 'uDpr', 'uTex', 'uHasTex', 'uSpacing', 'uSize', 'uThick', 'uAngle', 'uShape', 'uColor', 'uColorMode', 'uMix',
        'uOpacity', 'uResponse', 'uResponseAmt', 'uContrast', 'uMouse', 'uMouseRadius', 'uMouseStrength', 'uDrift', 'uTwinkle',
        'uEdgeFade', 'uTime'
      ].map(n => [n, U(n)])
    );

    // Background copy: drawn small on a 2D canvas, then uploaded as a texture
    const sample = document.createElement('canvas');
    const sctx = sample.getContext('2d', { willReadFrequently: false });
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const mouse = { x: -1, y: -1 };
    const onMove = e => {
      const r = root.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      mouse.x = inside ? e.clientX - r.left : -1;
      mouse.y = inside ? e.clientY - r.top : -1;
    };
    const onLeave = () => (mouse.x = mouse.y = -1);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    let raf = 0;
    let frame = 0;
    let hasTex = 0;
    let drift = [0, 0];
    let last = performance.now();
    const t0 = last;

    const tick = now => {
      raf = requestAnimationFrame(tick);
      const s = settings.current;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(root.clientWidth * dpr));
      const h = Math.max(1, Math.round(root.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      // Sample the background every other frame, at about one texel per pattern cell
      if (frame++ % 2 === 0 && (s.colorMode !== 'custom' || s.response !== 'off')) {
        const src = findSource(root);
        if (src && src.width > 0 && src.height > 0) {
          const sw = Math.max(8, Math.min(320, Math.round(root.clientWidth / Math.max(4, s.spacing))));
          const sh = Math.max(8, Math.min(320, Math.round(root.clientHeight / Math.max(4, s.spacing))));
          if (sample.width !== sw || sample.height !== sh) {
            sample.width = sw;
            sample.height = sh;
          }
          try {
            sctx.clearRect(0, 0, sw, sh);
            sctx.drawImage(src, 0, 0, sw, sh);
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sample);
            hasTex = 1;
          } catch {
            hasTex = 0;
          }
        } else hasTex = 0;
      }

      if (s.drift) {
        const a = (s.driftAngle * Math.PI) / 180;
        drift = [drift[0] + Math.cos(a) * s.driftSpeed * dt, drift[1] + Math.sin(a) * s.driftSpeed * dt];
      }

      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(u.uRes, w, h);
      gl.uniform1f(u.uDpr, dpr);
      gl.uniform1i(u.uTex, 0);
      gl.uniform1f(u.uHasTex, hasTex);
      gl.uniform1f(u.uSpacing, s.spacing);
      gl.uniform1f(u.uSize, s.size);
      gl.uniform1f(u.uThick, s.thickness);
      gl.uniform1f(u.uAngle, (s.rotation * Math.PI) / 180);
      gl.uniform1i(u.uShape, SHAPE_INDEX[s.shape] ?? 0);
      gl.uniform3fv(u.uColor, hexToRgb(s.color));
      gl.uniform1f(u.uColorMode, s.colorMode === 'custom' ? 0 : s.colorMode === 'background' ? 1 : 2);
      gl.uniform1f(u.uMix, s.mix);
      gl.uniform1f(u.uOpacity, s.opacity);
      gl.uniform1f(u.uResponse, s.response === 'off' ? 0 : s.response === 'brightness' ? 1 : 2);
      gl.uniform1f(u.uResponseAmt, s.responseAmount);
      gl.uniform1f(u.uContrast, s.contrast);
      gl.uniform2f(u.uMouse, s.cursor ? mouse.x : -1, s.cursor ? mouse.y : -1);
      gl.uniform1f(u.uMouseRadius, s.cursorRadius);
      gl.uniform1f(u.uMouseStrength, s.cursorStrength);
      gl.uniform2f(u.uDrift, drift[0], drift[1]);
      gl.uniform1f(u.uTwinkle, s.twinkle);
      gl.uniform1f(u.uEdgeFade, s.edgeFade);
      gl.uniform1f(u.uTime, (now - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [root, t.show]);

  if (!t.show) return null;
  return <canvas ref={canvasRef} className="trame-layer" aria-hidden="true" style={{ mixBlendMode: t.blend }} />;
}
