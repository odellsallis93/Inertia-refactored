import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Inertia Artist Management",
  description: "Inertia Artist Management - Music and talent management company",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="fullPage">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var q="(orientation: landscape) and (max-height: 500px) and (pointer: coarse)";var mq=window.matchMedia(q);function side(){var type=screen.orientation&&screen.orientation.type;if(type==="landscape-primary")return"left";if(type==="landscape-secondary")return"right";var angle=window.orientation||0;return angle===-90||angle===270?"right":"left"}function apply(){if(!mq.matches){document.documentElement.removeAttribute("data-portrait-lock");return}document.documentElement.setAttribute("data-portrait-lock",side())}apply();if(mq.addEventListener)mq.addEventListener("change",apply);else if(mq.addListener)mq.addListener(apply);window.addEventListener("orientationchange",apply);if(screen.orientation&&screen.orientation.addEventListener)screen.orientation.addEventListener("change",apply)})();`,
          }}
        />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
