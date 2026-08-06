"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { TransitionOverlay } from "./TransitionOverlay";
import { OffCanvasMenu, type OffCanvasMenuHandle } from "./OffCanvasMenu";
import { MenuButton } from "./MenuButton";
import { Lightbox, type LightboxHandle } from "./Lightbox";
import { VideoClickContext } from "./VideoClickContext";
import { WelcomeContext } from "./WelcomeContext";
import { WelcomeAnimation } from "@/components/home/WelcomeAnimation";
import { SiteHeader, SideNavigation, OverlayGrid, SVGFilters } from "@/components/shared";
import { type FeaturedVideo } from "@/data/videos";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface SiteChromeProps {
  children: React.ReactNode;
}

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const lightboxRef = useRef<LightboxHandle>(null);
  const menuRef = useRef<OffCanvasMenuHandle>(null);

  const pathnameRef = useRef(pathname);
  const nextPathRef = useRef<string | null>(null);
  const isTransitioningRef = useRef(false);
  const hasEnteredRef = useRef(false);
  const welcomePlayedRef = useRef(false);
  // State mirror of welcomePlayedRef so the intro unmounts once it completes.
  const [welcomePlayed, setWelcomePlayed] = useState(false);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const markWelcomePlayed = useCallback(() => {
    welcomePlayedRef.current = true;
    setWelcomePlayed(true);
  }, []);

  const welcomeValue = {
    get hasPlayed() { return welcomePlayedRef.current; },
    markPlayed: markWelcomePlayed,
  };

  const mapLegacyPathnameToAppPath = useCallback((legacyPathname: string): string | null => {
    if (legacyPathname === "/") return "/";
    if (legacyPathname === "/index.html") return "/";
    if (legacyPathname === "/about.html") return "/about";
    if (legacyPathname === "/about") return "/about";
    if (legacyPathname.startsWith("/artists/")) {
      return legacyPathname.replace(/\.html$/i, "");
    }
    return null;
  }, []);

  const playLeaveAndNavigate = useCallback((nextPath: string) => {
    const txtl = gsap.timeline();
    txtl.to(".allText", { xPercent: -100, duration: 0.7, ease: "power2.in", transformOrigin: "top" });

    const transOut = gsap.timeline({ ease: "expo.inOut" });
    transOut
      .to(".transCont__gridleft", { scaleX: 1, transformOrigin: "left", duration: 0.6 }, "columSt")
      .to(".transCont__header", { scaleX: 1, transformOrigin: "left", duration: 0.6 }, "<")
      .to(".transCont__overlayGrid", { scaleX: 1, transformOrigin: "left", duration: 0.6 }, "<")
      .to(".transCont__News", { scaleX: 1, transformOrigin: "left", duration: 0.6 }, "<")
      .to(".transCont__about", { scaleX: 1, transformOrigin: "left", duration: 0.6 }, "<");

    const pageCover = gsap.timeline();
    pageCover
      .set(".transBlk__lt", { autoAlpha: 1 })
      .fromTo(".transBlk__lt", { scaleY: 0 }, { scaleY: 1, transformOrigin: "bottom", ease: "expo.inOut", duration: 0.6 });

    const master = gsap.timeline();
    master.add(txtl).add(transOut, "<=.9").add(pageCover, ">");

    master.eventCallback("onComplete", () => {
      gsap.set(".transBlk__lt", { autoAlpha: 1, scaleY: 1 });
      nextPathRef.current = nextPath;
      router.push(nextPath);
    });
  }, [router]);

  const playEnterTransition = useCallback(() => {
    const masterOut = gsap.timeline();

    masterOut
      .set(".fullSite-Wrapper", { autoAlpha: 1 })
      .set(".fullSite-WrapperWel", { autoAlpha: 0, display: "none" })
      .fromTo(".transBlk__lt", { scaleY: 1 }, { scaleY: 0, transformOrigin: "top", ease: "expo.inOut", duration: 0.6 })
      .set(".transCont__gridleft, .transCont__News, .transCont__about, .transCont__overlayGrid, .transCont__header", { scaleX: 1 }, "<");

    const transIn = gsap.timeline();
    transIn
      .set(".transCont__gridleft, .transCont__News, .transCont__about, .transCont__overlayGrid, .transCont__header", { autoAlpha: 1 })
      .to(".transCont__gridleft", { scaleX: 0, transformOrigin: "right", delay: 2, ease: "expo.inOut", duration: 0.6 })
      .to(".transCont__overlayGrid", { scaleX: 0, transformOrigin: "right", ease: "expo.inOut", duration: 0.6 }, "<")
      .to(".transCont__header", { scaleX: 0, transformOrigin: "right", ease: "expo.inOut", duration: 0.6 }, "<")
      .to(".transCont__News", { scaleX: 0, transformOrigin: "right", ease: "expo.inOut", duration: 0.6 }, "<")
      .to(".transCont__about", { scaleX: 0, transformOrigin: "right", ease: "expo.inOut", duration: 0.6 }, "<");

    masterOut.add(transIn, "<-1");

    const txtlIn = gsap.timeline();
    txtlIn.fromTo(".allText", { xPercent: -100 }, { xPercent: 0, duration: 0.7, ease: "expo.out", transformOrigin: "bottom" });
    masterOut
      .add(txtlIn, ">")
      // GSAP writes xPercent into an inline transform. Clear it once the
      // reveal completes so responsive CSS transforms remain authoritative.
      .set(".allText", { clearProps: "transform,transformOrigin" });

    masterOut.eventCallback("onComplete", () => {
      isTransitioningRef.current = false;
      nextPathRef.current = null;
    });
  }, []);

  useEffect(() => {
    if (!hasEnteredRef.current) {
      hasEnteredRef.current = true;

      // If the welcome animation is about to play (homepage first visit),
      // defer to WelcomeAnimation — it will handle the full intro sequence.
      const isHomeFirstVisit = pathname === "/" && !welcomePlayedRef.current;
      if (isHomeFirstVisit) {
        return;
      }

      playEnterTransition();
      return;
    }

    if (!isTransitioningRef.current) return;
    const nextPath = nextPathRef.current;
    if (!nextPath) return;
    if (pathname !== nextPath) return;

    playEnterTransition();
  }, [pathname, playEnterTransition]);

  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      const target = e.target as Element | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      const targetAttr = anchor.getAttribute("target");
      if (targetAttr && targetAttr !== "_self") return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href.startsWith("http://") || href.startsWith("https://")) return;

      let url: URL;
      try { url = new URL(href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin) return;

      const nextPath = mapLegacyPathnameToAppPath(url.pathname);
      if (!nextPath) return;
      if (nextPath === pathnameRef.current) return;
      if (isTransitioningRef.current) { e.preventDefault(); return; }

      e.preventDefault();
      isTransitioningRef.current = true;
      playLeaveAndNavigate(nextPath);
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [mapLegacyPathnameToAppPath, playLeaveAndNavigate]);

  const handleVideoClick = useCallback((video: FeaturedVideo) => {
    lightboxRef.current?.open(video.embedUrl);
  }, []);

  const handleMenuOpen = useCallback(() => {
    menuRef.current?.open();
  }, []);

  const showWelcome = pathname === "/" && !welcomePlayed;

  return (
    <WelcomeContext.Provider value={welcomeValue}>
      {/* Viewport-level layers, separate from the site grid */}
      <TransitionOverlay />
      {showWelcome && <WelcomeAnimation />}
      <OffCanvasMenu ref={menuRef} />
      <Lightbox ref={lightboxRef} />

      {/* Persistent site grid: survives route changes; only page content swaps */}
      <VideoClickContext.Provider value={handleVideoClick}>
        <main className="fullSite-Wrapper">
          <SiteHeader>
            <MenuButton onOpen={handleMenuOpen} />
          </SiteHeader>
          {children}
          <SideNavigation />
          <OverlayGrid />
          <SVGFilters />
        </main>
      </VideoClickContext.Provider>
    </WelcomeContext.Provider>
  );
}

export default SiteChrome;
