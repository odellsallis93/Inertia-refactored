# Off-canvas menu

The Menu button in the top-right slides a full-screen dark panel in from the right with three large links (Roster, About, Contact Us) and a circular close icon. Choosing Roster or About closes the panel and plays the page transition to that route; Contact Us is a `mailto:` link; the close icon slides the panel back out and restores the Menu button.

## Sub-features

- `menu-open` slides the panel in and hides the Menu button.
- `menu-links` shows exactly Roster (`/`), About (`/about`), and Contact Us (`mailto:cameron@inertiamgmt.com`).
- `menu-navigate` chooses a menu link, closes the panel, and lands on the route with the transition finished.
- `menu-close` closes the panel via the close icon and restores the Menu button.
- `menu-home-label` labels the first link `home` (data-letters) on `/` and `Roster` elsewhere.

## How to get to it (user POV)

- Click the `Menu` button (three lines + "Menu") at the top-right of any page.

## Driving it with control-inertia

Preconditions:

- `$C doctor` passes.
- `$C open /` has returned (intro finished, ~13s).

- **Before state.** Capture the closed menu. Run `$C capture off-canvas-menu 01-home-before-open`. `$C browser eval "getComputedStyle(document.querySelector('.offNav__wrap')).visibility"` prints `"hidden"`.
- **Open (`menu-open`).** Click the Menu button. Run `$C browser click "#openButton"`, then `$C browser wait --fn "(() => { const cs = getComputedStyle(document.querySelector('.offNav__wrap')); const m = new DOMMatrixReadOnly(cs.transform); return cs.visibility === 'visible' && Math.abs(m.e) < 1 && Math.abs(m.c) < 0.001; })()" --timeout 5000`. Prints `true`; the panel is fully in and un-skewed.
- **Menu button hidden.** Run `$C browser eval "getComputedStyle(document.querySelector('#openButton')).opacity"`. Prints `"0"`.
- **Links (`menu-links`).** Run `$C browser eval "JSON.stringify([...document.querySelectorAll('.offNav a')].map(a => a.textContent + ' -> ' + a.getAttribute('href')))"`. Prints exactly `["Roster -> /","About -> /about","Contact Us -> mailto:cameron@inertiamgmt.com"]`.
- **Home label (`menu-home-label`).** Run `$C browser eval "document.querySelector('.offNav a[href=\"/\"]').dataset.letters"`. Prints `"home"` on `/`; on any other route it prints `"Roster"`.
- **Proof of open.** Run `$C capture off-canvas-menu 02-menu-open`. The screenshot shows the dark panel with ROSTER / ABOUT / CONTACT US and the close icon top-left; the ARIA snapshot lists three links.
- **Navigate (`menu-navigate`).** Choose About. Run `$C browser click ".offNav a.menuAbout"`, `$C browser wait --fn "location.pathname === '/about'" --timeout 10000`, then `$C ready`. Then `$C browser eval "JSON.stringify({path: location.pathname, cat: document.querySelector('.profileCat').textContent, name: document.querySelector('.artistName').textContent, menuVis: getComputedStyle(document.querySelector('.offNav__wrap')).visibility, openBtnOpacity: getComputedStyle(document.querySelector('#openButton')).opacity, sideActive: document.querySelector('.navMenu-text.active').textContent})"` prints `path: "/about"`, `cat: "About Us"`, `name: "Artist MGMT"`, `menuVis: "hidden"`, `openBtnOpacity: "1"`, `sideActive: "About"`.
- **Proof of navigation.** Run `$C capture off-canvas-menu 03-about-after-menu-nav`. The screenshot shows the About copy in the center column with the menu closed and the Menu button visible.
- **Close (`menu-close`).** Reopen and dismiss. Run `$C browser click "#openButton"`, `$C browser wait --fn "getComputedStyle(document.querySelector('.offNav__wrap')).visibility === 'visible' && Math.abs(new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.offNav__wrap')).transform).e) < 1" --timeout 5000`, then `$C browser click "#closeIcon"`, then `$C browser wait --fn "getComputedStyle(document.querySelector('.offNav__wrap')).visibility === 'hidden' && Number(getComputedStyle(document.querySelector('#openButton')).opacity) > 0.99" --timeout 6000`. Prints `true`; the route is unchanged.
- **Proof of close.** Run `$C capture off-canvas-menu 04-menu-closed-on-about`. The screenshot matches the About page with the Menu button visible and no panel.

## Gotchas

- Both the side nav and the menu contain a link named About; use the CSS handles (`.offNav a.menuAbout` vs `.sideNav__Wrapper a[href="/about"]`) rather than `find role link --name About`.
- The panel animates for 1s; assert on `visibility` plus the `translateX` matrix (`m.e`), not on a fixed sleep. `m.c` near 0 confirms the skew has settled.
- The close sequence is ~2s (fade, then slide out). Waiting only for `visibility === 'hidden'` can pass while the Menu button is still fading back in; the recipe waits for both.
- Clicking a menu link during a route transition is dropped by the app. Always `$C ready` before opening the menu after navigating.
- Contact Us is `mailto:`; assert the `href` and do not click it (headless Chrome may attempt an external protocol handler).
