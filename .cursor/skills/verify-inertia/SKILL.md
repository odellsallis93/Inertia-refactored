---
name: verify-inertia
description: "Drive the Inertia Artist Management site (Next.js web UI) the way a visitor does and capture proof: launch an isolated production instance, wait through the intro and route transitions, open the menu, follow roster links, open the video lightbox, and save screenshots plus ARIA snapshots. Use whenever a change touches app/, components/, hooks/, styles/, data/, or config/ and you need evidence it works, not just a passing build."
---

# Verify Inertia

Inertia is a single Next.js 16 App Router web app: roster home (`/`), `/about`, and six artist pages (`/artists/<slug>`), wrapped in a persistent animated shell (welcome intro, GSAP route transitions, off-canvas menu, news marquee, video lightbox). There is no API, CLI, or auth. Everything a user touches is in the browser, and almost every interaction is gated by an animation, so **waiting for the right state is the whole game**. The helper below encodes those waits; use it rather than raw sleeps.

Helper: `.cursor/skills/verify-inertia/scripts/control-inertia` (executable bash). Every command below is run from the repo root. Alias it for brevity:

```bash
C=.cursor/skills/verify-inertia/scripts/control-inertia
```

Read [`features/README.md`](features/README.md) before driving; it is the maintained map of what to prove and how.

## Launch

`next dev` refuses to start twice in the same directory (Next 16 holds `.next/dev/lock`), and the developer usually has one running on `:3000`. Never drive that instance: it is their session, with HMR and whatever state they left it in. Verification runs a **production build on its own port** instead, which Next 16 permits alongside a dev server because dev output lives in `.next/dev/` and build output in `.next/`.

```bash
$C up                # next build (~11s) + next start on the first free port in 3400-3499
$C up --skip-build   # reuse the existing .next/ build (only if you know it is current)
```

`up` prints `RUN_ID`, `URL`, `PID`, and `EVIDENCE`. It records the run as current, so later commands need no arguments. To keep several runs apart, set `VERIFY_RUN_ID=<id>` on every command. Readiness is `GET /` answering 200; `up` fails loudly if the server dies or does not answer within 30s (log at `.cursor/artifacts/verify-inertia/runs/<RUN_ID>/state/server.log`).

Constraints:

- One `up` with a build at a time. Builds share `.next/` and Next serializes them with `.next/lock`; a rebuild also replaces the files a running `next start` is serving, so tear down before rebuilding.
- The build is a snapshot. Edit code, then `up` again; do not expect hot reload.
- Default viewport is 1440x900 @1x (matches the `animation-parity` captures). Override with `VERIFY_VIEWPORT_WIDTH`, `VERIFY_VIEWPORT_HEIGHT`, `VERIFY_DPR`.

## Doctor

Run this first whenever anything looks off, and always before a proof run. It is read-only and exits non-zero if the instance is not worth driving.

```bash
$C doctor
```

Checks: server pid alive, the port's listener is that pid (not someone else's server), `GET /` is 200 and `x-powered-by: Next.js`, the HTML contains `class="fullSite-Wrapper"` and `id="openButton"`, `.next/BUILD_ID` is unchanged since `up` and the server serves that build's `_buildManifest.js`, and `agent-browser` is on PATH.

## Drive

The harness is [`agent-browser`](https://github.com/vercel-labs/agent-browser) in a per-run isolated session (`verify-inertia-<RUN_ID>`). `$C browser <args>` forwards any agent-browser command into that session; `$C open` and `$C ready` add the app-specific waits.

```bash
$C open /about                       # navigate + wait until the shell is interactive
$C browser snapshot -i               # ARIA tree with @refs
$C browser click "#openButton"       # CSS selectors and @refs both work
$C browser eval "location.pathname"  # inspect state
$C ready                             # after in-app navigation, wait for the transition to finish
```

**What "interactive" means here.** `open` and `ready` wait for: `.fullSite-Wrapper` visible, the welcome layer (`.fullSite-WrapperWel`) gone, every transition slice (`.transCont__gridleft/News/about/overlayGrid/header`) at `scaleX(0)`, the page cover (`.transBlk__lt`) at `scaleY(0)` or hidden, and every `.allText` with its GSAP inline transform cleared. That last step is what `SiteChrome` does right before it starts accepting link clicks again; click earlier and the click is silently swallowed (`isTransitioningRef`). Timeout is 60s (`VERIFY_READY_TIMEOUT_MS`); the home intro alone takes ~13s.

**Navigating between routes.** Internal `<a>` clicks are intercepted by `SiteChrome`, which plays a ~3s leave animation before `router.push`. So after clicking a link:

1. Wait for the URL to actually change: `$C browser wait --fn "location.pathname === '/about'" --timeout 10000`. Do not use `wait --url` with the bare home URL; it matches immediately on any path.
2. Then `$C ready`.

Skipping step 1 makes `ready` pass instantly (the old page is still interactive) and everything after it runs against the wrong route.

Stable handles (all verified against the running app):

| Thing | Selector / command |
| --- | --- |
| Menu button | `#openButton` |
| Off-canvas menu panel | `.offNav__wrap` (hidden: `visibility: hidden`, `translateX(100%)`; open: `visible`, `translateX(0)`) |
| Menu links | `.offNav a[href="/"]`, `.offNav a.menuAbout`, `.offNav a[href^="mailto:"]` |
| Menu close | `#closeIcon` |
| Side nav links | `.sideNav__Wrapper a[href="/"]`, `.sideNav__Wrapper a[href="/about"]`; active item is `.navMenu-text.active` |
| Roster links (home only) | `a.artistNav__link[href="/artists/<slug>"]`; hover reveals `video` (`visibility: visible`) and turns `h1` white |
| Page headings | `.profileCat`, `.artistName` (rendered text; e.g. `About Us` / `Artist MGMT`) |
| Artist page | `.profilePic--caash` (img), `.bio__wrap p`, `a.artistSocial[aria-label="Instagram"]` |
| Media thumbnails | `a.videoWrap[data-video-id="<id>"]` (ids in `data/videos.ts`) |
| Lightbox | `#overlay` (visibility), `#moviePlayer` (iframe `src`), `.lightbox-close` |
| News marquee | `#scrollCol .boxMarquee` (12 cards), `.marqueeTrack` (translateY moves continuously) |

Prefer these over coordinates and tab order. When you need a ref, `$C browser snapshot -i -s ".offNav__wrap"` scopes the tree.

## Evidence

Proof lives under `.cursor/artifacts/verify-inertia/runs/<RUN_ID>/evidence/<feature>/`, one folder per feature file in the map. Capture with:

```bash
$C capture off-canvas-menu 02-menu-open
# writes 02-menu-open.url.txt, 02-menu-open.aria.txt (snapshot -i), 02-menu-open.png (1440x900)
$C evidence off-canvas-menu     # prints (and creates) the folder
```

Standards for a proof:

- **Exercise the real user path.** Click `#openButton`, do not call the menu's `open()`; click a roster link, do not `router.push`. `eval` is for reading state, not for driving it.
- **Capture the action and the resulting state**, not only the final screen: a before capture, the state assertion (`eval` output pasted into your report or saved next to the captures), and an after capture.
- **Verify the side effect**, not the animation's promise: the lightbox proof is `#moviePlayer.src === embedUrl`, and after close `getAttribute("src") === ""`; the navigation proof is `location.pathname` plus rendered heading text plus the side-nav active state.
- **Cover every entry point the map lists.** Menu-to-About and side-nav-to-About are different code paths; a proof that drives one is incomplete when the feature file lists both.
- No mocks. The site has no external boundary except YouTube embeds (the iframe `src` is the assertion; do not wait for YouTube to render) and `mailto:` links (assert the `href`, do not click).

Record the `RUN_ID`, feature ID, and entry point used with every artifact you cite.

## Cleanup

```bash
$C down          # close the browser session, stop the server *this run* started, delete state/
$C list          # see every run: running / stale / torn down
```

`down` kills only the recorded pid, and refuses if the port is owned by a different process. It never touches `evidence/`; artifacts survive teardown at the path `down` prints. Run `down` after failed attempts too, so broken iterations do not strand a server on 3400. If `list` shows a `stale state` run, `VERIFY_RUN_ID=<id> $C down` clears it.

## Helpers

- `scripts/control-inertia` (bash, `chmod +x`): `up`, `doctor`, `url`, `open`, `ready`, `browser`, `capture`, `evidence`, `list`, `down`. `--help` prints usage and env vars.
- `features/`: the verification map. `README.md` is the index and shared conventions; one file per user-facing feature.

Related: the `animation-parity` skill (`~/.cursor/skills/animation-parity/`) and `.cursor/animation/flows/` handle frame-level motion parity against the original site. Use this skill to prove behavior and end states; use that one when the question is whether a motion matches the legacy implementation.
