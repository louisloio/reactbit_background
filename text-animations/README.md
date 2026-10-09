# Text animations for the Core appshell

Builds the React Bits text animations (https://reactbits.dev/text-animations) into one script that is
inlined into `../core-appshell-backgrounds.html`, between the `text-animations:start` / `end` markers.
It adds a picker next to the background picker, a "Text" settings panel, and a text area above the AI input.

```
npm install
npm run gen     # re-read demos/*.jsx → src/registry.generated.json (defaults + controls)
npm run build   # vite build, then inline dist/ into the page
```

- `src/components/` — React Bits components, copied unchanged from DavidHDev/react-bits.
- `demos/` — the matching React Bits demo files; `scripts/gen-registry.mjs` extracts each demo's
  `DEFAULT_PROPS` and `<Customize>` controls from them.
- `src/adapters.jsx` — per-component glue: text passed as children, extra controls, defaults that suit a short area.
- `src/main.jsx` — picker, panel and text area; settings are saved in `localStorage` (`core.textAnimations.v1`).
