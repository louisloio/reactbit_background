// Looks = background + text animation + their settings, as one shareable snapshot.
//
// Share links keep the background slug in the hash (as the page always did) and put the
// whole look, deflate-compressed and base64url-encoded, in a `look` query parameter:
//   core-appshell-backgrounds.html?look=<code>#ferrofluid
// No server needed, so links work as-is on GitHub Pages.

const LOOKS_KEY = 'core.looks.v1';
export const LOOK_PARAM = 'look';

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
const pipe = async (bytes, stream) =>
  new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());

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
  url.hash = look?.bg?.id && look.bg.id !== 'solid' ? look.bg.id : '';
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
