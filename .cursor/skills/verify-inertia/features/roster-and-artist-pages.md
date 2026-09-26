# Roster and artist pages

The home page lists six artist tiles (10k.Caash, 7ru7h, Will Claye, Spaceman Zack, Cotis, Demon In Me). Hovering a tile turns its name white and reveals a looping muted preview clip. Clicking a tile plays the page transition to `/artists/<slug>`, which shows the genre line, the artist name, a portrait, social icons that open in a new tab, and a short bio. Unknown slugs return the 404 page.

## Sub-features

- `roster-tiles` the home page shows exactly six tiles linking to `/artists/<slug>` in data order.
- `roster-hover` hovering a tile makes its `video` visible and playing and its name white; other tiles stay unchanged.
- `roster-unhover` leaving the tile pauses and hides the clip and restores the name color.
- `artist-detail` the artist page shows `Music: <genre>`, the name, the portrait image, and the bio.
- `artist-socials` each configured social renders as an icon link with `aria-label`, `target="_blank"`, and `rel="noopener noreferrer"`.
- `artist-title` the document title is `<name> - Inertia Artist Management`.
- `artist-404` an unknown slug returns HTTP 404.

## How to get to it (user POV)

- Load `/` (roster is the home page) and click an artist tile.
- Choose `Roster` in the off-canvas menu or `Home` in the side nav from any other page, then click a tile.
- Type `/artists/<slug>` directly; slugs are `10k-caash`, `7ru7h`, `will-claye`, `spaceman-zack`, `cotis`, `demon-in-me`.

## Driving it with control-inertia

Preconditions:

- `$C doctor` passes.
- `$C open /` has returned.

- **Tiles (`roster-tiles`).** Run `$C browser eval "JSON.stringify([...document.querySelectorAll('a.artistNav__link')].map(a => a.querySelector('h1').textContent + ' -> ' + a.getAttribute('href')))"`. Prints exactly `["10k.Caash -> /artists/10k-caash","7ru7h -> /artists/7ru7h","Will Claye -> /artists/will-claye","Spaceman Zack -> /artists/spaceman-zack","Cotis -> /artists/cotis","Demon In Me -> /artists/demon-in-me"]`.
- **Before hover.** Run `$C browser eval "JSON.stringify({vidVis: getComputedStyle(document.querySelector('a.artistNav__link[href=\"/artists/7ru7h\"] video')).visibility, color: getComputedStyle(document.querySelector('a.artistNav__link[href=\"/artists/7ru7h\"] h1')).color})"`. Prints `vidVis: "hidden"` and a grey `color` (`rgb(212, 212, 212)`).
- **Hover (`roster-hover`).** Run `$C browser hover 'a.artistNav__link[href="/artists/7ru7h"]'`, then `$C browser wait --fn "getComputedStyle(document.querySelector('a.artistNav__link[href=\"/artists/7ru7h\"] video')).visibility === 'visible' && getComputedStyle(document.querySelector('a.artistNav__link[href=\"/artists/7ru7h\"] h1')).color === 'rgb(255, 255, 255)'" --timeout 3000`. Prints `true`. Then `$C browser eval "JSON.stringify({paused: document.querySelector('a.artistNav__link[href=\"/artists/7ru7h\"] video').paused, otherVidVis: getComputedStyle(document.querySelector('a.artistNav__link[href=\"/artists/cotis\"] video')).visibility})"` prints `paused: false`, `otherVidVis: "hidden"`.
- **Proof of hover.** Run `$C capture roster-and-artist-pages 01-hover-7ru7h`. The screenshot shows the 7ru7h tile with white text over a video frame while the other tiles show their stills.
- **Unhover (`roster-unhover`).** Run `$C browser hover '.sideNav__Wrapper'`, then `$C browser wait --fn "getComputedStyle(document.querySelector('a.artistNav__link[href=\"/artists/7ru7h\"] video')).visibility === 'hidden'" --timeout 3000`. Prints `true`, and `$C browser eval "document.querySelector('a.artistNav__link[href=\"/artists/7ru7h\"] video').paused"` prints `true`.
- **Open artist (`artist-detail`, `artist-socials`, `artist-title`).** Run `$C browser click 'a.artistNav__link[href="/artists/7ru7h"]'`, `$C browser wait --url "**/artists/7ru7h" --timeout 10000`, then `$C ready`. Then `$C browser eval "JSON.stringify({cat: document.querySelector('.profileCat').textContent, name: document.querySelector('.artistName').textContent, img: document.querySelector('.profilePic--caash').getAttribute('src'), bio: document.querySelector('.bio__wrap p').textContent, socials: [...document.querySelectorAll('a.artistSocial')].map(a => [a.getAttribute('aria-label'), a.getAttribute('target'), a.getAttribute('rel')]), title: document.title})"` prints `cat: "Music: Hip-Hop"`, `name: "7ru7h"`, `img: "/assets/images/7ru7h-roster.jpg"`, the 7ru7h bio, `socials: [["Instagram","_blank","noopener noreferrer"]]`, `title: "7ru7h - Inertia Artist Management"`. For `10k-caash` expect four socials: Facebook, Instagram, Spotify, YouTube.
- **Proof of detail.** Run `$C capture roster-and-artist-pages 02-artist-7ru7h`. The screenshot shows the genre line, the sideways artist name, the portrait, the Instagram icon, and the bio.
- **Direct load.** Run `$C open /artists/10k-caash`, then `$C browser eval "JSON.stringify({name: document.querySelector('.artistName').textContent, socials: [...document.querySelectorAll('a.artistSocial')].map(a => a.getAttribute('aria-label')), welcome: !!document.querySelector('.fullSite-WrapperWel')})"`. Prints `name: "10k.Caash"`, `socials: ["Facebook","Instagram","Spotify","YouTube"]`, `welcome: false`.
- **Unknown slug (`artist-404`).** Run `curl -s -o /dev/null -w '%{http_code}\n' "$($C url /artists/nobody)"`. Prints `404`.

## Gotchas

- Roster tiles exist only on `/`; on other routes `a.artistNav__link` is absent and `click` fails with "Element not found". Confirm `location.pathname === '/'` and `ready` first.
- The preview `video` hides with `visibility: hidden` while `opacity` stays 1; assert `visibility`, not `opacity`.
- `video.paused` flips to `false` in headless Chrome because the clips are muted; if a future change unmutes them, autoplay policy will keep `paused: true` and the hover proof must fall back to `visibility` and color.
- Social links open a new tab; assert their attributes and do not click them.
- No side-nav item is active on artist pages (`.navMenu-text.active` is `null`).
- Slug classes on the videos (`7ru7hVid`) start with a digit and are awkward in CSS; address videos through the parent link's `href` as the recipe does.
