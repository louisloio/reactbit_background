# Text animations for the Core appshell

Builds the React Bits text animations (https://reactbits.dev/text-animations) into
`../assets/text-animations.{js,css}`, loaded by both pages:

- `core-appshell-backgrounds.html` (Enhanced): full-screen background, Customise panel with Background | Text tabs.
- `core-appshell-panel.html` (Classic): Background and Text settings as fixed columns, sample commodities
  content, and the background + text + AI input inside the Chat AI drawer.

The header's Classic / Enhanced switch moves between the two pages, keeping the background slug in the hash;
text and background settings carry over through `localStorage`.

Shared files in `../assets/`: `appshell.css/js` (shell styles, theme toggle, page switch), `backgrounds.js/css`
(the precompiled background bundle), `panel.css` + `commodities.js` (Classic page only).

```
npm install
npm run gen     # re-read demos/*.jsx → src/registry.generated.json (defaults + controls)
npm run build   # vite build, then copy dist/ into ../assets
```

- `src/components/` — React Bits components, copied unchanged from DavidHDev/react-bits.
- `demos/` — the matching React Bits demo files; `scripts/gen-registry.mjs` extracts each demo's
  `DEFAULT_PROPS` and `<Customize>` controls from them.
- `src/adapters.jsx` — per-component glue: text passed as children, extra controls, defaults that suit a short area.
- `src/main.jsx` — picker, panel and text area; settings are saved in `localStorage` (`core.textAnimations.v1`).

## Looks (share links + saved looks)

`src/looks.js` snapshots the background + text animation and their settings. Share links put the snapshot,
deflate-compressed and base64url-encoded, in a `?look=` query parameter next to the usual `#background-slug`,
so they work on GitHub Pages with no server. Saved looks are kept in `localStorage` (`core.looks.v1`).

The background lives in the precompiled bundle `../assets/backgrounds.js`. One line was added to it (right after `G9=new Set,`)
to expose its store as `window.__coreBg = { get, set, subscribe }`; keep it if that bundle is ever replaced.
