import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Schibsted_Grotesk, Spectral } from "next/font/google";
import Toaster from "@/components/Toaster";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
});

// Book serif for headings and move notes, in the spirit of printed opening books.
const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
});

export const metadata: Metadata = {
  title: "e4.learnchess",
  description:
    "Learn chess openings by playing them: step through a line, drill it from memory, and quiz yourself.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = { themeColor: "#121a24" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${schibsted.variable} ${spectral.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
