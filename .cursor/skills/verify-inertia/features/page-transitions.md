# Page transitions

Every in-app link (side nav, off-canvas menu, roster tiles) plays a leave animation (page copy slides out, colored slices cover the columns, a dark cover rises), swaps the route, then plays the enter animation in reverse. Only the center column content changes; the logo, side nav, news marquee, and media grid persist. Legacy `.html` URLs from the original static site redirect to the new routes.

## Sub-features

- `nav-side-about` `Home` to `About` via the left side nav lands on `/about` with the About headings and `About` marked active.
- `nav-side-home` `About` to `Home` via the side nav lands on `/` with the roster and `Home` marked active.
- `nav-heading-swap` `.profileCat` / `.artistName` show the destination's text after the transition.
- `nav-click-guard` clicks during a transition are ignored (the app stays on course for the first destination).
- `nav-legacy-redirects` `/index.html`, `/about.html`, and `/artists/<slug>.html` issue permanent redirects to the clean routes.

## How to get to it (user POV)

- Click `Home` or `About` in the vertical side nav at the bottom-left.
- Click `Roster` or `About` inside the off-canvas menu (see [off-canvas-menu](./off-canvas-menu.md)).
- Click an artist tile on the roster (see [roster-and-artist-pages](./roster-and-artist-pages.md)).
- Type a legacy URL such as `/about.html` in the address bar.

## Driving it with control-inertia

Preconditions:

- `$C doctor` passes.
- `$C open /` has returned.

- **Before state.** Run `$C browser eval "JSON.stringify({path: location.pathname, active: document.querySelector('.navMenu-text.active').textContent})"`. Prints `path: "/"`, `active: "Home"`. Run `$C capture page-transitions 01-home`.
- **Side nav to About (`nav-side-about`, `nav-heading-swap`).** Run `$C browser click '.sideNav__Wrapper a[href="/about"]'`, `$C browser wait --fn "location.pathname === '/about'" --timeout 10000`, then `$C ready`. Then `$C browser eval "JSON.stringify({path: location.pathname, cat: document.querySelector('.profileCat').textContent, name: document.querySelector('.artistName').textContent, active: document.querySelector('.navMenu-text.active').textContent, marqueeCards: document.querySelectorAll('#scrollCol .boxMarquee').length})"` prints `path: "/about"`, `cat: "About Us"`, `name: "Artist MGMT"`, `active: "About"`, `marqueeCards: 12` (persistent chrome survived the swap).
- **Proof.** Run `$C capture page-transitions 02-about-via-side-nav`. The screenshot shows the About paragraph centered with the side nav, marquee, and media grid still in place.
- **Side nav to Home (`nav-side-home`).** Run `$C browser click '.sideNav__Wrapper a[href="/"]'`, `$C browser wait --fn "location.pathname === '/'" --timeout 10000`, then `$C ready`. Then `$C browser eval "JSON.stringify({path: location.pathname, tiles: document.querySelectorAll('a.artistNav__link').length, active: document.querySelector('.navMenu-text.active').textContent, welcome: !!document.querySelector('.fullSite-WrapperWel')})"` prints `path: "/"`, `tiles: 6`, `active: "Home"`, `welcome: false`.
- **Click guard (`nav-click-guard`).** Start a transition and immediately click a different link. Run `$C browser click '.sideNav__Wrapper a[href="/about"]'`, then within a second `$C browser click 'a.artistNav__link[href="/artists/7ru7h"]'`, then `$C browser wait --fn "location.pathname === '/about'" --timeout 10000`, then `$C ready`. Then `$C browser eval "location.pathname"` prints `"/about"`, and `$C browser eval "location.pathname"` five seconds later still prints `"/about"`: the roster click was dropped and the first destination won.
- **Legacy redirects (`nav-legacy-redirects`).** Run `curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "$($C url /about.html)"`. Prints `308 http://127.0.0.1:<port>/about`. Repeat for `/index.html` (to `/`) and `/artists/7ru7h.html` (to `/artists/7ru7h`).

## Gotchas

- `wait --url "http://127.0.0.1:<port>/"` matches immediately on any path; always wait on `location.pathname` for the home route.
- `$C ready` passes instantly if called before the URL has changed, because the departing page is still interactive. Order is: click, wait for pathname, `ready`.
- The active side-nav item only exists on `/` and `/about`; on artist pages `.navMenu-text.active` is `null`. Guard with `?.` when the current route may be an artist page.
- The leave animation is ~3s, the enter ~3.5s; total round trip is 6-7s. A 10s pathname timeout is deliberate slack, not a target.
- `.allText` elements carry a GSAP inline transform during the transition; `ready` waits for it to be cleared. Do not screenshot before `ready` unless you want the mid-transition frame.
- The click guard only covers anchors. The Menu button is a `div`, so clicking it mid-transition does open the menu; that is current behavior, not a failed guard.
