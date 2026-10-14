// Reads the React Bits demo files in ./demos and extracts, for every text animation,
// its DEFAULT_PROPS and the <Customize> controls, into src/registry.generated.json.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { parse } from '@babel/parser';

const DEMO_DIR = new URL('../demos/', import.meta.url);
const OUT = new URL('../src/registry.generated.json', import.meta.url);

const CONTROL_TYPES = {
  PreviewSlider: 'range',
  PreviewSelect: 'select',
  PreviewSwitch: 'switch',
  PreviewInput: 'text',
  PreviewColorPicker: 'color',
  PreviewColorPickerCustom: 'color'
};

const walk = (node, visit) => {
  if (!node || typeof node.type !== 'string') return;
  if (visit(node) === false) return;
  for (const key of Object.keys(node)) {
    const v = node[key];
    if (Array.isArray(v)) v.forEach(n => walk(n, visit));
    else if (v && typeof v.type === 'string') walk(v, visit);
  }
};

const titleCase = id => id.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/ASCII/, 'ASCII');

const COMPONENT_DIR = new URL('../src/components/', import.meta.url);

// Finds the component's props pattern: `({ a = 1, b }) =>`, `function X({ ... })`,
// or `forwardRef((props, ref) => { const { a = 1 } = props; ... })`
function readComponentProps(id) {
  let src;
  try {
    src = readFileSync(new URL(`${id}/${id}.jsx`, COMPONENT_DIR), 'utf8');
  } catch {
    return [];
  }
  const ast = parse(src, { sourceType: 'module', plugins: ['jsx'] });
  const slice = n => src.slice(n.start, n.end);
  let pattern = null;
  walk(ast.program, node => {
    if (pattern) return false;
    const fn =
      (node.type === 'VariableDeclarator' && node.id.name === id && node.init) ||
      (node.type === 'FunctionDeclaration' && node.id?.name === id && node) ||
      null;
    if (!fn) return;
    let f = fn.type === 'CallExpression' ? fn.arguments[0] : fn; // forwardRef(...)
    if (!f?.params) return;
    const first = f.params[0];
    if (first?.type === 'ObjectPattern') pattern = first;
    else if (first?.type === 'Identifier') {
      // const { ... } = props inside the body
      walk(f.body, n => {
        if (!pattern && n.type === 'VariableDeclarator' && n.id.type === 'ObjectPattern' && n.init?.name === first.name) pattern = n.id;
      });
    }
  });
  if (!pattern) return [];
  return pattern.properties
    .filter(pr => pr.type === 'ObjectProperty')
    .map(pr => {
      const name = pr.key.name ?? pr.key.value;
      const dflt = pr.value.type === 'AssignmentPattern' ? slice(pr.value.right) : undefined;
      return { name, default: dflt };
    });
}

const result = [];
const warnings = [];

for (const file of readdirSync(DEMO_DIR).filter(f => f.endsWith('Demo.jsx')).sort()) {
  const id = file.replace(/Demo\.jsx$/, '');
  const src = readFileSync(new URL(file, DEMO_DIR), 'utf8');
  const ast = parse(src, { sourceType: 'module', plugins: ['jsx'] });
  const slice = n => src.slice(n.start, n.end);

  // Top-level literal constants (option lists, defaults) evaluated in order
  const scope = {};
  const decls = [];
  walk(ast.program, n => {
    if (n.type === 'VariableDeclaration') decls.push(n);
  });
  for (const stmt of decls) {
    for (const d of stmt.declarations) {
      if (d.id.type !== 'Identifier' || !d.init) continue;
      if (!['ArrayExpression', 'ObjectExpression', 'StringLiteral', 'NumericLiteral', 'TemplateLiteral'].includes(d.init.type))
        continue;
      try {
        scope[d.id.name] = new Function(...Object.keys(scope), `return (${slice(d.init)});`)(...Object.values(scope));
      } catch {
        /* non-literal, skip */
      }
    }
  }
  const evalExpr = n => {
    try {
      return new Function(...Object.keys(scope), `return (${slice(n)});`)(...Object.values(scope));
    } catch {
      return undefined;
    }
  };

  const defaults = scope.DEFAULT_PROPS ?? {};
  const controls = [];

  walk(ast.program, node => {
    if (node.type !== 'JSXElement') return;
    const name = node.openingElement.name.name;
    const type = CONTROL_TYPES[name];
    if (!type) return;
    const attrs = {};
    for (const a of node.openingElement.attributes) {
      if (a.type !== 'JSXAttribute') continue;
      const v = a.value;
      attrs[a.name.name] = !v ? { lit: true } : v.type === 'StringLiteral' ? { lit: v.value } : { expr: v.expression };
    }
    const lit = k => (attrs[k] ? ('lit' in attrs[k] ? attrs[k].lit : evalExpr(attrs[k].expr)) : undefined);

    // Prop key: first updateProp('key', ...) / updateAndReplay('key', ...) inside onChange
    let key;
    let transform;
    const onChange = attrs.onChange?.expr;
    if (onChange)
      walk(onChange, n => {
        if (
          !key &&
          n.type === 'CallExpression' &&
          /^update/.test(n.callee.name ?? '') &&
          n.arguments[0]?.type === 'StringLiteral'
        ) {
          key = n.arguments[0].value;
          const arg = n.arguments[1];
          if (arg && !(arg.type === 'Identifier' && onChange.params?.[0]?.name === arg.name)) {
            transform = `(${onChange.params.map(slice).join(', ')}) => ${slice(arg)}`;
          }
        }
      });
    // Preset selects call applyPreset(value), which merges PRESETS[value] into the props
    if (!key && type === 'select' && onChange?.type === 'Identifier' && /preset/i.test(onChange.name) && scope.PRESETS) {
      const opts = lit('options') ?? Object.keys(scope.PRESETS).map(k => ({ value: k, label: k }));
      controls.push({
        key: 'preset',
        label: lit('title') ?? 'Preset',
        type: 'select',
        options: opts.map(o => (typeof o === 'object' ? [o.value, o.label ?? String(o.value)] : [o, String(o)])),
        presets: scope.PRESETS
      });
      return;
    }
    if (!key) {
      warnings.push(`${id}: control "${lit('title')}" has no updateProp key`);
      return;
    }
    const c = { key, label: lit('title') ?? key, type };
    if (type === 'range') {
      c.min = lit('min') ?? 0;
      c.max = lit('max') ?? 100;
      c.step = lit('step') ?? 1;
      const unit = lit('valueUnit');
      if (unit) c.unit = unit;
    }
    if (type === 'select') {
      const opts = lit('options');
      if (!Array.isArray(opts)) warnings.push(`${id}: options for ${key} unresolved`);
      c.options = (opts ?? []).map(o => (typeof o === 'object' ? [o.value, o.label ?? String(o.value)] : [o, String(o)]));
    }
    if (type === 'text') {
      const ml = lit('maxLength');
      if (ml) c.maxLength = ml;
    }
    if (attrs.isDisabled?.expr) c.disabledWhen = slice(attrs.isDisabled.expr);
    if (transform) c.transform = transform;
    controls.push(c);
  });

  for (const c of controls) if (!(c.key in defaults)) warnings.push(`${id}: ${c.key} not in DEFAULT_PROPS`);

  // Every documented prop (the demo's props table), so props the Customize box leaves out can be
  // offered as extra controls: [{ name, type, default (source text), description }]
  const propTable = [];
  walk(ast.program, node => {
    if (node.type !== 'ObjectExpression') return;
    const get = k => node.properties.find(pr => (pr.key?.name ?? pr.key?.value) === k)?.value;
    const name = get('name');
    const type = get('type');
    const description = get('description');
    if (!name || !type || !description) return;
    const text = n => (n.type === 'StringLiteral' ? n.value : n.type === 'TemplateLiteral' ? n.quasis.map(q => q.value.cooked).join('') : slice(n));
    const dflt = get('default');
    propTable.push({ name: text(name), type: text(type), default: dflt ? text(dflt) : undefined, description: text(description) });
  });

  // The component's own parameter list (name + default source): the complete set of props,
  // since some props tables leave props out (e.g. DecryptedText's `characters`)
  const componentProps = readComponentProps(id);

  result.push({ id, name: titleCase(id), defaults, controls, propTable, componentProps });
}

writeFileSync(OUT, JSON.stringify(result, null, 2));
console.log(`${result.length} components → src/registry.generated.json`);
if (warnings.length) console.log('Warnings:\n  ' + warnings.join('\n  '));
