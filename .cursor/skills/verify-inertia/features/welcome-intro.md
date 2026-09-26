# Welcome intro

The first visit to the home page in a tab plays a ~13s branded intro (Insignia mark, white and green sweeps, INERTIA / ARTIST MANAGEMENT wordmark, then wipes) over a black overlay before the persistent site shell is revealed with the roster. Navigating away and back to the home page in the same tab does not replay it; direct loads of `/about` or an artist page never show it.

## Sub-features

- `intro-plays` a fresh load of `/` shows the welcome overlay first and the shell is not interactive yet.
- `intro-handoff` after the intro, the overlay is gone and the roster with six artist tiles is interactive.
- `intro-no-replay` returning to `/` via in-app navigation reveals the roster through the normal route transition, with no welcome overlay.
- `intro-not-on-subpages` a fresh load of `/about` shows no welcome overlay.

## How to get to it (user POV)

- Load `http://<host>/` in a fresh tab.
- From `/about` or an artist page, choose `Home` in the left side nav or `Roster` in the menu.

## Driving it with control-inertia

Preconditions:

- `$C doctor` passes.
- A fresh browser session or a tab that has not visited `/` yet in this run (the first `$C open` in a run satisfies this).

- **Overlay present (`intro-plays`).** Load home without the readiness wait. Run `$C browser open "$($C url /)"`, then `$C browser wait --fn "!!document.querySelector('.fullSite-WrapperWel')" --timeout 5000`. Prints `true`. Then `$C browser eval "getComputedStyle(document.querySelector('.fullSite-Wrapper')).visibility"` prints `"hidden"`: the shell is still covered.
- **Mid-intro proof.** Run `$C capture welcome-intro 01-intro-overlay` within the first few seconds. The screenshot shows the black welcome field with the Insignia mark and/or sweeps; no roster is visible.
- **Handoff (`intro-handoff`).** Wait for the shell. Run `$C ready` (takes ~13s from load). Then `$C browser eval "JSON.stringify({welcomeLayer: !!document.querySelector('.fullSite-WrapperWel'), rosterTiles: document.querySelectorAll('a.artistNav__link').length, wrapperVisibility: getComputedStyle(document.querySelector('.fullSite-Wrapper')).visibility})"` prints `welcomeLayer: false`, `rosterTiles: 6`, `wrapperVisibility: "visible"`.
- **Proof of handoff.** Run `$C capture welcome-intro 02-shell-after-intro`. The screenshot shows the sideways INERTIA logo on the left, the roster tiles in the center, and the news/media columns on the right.
- **No replay (`intro-no-replay`).** Leave and return. Run `$C browser click '.sideNav__Wrapper a[href="/about"]'`, `$C browser wait --fn "location.pathname === '/about'" --timeout 10000`, `$C ready`, then `$C browser click '.sideNav__Wrapper a[href="/"]'`, `$C browser wait --fn "location.pathname === '/'" --timeout 10000`, `$C ready`. Then `$C browser eval "!!document.querySelector('.fullSite-WrapperWel')"` prints `false`, and the round trip took a few seconds, not ~13.
- **Not on subpages (`intro-not-on-subpages`).** Run `$C open /about`, then `$C browser eval "!!document.querySelector('.fullSite-WrapperWel')"`. Prints `false`.

## Gotchas

- `$C open /` blocks through the whole intro; use raw `$C browser open` when you need to observe the overlay itself.
- The no-replay flag is per tab (React state in `SiteChrome`), not persisted. A new `open` of `/` in the same session replays the intro. That is expected, not a bug.
- Frame-accurate motion questions about the intro belong to the `animation-parity` skill and `.cursor/docs/animation-behavior-spec.md`; this map only proves the state machine (plays, hands off, does not replay).
- The intro does not respect `prefers-reduced-motion`; do not set `agent-browser set media reduced-motion` expecting a shortcut.
