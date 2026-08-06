export interface FeaturedVideo {
  id: string;
  title: string;
  thumbnail: string;
  embedUrl: string;
}

export const featuredVideos: FeaturedVideo[] = [
  {
    id: "2UftGSD6kXs",
    title: "Uzi x James Harden x 7ru7h",
    thumbnail: "/assets/images/uzi-james-harden-7ru7h-thumb.jpg",
    embedUrl: "https://www.youtube.com/embed/2UftGSD6kXs",
  },
  {
    id: "x6Y_NuzRhyw",
    title: "Up Up and Away",
    thumbnail: "/assets/images/up-up-away-thumb.jpg",
    embedUrl: "https://www.youtube.com/embed/x6Y_NuzRhyw",
  },
  {
    id: "dBG_RDOXISg",
    title: "10k.Caash",
    thumbnail: "/assets/images/10k-video-thumb.jpg",
    embedUrl: "https://www.youtube.com/embed/dBG_RDOXISg",
  },
  {
    id: "3iXcEgvwBdg",
    title: "Spaceman Zack",
    thumbnail: "/assets/images/spaceman-zack-video-thumb.jpg",
    embedUrl: "https://www.youtube.com/embed/3iXcEgvwBdg",
  },
  {
    id: "tQYfrHsvjrw",
    title: "Will Claye - Lil Vick",
    thumbnail: "/assets/images/will-claye-lil-vick-thumb.jpg",
    embedUrl: "https://www.youtube.com/embed/tQYfrHsvjrw",
  },
];

export function getVideoById(id: string): FeaturedVideo | undefined {
  return featuredVideos.find((v) => v.id === id);
}
