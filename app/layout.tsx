import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import Navigation from "@/components/Navigation";
import { SoundProvider } from "@/contexts/SoundContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: [
    "100", // Thin
    "200", // Extra Light
    "300", // Light
    "400", // Regular
    "500", // Medium
    "600", // Semi-Bold
    "700", // Bold
    "800", // Extra Bold
    "900", // Black
  ],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "e4.learnchess",
  description: "The Anti-Video Chess Coach",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon.png',
    },
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins antialiased bg-gray-900 text-gray-100`}>
        <SoundProvider>
          <Navigation />
          <div className="mt-[100px] lg:mt-0 lg:ml-[200px] p-4">
            {children}
          </div>
        </SoundProvider>
      </body>
    </html>
  );
}