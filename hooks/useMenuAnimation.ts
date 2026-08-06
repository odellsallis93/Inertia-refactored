"use client";

import { useRef, useCallback } from "react";
import gsap from "gsap";

interface UseMenuAnimationOptions {
  openDuration?: number;
  closeDuration?: number;
  ease?: string;
}

export function useMenuAnimation(
  menuRef: React.RefObject<HTMLElement>,
  openButtonRef: React.RefObject<HTMLElement>,
  closeButtonRef: React.RefObject<HTMLElement>,
  options: UseMenuAnimationOptions = {}
) {
  const { openDuration = 1, closeDuration = 1, ease = "circ.inOut" } = options;
  const isOpenRef = useRef(false);
  const skewTlRef = useRef<gsap.core.Timeline | null>(null);

  const initialize = useCallback(() => {
    if (!menuRef.current) return;

    gsap.set(menuRef.current, { autoAlpha: 0, xPercent: 100 });

    skewTlRef.current = gsap.timeline({ paused: true });
    skewTlRef.current.fromTo(
      menuRef.current,
      { skewX: -20 },
      { skewX: 0, ease, duration: openDuration }
    );
  }, [menuRef, openDuration, ease]);

  const open = useCallback(() => {
    if (!menuRef.current || !openButtonRef.current || isOpenRef.current) return;

    isOpenRef.current = true;

    const tl = gsap.timeline();
    tl.set(menuRef.current, { autoAlpha: 1 })
      .set(".offNav__text", { autoAlpha: 1 })
      .set(".linkAnim", { autoAlpha: 1 })
      .set(".closeButton", { autoAlpha: 1 })
      .addLabel("openStart")
      .to(menuRef.current, { xPercent: 0, ease, duration: openDuration }, "openStart")
      .to(openButtonRef.current, { autoAlpha: 0, duration: 0.04 }, "openStart");
    
    if (skewTlRef.current) {
      tl.add(skewTlRef.current.play(), "openStart");
    }
  }, [menuRef, openButtonRef, openDuration, ease]);

  const close = useCallback(() => {
    if (!menuRef.current || !openButtonRef.current || !closeButtonRef.current || !isOpenRef.current) return;

    isOpenRef.current = false;

    gsap.timeline()
      .addLabel("closeNavInit")
      .to(closeButtonRef.current, { autoAlpha: 0, duration: 0.05 }, "closeNavInit")
      .to(menuRef.current, { autoAlpha: 0, ease, duration: closeDuration }, "closeNavInit")
      .to(menuRef.current, { xPercent: 100, ease, duration: closeDuration }, ">")
      .to(openButtonRef.current, { autoAlpha: 1, duration: 0.04 }, "<");
  }, [menuRef, openButtonRef, closeButtonRef, closeDuration, ease]);

  const toggle = useCallback(() => {
    if (isOpenRef.current) {
      close();
    } else {
      open();
    }
  }, [open, close]);

  return {
    initialize,
    open,
    close,
    toggle,
    isOpen: () => isOpenRef.current,
  };
}
