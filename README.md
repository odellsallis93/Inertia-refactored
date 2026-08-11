# Inertia — Front-end

**Live site:** [https://inertia-refactored.vercel.app/](https://inertia-refactored.vercel.app/)

A simplified version of a client's frontend, rebuilt on a modern stack. The site is animation-heavy: a welcome intro, page transitions, an off-canvas menu, marquees, and video lightboxes are all core to the experience.

The original version was written by hand, pre-AI. It has since been migrated and converted to Next.js via [Cursor](https://cursor.com), using a custom skill I have written to ensure animation parity across the migration (see [Animation Parity Tooling](#animation-parity-tooling) below).

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [React](https://react.dev)
- [GSAP](https://gsap.com) with `[@gsap/react](https://gsap.com/resources/React/)`
- [react-transition-group](https://reactcommunity.org/react-transition-group/)
- TypeScript



## Getting Started

This project uses [Bun](https://bun.sh):

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Other scripts:

```bash
bun run build   # production build
bun run start   # serve the production build
bun run lint    # run ESLint
```



## Project Structure

- `app/` — App Router routes: home, about, and artist detail pages
- `components/` — site chrome (menu, transitions, lightbox), home sections, and shared UI
- `hooks/` — animation hooks (marquee, menu, page transitions)
- `data/` — artist, news, and video content
- `styles/legacy/` — CSS carried over from the original implementation
- `lib/gsap.ts` — GSAP setup and plugin registration



## Animation Parity Tooling

Animation changes are verified against the original implementation using the `anim:*` scripts (recording, frame extraction, and frame diffing):

```bash
bun run anim:record:original
bun run anim:record:migrated
bun run anim:extract
bun run anim:diff
bun run anim:review
```

The behavior spec lives at `.cursor/docs/animation-behavior-spec.md`, and evidence bundles are stored under `.cursor/artifacts/animations/`.