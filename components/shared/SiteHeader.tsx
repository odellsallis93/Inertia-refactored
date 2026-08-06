"use client";

import { forwardRef } from "react";
import { siteConfig } from "@/config/site";
import { FacebookIcon, InstagramIcon } from "@/components/icons/SocialIcons";

interface SiteHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(
  function SiteHeader({ className, children }, ref) {
    return (
      <header ref={ref} className={className || "landingHeader siteHeader"}>
        {children}
        <div className="socialIcons-Wrapper">
          <div className="socialGrid">
            <span className="fbIcon-Wrapper">
              <a
                className="fbLink"
                href={siteConfig.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
            </span>
            <span className="igIcon-Wrapper">
              <a
                className="igLink"
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            </span>
          </div>
        </div>
      </header>
    );
  }
);

export default SiteHeader;
