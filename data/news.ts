export interface NewsItem {
  id: string;
  title: string;
  image: string;
  url?: string;
}

export const newsItems: NewsItem[] = [
  {
    id: "inertia-launch",
    title: "Inertia Launch",
    image: "/assets/images/Inertia-launch.jpg",
  },
  {
    id: "nytimes-10k",
    title: "NY Times - 10k.Caash",
    image: "/assets/images/nytimes-10k-news.jpg",
  },
  {
    id: "will-claye-music-vid",
    title: "Will Claye Music Video",
    image: "/assets/images/will-claye-music-vid-news.jpg",
  },
  {
    id: "cameron-pollstar",
    title: "Cameron Pollstar",
    image: "/assets/images/inertia-cameron-pollstar-news.jpg",
  },
  {
    id: "7ru7h-school",
    title: "7ru7h School",
    image: "/assets/images/7ru7h-school-news.jpg",
  },
  {
    id: "cotis-hotnewhiphop",
    title: "Cotis - HotNewHipHop",
    image: "/assets/images/cotis-hotnewhiphop.jpg",
  },
];
