# NutriJewel: working notes

Standing instructions and hard-won facts about this repo. Read this first.

## Non-negotiables

- **Never use em dashes.** Not in replies, not in site copy, not in code comments.
  Use commas, colons, brackets, full stops, or recast the sentence.
- **Do not create new git branches** unless explicitly asked.
- **Mobile first.** Essentially all traffic is iPhone and Android. Design the phone
  layout first and treat desktop as the adaptation. Verify at 375px before calling
  anything done. Prefer bottom sheets and docked bars over sidebars, tap over
  hover, tap-to-add over drag. Touch targets at least 44px.
- **Never force push**, and never push to `gh-pages` without an explicit instruction:
  that is the live customer-facing site.

## Environment

Node is **not on PATH**. It lives at `C:\tools\node-v20.18.1-win-x64` (v20.18.1,
npm 10.8.2). Prepend it to every command, and note PowerShell state does not
persist between tool calls:

```powershell
$env:Path = "C:\tools\node-v20.18.1-win-x64;$env:Path"
```

Use the **PowerShell tool for anything Node**. The Bash tool cannot see `node` or
`npx` even with the PATH prefix.

Git pushes need Git Credential Manager coaxed out of non-interactive mode, or it
refuses instantly with "Cannot prompt because user interactivity has been disabled":

```powershell
$env:GCM_INTERACTIVE = 'true'
git -c credential.interactive=true -c credential.guiPrompt=true push ...
```

Reads work without this because the repo is public, so `git ls-remote` succeeds
anonymously. That is misleading: it does not mean push will work.

## Commands

```powershell
# test once (CI=true stops Jest entering watch mode)
$env:CI = 'true'; npx react-scripts test --watchAll=false

# build (CI=true makes warnings fail the build)
$env:CI = 'true'; npm run build

# dev server
$env:BROWSER = 'none'; $env:PORT = '3366'; npm start
```

Dev server runs on **3366**, not 3000. It is reachable from a phone on the same
wifi at `http://<machine-lan-ip>:3366`; the IP changes between sessions, so read it
from the "On Your Network" line in the start output.

## Branches and deploying

Three branches with three different jobs. They are **not** interchangeable.

| Branch | Holds | Serves |
|---|---|---|
| `main` | source (`njnew/nutrijewel-website/`) | nothing |
| `nutrijewel-test` | **built output**, staging snapshot | nothing |
| `gh-pages` | **built output** | **nutrijewel.com, live** |

`nutrijewel-test` holds a build, not source. Do not push source to it.

Local branch `nutrijewel-test` is the **source** working branch, despite sharing a
name with the remote deploy branch. Push it to `main`.

```powershell
# 1. source to main
cd d:\Downloads\VS-W\nutrijewel
$env:GCM_INTERACTIVE = 'true'
git push origin nutrijewel-test:main

# 2. build to the staging branch
cd d:\Downloads\VS-W\nutrijewel\njnew\nutrijewel-website
npm run build
npx gh-pages -d build -b nutrijewel-test
```

`npm run deploy` targets `gh-pages`, which is **production**. Only run it on an
explicit instruction.

GitHub Pages serves one branch per repo, currently `gh-pages`. So a build pushed to
`nutrijewel-test` is a reviewable snapshot with **no browsable URL**. Phone testing
happens against the dev server.

`public/CNAME` (`nutrijewel.com`) is copied into every build, so it lands on
`nutrijewel-test` too. Inert while Pages points at `gh-pages`, but two branches
claiming one custom domain would bite if Pages is ever repointed.

There is no CI (`.github/workflows` does not exist), so pushing `main` does not
deploy anything.

## Repo layout

Repo root is `d:\Downloads\VS-W\nutrijewel`, one level **above** the app. The React
app is `njnew/nutrijewel-website/`. The repo root also contains an old built copy
of the site (`index.html`, `static/`, etc). `git status` paths are repo-relative.

`njnew/nutrijewel-website/video/` is ~173MB of raw camera MP4s and is gitignored.
The web versions the site actually loads are the compressed files in
`public/reels/`, which are committed.

## Stack facts worth knowing

- Create React App (`react-scripts` 5.0.1, unmaintained) + React 19. Static host,
  **no backend**. Checkout is a prefilled WhatsApp message.
- `products.data.js` and `hampers.data.js` are CommonJS so
  `scripts/create-static-routes.js` can `require` them at build time. The ESM
  wrappers `products.js` / `hampers.js` are what components import.
- Several products are commented out inside `/* */` in `products.data.js`. The live
  catalogue is smaller than the file looks.
- SPA routing on a static host works via the `404.html` redirect trick plus a
  decoder in `index.html`, so deep links like `/hampers/diwali` resolve without
  per-route files.
- CRA's Jest 27 cannot parse ESM-only packages. `package.json` carries a
  `transformIgnorePatterns` exception for `lenis` and maps `@number-flow/react` to
  a stub at `src/test/numberFlowMock.js`.
- One rail pattern only: the native scroll-snap `Shelf` (`src/components/Shelf.js`).
  Do not reintroduce a carousel library.
- **The mobile menu overlay lives inside `.navbar`**, and `.navbar` is
  `position: sticky; z-index: 1000`, which **creates a stacking context**. So no
  z-index on the overlay can ever beat something outside the navbar. The homepage
  marquee is `position: fixed; z-index: 1001` and kept painting over the open menu.
  The fix is `.navbar.menu-open { z-index: 1300 }`, lifting the whole context. If
  anything ever appears on top of the mobile menu again, look here first.
- All scrolling goes through `src/lib/smoothScroll.js`. It is the only module that
  knows Lenis exists. Do not call `scrollIntoView` or `window.scrollTo` directly.

## Design system

- Brand green tokens (`--nj-*`) live in `src/index.css`.
- Gifting surfaces use a separate palette in `src/styles/hamperPalette.css`
  (indulgent red, `--hmp-*`). Swapping it is a four-value change; the file
  documents how.
- Bakery patterns (gingham, plaid, stripes, windowpane, graph) in
  `src/styles/patterns.css`, applied via `nj-pat nj-pat--<pattern> nj-pat--<tone>`.
  Currently only on hamper surfaces; available site-wide.
- `BakeryStamp` replaces gradient-pill-plus-sparkle badges. No gradient pills.
- Respect `useReducedMotion()` on every animation. There is a `prefers-reduced-motion`
  block in `hampers.css` as a backstop.

## Known outstanding

- **GA4 is still `G-XXXXXXXXXX`** in `public/index.html`. The site collects zero
  analytics. Nothing built is measurable until this is a real ID.
- Imported hamper products are placeholder pricing, all flagged `isPlaceholder: true`.
  Confirm sourcing and set real prices before they can be ordered.
- Hamper box prices and discount tiers are invented placeholders in
  `hampers.data.js`. Owner decisions.
- Desktop nav squeezes between 769px and 900px. The real fix is raising the
  hamburger threshold, which means untangling five interlocking media queries in
  `Navbar.css`.
- `ScrollToTop.css` used to reference `--primary-green` / `--secondary-green`, which
  are defined nowhere. Fixed, but other files may have similar dangling vars. An
  audit of every `var(--...)` against `index.css` is worth doing.
