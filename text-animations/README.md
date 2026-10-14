# Backgrounds + text animations for the Core appshell

Builds the React Bits backgrounds (https://reactbits.dev/tools/background-studio) and text animations
(https://reactbits.dev/text-animations) into `../assets/` (`text-animations-<hash>.js/.css` plus one lazy
chunk per background in `chunks/`), loaded by both pages:

- `core-appshell-backgrounds.html` (Enhanced): full-screen background, Customise panel with Background | Text tabs.
- `core-appshell-panel.html` (Classic): Background and Text settings as fixed columns, sample commodities
  content, and the background + text + AI input inside the Chat AI drawer.

The header's Classic / Enhanced switch moves between the two pages, keeping the background slug in the hash;
text and background settings carry over through `localStorage`.

Shared files in `../assets/`: `appshell.css/js` (shell styles, theme toggle, page switch), `panel.css` +
`commodities.js` (Classic page only), `demo/` (images some backgrounds use by default).

```
npm install
npm run gen     # re-read demos/*.jsx → src/registry.generated.json (defaults + controls)
npm run build   # vite build, copy dist/ into ../assets, stamp asset links
npm run stamp   # re-stamp asset links after editing a file in ../assets by hand
```

- `src/components/` — React Bits text animation components, copied unchanged from DavidHDev/react-bits.
- `src/bg/` — React Bits background (and effect) components, copied unchanged.
- `src/bg-registry.js` — Background Studio's registry (`src/tools/background-studio/backgrounds/index.js`):
  every background's settings with types, defaults and ranges. Only the import paths (and one demo image
  path) were changed. `src/backgrounds.jsx` turns it into the picker, settings panel, Surface row and renderer.
- `demos/` — the matching React Bits demo files; `scripts/gen-registry.mjs` extracts each demo's
  `DEFAULT_PROPS` and `<Customize>` controls from them.
- `src/adapters.jsx` — per-component glue: text passed as children, extra controls, defaults that suit a short area.
- `src/main.jsx` — picker, panel and text area; settings are saved in `localStorage` (`core.textAnimations.v1`).

## Looks (share links + saved looks)

`src/looks.js` snapshots the background + text animation and their settings. Share links put the snapshot,
deflate-compressed and base64url-encoded, in a `?look=` query parameter next to the usual `#background-slug`,
so they work on GitHub Pages with no server. Saved looks are kept in `localStorage` (`core.looks.v1`).

Background state (selected background, its settings, the Surface colour) is kept in `localStorage`
(`core.background.v2`) and the background id is mirrored in the URL hash (`#letter-glitch`).
