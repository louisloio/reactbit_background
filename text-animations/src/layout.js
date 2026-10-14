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

// ---------- copy customisation from the other view ----------

export const OTHER_VIEW = VIEW === 'drawer' ? 'full' : 'drawer';
export const VIEW_NAMES = { full: 'full page', drawer: 'drawer view' };

// Storage keys holding each part's per-view customisation
export const VIEW_PARTS = {
  background: ['core.background.v2', 'core.surface.v1'],
  text: ['core.textAnimations.v1'],
  glow: ['core.glow.v1'],
  pattern: ['core.trame.v1']
};

// Copies the other view's saved customisation over this view's; returns true if anything was copied
export const copyFromOtherView = (parts = Object.keys(VIEW_PARTS)) => {
  let copied = false;
  try {
    for (const part of parts)
      for (const key of VIEW_PARTS[part] ?? []) {
        const value = localStorage.getItem(`${key}.${OTHER_VIEW}`);
        if (value === null) continue;
        localStorage.setItem(`${key}.${VIEW}`, value);
        copied = true;
      }
  } catch {
    /* storage unavailable */
  }
  return copied;
};
