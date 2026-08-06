# Animation Parity Reference

## Working folders live in `.cursor/`

All of the skill's working folders belong inside the repository's local
`.cursor` directory, not at the repo root:

- `.cursor/docs/` — the behavior spec
- `.cursor/skills/animation-parity/scripts/` — recording, extraction, and diff
  scripts
- `.cursor/artifacts/` — per-flow evidence bundles

Create the docs and artifacts folders if they are missing before recording, and
keep the `anim:*` commands in `package.json` pointed at the skill's scripts.

## Behavior specification first

The canonical behavior contract is `.cursor/docs/animation-behavior-spec.md`.

Before a parity run, search for it. If missing, create it from
[behavior-spec-template.md](behavior-spec-template.md) after inspecting the
source implementation and observing the affected flows. A copied template is
not a valid specification. Complete every field relevant to the flow, remove
template markers, and resolve blocking questions before recording.

Treat the original implementation as evidence rather than unquestioned product
intent. Call out differences between legacy behavior and confirmed requirements.
Update only the affected flow when behavior changes; preserve accepted evidence
and historical decisions.

## Artifact layout

Each flow is stored independently:

```text
.cursor/artifacts/animations/<flow>/
  original/
    before.annotated.png
    before.snapshot.txt
    capture-metadata.txt
    run.webm
    after.png
    after.snapshot.txt
    frames/
  migrated/
    before.annotated.png
    before.snapshot.txt
    capture-metadata.txt
    run.webm
    after.png
    after.snapshot.txt
    frames/
  diffs/timeline/
    frame-0001.png
    summary.json
  behavior-spec.md
```

`anim:review` copies the exact behavior spec used for the run to
`behavior-spec.md`, making an artifact self-contained. Ignore
`.cursor/artifacts/animations/*` in Git. Keep representative evidence locally or
attach it to the task/PR when the result matters.

## Prerequisites

Install and verify:

- a running original and migrated site
- `agent-browser` (or a compatible CLI with the same commands)
- `ffmpeg`
- Node dependencies: `pixelmatch` and `pngjs`

The scripts use these environment variables:

```bash
export ORIGINAL_URL=http://localhost:4000
export MIGRATED_URL=http://localhost:3000
export ANIMATION_VIEWPORT_WIDTH=1440
export ANIMATION_VIEWPORT_HEIGHT=900
export ANIMATION_DPR=2
```

## Recording a flow

Run the original first:

```bash
npm run anim:record:original -- home-intro
```

Then run the migrated implementation:

```bash
npm run anim:record:migrated -- home-intro
```

The default recorder captures page load and a clarity pause. For a real
interaction, add an executable flow script at
`.cursor/skills/animation-parity/scripts/animation/flows/<flow>.sh`. It receives
the browser session name as
its first argument and should perform the exact same actions in both runs:

```bash
#!/usr/bin/env bash
set -euo pipefail
SESSION="${1:?Missing browser session}"

agent-browser --session "$SESSION" click @e3
agent-browser --session "$SESSION" wait 1500
```

Use three waits deliberately:

1. `wait --load networkidle` for a stable starting line.
2. `wait --fn "..."` for an app readiness or animation phase signal.
3. `wait 500` or `wait 1500` as a recording clarity window.

Useful app signals include `window.__pageReady`, `window.__introFinished`,
`data-phase`, and `data-animation-id`.

## Extracting and diffing

Extract 100ms frames (10fps):

```bash
npm run anim:extract -- home-intro
```

Diff matching frames:

```bash
npm run anim:diff -- \
  .cursor/artifacts/animations/home-intro/original/frames \
  .cursor/artifacts/animations/home-intro/migrated/frames \
  .cursor/artifacts/animations/home-intro/diffs/timeline
```

Run the complete sequence:

```bash
npm run anim:review -- home-intro
```

The wrapper fails before recording when `.cursor/docs/animation-behavior-spec.md` is
missing, incomplete, or missing a matching `### <flow-name>` section, so the
behavior contract cannot be skipped. Use lowercase kebab-case flow names. The
wrapper creates the flow artifact directory and persists the spec, recordings,
snapshots, frames, diff images, metadata, and summary as it runs.

The diff script writes `summary.json` with per-frame mismatch percentages,
mean mismatch, peak mismatch, and frames above the default 3% threshold.
Different frame counts are reported as a failure because the timelines are not
aligned.

## Structural and visual review

Use temporal diffs for motion and ordering, spatial screenshots for exact
appearance, and structural snapshots for semantic state. Verify modal presence,
hidden/inert background content, disabled controls, and text swaps at the
correct phase.

For nondeterministic WebGL, seed randomness or crop/mask the animated region
before diffing. Do not fail a UI migration solely because decorative particles
drift. Do not mask UI choreography or brand-critical motion.

## Minimum flow matrix

When applicable, review:

- cold page-load intro
- forward and backward navigation
- menu open and close
- modal open and close
- return home after navigation
- deep-link reload
- interrupted interactions
- mobile-specific motion and camera behavior

## Troubleshooting

- `agent-browser: command not found`: install it or adapt the recorder scripts
  to the browser automation CLI used by the project.
- `ffmpeg: command not found`: install FFmpeg and ensure it is on `PATH`.
- missing or mismatched frames: confirm both videos were recorded at the same
  viewport and that the clarity pause is long enough.
- noisy WebGL diffs: seed time/randomness or restrict comparison to the DOM/UI
  region.
- timing drift: add explicit readiness and phase signals rather than increasing
  arbitrary sleeps.
- one-frame flash: inspect adjacent frames and structural snapshots; a final
  screenshot cannot prove this bug is absent.
