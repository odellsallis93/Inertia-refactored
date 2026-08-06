"use client";

import { artists } from "@/data/artists";
import { RosterLink } from "./RosterLink";
import { InertiaLogo } from "@/components/icons/InertiaLogo";

interface RosterSectionProps {
  className?: string;
}

export function RosterSection({ className }: RosterSectionProps) {
    return (
      <div className={`about-headers bgHover${className ? ` ${className}` : ""}`}>
        <span className="transCont__about" />

        {/* Roster Header */}
        <div className="idText_wrap">
          <h3>
            <span className="profileCat">
              Roster
              <span className="mainFilterWrapper">
                <span id="mgmtSpan" className="rosterWrapper">
                  Mgmt
                </span>
                /
                <span id="labelSpan" className="labelWrapper">
                  Label
                </span>
              </span>
            </span>
          </h3>
          <h2>
            <span className="artistName">
              Talent<small>MGMT</small>
            </span>
          </h2>
        </div>

        {/* Artist Navigation */}
        <div className="artistNav__wrap">
          {artists.map((artist) => (
            <RosterLink key={artist.slug} artist={artist} />
          ))}
        </div>

        {/* Mobile Logo */}
        <div className="logoMobile__Sideways">
          <InertiaLogo variant="mobile" />
        </div>
      </div>
    );
}

export default RosterSection;
