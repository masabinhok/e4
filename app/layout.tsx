import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import Image from "next/image";
import logo from "../public/e4.svg";
import Link from "next/link";

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
      <body className={`${poppins.variable} font-poppins antialiased`}>
        <div className="flex flex-col gap-5 fixed top-10 left-5">
          <Link href={"/"} className="flex items-center">
            <Image src={logo} height={40} width={40} alt="logo" className="size-24"></Image>
            <h1 className="text-2xl font-bold">e4.<span className="text-xs">learnchess</span></h1>
          </Link>
          <div className="flex flex-col gap-2 text-xl font-bold p-5 border-r w-[150px] border-white">
            <Link href={"/lessons"}>
              <h1 className="">Lessons</h1>
            </Link>
            <Link href={"/credit"}>
              <h1 className="">Credit</h1>
            </Link>
          </div>
        </div>

        {children}
      </body>
    </html>
  );
}
