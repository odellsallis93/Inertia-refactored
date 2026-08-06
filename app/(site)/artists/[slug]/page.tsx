import { notFound } from "next/navigation";
import { artists, getArtistBySlug, isValidArtistSlug } from "@/data/artists";
import { InertiaLogo } from "@/components/icons/InertiaLogo";
import { FacebookIcon, InstagramIcon, SpotifyIcon, YouTubeIcon } from "@/components/icons/SocialIcons";

export function generateStaticParams() {
  return artists.map((artist) => ({ slug: artist.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);

  if (!artist) {
    return { title: "Artist Not Found" };
  }

  return {
    title: `${artist.name} - Inertia Artist Management`,
    description: artist.bio,
  };
}

// The persistent grid (<main class="fullSite-Wrapper">), header, side nav,
// and overlay grid live in SiteChrome. Pages render only their center content.
export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isValidArtistSlug(slug)) {
    notFound();
  }

  const artist = getArtistBySlug(slug);
  if (!artist) {
    notFound();
  }

  return (
    <div className="about-headers bgHover">
      <span className="transCont__about" />

      <div className="idText_wrap">
        <h3>
          <span className="profileCat allText">Music: {artist.genre}</span>
        </h3>
        <h2>
          <span className="artistName allText">{artist.name}</span>
        </h2>
      </div>

      <div className="profileSection__wrap">
        <div className="profilePic__wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="profilePic--caash"
            src={artist.image}
            alt={artist.name}
          />
        </div>

        <div className="profileSocials__wrap">
          {artist.socials.facebook && (
            <div className="fbProfile__wrap artistSocials__wrap">
              <span className="socialBorder" />
              <a
                className="artistSocial"
                href={artist.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <FacebookIcon className="fbIcon__profile profileIcons" />
              </a>
            </div>
          )}
          {artist.socials.instagram && (
            <div className="igProfile__wrap artistSocials__wrap">
              <span className="socialBorder" />
              <a
                className="artistSocial"
                href={artist.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <InstagramIcon className="igIcon__profile profileIcons" />
              </a>
            </div>
          )}
          {artist.socials.spotify && (
            <div className="spotProfile__wrap artistSocials__wrap">
              <span className="socialBorder" />
              <a
                className="artistSocial"
                href={artist.socials.spotify}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Spotify"
              >
                <SpotifyIcon />
              </a>
            </div>
          )}
          {artist.socials.youtube && (
            <div className="soundProfile__wrap artistSocials__wrap">
              <span className="socialBorder" />
              <a
                className="artistSocial"
                href={artist.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <YouTubeIcon />
              </a>
            </div>
          )}
        </div>

        <div className="bio__wrap">
          <p>{artist.bio}</p>
        </div>
      </div>

      <div className="logoMobile__Sideways">
        <InertiaLogo variant="mobile" />
      </div>
    </div>
  );
}
