export interface ArtistSocials {
  facebook?: string;
  instagram?: string;
  spotify?: string;
  youtube?: string;
  soundcloud?: string;
}

export interface Artist {
  slug: string;
  name: string;
  genre: string;
  image: string;
  video: string;
  bio: string;
  socials: ArtistSocials;
}

export const artists: Artist[] = [
  {
    slug: "10k-caash",
    name: "10k.Caash",
    genre: "Hip-Hop",
    image: "/assets/images/10k-caash-roster.png",
    video: "/assets/videos/10k-Caash-Turnup-Snip.mp4",
    bio: "10k.Caash is a hip-hop artist known for his innovative sound and energetic performances.",
    socials: {
      facebook: "https://www.facebook.com/10K.CaashMusic/",
      instagram: "https://www.instagram.com/10k.caash",
      spotify: "https://open.spotify.com/artist/4uyIwcaJgV9ShErevnVlNp",
      youtube: "https://www.youtube.com/channel/UCJeQlzRb7FOlAUEVBjRAM7Q",
    },
  },
  {
    slug: "7ru7h",
    name: "7ru7h",
    genre: "Hip-Hop",
    image: "/assets/images/7ru7h-roster.jpg",
    video: "/assets/videos/7ru7h-Snip.mp4",
    bio: "7ru7h brings a unique perspective to hip-hop with thought-provoking lyrics and innovative production.",
    socials: {
      instagram: "https://www.instagram.com/7ru7h",
    },
  },
  {
    slug: "will-claye",
    name: "Will Claye",
    genre: "Hip-Hop / R&B",
    image: "/assets/images/will-claye-roster.png",
    video: "/assets/videos/Will-Claye-Snip.mp4",
    bio: "Will Claye combines athletic excellence with musical artistry, creating a unique blend of hip-hop and R&B.",
    socials: {
      instagram: "https://www.instagram.com/willclaye",
    },
  },
  {
    slug: "spaceman-zack",
    name: "Spaceman Zack",
    genre: "Hip-Hop",
    image: "/assets/images/spaceman-zack-roster.jpg",
    video: "/assets/videos/SpaceMan-Zack-Snip.mp4",
    bio: "Spaceman Zack delivers out-of-this-world beats and cosmic lyricism.",
    socials: {
      instagram: "https://www.instagram.com/spacemanzack",
    },
  },
  {
    slug: "cotis",
    name: "Cotis",
    genre: "Hip-Hop",
    image: "/assets/images/cotis-roster.png",
    video: "/assets/videos/COTIS-Up-and-Away-Snip.mp4",
    bio: "Cotis brings fresh energy and authentic storytelling to the hip-hop scene.",
    socials: {
      instagram: "https://www.instagram.com/cotismusic",
    },
  },
  {
    slug: "demon-in-me",
    name: "Demon In Me",
    genre: "Hip-Hop",
    image: "/assets/images/Demon-In-Me-roster.png",
    video: "/assets/videos/Demon-In-Me-Snip.mp4",
    bio: "Demon In Me explores the darker side of hip-hop with intense lyrics and hard-hitting production.",
    socials: {
      instagram: "https://www.instagram.com/demoninme",
    },
  },
];

export const ARTIST_SLUGS = artists.map((a) => a.slug) as readonly string[];

export function getArtistBySlug(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug);
}

export function isValidArtistSlug(slug: string): boolean {
  return ARTIST_SLUGS.includes(slug);
}
