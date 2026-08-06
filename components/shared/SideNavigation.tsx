"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { InertiaLogo } from "@/components/icons/InertiaLogo";
import { siteConfig } from "@/config/site";

interface SideNavigationProps {
  className?: string;
}

export const SideNavigation = forwardRef<HTMLDivElement, SideNavigationProps>(
  function SideNavigation({ className }, ref) {
    const pathname = usePathname();
    
    const isActive = (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname.startsWith(href);
    };

    return (
      <div ref={ref} className={className || "gridleft"}>
        <span className="transCont__gridleft" />

        <div className="logoSideways">
          <InertiaLogo variant="full" />
        </div>

        <nav className="sideNav__Wrapper">
          <Link className="menu__link navTwist1" href="/">
            <li className={`navMenu-text menu__link--1 ${isActive("/") ? "active" : ""}`}>
              Home
            </li>
          </Link>
          <Link className="menu__link navTwist2" href="/about">
            <li className={`navMenu-text menu__link--3 ${isActive("/about") ? "active" : ""}`}>
              About
            </li>
          </Link>
          <a
            className="menu__link navTwist3"
            href={`mailto:${siteConfig.contact.email}`}
          >
            <li className="navMenu-text menu__link--2">Contact</li>
          </a>
        </nav>
      </div>
    );
  }
);

export default SideNavigation;
