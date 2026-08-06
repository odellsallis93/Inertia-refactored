---
name: animation-parity
description: Enforces evidence-based verification for animation, motion, 3D, and WebGL changes. Use when changing transitions, intros, menus, modals, scroll choreography, GSAP timelines, Framer Motion, canvas, Three.js, React Three Fiber, or animation-heavy migrations.
---

# Animation Parity

Use this workflow whenever a change can alter timing, ordering, lifecycle, or intermediate visual states.

## Quick Start

1. Ensure the repo has the skill's working folders inside its local `.cursor`
   directory: `.cursor/docs/` and `.cursor/artifacts/animations/`. Create any
   that are missing. The skill's executable helpers live in this skill's
   `scripts/` directory.
2. Look for `.cursor/docs/animation-behavior-spec.md`. If it does not exist,
   create it before changing or testing motion.
3. Build the spec from the source implementation, existing recordings, and
   browser observation. It must cover every affected interaction, animation, and
   transition; do not create a stub or leave `TODO` placeholders.
4. Ask before proceeding if feature flags, intro lifecycle, or legacy behavior
   conflict with product intent.
5. Lock the comparison environment: browser, viewport, DPR, color scheme,
   reduced-motion setting, route state, and seeded randomness where possible.
6. Record the original flow before changing it, then record the migrated flow
   with the same actions and explicit waits.
7. Create the evidence artifacts while testing: videos, screenshots, structural
   snapshots, fixed-interval frames, diff images, capture metadata, and summary.
8. Extract frames at 100ms intervals, diff matching frames, inspect the worst
   timestamps, and update the behavior spec if testing exposes a missing rule.
9. Report the spec path, artifact path, timing drift, mismatch statistics,
   forbidden intermediate states, and pass/fail status.

## Behavior Spec Is Required

`.cursor/docs/animation-behavior-spec.md` is the repository's behavior contract. Create
it from [behavior-spec-template.md](behavior-spec-template.md) only when it is
missing; replace every template marker with observed behavior before testing.

For each affected flow, specify:

- trigger, preconditions, route, and exact automation actions
- initial, intermediate, and terminal visual/structural states
- ordered phases with duration, delay, easing, and expected timestamps
- one-time lifecycle, interruption, navigation, and reduced-motion behavior
- required accessibility/DOM assertions and forbidden transient states
- deterministic-WebGL handling, masks/crops, and acceptance thresholds

The behavior spec must describe observed behavior, identify unknowns explicitly
as blocking questions, and distinguish legacy behavior from confirmed product
intent. Do not run `anim:review` until relevant flows are complete.

## Required Evidence

A parity claim requires:

- a complete behavior spec linked to the tested flow
- full session video for original and migrated flows
- annotated baseline screenshot
- baseline structural snapshot
- end-state screenshot(s)
- end-state structural snapshot(s)
- extracted fixed-interval frames
- capture metadata, including URL and comparison environment
- machine-readable per-frame diff summary

No video and frame diff means no animation parity claim.

## Pass/Fail Defaults

- start-time drift: <= 100ms
- end-time drift: <= 100ms
- mean UI-region mismatch: <= 1.5%
- peak critical-key-frame mismatch: <= 3%
- zero forbidden intermediate states, including one-frame flashes
- human review required for hero transitions, intros, menus, modals, and brand-critical WebGL

## Repository Workflow

The recording, extraction, and diff scripts live in
`.cursor/skills/animation-parity/scripts/animation/` (plus
`.cursor/skills/animation-parity/scripts/diff-frames.mjs`); the `anim:*`
commands in `package.json` must point at them. Store outputs under
`.cursor/artifacts/animations/<flow>/`. `anim:review` refuses to run without the
canonical behavior spec and copies it into that flow's artifacts. Keep
choreography in isolated files and timing values centralized. Prefer a faithful
imperative port before refactoring.

For the spec template, commands, flow configuration, WebGL masking, and
troubleshooting, read [reference.md](reference.md).
