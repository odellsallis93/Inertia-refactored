"use client";

import { forwardRef, useRef, useCallback } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type Artist } from "@/data/artists";

interface RosterLinkProps {
  artist: Artist;
  className?: string;
}

export const RosterLink = forwardRef<HTMLAnchorElement, RosterLinkProps>(
  function RosterLink({ artist, className }, ref) {
    const containerRef = useRef<HTMLAnchorElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    useGSAP(
      () => {
        if (!textRef.current || !videoRef.current) return;

        const tl = gsap.timeline({ paused: true });
        tl.to(textRef.current, { color: "white", duration: 0.5 }, "initChange")
          .to(videoRef.current, { autoAlpha: 1, overflow: "hidden" }, "<");

        timelineRef.current = tl;
      },
      { scope: containerRef }
    );

    const isHoveredRef = useRef(false);

    const handleMouseEnter = useCallback(() => {
      timelineRef.current?.play();
      isHoveredRef.current = true;
      const video = videoRef.current;
      video
        ?.play()
        .then(() => {
          // Pointer already left while playback was starting: pause now.
          if (!isHoveredRef.current) video.pause();
        })
        .catch(() => {
          // play() was interrupted by pause() or blocked by autoplay policy.
        });
    }, []);

    const handleMouseLeave = useCallback(() => {
      timelineRef.current?.reverse();
      isHoveredRef.current = false;
      videoRef.current?.pause();
    }, []);

    return (
      <Link
        ref={(node) => {
          // Handle both refs
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
          (containerRef as React.MutableRefObject<HTMLAnchorElement | null>).current = node;
        }}
        href={`/artists/${artist.slug}`}
        className={className || "link mgmt artistNav__link"}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleMouseEnter}
        onTouchEnd={handleMouseLeave}
      >
        <h1 ref={textRef} className="text navText">
          {artist.name}
        </h1>
        <video
          ref={videoRef}
          className={`revitem ${artist.slug}Vid`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={artist.video} type="video/mp4" />
        </video>
        <div className="roster__img-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="roster__img"
            src={artist.image}
            alt={artist.name}
          />
        </div>
      </Link>
    );
  }
);

export default RosterLink;
