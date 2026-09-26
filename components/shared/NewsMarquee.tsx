"use client";

import { useRef } from "react";
import { newsItems, type NewsItem } from "@/data/news";
import { useMarquee } from "@/hooks/useMarquee";

interface NewsMarqueeProps {
  items?: NewsItem[];
}

export function NewsMarquee({ items = newsItems }: NewsMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  useMarquee(trackRef);

  const displayItems = [...items, ...items];

  return (
    <div id="scrollCol" className="tiltFx--wrap1">
      <span className="transCont__News" />
      <div ref={trackRef} className="marqueeTrack">
        {displayItems.map((item, i) => (
          <div key={`marquee-${i}`} className="boxMarquee">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={`tiltFx__img tiltFx__img--${(i % 6) + 1}`}
              src={item.image}
              alt={item.title}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewsMarquee;
