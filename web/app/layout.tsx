import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import Navigation from "@/components/Navigation";


//init poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: [
    "100", 
    "200", 
    "300", 
    "400", 
    "500", 
    "600", 
    "700", 
    "800", 
    "900", 
  ],
  variable: "--font-poppins",
});


//create metadata for app
export const metadata: Metadata = {
  title: "e4.learnchess",
  description: "The Anti-Video Chess Openings Coach",
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
        <Navigation />
        <div className="mt-[100px] lg:mt-0 lg:ml-[320px] p-4">
          {children}
        </div>
      </body>
    </html>
  );
}