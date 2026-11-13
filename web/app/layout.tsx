import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter, Nunito } from "next/font/google";
import Toaster from "@/components/Toaster";

// Inter for reading (body, move tables, forms); Nunito for the voice
// (headings, buttons, the coach).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-nunito",
});

// Icons come from app/icon.svg and app/apple-icon.png (Next's file conventions).
export const metadata: Metadata = {
  title: "e4.learnchess",
  description:
    "Learn chess openings by playing them: annotated lines, drills from memory, and spaced-repetition review.",
  manifest: "/site.webmanifest",
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
