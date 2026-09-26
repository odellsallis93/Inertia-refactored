"use client";

import { type RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

interface UseMarqueeOptions {
  duration?: number;
}

export function useMarquee(
  trackRef: RefObject<HTMLElement | null>,
  options: UseMarqueeOptions = {}
) {
  const { duration = 30 } = options;

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      gsap.to(track, {
        yPercent: -50,
        duration,
        ease: "none",
        repeat: -1,
      });
    },
    { scope: trackRef, dependencies: [duration] }
  );
}
