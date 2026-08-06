export const siteConfig = {
  name: "Inertia Artist Management",
  description: "Inertia Artist Management - Music and talent management company",
  url: "https://inertiamgmt.com",
  
  socials: {
    facebook: "https://www.facebook.com/inertiamgmt/",
    instagram: "https://www.instagram.com/inertiamgmt",
  },
  
  contact: {
    email: "cameron@inertiamgmt.com",
  },
  
  navigation: {
    main: [
      { label: "Roster", href: "/", dataLetters: "home" },
      { label: "About", href: "/about", dataLetters: "About" },
      { label: "Contact Us", href: "mailto:cameron@inertiamgmt.com", dataLetters: "Contact Us" },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
