// Which view we're in: the full page (Enhanced) or the Chat AI drawer (Classic).
// The selected background and text animation are shared between the two; every customisation
// (background settings, Surface, text style/settings, glow, pattern) is kept per view.
export const VIEW = document.body.classList.contains('layout-panel') ? 'drawer' : 'full';

// Storage key for this view's customisation
export const viewKey = key => `${key}.${VIEW}`;

// Reads this view's value; the first time, starts from the value saved before views were split
export const readView = key => {
  try {
    const own = localStorage.getItem(viewKey(key));
    if (own !== null) return JSON.parse(own);
    const shared = localStorage.getItem(key);
    return shared !== null ? JSON.parse(shared) : null;
  } catch {
    return null;
  }
};

export const writeView = (key, value) => {
  try {
    localStorage.setItem(viewKey(key), JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
};

// One-time split: copy what was saved before views existed into both views' keys, before any
// store overwrites the old key (background / text keep only the shared selection there now).
export const seedViews = key => {
  try {
    const shared = localStorage.getItem(key);
    if (shared === null) return;
    for (const view of ['full', 'drawer'])
      if (localStorage.getItem(`${key}.${view}`) === null) localStorage.setItem(`${key}.${view}`, shared);
  } catch {
    /* storage unavailable */
  }
};

// Plain-string values (not JSON), e.g. the Surface colour
// (cleared = empty string, so a reset in one view doesn't fall back to the old shared value)
export const readViewString = key => {
  try {
    const own = localStorage.getItem(viewKey(key));
    return own !== null ? own || null : localStorage.getItem(key);
  } catch {
    return null;
  }
};
export const writeViewString = (key, value) => {
  try {
    localStorage.setItem(viewKey(key), value || '');
  } catch {
    /* storage unavailable */
  }
};
