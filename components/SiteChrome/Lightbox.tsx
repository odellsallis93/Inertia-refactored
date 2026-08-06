"use client";

import { forwardRef, useRef, useCallback, useImperativeHandle, useEffect } from "react";
import gsap from "gsap";

export interface LightboxHandle {
  open: (videoUrl: string) => void;
  close: () => void;
}

interface LightboxProps {
  className?: string;
}

export const Lightbox = forwardRef<LightboxHandle, LightboxProps>(
  function Lightbox(_, ref) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const initializedRef = useRef(false);

    useEffect(() => {
      if (!overlayRef.current || initializedRef.current) return;
      initializedRef.current = true;
      gsap.set(overlayRef.current, { autoAlpha: 0 });
      gsap.set(".lightboxWrapper", { autoAlpha: 0 });
    }, []);

    const open = useCallback((videoUrl: string) => {
      if (!overlayRef.current || !iframeRef.current) return;

      iframeRef.current.src = videoUrl;

      gsap.timeline()
        .set(".tilt__Grid", { zIndex: 999999 })
        .to(overlayRef.current, { autoAlpha: 1, duration: 0.3 })
        .to(".youtube, .lightboxWrapper", { autoAlpha: 1, duration: 0.3 }, ">");
    }, []);

    const close = useCallback(() => {
      if (!overlayRef.current || !iframeRef.current) return;

      gsap.timeline()
        .to(overlayRef.current, { autoAlpha: 0, duration: 0.3 })
        .to(".youtube", { autoAlpha: 0, duration: 0.3 })
        .set(".tilt__Grid", { zIndex: 1 }, ">")
        .eventCallback("onComplete", () => {
          if (iframeRef.current) iframeRef.current.src = "";
        });
    }, []);

    useImperativeHandle(ref, () => ({ open, close }), [open, close]);

    const handleCloseClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      close();
    }, [close]);

    return (
      <div ref={overlayRef} id="overlay" className="lightbox-container">
        <div className="lightboxWrapper">
          <div className="close lightbox-close" onClick={handleCloseClick}>
            <p>Close</p>
          </div>
          <iframe
            ref={iframeRef}
            id="moviePlayer"
            className="youtube"
            frameBorder="0"
            allowFullScreen
            title="Video Player"
          />
        </div>
      </div>
    );
  }
);

export default Lightbox;
