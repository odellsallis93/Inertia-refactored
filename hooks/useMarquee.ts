"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface UseMarqueeOptions {
  duration?: number;
  ease?: string;
}

export function useMarquee(
  containerRef: React.RefObject<HTMLElement>,
  options: UseMarqueeOptions = {}
) {
  const { duration = 30, ease = "none" } = options;
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const items = container.querySelectorAll(".boxMarquee");
    const containerHeight = container.getBoundingClientRect().height;

    if (items.length === 0 || containerHeight === 0) return;

    items.forEach((item) => {
      const tl = gsap.timeline({ repeat: -1 });
      tl.set(container, { y: 0 }).to(item, {
        duration,
        ease,
        y: containerHeight * -1,
        modifiers: {
          y: gsap.utils.unitize(gsap.utils.wrap(0, -containerHeight), "px"),
        },
      });

      timelineRef.current = tl;
    });

    return () => {
      timelineRef.current?.kill();
    };
  }, [containerRef, duration, ease]);

  return {
    pause: () => timelineRef.current?.pause(),
    resume: () => timelineRef.current?.resume(),
    kill: () => timelineRef.current?.kill(),
  };
}
