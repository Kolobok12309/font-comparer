# PROJECT KNOWLEDGE BASE

**Generated:** 2026-10-16
**Commit:** 32d3c04
**Branch:** feat/fonts-page

## OVERVIEW

Client-side calculator for `@font-face` fallback metrics (`size-adjust`, `ascent-/descent-/line-gap-override`): it measures a target font against a local fallback in the browser and emits CSS. Nuxt 4 + Vue 3 SFCs, Tailwind, @nuxtjs/i18n (en/ru), Stylus, pnpm + turbo, static deploy to GH Pages.

## STRUCTURE

```
font-comparer/
├── app/                       # Nuxt 4 srcDir (all code lives here)
│   ├── components/            # FontComparer/ = main calculator widget on index page
│   ├── composables/fonts/     # font lists: system (queryLocalFonts or probe) + Google
│   ├── pages/                 # one page per descriptor + preview/analyze; fonts/ is WIP
│   ├── types/                 # font shape interfaces only
│   └── utils/                 # measurement algorithms + consts/ (large JSON tables)
├── i18n.config.ts             # legacy:false only; messages live in SFC <i18n> blocks
├── turbo.json                 # build/lint cache inputs - add new root config files here
└── .github/workflows/ci.yml   # build+lint on PR, deploy Pages on master
```

## WHERE TO LOOK

| Task                                    | Location                                                          | Notes                                                                                                                                                |
| --------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fallback-metric calculation (main flow) | `app/utils/calculateFontProperties.ts`                            | `calculateRootProperties`: `method: 'frequency'` with `profile` fits size-adjust by weighted DOM widths; `text` uses canvas; then ascent and descent |
| Single-font default metrics             | `app/utils/analyze/dom.ts`                                        | `analyzeFontByDom`: DOM heights, one char per line                                                                                                   |
| Iterative search primitive              | `app/utils/common.ts`                                             | `calculateNearArg` step-refine search; `createContainersAndFontFace`                                                                                 |
| Font picker lists                       | `app/composables/fonts/`                                          | Google list lazy-imports `consts/google-fonts-array.json`                                                                                            |
| Custom font registry                    | `app/composables/fonts/custom-fonts.ts`                           | `useCustomFonts`: restore, validate/register, rename/delete, broken entries and shared object URLs                                                   |
| Custom font persistence                 | `app/utils/customFontsDb.ts`                                      | Client-only IndexedDB CRUD; stores font bytes as a Blob                                                                                              |
| Font file helpers                       | `app/utils/fontFile.ts`                                           | Pure format detection, size/quota constants, family collision naming and suffix stripping                                                            |
| Custom font upload UI                   | `app/components/CustomFontUpload.vue`                             | File picker/drop, rename/delete, broken rows and localized errors                                                                                    |
| Frequency profiles                      | `app/utils/frequency.ts`                                          | Pure en/ru profiles, mixing, from-text top 64 characters and weighted averages                                                                       |
| Font installed check                    | `app/utils/checkFontExist.ts`                                     | canvas width vs `monospace` fallback                                                                                                                 |
| Generated CSS text                      | `FontFaceCssPreview.vue` (text) / `FontFace.vue` (live `<style>`) | Export keeps `local()` plus a custom-file URL hint; live styles use the shared blob URL                                                              |
| Settings UI / v-model plumbing          | `FontPreviewSettings.vue` + `useMapSync`                          | `change*` boolean props toggle each control                                                                                                          |
| Translations                            | `<i18n lang="json">` block in each SFC                            | `useI18n({ useScope: 'local' })` everywhere                                                                                                          |

## CODE MAP

| Symbol                              | Type               | Location                           | Refs (files) | Role                                                                |
| ----------------------------------- | ------------------ | ---------------------------------- | ------------ | ------------------------------------------------------------------- |
| `defaultText`                       | const              | `utils/consts/default.ts`          | 7            | Default preview text for every page                                 |
| `calculateNearArg`                  | fn                 | `utils/common.ts`                  | 2            | Core search: adjust input until measured value hits target          |
| `createContainersAndFontFace`       | fn                 | `utils/common.ts`                  | 2            | Injects hidden spans + random-named `@font-face`, returns `cleanup` |
| `rafPromise`                        | default fn         | `utils/rafPromise.ts`              | 2            | Await a frame before re-measuring                                   |
| `calculateRootProperties`           | fn                 | `utils/calculateFontProperties.ts` | 1            | Used by `FontComparer`                                              |
| `analyzeFontByDom`                  | fn                 | `utils/analyze/dom.ts`             | 1            | Used by `pages/analyze.vue`; also set on `window`                   |
| `useMapSync`                        | default composable | `composables/useMapSync.ts`        | 2            | props -> writable computeds emitting `update:<key>`                 |
| `useSizes`                          | default composable | `composables/useSizes.ts`          | 1            | ResizeObserver width/height                                         |
| `useSystemFonts` / `useGoogleFonts` | composables        | `composables/fonts/`               | 2 / 1        | Font lists + Google stylesheet loader                               |

## CONVENTIONS

- Nuxt auto-imports are relied on: `rafPromise`, `sleep`, `fontLoadPromise`, `getRandomString`, `useMapSync`, `useSizes`, `ref`/`watch` appear without imports. Default-export utils/composables are named by file name - keep one default export per such file.
- Explicit imports use both `@/` and `~/` aliases; either resolves to `app/`.
- Props use runtime `defineProps({...})` objects, not type-only generics. Two-way binding is `v-model:<prop>` + `useMapSync`, not `defineModel`.
- Descriptor values are plain percent numbers (100 = 100%); CSS output appends `%`.
- Fallback font family names are `${target}-${src}` in previews; measurement uses `font-<random>-fallback`.
- Comments in algorithm code are often Russian; keep that language when editing nearby.
- Prettier is the only linter: single quotes, semicolons, trailing commas, `singleAttributePerLine`. `.editorconfig` max line 80.

## ANTI-PATTERNS (THIS PROJECT)

- Do not start `calculateNearArg` at `src = 0`: the loop guard is `src > 0`, so the descent search seeds `0.001` on purpose.
- Do not measure without `await rafPromise()` after changing `fontFace.style.*`; values stay stale until the next frame.
- Always call the returned `cleanup()` after `createContainersAndFontFace`; it removes the injected `<style>` and containers.
- Before measuring a `url(blob:)` fallback, await `document.fonts.load()` and verify `document.fonts.check()` for the measuring face; `document.fonts.ready` alone is insufficient.
- Browser-only APIs (`document`, `window.queryLocalFonts`, canvas): use `import.meta.client` in new code or run inside `onMounted`. `process.client` is legacy, retained at two existing call sites (`app/components/FontFamilySelector.vue`, `app/utils/analyze/dom.ts`). The site is statically generated (`nuxt generate`).
- Do not eagerly import the big JSON tables in components; the composables load them via dynamic `import()`.

## UNIQUE STYLES

- Every page repeats the same shell: `BackButton` + `PageHeader` + MDN `Blockquote` + `FontFaceCssPreview` + `FontPreviewSettings` + `FontPreview`, with `ghost`/`border`/`size` defaulting to `true`.
- The "ghost" mode overlays original (green, 70% opacity) and adjusted (red, 30%) text.
- Computation code is debug-heavy (`console.time`/`console.log`); this is current practice, not leftover.

## COMMANDS

```bash
pnpm install            # postinstall runs `nuxt prepare` (needed for tsconfig/.nuxt types)
pnpm dev                # nuxt dev
pnpm build              # nuxt generate -> dist/ (CI: NUXT_APP_BASE_URL=/font-comparer/)
pnpm lint               # prettier --check .   (lint:fix to write)
pnpm test               # vitest run
pnpm exec turbo run build lint test   # CI runs these tasks in separate jobs
```

Node 24.x and pnpm 11.6.0 are pinned in `engines`/`packageManager`. Unit tests are `*.test.ts` for pure modules; use explicit imports for the modules under test and `describe`/`it`/`expect` from `vitest` (no Nuxt auto-imports).

## NOTES

- `calculateRootProperties` always returns `lineGapOverride: 0`. Its `assumption` arg is used by the frequency size-adjust search; text/ascent/descent searches pass `0`.
- Dead or stub code: `calculateAscentDescentFromSum` (unused), `checkFontExistByWeight` (empty), `utils/analyze/canvas.ts` (empty), large commented-out blocks.
- `consts/google-fonts.json` (map family -> category) and `google-fonts-array.json` (`[{family}]`) are two shapes of the same list; the picker uses the array.
- `frequence-tables/{en,ru}.json` feed the normalized language profiles in `app/utils/frequency.ts`.
- Custom fonts use a single Blob stored in IndexedDB and one object URL per registered font, shared by FontFace API, measuring `@font-face` and live previews; do not retain a second ArrayBuffer representation.
- `opentype.js` is dynamically imported for ttf/otf/woff family names; woff2 uses the filename stem. Users can rename uploaded fonts.
- Exported CSS for custom fallbacks strips the trailing ` (custom)` / ` (custom N)` suffix, keeps `local()` and adds a comment hint to replace it with the site's file `url()` and `format()`; never export the browser's blob URL.
- Supported browser boundary: Chromium only; the code relies on named `document.styleSheets` access and `queryLocalFonts`.
- `pages/fonts/index.vue` is WIP on this branch: its sections are empty headers.
- Supported locales are only `en`/`ru`. Add both keys to every `<i18n>` block, and use `useLocalePath()` for internal links.
- `.omo/` is gitignored.
