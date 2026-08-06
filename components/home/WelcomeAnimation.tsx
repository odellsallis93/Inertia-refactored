"use client";

import { useRef } from "react";
import { Transition } from "react-transition-group";
import gsap from "gsap";
import { useWelcome } from "@/components/SiteChrome/WelcomeContext";

export function WelcomeAnimation() {
  const { hasPlayed, markPlayed } = useWelcome();
  const nodeRef = useRef<HTMLDivElement>(null);

  const sigRef = useRef<SVGGElement>(null);
  const rectWrapWtRef = useRef<SVGGElement>(null);
  const rectWrapGrRef = useRef<SVGGElement>(null);
  const rectBlkRef = useRef<SVGGElement>(null);
  const sidePushRef = useRef<SVGGElement>(null);
  const inertiaTextRef = useRef<SVGGElement>(null);
  const artistTextRef = useRef<SVGGElement>(null);
  const wordsWrapRef = useRef<SVGSVGElement>(null);

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

    if (!container || !sig || !rectWrapWt || !rectWrapGr || !rectBlk || !sidePush || !inertia || !artist || !wordsWrap) return;

    // Insignia timeline
    const insignitaTl = gsap.timeline();
    insignitaTl.set(sig, { xPercent: 389, scaleX: 0.5, scaleY: 0.5 });
    insignitaTl
      .to(sig, { autoAlpha: 1, duration: 2, scaleX: 1, scaleY: 1, ease: "back.out(2)", transformOrigin: "left top" })
      .to(sig, { xPercent: 10, duration: 1.8, ease: "expo.out" })
      .to(sig, { rotate: -360, duration: 1, transformOrigin: "50% 55%", ease: "expo.out" }, "<.05");

    // Span white
    const spanWhite = gsap.timeline({ duration: 1.5, ease: "expo.inOut", transformOrigin: "left bottom" });
    spanWhite.set(rectWrapWt, { autoAlpha: 1, skewX: 0, xPercent: -20, scaleX: 0 });
    spanWhite
      .to(rectWrapWt, { skewX: 10, scaleX: 0.4 })
      .to(rectWrapWt, { skewX: 40, scaleX: 0.7 }, ">-.4")
      .to(rectWrapWt, { skewX: 20, scaleX: 1 }, ">-.4")
      .to(rectWrapWt, { skewX: 0, scaleX: 1.4 }, ">-.4");

    // Span white out
    const spanWhiteOut = gsap.timeline({ transformOrigin: "right", ease: "expo.out", duration: 1.5 });
    spanWhiteOut.set(rectWrapWt, { autoAlpha: 1, yPercent: -70 });
    spanWhiteOut
      .fromTo(rectWrapWt, { scaleX: 1.4, skewY: 0 }, { scaleX: 0.7, skewX: -25 })
      .to(rectWrapWt, { scaleX: 0, skewX: 0 }, ">-.5");

    // Span green
    const spanGreen = gsap.timeline({ transformOrigin: "top", ease: "expo.inOut" });
    spanGreen.set(wordsWrap, { autoAlpha: 1 });
    spanGreen.set(inertia, { autoAlpha: 1 });
    spanGreen.set(artist, { autoAlpha: 1 });
    spanGreen.set(rectWrapGr, { autoAlpha: 1, yPercent: -70 });
    spanGreen
      .fromTo(rectWrapGr, { scaleY: 0, skewY: 0 }, { scaleY: 1.5, skewY: 10, duration: 0.7 })
      .to(rectWrapGr, { scaleY: 2.5, skewY: 0, duration: 0.5 }, ">-.5");

    // Green out
    const spanGreenOut = gsap.timeline({ transformOrigin: "bottom right", ease: "expo.out" });
    spanGreenOut.set(rectWrapGr, { autoAlpha: 1, yPercent: -70 });
    spanGreenOut
      .fromTo(rectWrapGr, { scaleY: 2.5, skewY: 0 }, { scaleY: 1.5, skewY: -10, duration: 0.7 })
      .to(rectWrapGr, { scaleY: 0, skewY: 0, duration: 0.5 }, ">-.5");

    // Letters in
    const lettersIn = gsap.timeline({ ease: "sine.in" });
    lettersIn
      .to(inertia, { fill: "white", autoAlpha: 1, duration: 0.5 }, "firstFill")
      .to(sig, { fill: "green" }, "firstFill")
      .to(artist, { fill: "white", autoAlpha: 1, duration: 0.5 }, "firstFill");

    // Span black
    const spanBlack = gsap.timeline();
    spanBlack.set(rectBlk, { autoAlpha: 1, scaleY: 0 });
    spanBlack.to(rectBlk, { scaleY: 1, ease: "expo.in", duration: 0.5 });

    // Insignia out
    const insigniaOut = gsap.timeline({ ease: "expo.out" });
    insigniaOut.set(rectBlk, { autoAlpha: 1, scaleX: 0, xPercent: 26 });
    insigniaOut
      .fromTo(sig, { xPercent: 0 }, { xPercent: 640, duration: 0.6 })
      .fromTo(rectBlk, { scaleX: 0 }, { scaleX: 1, duration: 0.6, transformOrigin: "left" }, "<")
      .to(sig, { rotate: 0, duration: 0.5, transformOrigin: "50% 55%" }, "<");

    // Side overlay
    const sideOverlay = gsap.timeline({ ease: "expo.inOut", transformOrigin: "left", duration: 1 });
    sideOverlay.set(sidePush, { xPercent: -40, autoAlpha: 1, scaleX: 0, skewX: 0 });
    sideOverlay
      .fromTo(sidePush, { scaleX: 0, skewX: 0 }, { scaleX: 0.3, skewX: 20 })
      .to(sidePush, { scaleX: 0.7, skewX: 40 }, ">-.3")
      .to(sidePush, { scaleX: 1.5, skewX: 0 }, ">-.3");

    // Transition overlay reveal (these elements are outside this component)
    const transIn = gsap.timeline();
    transIn.set(
      ".transCont__gridleft, .transCont__News, .transCont__about, .transCont__overlayGrid, .transCont__header",
      { autoAlpha: 1 }
    );
    transIn
      .to(".transCont__gridleft", { scaleX: 0, transformOrigin: "right", delay: 2, ease: "expo.inOut", duration: 0.6 })
      .to(".transCont__overlayGrid", { scaleX: 0, transformOrigin: "right", ease: "expo.inOut", duration: 0.6 }, "<")
      .to(".transCont__header", { scaleX: 0, transformOrigin: "right", ease: "expo.inOut", duration: 0.6 }, "<")
      .to(".transCont__News", { scaleX: 0, transformOrigin: "right", ease: "expo.inOut", duration: 0.6 }, "<")
      .to(".transCont__about", { scaleX: 0, transformOrigin: "right", ease: "expo.inOut", duration: 0.6 }, "<");

    const coverOut = gsap.timeline();
    coverOut.fromTo(".transBlk__lt", { scaleY: 1 }, { scaleY: 0, transformOrigin: "top", ease: "expo.inOut", duration: 0.6 });

    const txtlIn = gsap.timeline();
    txtlIn.fromTo(".allText", { xPercent: -100 }, { xPercent: 0, duration: 0.7, ease: "expo", transformOrigin: "bottom" });

    const pageCover = gsap.timeline();
    pageCover.set(".transBlk__lt", { autoAlpha: 1 });
    pageCover.fromTo(".transBlk__lt", { scaleY: 0 }, { scaleY: 1, transformOrigin: "bottom", ease: "expo.inOut", duration: 0.6 });

    // Master welcome timeline
    const masterWel = gsap.timeline();
    masterWel
      .add(insignitaTl, "welcomeStart")
      .add(spanWhite, "welcomeStart+=1")
      .add(spanGreen, ">-.3")
      .add(spanGreenOut, ">-.29")
      .add(spanWhiteOut, "<-1.5")
      .add(lettersIn, ">-.3")
      .add(spanBlack, ">.5")
      .add(insigniaOut)
      .add(sideOverlay, "<-.7")
      .add(pageCover, ">")
      .to(".logoMobile__Sideways, .fullSite-Wrapper", { autoAlpha: 1 }, "<2")
      .to(container, { autoAlpha: 0 }, "<-.5")
      .add(coverOut, "<.5")
      .set(
        ".transCont__gridleft, .transCont__News, .transCont__about, .transCont__overlayGrid, .transCont__header",
        { scaleX: 1 }
      )
      .add(transIn, "<-1")
      .add(txtlIn, ">")
      // Restore transforms authored in CSS after GSAP's text reveal. This
      // preserves responsive offsets on the first transition as well.
      .set(".allText", { clearProps: "transform,transformOrigin" });

    masterWel.eventCallback("onComplete", () => {
      gsap.set(".fullSite-Wrapper", { autoAlpha: 1 });
      // Remove the intro from layout immediately; markPlayed() then unmounts it.
      if (nodeRef.current) gsap.set(nodeRef.current, { display: "none" });
      markPlayed();
    });
  };

  return (
    <Transition
      nodeRef={nodeRef}
      in={true}
      appear
      timeout={0}
      onEnter={handleAppear}
    >
      <div ref={nodeRef} className="fullSite-WrapperWel">
        <svg className="sidePushWrap">
          <g ref={sidePushRef} className="sidePush">
            <rect width="100%" height="100%" />
          </g>
        </svg>
        <svg className="insigniaWrap" viewBox="0 0 1366 768">
          <g ref={sigRef} className="insigniaLand">
            <path d="M310.6 263.5L298 284.9c11.9 15.9 18.9 35.5 18.9 56.8 0 52.4-42.6 95-95 95-8.6 0-16.9-1.2-24.8-3.3l119.6-204.3L173 423c-4.5-2.8-8.8-5.8-12.8-9.3l174.3-220.1-203.6 174.8c-2.5-8.5-3.9-17.4-3.9-26.8 0-52.4 42.6-95 95-95 9.6 0 18.9 1.5 27.6 4.1l20.1-17.2c-14.6-6.5-30.8-10.1-47.8-10.1-65.2 0-118.2 53.1-118.2 118.2 0 65.2 53.1 118.2 118.2 118.2 65.2 0 118.2-53.1 118.2-118.2.1-29.9-11.1-57.3-29.5-78.1z" />
          </g>
        </svg>
        <svg className="rectWrapWtcont">
          <g ref={rectWrapWtRef} className="rectWrapWt">
            <rect width="100%" height="100%" />
          </g>
        </svg>
        <svg className="rectWrapGrcont">
          <g ref={rectWrapGrRef} className="rectWrapGr">
            <rect width="100%" height="100%" />
          </g>
        </svg>
        <svg className="rectWrapOutcont">
          <g ref={rectBlkRef} className="rectWrapOut">
            <rect width="100%" height="100%" />
          </g>
        </svg>
        <svg ref={wordsWrapRef} className="fullSvgWelcome" viewBox="0 0 1366 768">
          <g ref={inertiaTextRef} className="inertiatext_welc">
            <path d="M393.8 278.5h35l-20.1 114.1h-35l20.1-114.1zm207.9 0h124.8l-4.7 26.5H632l-3.2 18.3h85.1l-4.2 23.6h-85.1l-3.2 18.3h91.9l-4.8 27.4H581.6l20.1-114.1zm135.3 0h105.6c26.9 0 31.9 13.4 28.2 33.9l-1.3 7.3c-2.7 15.3-7.8 24.3-24.5 28.1v.3c10.1 1.9 17.9 6.5 14.6 25.2l-3.4 19.4h-35l2.4-13.7c2.1-12-.7-15.9-11.5-15.9h-55l-5.2 29.6h-35L737 278.5zm25.1 56.1h57.8c9.4 0 13.6-3.8 15-12l.7-3.8c1.8-10.1-2.9-12-13.9-12H767l-4.9 27.8zm253.6-56.1H882.9l-5 28.4h48.7l-15.1 85.7H947l15.1-85.7h48.7l4.9-28.4zm8.5 0h35l-20.1 114.1h-35l20.1-114.1zm105.5 0h45.5l42.6 114.1h-38.9l-7.3-20.2h-70.9l-13.8 20.2h-39.1l81.9-114.1zm-11.6 69.3h44.7l-15.2-42.9-29.5 42.9zm-559.7-69.3l-14.6 82.9h-.3l-51.1-82.9h-54.2L418 392.6h35l14.6-82.9h.3l51.1 82.9h54.2l20.1-114.1h-34.9z" />
          </g>
          <g ref={artistTextRef} className="artistmgmtLand">
            <path d="M404.7 437.2l-3.5-5.6h-20.6l-3.3 5.6h-3.8l15.1-26.5h4.3l15.9 26.5h-4.1zm-14-23.3l-8.4 14.7h17.1c0-.1-8.7-14.7-8.7-14.7zm67.4 10.1c-1.7 1.3-2.8 1.4-2.9 1.4 0 0 2.2.6 3.3 2 .9 1.1 1.1 2.1 1.1 3.5v6.2H456v-6.9c0-1.3-.6-2-1.5-2.9-.7-.7-1.6-.7-2.7-.7h-18.4V437H430v-26.5h22c2.3 0 4.2.6 5.6 1.7 1.5 1.1 2 3.5 1.9 5.4v2.3c.1 1.8-.4 3.3-1.4 4.1zm-1.8-5.4c0-1.6-.3-2.8-1.6-3.9-.6-.5-1.8-1-3.1-1h-18.2v10.1h18.1c1.4 0 2.5-.1 3.5-1 .8-.8 1.3-1.6 1.3-2.8v-1.4zm41.9-4.9v23.5h-3v-23.5h-13.4v-3h29.3v3h-12.9zm35.5 23.5v-26.5h3.6v26.5h-3.6zm53.6-1.9c-2.8 2.3-7.3 1.8-11 1.8H570c-.9 0-4.8.3-7.7-2-1.5-1.2-1.6-3.9-1.6-4.6v-1.7h3.3v1.4c0 1 .2 1.8.6 2.5 1 1.7 5.2 1.5 8.6 1.5h4.5c1.2 0 5.9-.1 7.3-1.4.8-.7 1-1.4 1-2.4v-1c0-1.3-.1-2.5-1.2-3.6-.9-.8-2.5-.7-4.2-.7h-11.5c-.5 0-3.3 0-5.1-.8-2.4-1-3.5-2.8-3.6-5.4v-.9c.1-2.8.7-5.2 3.5-6.5 1.9-.8 6.5-.9 8.8-.9h3.5c3.6 0 8.7-.1 10.6 2.2 1.3 1.6 1.7 2.7 1.7 4.6v1h-3.3v-1.3c0-1-.3-1.8-1-2.4-1.4-1.3-5.3-1.1-6-1.1h-7c-4.2 0-5.7.4-6.6 1.3-.8 1-.8 1.9-.8 3.1v.5c0 1.1.3 1.9.9 2.5 1.1 1.3 2.7 1.1 4.4 1.1H581c.5 0 3.7.3 5.3 1.1 1.9 1 3 2.6 3 5.5v1.5c.1 2.6-.6 4-2 5.1zm40-21.6v23.5h-3v-23.5h-13.4v-3h29.3v3h-12.9zm99.2 23.5V414l-15.7 23.2h-2.2l-15.9-23v23H689v-26.5h5.4l15.4 22.2 14.8-22.2h5.6v26.5h-3.7zm56.8 0l-3.5-5.6h-20.6l-3.3 5.6h-3.8l15.1-26.5h4.3l15.9 26.5h-4.1zm-14.1-23.3l-8.4 14.7H778l-8.8-14.7zm67.1 23.3L811.8 414v23.2h-3.3v-26.5h4.7l24.5 23.6v-23.6h3.6v26.5h-5zm58.1 0l-3.5-5.6h-20.6l-3.3 5.6h-3.8l15.1-26.5h4.3l15.9 26.5h-4.1zm-14-23.3l-8.4 14.7h17.2l-8.8-14.7zm70 20.6c-2.5 3.2-8.7 2.8-11.6 2.8h-6.3c-1.1 0-8.1.3-10.5-2.2-1.7-1.7-2.3-5-2.3-8.3v-7.2c0-1.1 0-5 2.6-7.3 1.9-1.7 6.9-1.6 11.3-1.6h3.7c4.5 0 9.3-.1 12 1.8 2 1.5 2.4 2.9 2.4 5v1.3h-3.5v-1.3c0-1-.1-1.9-.9-2.6-1.7-1.5-6.7-1.3-9.3-1.3h-5.1c-2.1 0-6.9-.1-8.3 1.2-1.4 1.3-1.4 4.1-1.4 6.9v5.3c0 2.1.5 4.6 1 5.3 1.5 1.8 4.2 1.9 7 1.9h8.5c2.9 0 5.3.3 7.3-1.1 1.1-.7 1.4-2.7 1.4-4.6V427h-13.7v-3H952v5.3c0 2.1-.5 3.8-1.6 5.2zm24 2.7v-26.5h25.5v3h-22.2v8.6h21.5v2.9h-21.5v9.1h22.6v2.9h-25.9zm85.6 0V414l-15.7 23.2h-2.2l-15.9-23v23h-3.7v-26.5h5.4l15.4 22.2 14.8-22.2h5.6v26.5h-3.7zm26 0v-26.5h25.5v3h-22.2v8.6h21.5v2.9h-21.5v9.1h22.6v2.9H1086zm76 0l-24.5-23.2v23.2h-3.3v-26.5h4.7l24.5 23.6v-23.6h3.6v26.5h-5zm43.1-23.5v23.5h-3v-23.5h-13.4v-3h29.3v3h-12.9z" />
          </g>
        </svg>
      </div>
    </Transition>
  );
}

export default WelcomeAnimation;
