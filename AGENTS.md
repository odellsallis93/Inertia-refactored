<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Animation and 3D Verification Policy

When changing CSS transitions, GSAP timelines, Framer Motion, canvas/WebGL scenes,
scroll choreography, overlays, intros, menus, or modals:

- Do not claim parity from a single screenshot.
- Treat the original implementation as the behavior spec.
- Before recording or testing, create `.cursor/docs/animation-behavior-spec.md` if it
  does not exist. It must document observed state transitions, timing and
  delays, one-time lifecycle rules, accessibility assertions, forbidden
  intermediate states, automation actions, and acceptance criteria for every
  affected flow.
- Do not use an incomplete template or test a flow absent from the behavior
  specification. Resolve ambiguity about feature flags, intro versus navigation
  lifecycle, or legacy behavior versus product intent first.
- Record the affected interaction on the original implementation and the new
  implementation.
- Capture video, annotated baseline and end-state screenshots, and structural
  snapshots.
- Extract video frames at fixed intervals, normally every 100ms, and diff
  matching frames.
- Use explicit readiness, synchronization, and clarity waits.
- Ask clarifying questions when feature flags, intro versus navigation lifecycle,
  or old behavior versus product intent is ambiguous.
- Prefer faithful ports of imperative animation logic first, then refactor.
- Keep animation logic in isolated files, not giant mixed UI components.

A task is not done until the evidence bundle supports the claim. Use
`.cursor/artifacts/animations/<flow>/` and the `anim:*` scripts in `package.json`;
each test run stores the behavior spec and capture metadata alongside its
evidence.
