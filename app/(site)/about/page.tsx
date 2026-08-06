import { InertiaLogo } from "@/components/icons/InertiaLogo";

// The persistent grid (<main class="fullSite-Wrapper">), header, side nav,
// and overlay grid live in SiteChrome. Pages render only their center content.
export default function AboutPage() {
  return (
    <div className="about-headers bgHover">
      <span className="transCont__about" />

      <div className="idText_wrap">
        <h3>
          <span className="profileCat allText">About Us</span>
        </h3>
        <h2>
          <span className="artistName allText">Artist MGMT</span>
        </h2>
      </div>

      <div className="profileSection__wrap">
        <div
          className="bio__wrap aboutWrap"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gridRow: "1 / -1",
            textAlign: "center",
          }}
        >
          <p>
            Inertia Artist Management is dedicated to representing innovative artists
            in the music industry. We focus on developing talent and creating
            opportunities for our roster of exceptional artists.
          </p>
        </div>
      </div>

      <div className="logoMobile__Sideways">
        <InertiaLogo variant="mobile" />
      </div>
    </div>
  );
}
