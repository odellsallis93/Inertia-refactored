# Inertia verification map

This directory is the maintained source for verifying the user-facing behavior of the Inertia Artist Management site. Read this index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch with `control-inertia up` (production build on an isolated port) and require `control-inertia doctor` to pass.
- Every recipe assumes `C=.cursor/skills/verify-inertia/scripts/control-inertia` and runs from the repo root.
- Viewport 1440x900 @1x unless a recipe says otherwise. Responsive layouts below 1024px are not yet mapped.
- The site has no persisted state, accounts, or seed data. Each `open` is a fresh page load; in-session state (whether the intro has played) lives only in the current tab.
- Never drive an instance that was not started by this verification run (in particular, not the developer's `next dev` on `:3000`).

## Driving conventions

- Start every recipe from `$C open <route>`, which waits for the shell to be interactive, unless its preconditions say otherwise.
- After clicking any in-app link, first wait for `location.pathname` to change, then `$C ready`. Clicks during a transition are silently dropped by the app.
- Prefer the CSS handles listed in `SKILL.md`; the app has few ARIA roles because the legacy markup uses `div`/`li` for controls. Use `snapshot -i -s <selector>` to scope.
- Read state with `$C browser eval "<js>"`; drive with `click`, `hover`, `press`. Treat every command as literal.
- `mailto:` links are asserted by `href`, never clicked. YouTube iframes are asserted by `src`, never waited on.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen: a before `capture`, the `eval` assertion output, an after `capture`.
- UI proof is `$C capture <feature> <name>`: URL, ARIA snapshot, and a 1440x900 screenshot, saved under the run's `evidence/<feature>/`.
- State proof is the JSON printed by `eval`; paste it into the report or save it beside the captures.
- Record the `RUN_ID`, feature ID (`Sub-features` heading IDs), and the entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with control-inertia` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Welcome intro](./welcome-intro.md) covers the one-time home intro, the handoff to the interactive shell, and no-replay on return.
- [Off-canvas menu](./off-canvas-menu.md) covers opening from the Menu button, the three links, navigating from the menu, and the close icon.
- [Page transitions](./page-transitions.md) covers side-nav navigation between Home and About, heading swap, active state, and legacy `.html` redirects.
- [Roster and artist pages](./roster-and-artist-pages.md) covers the six roster tiles, hover preview, artist detail content, socials, and unknown-slug 404.
- [Latest news and media](./latest-news-and-media.md) covers the scrolling news marquee and the video lightbox open/close.
