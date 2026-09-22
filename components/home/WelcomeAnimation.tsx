"use client";

import { useRef } from "react";
import { Transition } from "react-transition-group";
import gsap from "gsap";
import { useWelcome } from "@/components/SiteChrome/WelcomeContext";

/**
 * One-time home intro: the Insignia mark, colored rectangle sweeps, wordmark,
 * and then a handoff onto the persistent page shell.
 *
 * Sub-timelines below are authored independently, then sequenced by `masterWel`.
 * Position strings ("<", ">- .3", "welcomeStart+=1") are GSAP labels:
 *   "<"     start at the same time as the previous tween
 *   "<.05"  start 0.05s after the previous tween started
 *   ">-.4"  start 0.4s before the previous tween ends
 *   "<-1.5" start 1.5s before the previous tween started
 *   ">"     start after the previous tween ends
 */
export function WelcomeAnimation() {
  const { hasPlayed, markPlayed } = useWelcome();
  const nodeRef = useRef<HTMLDivElement>(null);

  // SVG pieces inside the welcome overlay. CSS keeps them hidden until GSAP
  // sets autoAlpha; each ref is a timeline target, not a React-driven style.
  const sigRef = useRef<SVGGElement>(null); // circular Insignia mark
  const rectWrapWtRef = useRef<SVGGElement>(null); // white horizontal sweep
  const rectWrapGrRef = useRef<SVGGElement>(null); // green vertical sweep
  const rectBlkRef = useRef<SVGGElement>(null); // black wipe behind the exiting mark
  const sidePushRef = useRef<SVGGElement>(null); // white panel that covers the page from the left
  const inertiaTextRef = useRef<SVGGElement>(null); // "INERTIA" wordmark paths
  const artistTextRef = useRef<SVGGElement>(null); // "ARTIST MANAGEMENT" wordmark paths
  const wordsWrapRef = useRef<SVGSVGElement>(null); // SVG that holds both wordmarks

  // Session-scoped: after the intro finishes, WelcomeContext keeps hasPlayed true
  // so navigating away and back to "/" does not replay this sequence.
  if (hasPlayed) return null;

  const handleAppear = () => {
    const container = nodeRef.current;
    const sig = sigRef.current;
    const rectWrapWt = rectWrapWtRef.current;
    const rectWrapGr = rectWrapGrRef.current;
    const rectBlk = rectBlkRef.current;
    const sidePush = sidePushRef.current;
    const inertia = inertiaTextRef.current;
    const artist = artistTextRef.current;
    const wordsWrap = wordsWrapRef.current;

    // Abort if any SVG piece missed its first paint. Better to skip than to
    // start a timeline that would tween null and leave the overlay stuck.
    if (!container || !sig || !rectWrapWt || !rectWrapGr || !rectBlk || !sidePush || !inertia || !artist || !wordsWrap) return;

    // ------------------------------------------------------------------
    // 1. Insignia entrance
    // The mark starts off-canvas to the right and half size, then pops in,
    // slides left, and spins a full turn. This is the first visible motion.
    // ------------------------------------------------------------------
    const insignitaTl = gsap.timeline();
    // Park the mark far to the right (389% of its own width) at 50% scale,
    // still invisible (CSS autoAlpha 0) until the first .to() below.
    insignitaTl.set(sig, { xPercent: 389, scaleX: 0.5, scaleY: 0.5 });
    insignitaTl
      // Fade in and grow to full size over 2s. back.out(2) overshoots then
      // settles, so the mark "pops" rather than easing in linearly.
      // Origin is the top-left of the path so growth reads as unfolding.
      .to(sig, { autoAlpha: 1, duration: 2, scaleX: 1, scaleY: 1, ease: "back.out(2)", transformOrigin: "left top" })
      // Slide left to ~10% of its width so it sits in the composition.
      .to(sig, { xPercent: 10, duration: 1.8, ease: "expo.out" })
      // Begin the spin 0.05s after that slide starts ("<.05"), not after it
      // finishes. Origin 50% 55% is the visual center of the circular mark
      // (slightly below geometric center because of the path's weight).
      .to(sig, { rotate: -360, duration: 1, transformOrigin: "50% 55%", ease: "expo.out" }, "<.05");

    // ------------------------------------------------------------------
    // 2. White horizontal sweep in
    // A white rectangle grows from a collapsed left edge, shearing as it
    // expands so the leading edge looks like a blade rather than a box.
    // ------------------------------------------------------------------
    const spanWhite = gsap.timeline({ duration: 1.5, ease: "expo.inOut", transformOrigin: "left bottom" });
    // Visible, unskewed, nudged left, and scaled to zero width — a vertical
    // line on the left that the next tweens will stretch across the screen.
    spanWhite.set(rectWrapWt, { autoAlpha: 1, skewX: 0, xPercent: -20, scaleX: 0 });
    spanWhite
      // Stage 1: slight shear, 40% width.
      .to(rectWrapWt, { skewX: 10, scaleX: 0.4 })
      // Each later stage starts 0.4s before the previous one ends so the
      // shears blend instead of stepping.
      .to(rectWrapWt, { skewX: 40, scaleX: 0.7 }, ">-.4")
      .to(rectWrapWt, { skewX: 20, scaleX: 1 }, ">-.4")
      // Overshoot past full width (1.4) and flatten the shear. The next
      // timeline will collapse this same rectangle from the right.
      .to(rectWrapWt, { skewX: 0, scaleX: 1.4 }, ">-.4");

    // ------------------------------------------------------------------
    // 3. White horizontal sweep out
    // Collapse the same white rectangle from the right so it disappears
    // under the green sweep / wordmark rather than reversing the entrance.
    // ------------------------------------------------------------------
    const spanWhiteOut = gsap.timeline({ transformOrigin: "right", ease: "expo.out", duration: 1.5 });
    // Lift it up 70% so it lines up with the wordmark band, not the full
    // viewport. Visibility is already on from spanWhite; this reaffirms it.
    spanWhiteOut.set(rectWrapWt, { autoAlpha: 1, yPercent: -70 });
    spanWhiteOut
      // Shrink from the overshoot (1.4) and shear the opposite way so the
      // trailing edge looks like it is being pulled off-screen.
      .fromTo(rectWrapWt, { scaleX: 1.4, skewY: 0 }, { scaleX: 0.7, skewX: -25 })
      // Finish at zero width, shear removed. Starts 0.5s before the shrink
      // tween ends so the collapse is continuous.
      .to(rectWrapWt, { scaleX: 0, skewX: 0 }, ">-.5");

    // ------------------------------------------------------------------
    // 4. Green vertical sweep in
    // A green rectangle grows downward over the wordmark. The wordmark
    // paths are made visible here so they exist under the sweep and can
    // be filled white in lettersIn without popping in from nowhere.
    // ------------------------------------------------------------------
    const spanGreen = gsap.timeline({ transformOrigin: "top", ease: "expo.inOut" });
    spanGreen.set(wordsWrap, { autoAlpha: 1 });
    spanGreen.set(inertia, { autoAlpha: 1 });
    spanGreen.set(artist, { autoAlpha: 1 });
    // Same vertical band as the white sweep; growth is on Y, from the top.
    spanGreen.set(rectWrapGr, { autoAlpha: 1, yPercent: -70 });
    spanGreen
      // Shoot to 1.5 height with a 10° Y-shear so the leading edge tilts.
      .fromTo(rectWrapGr, { scaleY: 0, skewY: 0 }, { scaleY: 1.5, skewY: 10, duration: 0.7 })
      // Overshoot to 2.5 and flatten. Overlaps the previous tween by 0.5s.
      .to(rectWrapGr, { scaleY: 2.5, skewY: 0, duration: 0.5 }, ">-.5");

    // ------------------------------------------------------------------
    // 5. Green vertical sweep out
    // Reverse of the green entrance: collapse from the bottom-right so the
    // wordmark is left sitting on the black welcome field.
    // ------------------------------------------------------------------
    const spanGreenOut = gsap.timeline({ transformOrigin: "bottom right", ease: "expo.out" });
    spanGreenOut.set(rectWrapGr, { autoAlpha: 1, yPercent: -70 });
    spanGreenOut
      // From the overshoot height back through a reverse shear.
      .fromTo(rectWrapGr, { scaleY: 2.5, skewY: 0 }, { scaleY: 1.5, skewY: -10, duration: 0.7 })
      // Collapse to nothing. Overlaps the shrink by 0.5s.
      .to(rectWrapGr, { scaleY: 0, skewY: 0, duration: 0.5 }, ">-.5");
  
    // ------------------------------------------------------------------
    // 6. Wordmark fill
    // All three tweens share the "firstFill" label, so they start together:
    // INERTIA and ARTIST MANAGEMENT go white, and the Insignia goes green.
    // ------------------------------------------------------------------
    const lettersIn = gsap.timeline({ ease: "sine.in" });
    lettersIn
      .to(inertia, { fill: "white", autoAlpha: 1, duration: 0.5 }, "firstFill")
      .to(sig, { fill: "green" }, "firstFill")
      .to(artist, { fill: "white", autoAlpha: 1, duration: 0.5 }, "firstFill");

    // ------------------------------------------------------------------
    // 7. Black vertical wipe
    // A black rectangle scales up on Y behind the still-visible Insignia.
    // This is the field the mark will travel across as it exits.
    // ------------------------------------------------------------------
    const spanBlack = gsap.timeline();
    spanBlack.set(rectBlk, { autoAlpha: 1, scaleY: 0 });
    spanBlack.to(rectBlk, { scaleY: 1, ease: "expo.in", duration: 0.5 });

    // ------------------------------------------------------------------
    // 8. Insignia exit
    // The mark shoots off to the right while a black bar grows from the
    // left to cover its trail, and the spin unwinds back to 0°.
    // ------------------------------------------------------------------
    const insigniaOut = gsap.timeline({ ease: "expo.out" });
    // Reconfigure the same black rect: now a zero-width bar, shifted right
    // 26%, ready to grow on X instead of Y.
    insigniaOut.set(rectBlk, { autoAlpha: 1, scaleX: 0, xPercent: 26 });
    insigniaOut
      // Send the mark far off the right edge (640% of its width).
      .fromTo(sig, { xPercent: 0 }, { xPercent: 640, duration: 0.6 })
      // Grow the black bar from the left in lockstep ("<") so the trail
      // never shows the page underneath.
      .fromTo(rectBlk, { scaleX: 0 }, { scaleX: 1, duration: 0.6, transformOrigin: "left" }, "<")
      // Unwind the earlier -360° spin while the mark is still on screen.
      .to(sig, { rotate: 0, duration: 0.5, transformOrigin: "50% 55%" }, "<");

    // ------------------------------------------------------------------
    // 9. Side overlay
    // A white panel expands from the left, shearing as it goes, until it
    // covers the welcome composition. This is the last welcome-layer wipe
    // before the persistent page cover takes over.
    // ------------------------------------------------------------------
    const sideOverlay = gsap.timeline({ ease: "expo.inOut", transformOrigin: "left", duration: 1 });
    // Start 40% left of itself, invisible-width, no shear.
    sideOverlay.set(sidePush, { xPercent: -40, autoAlpha: 1, scaleX: 0, skewX: 0 });
    sideOverlay
      .fromTo(sidePush, { scaleX: 0, skewX: 0 }, { scaleX: 0.3, skewX: 20 })
      .to(sidePush, { scaleX: 0.7, skewX: 40 }, ">-.3")
      // Overshoot to 1.5 width and flatten. The welcome layer fades out
      // while this panel is still covering the viewport.
      .to(sidePush, { scaleX: 1.5, skewX: 0 }, ">-.3");

    // ------------------------------------------------------------------
    // 10. Persistent page overlay slices retract
    // These .transCont__* nodes live in SiteChrome, not this component.
    // They scaleX to 0 from the right, revealing the grid, header, news,
    // and about columns underneath. The 0.8s delay works against the "<-1"
    // offset in masterWel: the retract starts 0.2s before coverOut ends.
    // ------------------------------------------------------------------
    const transIn = gsap.timeline();
    transIn.set(
      ".transCont__gridleft, .transCont__News, .transCont__about, .transCont__overlayGrid, .transCont__header",
      { autoAlpha: 1 }
    );
    transIn
      .to(".transCont__gridleft", { scaleX: 0, transformOrigin: "right", delay: 0.8, ease: "expo.inOut", duration: 0.6 })
      // All remaining slices share the gridleft tween's start time ("<")
      // so the columns retract as one plane, not a stagger.
      .to(".transCont__overlayGrid", { scaleX: 0, transformOrigin: "right", ease: "expo.inOut", duration: 0.6 }, "<")
      .to(".transCont__header", { scaleX: 0, transformOrigin: "right", ease: "expo.inOut", duration: 0.6 }, "<")
      .to(".transCont__News", { scaleX: 0, transformOrigin: "right", ease: "expo.inOut", duration: 0.6 }, "<")
      .to(".transCont__about", { scaleX: 0, transformOrigin: "right", ease: "expo.inOut", duration: 0.6 }, "<");

    // ------------------------------------------------------------------
    // 11. White page cover collapses upward
    // After the persistent shell is visible behind it, .transBlk__lt
    // (a full-viewport white slab in SiteChrome) scales Y from 1 to 0
    // from the top, uncovering the home layout.
    // ------------------------------------------------------------------
    const coverOut = gsap.timeline();
    coverOut.fromTo(".transBlk__lt", { scaleY: 1 }, { scaleY: 0, transformOrigin: "top", ease: "expo.inOut", duration: 0.6 });

    // ------------------------------------------------------------------
    // 12. Page copy slides in from the left
    // .allText is the home copy block. GSAP parks it at -100% then eases
    // it to 0. clearProps later hands transform back to CSS so responsive
    // offsets still apply on later navigations.
    // ------------------------------------------------------------------
    const txtlIn = gsap.timeline();
    txtlIn.fromTo(".allText", { xPercent: -100 }, { xPercent: 0, duration: 0.7, ease: "expo", transformOrigin: "bottom" });

    // ------------------------------------------------------------------
    // 13. Green page cover comes up
    // Grow .transBlk__lt from the bottom over the white side panel. During
    // the intro the slab wears transBlk__lt--welcome, which paints it green
    // and lifts it above the welcome layer; otherwise it would rise behind
    // the panel and the handoff would read as a fade instead of a wipe.
    // ------------------------------------------------------------------
    const welcomeCover = document.querySelector<HTMLElement>(".transBlk__lt");
    welcomeCover?.classList.add("transBlk__lt--welcome");
    const pageCover = gsap.timeline();
    pageCover.set(".transBlk__lt", { autoAlpha: 1 });
    pageCover.fromTo(".transBlk__lt", { scaleY: 0 }, { scaleY: 1, transformOrigin: "bottom", ease: "expo.inOut", duration: 0.6 });

    // ------------------------------------------------------------------
    // Master timeline — stitches the sub-timelines into one sequence.
    // Overlaps are intentional; the intro is ~13s from first frame to
    // copy entrance, not a sum of the sub-timeline durations.
    // ------------------------------------------------------------------
    const masterWel = gsap.timeline();
    masterWel
      // Label t=0. Insignia pops in, slides, and spins.
      .add(insignitaTl, "welcomeStart")
      // White sweep starts 1s into the insignia entrance, while the mark
      // is still growing — they share the screen rather than taking turns.
      .add(spanWhite, "welcomeStart+=1")
      // Green sweep starts 0.3s before the white sweep finishes.
      .add(spanGreen, ">-.3")
      // Green collapse starts 0.29s before the green entrance ends, so
      // the bar barely reaches full height before it starts leaving.
      .add(spanGreenOut, ">-.29")
      // White collapse starts 1.5s before the previous tween's start,
      // overlapping both green tweens.
      .add(spanWhiteOut, "<-1.5")
      // Wordmark fill starts 0.3s before that white-out ends.
      .add(lettersIn, ">-.3")
      // Black wipe waits 0.5s after lettersIn, then the insignia exits.
      .add(spanBlack, ">.5")
      .add(insigniaOut)
      // Side overlay starts 0.7s before the insignia exit begins, so the
      // white panel is already covering as the mark leaves.
      .add(sideOverlay, "<-.7")
      // After the side overlay, swipe the green cover up over the white panel.
      .add(pageCover, ">")
      // Once the cover is fully up, hide the welcome layer in one step. No
      // fade: the panel is already hidden under the opaque green slab.
      .set(container, { autoAlpha: 0 }, ">")
      // Switch the persistent shell and the sideways mobile logo on in the
      // same step. They sit behind the opaque cover, so a fade would only
      // add a hold nobody can see.
      .set(".logoMobile__Sideways, .fullSite-Wrapper", { autoAlpha: 1 }, "<")
      // Immediately retract the cover upward onto the matching green slices.
      .add(coverOut, "<")
      // Reset overlay slices to full width so transIn can animate them
      // from covered (scaleX 1) to revealed (scaleX 0).
      .set(
        ".transCont__gridleft, .transCont__News, .transCont__about, .transCont__overlayGrid, .transCont__header",
        { scaleX: 1 }
      )
      // transIn's autoAlpha set lands 1s before coverOut ends (so the slices
      // are already visible under the lifting cover); its 0.8s internal
      // delay starts the retract 0.2s before coverOut ends, inside the
      // expo.inOut tail where the cover is already visually gone.
      .add(transIn, "<-1")
      // After the slices finish retracting, slide the page copy in.
      .add(txtlIn, ">")
      // Drop GSAP's inline transform so CSS (including container-query
      // offsets) owns .allText again on subsequent route transitions.
      .set(".allText", { clearProps: "transform,transformOrigin" });

    masterWel.eventCallback("onComplete", () => {
      // Belt-and-suspenders: the shell must stay visible even if a later
      // tween or unmount races the autoAlpha set above.
      gsap.set(".fullSite-Wrapper", { autoAlpha: 1 });
      // Hand the cover back to route transitions, which expect the dark slab.
      welcomeCover?.classList.remove("transBlk__lt--welcome");
      // Take the overlay out of layout before React unmounts it, so the
      // last frame cannot flash a 1px welcome layer.
      if (nodeRef.current) gsap.set(nodeRef.current, { display: "none" });
      // Flip the session flag; next render of this component returns null.
      markPlayed();
    });
  };

  return (
    // appear + timeout={0} fires onEnter on the first paint, which is when
    // the SVG refs are in the DOM and safe to tween.
    <Transition
      nodeRef={nodeRef}
      in={true}
      appear
      timeout={0}
      onEnter={handleAppear}
    >
      {/* Fixed full-viewport black overlay. Stacking order of the SVGs
          below matches paint order: later siblings sit on top. */}
      <div ref={nodeRef} className="fullSite-WrapperWel">
        {/* White side panel — last welcome wipe, grows from the left. */}
        <svg className="sidePushWrap">
          <g ref={sidePushRef} className="sidePush">
            <rect width="100%" height="100%" />
          </g>
        </svg>
        {/* Circular Insignia mark. 1366×768 matches the original artboard. */}
        <svg className="insigniaWrap" viewBox="0 0 1366 768">
          <g ref={sigRef} className="insigniaLand">
            <path d="M310.6 263.5L298 284.9c11.9 15.9 18.9 35.5 18.9 56.8 0 52.4-42.6 95-95 95-8.6 0-16.9-1.2-24.8-3.3l119.6-204.3L173 423c-4.5-2.8-8.8-5.8-12.8-9.3l174.3-220.1-203.6 174.8c-2.5-8.5-3.9-17.4-3.9-26.8 0-52.4 42.6-95 95-95 9.6 0 18.9 1.5 27.6 4.1l20.1-17.2c-14.6-6.5-30.8-10.1-47.8-10.1-65.2 0-118.2 53.1-118.2 118.2 0 65.2 53.1 118.2 118.2 118.2 65.2 0 118.2-53.1 118.2-118.2.1-29.9-11.1-57.3-29.5-78.1z" />
          </g>
        </svg>
        {/* White horizontal sweep rectangle. */}
        <svg className="rectWrapWtcont">
          <g ref={rectWrapWtRef} className="rectWrapWt">
            <rect width="100%" height="100%" />
          </g>
        </svg>
        {/* Green vertical sweep rectangle. */}
        <svg className="rectWrapGrcont">
          <g ref={rectWrapGrRef} className="rectWrapGr">
            <rect width="100%" height="100%" />
          </g>
        </svg>
        {/* Black wipe — first a vertical fill, then a horizontal bar that
            covers the Insignia's exit trail. */}
        <svg className="rectWrapOutcont">
          <g ref={rectBlkRef} className="rectWrapOut">
            <rect width="100%" height="100%" />
          </g>
        </svg>
        {/* Wordmarks. Paths stay presentation-only; fill/alpha are GSAP. */}
        <svg ref={wordsWrapRef} className="fullSvgWelcome" viewBox="0 0 1366 768">
          {/* "INERTIA" */}
          <g ref={inertiaTextRef} className="inertiatext_welc">
            <path d="M393.8 278.5h35l-20.1 114.1h-35l20.1-114.1zm207.9 0h124.8l-4.7 26.5H632l-3.2 18.3h85.1l-4.2 23.6h-85.1l-3.2 18.3h91.9l-4.8 27.4H581.6l20.1-114.1zm135.3 0h105.6c26.9 0 31.9 13.4 28.2 33.9l-1.3 7.3c-2.7 15.3-7.8 24.3-24.5 28.1v.3c10.1 1.9 17.9 6.5 14.6 25.2l-3.4 19.4h-35l2.4-13.7c2.1-12-.7-15.9-11.5-15.9h-55l-5.2 29.6h-35L737 278.5zm25.1 56.1h57.8c9.4 0 13.6-3.8 15-12l.7-3.8c1.8-10.1-2.9-12-13.9-12H767l-4.9 27.8zm253.6-56.1H882.9l-5 28.4h48.7l-15.1 85.7H947l15.1-85.7h48.7l4.9-28.4zm8.5 0h35l-20.1 114.1h-35l20.1-114.1zm105.5 0h45.5l42.6 114.1h-38.9l-7.3-20.2h-70.9l-13.8 20.2h-39.1l81.9-114.1zm-11.6 69.3h44.7l-15.2-42.9-29.5 42.9zm-559.7-69.3l-14.6 82.9h-.3l-51.1-82.9h-54.2L418 392.6h35l14.6-82.9h.3l51.1 82.9h54.2l20.1-114.1h-34.9z" />
          </g>
          {/* "ARTIST MANAGEMENT" */}
          <g ref={artistTextRef} className="artistmgmtLand">
            <path d="M404.7 437.2l-3.5-5.6h-20.6l-3.3 5.6h-3.8l15.1-26.5h4.3l15.9 26.5h-4.1zm-14-23.3l-8.4 14.7h17.1c0-.1-8.7-14.7-8.7-14.7zm67.4 10.1c-1.7 1.3-2.8 1.4-2.9 1.4 0 0 2.2.6 3.3 2 .9 1.1 1.1 2.1 1.1 3.5v6.2H456v-6.9c0-1.3-.6-2-1.5-2.9-.7-.7-1.6-.7-2.7-.7h-18.4V437H430v-26.5h22c2.3 0 4.2.6 5.6 1.7 1.5 1.1 2 3.5 1.9 5.4v2.3c.1 1.8-.4 3.3-1.4 4.1zm-1.8-5.4c0-1.6-.3-2.8-1.6-3.9-.6-.5-1.8-1-3.1-1h-18.2v10.1h18.1c1.4 0 2.5-.1 3.5-1 .8-.8 1.3-1.6 1.3-2.8v-1.4zm41.9-4.9v23.5h-3v-23.5h-13.4v-3h29.3v3h-12.9zm35.5 23.5v-26.5h3.6v26.5h-3.6zm53.6-1.9c-2.8 2.3-7.3 1.8-11 1.8H570c-.9 0-4.8.3-7.7-2-1.5-1.2-1.6-3.9-1.6-4.6v-1.7h3.3v1.4c0 1 .2 1.8.6 2.5 1 1.7 5.2 1.5 8.6 1.5h4.5c1.2 0 5.9-.1 7.3-1.4.8-.7 1-1.4 1-2.4v-1c0-1.3-.1-2.5-1.2-3.6-.9-.8-2.5-.7-4.2-.7h-11.5c-.5 0-3.3 0-5.1-.8-2.4-1-3.5-2.8-3.6-5.4v-.9c.1-2.8.7-5.2 3.5-6.5 1.9-.8 6.5-.9 8.8-.9h3.5c3.6 0 8.7-.1 10.6 2.2 1.3 1.6 1.7 2.7 1.7 4.6v1h-3.3v-1.3c0-1-.3-1.8-1-2.4-1.4-1.3-5.3-1.1-6-1.1h-7c-4.2 0-5.7.4-6.6 1.3-.8 1-.8 1.9-.8 3.1v.5c0 1.1.3 1.9.9 2.5 1.1 1.3 2.7 1.1 4.4 1.1H581c.5 0 3.7.3 5.3 1.1 1.9 1 3 2.6 3 5.5v1.5c.1 2.6-.6 4-2 5.1zm40-21.6v23.5h-3v-23.5h-13.4v-3h29.3v3h-12.9zm99.2 23.5V414l-15.7 23.2h-2.2l-15.9-23v23H689v-26.5h5.4l15.4 22.2 14.8-22.2h5.6v26.5h-3.7zm56.8 0l-3.5-5.6h-20.6l-3.3 5.6h-3.8l15.1-26.5h4.3l15.9 26.5h-4.1zm-14.1-23.3l-8.4 14.7H778l-8.8-14.7zm67.1 23.3L811.8 414v23.2h-3.3v-26.5h4.7l24.5 23.6v-23.6h3.6v26.5h-5zm58.1 0l-3.5-5.6h-20.6l-3.3 5.6h-3.8l15.1-26.5h4.3l15.9 26.5h-4.1zm-14-23.3l-8.4 14.7h17.2l-8.8-14.7zm70 20.6c-2.5 3.2-8.7 2.8-11.6 2.8h-6.3c-1.1 0-8.1.3-10.5-2.2-1.7-1.7-2.3-5-2.3-8.3v-7.2c0-1.1 0-5 2.6-7.3 1.9-1.7 6.9-1.6 11.3-1.6h3.7c4.5 0 9.3-.1 12 1.8 2 1.5 2.4 2.9 2.4 5v1.3h-3.5v-1.3c0-1-.1-1.9-.9-2.6-1.7-1.5-6.7-1.3-9.3-1.3h-5.1c-2.1 0-6.9-.1-8.3 1.2-1.4 1.3-1.4 4.1-1.4 6.9v5.3c0 2.1.5 4.6 1 5.3 1.5 1.8 4.2 1.9 7 1.9h8.5c2.9 0 5.3.3 7.3-1.1 1.1-.7 1.4-2.7 1.4-4.6V427h-13.7v-3H952v5.3c0 2.1-.5 3.8-1.6 5.2zm24 2.7v-26.5h25.5v3h-22.2v8.6h21.5v2.9h-21.5v9.1h22.6v2.9h-25.9zm85.6 0V414l-15.7 23.2h-2.2l-15.9-23v23h-3.7v-26.5h5.4l15.4 22.2 14.8-22.2h5.6v26.5h-3.7zm26 0v-26.5h25.5v3h-22.2v8.6h21.5v2.9h-21.5v9.1h22.6v2.9H1086zm76 0l-24.5-23.2v23.2h-3.3v-26.5h4.7l24.5 23.6v-23.6h3.6v26.5h-5zm43.1-23.5v23.5h-3v-23.5h-13.4v-3h29.3v3h-12.9z" />
          </g>
        </svg>
      </div>
    </Transition>
  );
}

export default WelcomeAnimation;
