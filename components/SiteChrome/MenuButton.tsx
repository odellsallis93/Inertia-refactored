"use client";

import { useRef, useCallback, useEffect } from "react";
import gsap from "gsap";

interface MenuButtonProps {
  onOpen: () => void;
}

export function MenuButton({ onOpen }: MenuButtonProps) {
  const hoverTlRef = useRef<gsap.core.Timeline | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    hoverTlRef.current = gsap.timeline({ paused: true });
    hoverTlRef.current.to(".sideLines__menu, .sideMenu__text", {
      fill: "#39B54A",
      color: "#39B54A",
      duration: 0.5,
      ease: "expo.in",
    });
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onOpen();
    },
    [onOpen]
  );

  const handleHover = useCallback(() => {
    hoverTlRef.current?.play();
  }, []);

  const handleLeave = useCallback(() => {
    hoverTlRef.current?.reverse();
  }, []);

  return (
    <div
      id="openButton"
      className="siteMenu-Wrapper"
      onClick={handleClick}
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
    >
      <li className="siteMenu__link--wrap">
        <svg
          id="menuLines"
          className="sideLines__menu"
          version="1.1"
          viewBox="0 0 100 100"
          xmlSpace="preserve"
        >
          <g className="lineOne">
            <polyline points="20.1,39.3 80.1,39.3 80.1,37.3 20.1,37.3" />
          </g>
          <g className="lineTwo">
            <polyline points="20.1,53.8 80.1,53.8 80.1,51.8 20.1,51.8" />
          </g>
          <g className="lineThree">
            <polyline points="20.1,68.3 80.1,68.3 80.1,66.3 20.1,66.3" />
          </g>
        </svg>
        <span className="sideMenu__text">Menu</span>
      </li>
    </div>
  );
}

export default MenuButton;
