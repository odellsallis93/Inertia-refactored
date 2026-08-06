# Animation Behavior Specification

## Scope and evidence sources

- Source implementation inspected: the current Next.js/GSAP implementation in `components/home/WelcomeAnimation.tsx`, `components/SiteChrome/index.tsx`, `components/SiteChrome/OffCanvasMenu.tsx`, `components/SiteChrome/Lightbox.tsx`, `components/home/RosterLink.tsx`, `components/shared/MediaGrid.tsx`, and `components/shared/NewsMarquee.tsx`; related legacy CSS in `styles/legacy/`.
- Historical references inspected: `extracted-openai-log/MIGRATION_ANALYSIS.md` and `extracted-openai-log/MIGRATION_ANALYSIS_DISCORD.md`.
- Confirmed product intent: retain the legacy choreography, use the intro only on the first home-page entry in a client session, and treat flashes or out-of-order transition layers as defects.
- Evidence limitation: an executable original implementation and its URL are not present in this repository. This specification records the observable contract encoded by the migrated implementation and the historical migration analysis. It is valid for migrated-flow regression captures; an original-versus-migrated parity result requires the original URL before `anim:review` is run.

## Comparison environment

- Browser and version: Chromium supplied by the recording environment; record its exact version in each capture metadata file.
- Viewport and DPR: 1440 × 900 CSS pixels at DPR 2.
- Color scheme and reduced-motion setting: light color scheme; `prefers-reduced-motion: no-preference`.
- Network and font readiness condition: use local assets; wait for `document.fonts.ready`, `networkidle`, and two animation frames before starting a timed action.
- Route, route state, and authenticated state: unauthenticated public routes only. Begin each flow with a fresh page unless the flow explicitly tests in-session return behavior.
- Randomness/time controls: no WebGL or random animation is in scope. The news marquee is time-based; begin captures after its initial `y: 0` set.
- WebGL comparison region or excluded decorative region: no region is excluded. Diff the full viewport.

## Cross-flow rules

- The transition-layer selectors are `.transBlk__lt`, `.transCont__gridleft`, `.transCont__header`, `.transCont__overlayGrid`, `.transCont__News`, and `.transCont__about`.
- A covering layer has `scaleX: 1` or `scaleY: 1`; a revealed layer has `scaleX: 0` or `scaleY: 0`. Covering layers must not expose an intermediate blank page or a one-frame flash of incoming `.allText`.
- The page transition gate ignores additional internal navigation clicks from the first accepted click until the enter sequence completes.
- The current implementation does not define a reduced-motion alternative. Record this as the expected legacy-compatible behavior: motion plays at its normal duration even when reduced motion is enabled. A product decision to change that behavior requires an updated specification before implementation.
- All durations below are GSAP seconds converted to milliseconds. Timing acceptance is start and end drift of at most 100 ms, with zero forbidden states.
- The vertical `.latestNewstx` and `.latestMediatx` labels use their respective heading column as a size container. Their `20cqw` font size must decrease with the column width and remain within the column at every supported viewport.

## Flows

### `home-intro`

**Purpose**

Reveal the home page through the one-time welcome composition, then reveal the persistent page shell and its text.

**Trigger and preconditions**

- Route: `/`
- Initial state: fresh client session, `WelcomeContext.hasPlayed` is false, `.fullSite-WrapperWel` is a fixed black full-viewport layer, and its individual SVG pieces are CSS-hidden until GSAP sets them visible.
- User action or automatic trigger: automatic `Transition` appear event after the home page mounts.
- Automation procedure:
  1. Open `/` in a new browser context.
  2. Wait for `document.fonts.ready`, `networkidle`, and two animation frames.
  3. Start video recording before the first animation frame.
  4. Wait 13 seconds to include the final overlay reveal and text entrance.
  5. Capture the terminal screenshot and DOM snapshot.

**Expected timeline**

| Timestamp | Phase | Visual behavior | Structural/accessibility behavior |
| --- | --- | --- | --- |
| 0 ms | welcome start | Black welcome layer covers the viewport. The insignia starts right-shifted and half scale; content shell remains concealed. | `.fullSite-WrapperWel` exists and is topmost; `.fullSite-Wrapper` is not yet visually available. |
| 0–2,000 ms | insignia entrance | White insignia becomes visible, scales to full size with `back.out(2)`, then begins its leftward movement. | No interactive control is intentionally enabled by this sequence. |
| 1,000–5,800 ms | white sweep | The white rectangle grows through four skewed horizontal stages. | The welcome SVG remains the only visible composition. |
| about 5,500–7,100 ms | green sweep and word reveal | Green vertical sweep appears; the INERTIA and Artist Management paths become visible and white while the insignia turns green. White and green sweeps collapse according to their overlapping timelines. | Welcome text remains presentation-only SVG content. |
| about 7,600–9,800 ms | black wipe and side sweep | Black wipe covers behind the departing insignia; insignia travels right as the white side overlay expands across the page. | The welcome layer must remain visually continuous; no page-content flash is allowed. |
| about 9,800–12,400 ms | page cover exchange | White `.transBlk__lt` covers, the persistent shell becomes visible behind it, then the white cover collapses upward. The grid/header/news/about overlay slices retract rightward after a two-second delay. | `.fullSite-Wrapper` becomes visible. Welcome layer is hidden and then removed from the rendered tree when `markPlayed()` updates context. |
| about 12,400–13,100 ms | page text entrance | `.allText` enters from `xPercent: -100` to `0` with an expo ease. | Persistent route content is available for normal interaction. |

**Timing**

- Duration: approximately 13,100 ms from first welcome frame through text entrance; overlapping timeline positions are intentional.
- Delay: white sweep begins 1,000 ms after welcome start; transition-slice reveal waits 2,000 ms after its own reveal sequence starts.
- Easing: `back.out(2)`, `expo.out`, `expo.inOut`, `expo.in`, and `sine.in` as assigned by the individual GSAP sub-timelines.
- Start and end tolerance: 100 ms.

**Lifecycle and interruption rules**

- Cold load: play exactly once.
- Return navigation: do not replay after navigating away and back to `/` in the same mounted `SiteChrome` session.
- Repeated trigger: remounting the home component after `markPlayed()` returns `null` for `WelcomeAnimation`.
- Interrupted interaction: route navigation is not a supported action before the welcome timeline completes; preserve a continuous cover if it occurs.
- Reduced motion: normal motion remains the current expected behavior.

**Assertions**

- Required final state: `.fullSite-Wrapper` is visible, `.fullSite-WrapperWel` is absent, transition slices have `scaleX: 0`, `.transBlk__lt` has `scaleY: 0`, and `.allText` has `xPercent: 0`.
- Required intermediate state: before page-shell exposure, at least one opaque welcome or transition cover spans the viewport.
- Forbidden transient states: an uncovered black/blank viewport; incoming `.allText` visible before the cover starts retracting; replay of welcome artwork on return navigation; a one-frame visible welcome layer after completion.
- Required DOM/accessibility assertions: SVG decoration must not receive focus; after completion, normal page links are focusable and no removed welcome node remains in the accessibility tree.

**Verification**

- Original URL: unavailable in this checkout; supply `ORIGINAL_URL` before parity review.
- Migrated URL: `http://localhost:3000/`
- Artifact directory: `.cursor/artifacts/animations/home-intro/`
- UI mismatch threshold: mean at most 1.5%; peak critical frame at most 3%.
- Critical frames for human review: 0 ms, 1,000 ms, 5,500 ms, 7,600 ms, 9,800 ms, first `.fullSite-Wrapper` visibility, first text entrance, and terminal state.

### `route-transition`

**Purpose**

Cover an internal route change, navigate only after the leave cover is complete, then uncover and reveal incoming text.

**Trigger and preconditions**

- Route: any supported internal pair: `/`, `/about`, or `/artists/{slug}`.
- Initial state: current route is fully entered; transition gate is idle; menu and lightbox are closed.
- User action or automatic trigger: click an internal link to a different supported path.
- Automation procedure:
  1. Open `/about` and wait until all transition slices are retracted.
  2. Click the Roster link, or start at `/` and click About.
  3. Record until destination text has entered and the gate is idle.
  4. Repeat in reverse direction and once for an artist route.

**Expected timeline**

| Timestamp | Phase | Visual behavior | Structural/accessibility behavior |
| --- | --- | --- | --- |
| 0 ms | accepted click | Outgoing `.allText` begins moving left. | The navigation gate accepts one click and prevents subsequent supported internal clicks. |
| 0–700 ms | outgoing text | `.allText` travels to `xPercent: -100` with `power2.in`. | Outgoing route stays mounted until leave completion. |
| about 900–1,500 ms | horizontal cover | Grid/header/overlay/news/about slices grow from the left together over 600 ms. | Incoming route is not yet pushed. |
| about 1,500–2,100 ms | vertical cover | White `.transBlk__lt` grows upward from the bottom over 600 ms. | On completion, router navigation occurs. |
| destination mount to 600 ms | vertical uncover | Persistent shell is forced visible, welcome layer is hidden, and white cover retracts upward over 600 ms. | Destination route mounts behind the cover. |
| destination mount to about 1,600 ms | slice hold | Horizontal slices reset fully covering, then remain covering for one second of overlap. | `.allText` remains offscreen. |
| about 1,600–2,200 ms | horizontal reveal | All slices retract to the right in parallel over 600 ms with `expo.inOut`. | Destination visual structure becomes exposed. |
| about 2,200–2,900 ms | text entrance | Incoming `.allText` enters from the left over 700 ms with `expo.out`; transition gate resets on completion. | Exactly one destination route is active and keyboard focus remains usable. |

**Timing**

- Duration: leave is about 2,100 ms; destination enter is about 2,900 ms after destination mount.
- Delay: leave slices start 900 ms after text leave begins; enter slices wait 2,000 ms from the start of the overlapping enter timeline, yielding a one-second covered hold after vertical uncover.
- Easing: `power2.in` for outgoing text; `expo.inOut` for covers; `expo.out` for incoming text.
- Start and end tolerance: 100 ms.

**Lifecycle and interruption rules**

- Cold load: non-home routes run the enter transition on initial mount. First home load defers to `home-intro`.
- Return navigation: every route change uses this flow; only the welcome animation is excluded after its first completion.
- Repeated trigger: a second internal click while the gate is active is prevented and does not queue another navigation.
- Interrupted interaction: opening a menu or lightbox during the route transition is outside the supported flow and must not expose incoming content before covers reveal it.
- Reduced motion: normal motion remains the current expected behavior.

**Assertions**

- Required final state: target URL is loaded; all horizontal slices have `scaleX: 0`; `.transBlk__lt` has `scaleY: 0`; target `.allText` has `xPercent: 0`; the transition gate is idle.
- Required intermediate state: target page is mounted only while fully covered by `.transBlk__lt` and the horizontal slices.
- Forbidden transient states: both route texts visible together; destination content visible before the cover retracts; blank viewport; duplicate navigation from rapid clicks.
- Required DOM/accessibility assertions: links retain their native link semantics; external and `mailto:` links bypass the custom route transition; no overlay has pointer-event behavior that blocks the completed destination.

**Verification**

- Original URL: unavailable in this checkout; supply `ORIGINAL_URL` before parity review.
- Migrated URL: `http://localhost:3000/`
- Artifact directory: `.cursor/artifacts/animations/route-transition/`
- UI mismatch threshold: mean at most 1.5%; peak critical frame at most 3%.
- Critical frames for human review: click, 700 ms, 900 ms, 1,500 ms, immediately before `router.push`, destination mount, slice reveal start, text entrance start, and final state.

### `off-canvas-menu`

**Purpose**

Open and close the full-screen navigation panel without exposing a partial or duplicate menu control state.

**Trigger and preconditions**

- Route: any public route.
- Initial state: `.offNav__wrap` has `autoAlpha: 0` and `xPercent: 100`; open control is visible; close control is hidden.
- User action or automatic trigger: click the Menu control to open; click the close icon or an internal menu link to close.
- Automation procedure:
  1. Wait for the page transition flow to finish.
  2. Hover Menu, then capture the hover color state.
  3. Click Menu and record for 1,100 ms.
  4. Click close and record for 1,100 ms.
  5. Repeat by clicking the About menu link and verify the menu closes before the route-transition cover begins.

**Expected timeline**

| Timestamp | Phase | Visual behavior | Structural/accessibility behavior |
| --- | --- | --- | --- |
| hover 0–500 ms | menu hover | Menu lines and label animate from white to `#39B54A` with `expo.in`; reverse on pointer leave. | The Menu control remains the active click target. |
| open 0 ms | open setup | Panel, nav text, animated links, and close icon become visible; open control begins fading out. | Panel is rendered and visually available before translation starts. |
| open 0–40 ms | control swap | Open control fades to hidden. | Close control is available visually; focus is not programmatically moved in the current implementation. |
| open 0–1,000 ms | panel entrance | Panel translates from right (`xPercent: 100`) to `0` while skew resolves from -20 degrees to 0, both `circ.inOut`. | Menu links remain native links. |
| close 0–50 ms | close control | Close icon fades out. | Open control remains hidden. |
| close 0–1,000 ms | panel fade | Panel fades to `autoAlpha: 0` with `circ.inOut`. | Links are not visually available. |
| close 1,000–2,000 ms | panel exit | Panel translates to `xPercent: 100`; open control fades in during the final 40 ms. | Closed panel is non-visible. |

**Timing**

- Duration: opening 1,000 ms; closing 2,000 ms total.
- Delay: none.
- Easing: `circ.inOut` for panel/skew; `expo.in` for hover.
- Start and end tolerance: 100 ms.

**Lifecycle and interruption rules**

- Cold load: panel initializes off-canvas and hidden.
- Return navigation: route changes preserve the component instance; panel state must be closed before an internal menu navigation proceeds.
- Repeated trigger: current component does not debounce repeated open clicks; a parity capture uses one click only.
- Interrupted interaction: clicking a menu link calls close immediately, while site-level navigation starts its independent cover flow. The cover must prevent a destination flash.
- Reduced motion: normal motion remains the current expected behavior.

**Assertions**

- Required final state: after open, panel is visible at `xPercent: 0` and Menu is hidden; after close, panel is hidden at `xPercent: 100` and Menu is visible.
- Required intermediate state: menu text and links are visible before the panel crosses into view.
- Forbidden transient states: visible panel with both close and Menu controls hidden; open control visible while an open panel is interactive; panel content visible after close fade ends.
- Required DOM/accessibility assertions: Menu is keyboard-operable; close icon is keyboard-operable only after an explicit accessibility enhancement (the current SVG click handler is not keyboard-accessible); menu links preserve their accessible names. This known gap must be preserved for strict legacy parity or fixed as a separate accessibility change with updated acceptance criteria.

**Verification**

- Original URL: unavailable in this checkout; supply `ORIGINAL_URL` before parity review.
- Migrated URL: `http://localhost:3000/`
- Artifact directory: `.cursor/artifacts/animations/off-canvas-menu/`
- UI mismatch threshold: mean at most 1.5%; peak critical frame at most 3%.
- Critical frames for human review: hover start/end, open start, 40 ms, 500 ms, 1,000 ms, close start, 50 ms, 1,000 ms, and 2,000 ms.

### `video-lightbox`

**Purpose**

Reveal the selected video in an overlay and restore the grid layering after close.

**Trigger and preconditions**

- Route: a page that renders `MediaGrid`.
- Initial state: `#overlay` and `.lightboxWrapper` are `autoAlpha: 0`; iframe source is empty; `.tilt__Grid` has normal z-index.
- User action or automatic trigger: click a video thumbnail; click Close to dismiss.
- Automation procedure:
  1. Wait until thumbnails have initialized to grayscale.
  2. Click one video thumbnail.
  3. Wait 700 ms and capture an overlay screenshot plus DOM snapshot.
  4. Click Close.
  5. Wait 700 ms and capture final state.

**Expected timeline**

| Timestamp | Phase | Visual behavior | Structural/accessibility behavior |
| --- | --- | --- | --- |
| 0 ms open | source and stacking | Iframe source receives selected embed URL; `.tilt__Grid` rises to z-index 999999. | The selected URL is loaded into `#moviePlayer`. |
| 0–300 ms open | backdrop | `#overlay` fades to visible. | Underlying content remains in the DOM; current implementation does not apply `inert` or a focus trap. |
| 300–600 ms open | video container | `.youtube` and `.lightboxWrapper` fade to visible. | Close control is visible. |
| 0–300 ms close | backdrop | Overlay fades out. | Iframe remains sourced during fade. |
| 300–600 ms close | player hide | `.youtube` fades out; grid z-index resets to 1. | On complete, iframe source is cleared. |

**Timing**

- Duration: 600 ms open and 600 ms close.
- Delay: the player/container fade starts after backdrop fade.
- Easing: GSAP default easing.
- Start and end tolerance: 100 ms.

**Lifecycle and interruption rules**

- Cold load: hidden and unsourced.
- Return navigation: the lightbox component persists in `SiteChrome`; it must be closed before route captures.
- Repeated trigger: a new open call replaces iframe source and restarts visible-state tweens.
- Interrupted interaction: close during open must leave the overlay hidden, restore z-index, and clear source after the close timeline.
- Reduced motion: normal motion remains the current expected behavior.

**Assertions**

- Required final state: `#overlay`, `.youtube`, and `.lightboxWrapper` are hidden; `.tilt__Grid` has z-index 1; iframe `src` is empty.
- Required intermediate state: overlay backdrop becomes visible before video container.
- Forbidden transient states: playable iframe visible above a hidden overlay; grid z-index left elevated after close; iframe source retained after close completion.
- Required DOM/accessibility assertions: iframe has title `Video Player`; close action is operable by pointer in the current implementation. Focus trap, Escape handling, and background inertness are absent and are not claimed by this parity specification.

**Verification**

- Original URL: unavailable in this checkout; supply `ORIGINAL_URL` before parity review.
- Migrated URL: `http://localhost:3000/`
- Artifact directory: `.cursor/artifacts/animations/video-lightbox/`
- UI mismatch threshold: mean at most 1.5%; peak critical frame at most 3%.
- Critical frames for human review: open start, 300 ms, 600 ms, close start, 300 ms, and 600 ms.

### `roster-and-media-hover`

**Purpose**

Animate roster previews and media thumbnails on pointer interaction while preserving their terminal visual states.

**Trigger and preconditions**

- Route: `/` for roster links and any route that renders `MediaGrid` for media tiles.
- Initial state: roster preview video is not auto-visible; media thumbnails are grayscale.
- User action or automatic trigger: pointer enter and leave on a roster link or media tile.
- Automation procedure:
  1. Open the applicable route and wait for all initial GSAP sets.
  2. Move pointer onto one roster link for 600 ms, then away for 600 ms.
  3. Move pointer onto one media thumbnail for 1,100 ms, then away for 1,100 ms.
  4. Capture start, midpoint, and terminal frames for each interaction.

**Expected timeline**

| Timestamp | Phase | Visual behavior | Structural/accessibility behavior |
| --- | --- | --- | --- |
| roster enter 0–500 ms | preview reveal | Artist text changes to white and preview video becomes visible; video playback is requested. | Link remains an active native link. |
| roster leave 0–500 ms | preview restore | Timeline reverses and video pause is requested. | Link remains available. |
| media enter 0–1,000 ms | thumbnail color | Thumbnail filter transitions from grayscale to full color with `expo.inOut`; existing CSS play-icon transforms run over 1,000 ms. The clickable media and thumbnail stay centered in their media column. | Video tile link remains the click target. |
| media leave 0–1,000 ms | thumbnail restore | Thumbnail returns to grayscale; CSS play-icon transforms return to rest. | No modal is created until click. |

**Timing**

- Duration: roster color reveal 500 ms; media color and CSS hover effects 1,000 ms.
- Delay: none.
- Easing: roster default GSAP easing; media `expo.inOut`; CSS effects `ease-in-out`.
- Start and end tolerance: 100 ms.
- Responsive sizing: each `.mediaWrap > a` is no wider than the media column and scales down to the smaller of 75% of that column or 45vh. Its `.videoThumb` fills the click target without exceeding it.

**Lifecycle and interruption rules**

- Cold load: media thumbnails initialize grayscale before user interaction.
- Return navigation: each mounted component initializes its own hover state.
- Repeated trigger: pointer enter/leave reverses the existing roster timeline; media starts a new tween toward the latest requested filter state.
- Interrupted interaction: leaving before the end must reverse toward the rest state without leaving a playing or visible preview.
- Reduced motion: normal motion remains the current expected behavior.

**Assertions**

- Required final state: roster preview is hidden and paused after leave; media thumbnail is grayscale after leave.
- Required intermediate state: roster video visibility and white text begin together; media color is partially restored at 500 ms.
- Forbidden transient states: visible roster preview after leave completion; colored media thumbnail after leave completion; clickable media or its thumbnail offset from the media-column center; clickable media or its thumbnail overflowing the media column; pointer hover launching a lightbox without click.
- Required DOM/accessibility assertions: roster artist names and thumbnail alt text remain exposed as link content; hover-only visual changes must not remove link focus indication.

**Verification**

- Original URL: unavailable in this checkout; supply `ORIGINAL_URL` before parity review.
- Migrated URL: `http://localhost:3000/`
- Artifact directory: `.cursor/artifacts/animations/roster-and-media-hover/`
- UI mismatch threshold: mean at most 1.5%; peak critical frame at most 3%.
- Critical frames for human review: each enter/leave start, 500 ms, and terminal frame.

### `news-marquee`

**Purpose**

Continuously scroll the duplicated news cards upward and wrap without a visible seam.

**Trigger and preconditions**

- Route: any route that renders `NewsMarquee`.
- Initial state: wrapper is measured after mount; six unique cards plus the first two duplicates are rendered.
- User action or automatic trigger: automatic on mount.
- Automation procedure:
  1. Load the route and wait for layout to stabilize.
  2. Record 31 seconds at the comparison viewport.
  3. Inspect the 30-second wrap and capture before/after structural snapshots.

**Expected timeline**

| Timestamp | Phase | Visual behavior | Structural/accessibility behavior |
| --- | --- | --- | --- |
| 0 ms | initialization | Wrapper y position is set to zero. Each news image is centered within its marquee card and constrained to the column's inline width. | Eight news card nodes are present: six unique cards plus two duplicates. |
| 0–30,000 ms | upward scroll | Each card moves upward linearly by one wrapper height. Images retain their horizontal and vertical centering as they move. | Card markup remains stable. |
| 30,000 ms | wrap | Modifiers wrap y into the interval from zero to negative wrapper height. | No node is inserted or removed during the wrap. |

**Timing**

- Duration: 30,000 ms per repeated cycle.
- Delay: none after measurable wrapper height is available.
- Easing: `none`.
- Start and end tolerance: 100 ms at cycle boundary; no visible discontinuity.
- Responsive sizing: each `.tiltFx__img` is no wider than its `.boxMarquee` column or 45vh, whichever is smaller, and retains its aspect ratio. As the viewport narrows, the image width must decrease with the column rather than overflow it.

**Lifecycle and interruption rules**

- Cold load: if wrapper height is zero, no timeline is created until a later remount; normal capture requires a measurable layout.
- Return navigation: remount creates a new repeat-forever timeline.
- Repeated trigger: not user-triggered.
- Interrupted interaction: not applicable.
- Reduced motion: normal motion remains the current expected behavior.

**Assertions**

- Required final state: after a cycle boundary, visible cards continue moving upward with no blank gap.
- Required intermediate state: a duplicate card follows the sixth unique card before the wrap.
- Forbidden transient states: a blank marquee column, jump larger than one animation-frame movement, an image offset from the center of its marquee card, a news image overflowing its column at a narrow viewport, or more than one active timeline per mounted card.
- Required DOM/accessibility assertions: each rendered image retains its text alternative; duplicate cards must not create focusable duplicate controls.

**Verification**

- Original URL: unavailable in this checkout; supply `ORIGINAL_URL` before parity review.
- Migrated URL: `http://localhost:3000/`
- Artifact directory: `.cursor/artifacts/animations/news-marquee/`
- UI mismatch threshold: mean at most 1.5%; peak critical frame at most 3%.
- Critical frames for human review: 0 ms, 15,000 ms, 29,900 ms, 30,000 ms, and 30,100 ms.

## Approval

- [x] Each listed flow is complete and contains no template markers.
- [x] The source limitation and required original URL are explicit before parity testing.
- [x] Thresholds and the full-viewport comparison region have an explicit rationale.
- [ ] Original and migrated recordings have been captured and reviewed by a human.
