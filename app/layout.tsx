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
    <html lang="en">
      <body className="fullPage">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
