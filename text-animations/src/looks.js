// Looks = background + text animation + their settings, as one shareable snapshot.
//
// Share links keep the background slug in the hash (as the page always did) and put the
// whole look, deflate-compressed and base64url-encoded, in a `look` query parameter:
//   core-appshell-backgrounds.html?look=<code>#ferrofluid
// No server needed, so links work as-is on GitHub Pages.
//
// The background state lives in the page's own (precompiled) bundle; it exposes
// window.__coreBg = { get, set, subscribe } for this.

const LOOKS_KEY = 'core.looks.v1';
const BG_KEY = 'core.background.v1';
export const LOOK_PARAM = 'look';

const bg = () => window.__coreBg;

// ---------- background snapshot ----------

export const getBackground = () => {
  const s = bg()?.get();
  if (!s) return null;
  const out = { id: s.id };
  if (s.backdrop) out.backdrop = s.backdrop;
  if (s.demo?.[s.id]) out.props = s.demo[s.id];
  return out;
};

export const applyBackground = look => {
  const api = bg();
  if (!api || !look?.id) return;
  const s = api.get();
  const demo = { ...s.demo };
  if (look.props) demo[look.id] = look.props;
  else delete demo[look.id];
  // bump rev so the background remounts with the restored settings
  api.set({
    id: look.id,
    backdrop: look.backdrop ?? null,
    demo,
    rev: { ...s.rev, [look.id]: (s.rev?.[look.id] ?? 0) + 1 }
  });
};

// Background settings survive a reload (the bundle itself keeps them in memory only)
export const persistBackground = () => {
  const api = bg();
  if (!api) return;
  try {
    const saved = JSON.parse(localStorage.getItem(BG_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      const s = api.get();
      api.set({ backdrop: saved.backdrop ?? s.backdrop, demo: { ...saved.demo, ...s.demo } });
    }
  } catch {
    /* ignore unreadable storage */
  }
  api.subscribe(s => {
    try {
      localStorage.setItem(BG_KEY, JSON.stringify({ backdrop: s.backdrop, demo: s.demo }));
    } catch {
      /* storage unavailable */
    }
  });
};

// ---------- encoding ----------

const toBase64Url = bytes => {
  let bin = '';
  bytes.forEach(b => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromBase64Url = str => {
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
};
const pipe = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());

export const encodeLook = async look => {
  const json = new TextEncoder().encode(JSON.stringify(look));
  return toBase64Url(await pipe(json, new CompressionStream('deflate-raw')));
};

export const decodeLook = async code => {
  const bytes = await pipe(fromBase64Url(code), new DecompressionStream('deflate-raw'));
  return JSON.parse(new TextDecoder().decode(bytes));
};

export const lookUrl = async look => {
  const url = new URL(location.href);
  url.searchParams.set(LOOK_PARAM, await encodeLook(look));
  const slug = bg() ? location.hash.slice(1) : '';
  url.hash = slug;
  return url.toString();
};

// The look in the current URL, if any; removed from the address bar once read
export const takeLookFromUrl = async () => {
  const url = new URL(location.href);
  const code = url.searchParams.get(LOOK_PARAM);
  if (!code) return null;
  url.searchParams.delete(LOOK_PARAM);
  history.replaceState(history.state, '', url.toString());
  try {
    return await decodeLook(code);
  } catch {
    return null;
  }
};

// ---------- saved looks ----------

export const loadSavedLooks = () => {
  try {
    const list = JSON.parse(localStorage.getItem(LOOKS_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const storeSavedLooks = list => {
  try {
    localStorage.setItem(LOOKS_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
};
