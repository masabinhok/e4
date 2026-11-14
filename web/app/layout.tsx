import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter, Nunito } from "next/font/google";
import Toaster from "@/components/Toaster";
import { DESCRIPTION, SITE_URL } from "@/lib/site";

// Inter for reading (body, move tables, forms); Nunito for the voice
// (headings, buttons, the coach).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-nunito",
});

// Icons come from app/icon.svg and app/apple-icon.png (Next's file conventions).
// app/opengraph-image.png supplies the share image for every page.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "e4.learnchess: learn chess openings by playing them",
    template: "%s · e4.learnchess",
  },
  description: DESCRIPTION,
  manifest: "/site.webmanifest",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "e4.learnchess",
    url: "/",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#1d1916" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${nunito.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
