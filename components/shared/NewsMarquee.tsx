"use client";

import { useRef, useCallback } from "react";
import { newsItems, type NewsItem } from "@/data/news";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface NewsMarqueeProps {
  items?: NewsItem[];
}

export function NewsMarquee({ items = newsItems }: NewsMarqueeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setBoxRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    boxRefs.current[index] = el;
  }, []);

  useGSAP(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const wrapperHeight = wrapper.getBoundingClientRect().height;
    if (wrapperHeight === 0) return;

    const boxes = boxRefs.current.filter(Boolean) as HTMLDivElement[];
    if (boxes.length === 0) return;

    boxes.forEach((box) => {
      gsap.timeline({ repeat: -1 })
        .set(wrapper, { y: 0 })
        .to(box, {
          duration: 30,
          ease: "none",
          y: wrapperHeight * -1,
          modifiers: {
            y: gsap.utils.unitize(gsap.utils.wrap(0, -wrapperHeight), "px"),
          },
        });
    });
  }, { scope: wrapperRef });

  // 6 unique items + 2 duplicates for seamless wrapping (matches old HTML exactly)
  const displayItems = [...items, items[0], items[1]];

  return (
    <div ref={wrapperRef} id="scrollCol" className="tiltFx--wrap1">
      <span className="transCont__News" />
      {displayItems.map((item, i) => (
        <div key={`marquee-${i}`} ref={setBoxRef(i)} className="boxMarquee">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`tiltFx__img tiltFx__img--${(i % 6) + 1}`}
            src={item.image}
            alt={item.title}
          />
        </div>
      ))}
    </div>
  );
}

export default NewsMarquee;
