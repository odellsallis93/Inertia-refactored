"use client";

import { useCallback } from "react";
import gsap from "gsap";

interface TransitionTimings {
  leaveDuration?: number;
  leaveDelay?: number;
  enterDuration?: number;
  enterDelay?: number;
}

const DEFAULT_TIMINGS: Required<TransitionTimings> = {
  leaveDuration: 0.6,
  leaveDelay: 0,
  enterDuration: 0.6,
  enterDelay: 2,
};

export function usePageTransition(timings: TransitionTimings = {}) {
  const { leaveDuration, enterDuration, enterDelay } = {
    ...DEFAULT_TIMINGS,
    ...timings,
  };

  const playLeave = useCallback(() => {
    const transGridleft = document.querySelector(".transCont__gridleft");
    const transHeader = document.querySelector(".transCont__header");
    const transAbout = document.querySelector(".transCont__about");
    const transOverlay = document.querySelector(".transCont__overlayGrid");
    const transBlklt = document.querySelectorAll(".transBlk__lt");
    const allText = document.querySelectorAll(".allText");
    const transNews = document.querySelectorAll(".transCont__News");

    const transOut = gsap.timeline({ ease: "expo.inOut" });
    transOut
      .to(transGridleft, { scaleX: 1, transformOrigin: "left", duration: leaveDuration }, "columSt")
      .to(transHeader, { scaleX: 1, transformOrigin: "left", duration: leaveDuration }, "<")
      .to(transOverlay, { scaleX: 1, transformOrigin: "left", duration: leaveDuration }, "<")
      .to(transNews, { scaleX: 1, transformOrigin: "left", duration: leaveDuration }, "<")
      .to(transAbout, { scaleX: 1, transformOrigin: "left", duration: leaveDuration }, "<");

    const pageCover = gsap.timeline();
    pageCover.set(transBlklt, { autoAlpha: 1 });
    pageCover.fromTo(
      transBlklt,
      { scaleY: 0 },
      { scaleY: 1, transformOrigin: "bottom", ease: "expo.inOut", duration: leaveDuration }
    );

    const txtl = gsap.timeline();
    txtl.to(allText, { xPercent: -100, duration: 0.7, ease: "power2.in", transformOrigin: "top" });

    const master = gsap.timeline();
    master.add(txtl).add(transOut, "<=.9").add(pageCover, ">");

    return master;
  }, [leaveDuration]);

  const playEnter = useCallback(() => {
    const mainAnimSect = document.querySelectorAll(".fullSite-Wrapper");
    const landingAnimSect = document.querySelectorAll(".fullSite-WrapperWel");
    const transGridleftout = document.querySelectorAll(".transCont__gridleft");
    const transHeaderout = document.querySelectorAll(".transCont__header");
    const transAboutout = document.querySelectorAll(".transCont__about");
    const transOverlayout = document.querySelectorAll(".transCont__overlayGrid");
    const transBlkltout = document.querySelectorAll(".transBlk__lt");
    const transNewsout = document.querySelectorAll(".transCont__News");
    const allTextout = document.querySelectorAll(".allText");

    const transIn = gsap.timeline();
    transIn.set(
      ".transCont__gridleft, .transCont__News, .transCont__about, .transCont__overlayGrid, .transCont__header",
      { autoAlpha: 1 }
    );
    transIn
      .to(transGridleftout, {
        scaleX: 0,
        transformOrigin: "right",
        delay: enterDelay,
        ease: "expo.inOut",
        duration: enterDuration,
      })
      .to(transOverlayout, { scaleX: 0, transformOrigin: "right", ease: "expo.inOut", duration: enterDuration }, "<")
      .to(transHeaderout, { scaleX: 0, transformOrigin: "right", ease: "expo.inOut", duration: enterDuration }, "<")
      .to(transNewsout, { scaleX: 0, transformOrigin: "right", ease: "expo.inOut", duration: enterDuration }, "<")
      .to(transAboutout, { scaleX: 0, transformOrigin: "right", ease: "expo.inOut", duration: enterDuration }, "<");

    const coverOut = gsap.timeline();
    coverOut.fromTo(
      transBlkltout,
      { scaleY: 1 },
      { scaleY: 0, transformOrigin: "top", ease: "expo.inOut", duration: enterDuration }
    );

    const txtlIn = gsap.timeline();
    txtlIn.fromTo(
      allTextout,
      { xPercent: -100 },
      { xPercent: 0, duration: 0.7, ease: "expo.out", transformOrigin: "bottom" }
    );

    const masterOut = gsap.timeline();
    masterOut.set(mainAnimSect, { autoAlpha: 1 });
    if (landingAnimSect.length) {
      masterOut.set(landingAnimSect, { autoAlpha: 0, display: "none" });
    }
    masterOut
      .add(coverOut)
      .set(
        ".transCont__gridleft, .transCont__News, .transCont__about, .transCont__overlayGrid, .transCont__header",
        { scaleX: 1 },
        "<"
      )
      .add(transIn, "<-1")
      .add(txtlIn, ">");

    return masterOut;
  }, [enterDuration, enterDelay]);

  return {
    playLeave,
    playEnter,
  };
}
