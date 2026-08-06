"use client";

import { NewsMarquee } from "./NewsMarquee";
import { MediaGrid } from "./MediaGrid";

interface OverlayGridProps {
  className?: string;
}

export function OverlayGrid({ className }: OverlayGridProps) {
    return (
      <div className={className || "overlayGrid"}>
        <span className="overlayLines" />
        <span className="overlayLines-light" />
        <div className="tilt__Grid tiltWrap">
          <h2>
            <span className="latestNewstx allText">Latest News</span>
          </h2>
          <h2>
            <span className="latestMediatx allText">Latest Media</span>
          </h2>

          <NewsMarquee />
          <MediaGrid />
        </div>
      </div>
    );
}

export default OverlayGrid;
