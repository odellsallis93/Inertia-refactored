# Latest news and media

The two right-hand columns persist on every page. "Latest News" is a vertical marquee of press images that scrolls upward continuously and loops seamlessly. "Latest Media" is a column of five video thumbnails shown in grayscale; hovering restores color, and clicking opens a full-screen lightbox with the YouTube embed. Close dismisses the lightbox and unloads the video.

## Sub-features

- `news-marquee-cards` the marquee renders the six news images twice (12 cards) so the loop has no gap.
- `news-marquee-moves` the track's vertical position changes over time without user input.
- `media-thumbs` five thumbnails render, each an `a.videoWrap` with a `data-video-id` and the embed URL as `href`.
- `media-hover` hovering a thumbnail removes its grayscale filter.
- `lightbox-open` clicking a thumbnail shows the overlay and loads the matching embed URL into the player.
- `lightbox-close` `Close` hides the overlay and clears the player `src`.

## How to get to it (user POV)

- Both columns are visible on `/`, `/about`, and every artist page; no navigation is required.
- Click any thumbnail in the Latest Media column (play icon) to open the lightbox; click `Close` at the top of the lightbox to dismiss.

## Driving it with control-inertia

Preconditions:

- `$C doctor` passes.
- `$C open /about` has returned (no intro on this route, so the fastest way in).

- **Marquee cards (`news-marquee-cards`).** Run `$C browser eval "JSON.stringify({cards: document.querySelectorAll('#scrollCol .boxMarquee').length, distinct: new Set([...document.querySelectorAll('#scrollCol img')].map(i => i.getAttribute('src'))).size})"`. Prints `cards: 12`, `distinct: 6`.
- **Marquee moves (`news-marquee-moves`).** Sample twice one second apart. Run `$C browser eval "new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.marqueeTrack')).transform).f"`, then `sleep 1`, then the same command. The second value is smaller (more negative) than the first; the change is roughly 90-100px per second.
- **Thumbnails (`media-thumbs`).** Run `$C browser eval "JSON.stringify([...document.querySelectorAll('a.videoWrap')].map(a => [a.dataset.videoId, a.getAttribute('href')]))"`. Prints five pairs, the first `["2UftGSD6kXs","https://www.youtube.com/embed/2UftGSD6kXs"]`.
- **Hover (`media-hover`).** Run `$C browser eval "getComputedStyle(document.querySelector('a.videoWrap[data-video-id=\"2UftGSD6kXs\"] img')).filter"` (prints `"grayscale(1)"`), then `$C browser hover 'a.videoWrap[data-video-id="2UftGSD6kXs"]'`, then `$C browser wait --fn "getComputedStyle(document.querySelector('a.videoWrap[data-video-id=\"2UftGSD6kXs\"] img')).filter === 'grayscale(0)'" --timeout 3000`. Prints `true`.
- **Before lightbox.** Run `$C capture latest-news-and-media 01-before-lightbox`. `$C browser eval "getComputedStyle(document.querySelector('#overlay')).visibility"` prints `"hidden"`.
- **Open lightbox (`lightbox-open`).** Run `$C browser click 'a.videoWrap[data-video-id="2UftGSD6kXs"]'`, then `$C browser wait --fn "getComputedStyle(document.querySelector('#overlay')).visibility === 'visible' && Number(getComputedStyle(document.querySelector('#overlay')).opacity) > 0.99" --timeout 5000`. Prints `true`. Then `$C browser eval "JSON.stringify({src: document.querySelector('#moviePlayer').src, iframeVis: getComputedStyle(document.querySelector('#moviePlayer')).visibility, path: location.pathname})"` prints `src: "https://www.youtube.com/embed/2UftGSD6kXs"`, `iframeVis: "visible"`, `path: "/about"` (no navigation happened).
- **Proof of open.** Run `$C capture latest-news-and-media 02-lightbox-open`. The screenshot shows the dark overlay with a `Close` label and the player frame; the ARIA snapshot includes an iframe named `Video Player`.
- **Close (`lightbox-close`).** Run `$C browser click ".lightbox-close"`, then `$C browser wait --fn "getComputedStyle(document.querySelector('#overlay')).visibility === 'hidden' && document.querySelector('#moviePlayer').getAttribute('src') === ''" --timeout 5000`. Prints `true`.
- **Proof of close.** Run `$C capture latest-news-and-media 03-lightbox-closed`. The screenshot matches the page before the lightbox; `$C browser eval "document.querySelector('#moviePlayer').getAttribute('src')"` prints `""`.

## Gotchas

- Do not wait for YouTube content inside the iframe; headless runs may have no network to youtube.com, and the assertion is the `src`, not the rendered video.
- The thumbnail `href` is the embed URL, but the click is intercepted (`preventDefault`); if a change breaks that handler the browser navigates to youtube.com. `path` in the open assertion catches this.
- The marquee never stops; screenshots of the news column differ between runs by design. Do not pixel-diff them here; frame parity is the `animation-parity` skill's job.
- The lightbox stacks above the tilt grid by bumping `.tilt__Grid` z-index while open; if `Close` is unclickable, check that `#overlay` is at `opacity: 1` before clicking (the recipe waits for it).
- Filter values are reported as `grayscale(1)` / `grayscale(0)`, not percentages.
