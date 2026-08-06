"use client";

import { useRef, useCallback } from "react";
import { featuredVideos, type FeaturedVideo } from "@/data/videos";
import { PlayButtonIcon } from "@/components/icons/SocialIcons";
import { useVideoClick } from "@/components/SiteChrome/VideoClickContext";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface MediaGridProps {
  videos?: FeaturedVideo[];
  className?: string;
  onVideoClick?: (video: FeaturedVideo) => void;
}

export function MediaGrid({ videos = featuredVideos, className, onVideoClick }: MediaGridProps) {
  const videoClickFromContext = useVideoClick();
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLImageElement | null)[]>([]);

  const setThumbRef = useCallback((index: number) => (el: HTMLImageElement | null) => {
    thumbRefs.current[index] = el;
  }, []);

  useGSAP(() => {
    thumbRefs.current.forEach((thumb) => {
      if (!thumb) return;
      gsap.set(thumb, { filter: "grayscale(100%)" });
    });
  }, { scope: containerRef });

  const handleMouseEnter = useCallback((index: number) => () => {
    const thumb = thumbRefs.current[index];
    if (!thumb) return;
    gsap.to(thumb, { filter: "grayscale(0%)", ease: "expo.inOut", duration: 1 });
  }, []);

  const handleMouseLeave = useCallback((index: number) => () => {
    const thumb = thumbRefs.current[index];
    if (!thumb) return;
    gsap.to(thumb, { filter: "grayscale(100%)", ease: "expo.inOut", duration: 1 });
  }, []);

  const effectiveOnVideoClick = onVideoClick ?? videoClickFromContext;

  const handleClick = useCallback(
    (e: React.MouseEvent, video: FeaturedVideo) => {
      e.preventDefault();
      effectiveOnVideoClick?.(video);
    },
    [effectiveOnVideoClick]
  );

  return (
    <div ref={containerRef} className={className || "tiltFx--wrap2"} id="mediaCol">
      <span className="transCont__overlayGrid" />
      {videos.map((video, index) => (
        <div key={video.id} className="mediaWrap">
          <a
            className="videoWrap"
            data-video-id={video.id}
            href={video.embedUrl}
            onClick={(e) => handleClick(e, video)}
            onMouseEnter={handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave(index)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={setThumbRef(index)}
              className="videoThumb aloha"
              src={video.thumbnail}
              alt={video.title}
            />
            <PlayButtonIcon />
          </a>
        </div>
      ))}
    </div>
  );
}

export default MediaGrid;
