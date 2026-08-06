"use client";

import { forwardRef, useRef, useCallback, useEffect, useImperativeHandle } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { siteConfig } from "@/config/site";

export interface OffCanvasMenuHandle {
  open: () => void;
  close: () => void;
}

export const OffCanvasMenu = forwardRef<OffCanvasMenuHandle>(
  function OffCanvasMenu(_, ref) {
    const pathname = usePathname();
    const menuWrapRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<SVGSVGElement>(null);
    const pageSkewTlRef = useRef<gsap.core.Timeline | null>(null);
    const initializedRef = useRef(false);

    const isHome = pathname === "/";
    const rosterDataLetters = isHome ? "home" : "Roster";
    const rosterClassName = isHome ? "menuHome" : "menuRoster";

    useEffect(() => {
      if (!menuWrapRef.current || initializedRef.current) return;
      initializedRef.current = true;

      gsap.set(menuWrapRef.current, { autoAlpha: 0, xPercent: 100 });

      pageSkewTlRef.current = gsap.timeline({ paused: true });
      pageSkewTlRef.current.fromTo(
        menuWrapRef.current,
        { skewX: -20 },
        { skewX: 0, ease: "circ.inOut", duration: 1 }
      );
    }, []);

    const open = useCallback(() => {
      if (!menuWrapRef.current) return;

      const tl = gsap.timeline();
      tl.set(menuWrapRef.current, { autoAlpha: 1 })
        .set(".offNav__text", { autoAlpha: 1 })
        .set(".linkAnim", { autoAlpha: 1 })
        .set(".closeButton", { autoAlpha: 1 })
        .addLabel("openStart")
        .to(menuWrapRef.current, { xPercent: 0, ease: "circ.inOut", duration: 1 }, "openStart")
        .to("#openButton", { autoAlpha: 0, duration: 0.04 }, "openStart");

      if (pageSkewTlRef.current) {
        tl.add(pageSkewTlRef.current.play(), "openStart");
      }
    }, []);

    const close = useCallback(() => {
      if (!menuWrapRef.current || !closeButtonRef.current) return;

      gsap.timeline()
        .addLabel("closeNavInit")
        .to(closeButtonRef.current, { autoAlpha: 0, duration: 0.05 }, "closeNavInit")
        .to(menuWrapRef.current, { autoAlpha: 0, ease: "circ.inOut", duration: 1 }, "closeNavInit")
        .to(menuWrapRef.current, { xPercent: 100, ease: "circ.inOut", duration: 1 }, ">")
        .to("#openButton", { autoAlpha: 1, duration: 0.04 }, "<");
    }, []);

    useImperativeHandle(ref, () => ({ open, close }), [open, close]);

    const handleCloseClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        close();
      },
      [close]
    );

    const handleNavLinkClick = useCallback(() => {
      close();
    }, [close]);

    return (
      <div ref={menuWrapRef} className="offNav__wrap">
        <nav className="offNav">
          <li className="offNav__text offText1">
            <Link
              href="/"
              data-letters={rosterDataLetters}
              className={`linkAnim link--kukuri ${rosterClassName}`}
              onClick={handleNavLinkClick}
            >
              Roster
            </Link>
          </li>
          <li className="offNav__text offText1">
            <Link
              href="/about"
              data-letters="About"
              className="linkAnim link--kukuri menuAbout"
              onClick={handleNavLinkClick}
            >
              About
            </Link>
          </li>
          <li className="offNav__text offText1">
            <a
              href={`mailto:${siteConfig.contact.email}`}
              data-letters="Contact Us"
              className="linkAnim link--kukuri menuContact"
            >
              Contact Us
            </a>
          </li>
        </nav>

        {/* Close Button */}
        <svg
          ref={closeButtonRef}
          version="1.1"
          id="closeIcon"
          className="closeButton"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox="0 0 512 512"
          xmlSpace="preserve"
          onClick={handleCloseClick}
        >
          <g>
            <path d="M256,0C114.844,0,0,114.844,0,256s114.844,256,256,256s256-114.844,256-256S397.156,0,256,0z M256,490.667C126.604,490.667,21.333,385.396,21.333,256S126.604,21.333,256,21.333S490.667,126.604,490.667,256S385.396,490.667,256,490.667z" />
          </g>
          <g>
            <path d="M359.542,152.458c-4.167-4.167-10.917-4.167-15.083,0L256,240.917l-88.458-88.458c-4.167-4.167-10.917-4.167-15.083,0c-4.167,4.167-4.167,10.917,0,15.083L240.917,256l-88.458,88.458c-4.167,4.167-4.167,10.917,0,15.083c2.083,2.083,4.813,3.125,7.542,3.125s5.458-1.042,7.542-3.125L256,271.083l88.458,88.458c2.083,2.083,4.813,3.125,7.542,3.125c2.729,0,5.458-1.042,7.542-3.125c4.167-4.167,4.167-10.917,0-15.083L271.083,256l88.458-88.458C363.708,163.375,363.708,156.625,359.542,152.458z" />
          </g>
        </svg>
      </div>
    );
  }
);

export default OffCanvasMenu;
