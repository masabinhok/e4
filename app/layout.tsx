'use client'
import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import Image from "next/image";
import logo from "../public/e4.svg";
import Link from "next/link";
import { useState } from "react";

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

const sidebarContent = [{
  title: "Lessons",
  url: "/lessons",
}, {
  title: "Record",
  url: "/record",
}, {
  title: "Custom Lines",
  url: "/custom",
},
{
  title: "Credit",
  url: "/credit",
},]

const metadata: Metadata = {
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
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins antialiased bg-gray-900 text-gray-100`}>
        <div className="fixed top-0 left-0 w-full sm:w-auto bg-gray-900 sm:bg-transparent p-4 sm:p-0 shadow-lg sm:shadow-none z-50 border-b border-gray-800">
          <div className="flex justify-between items-center sm:flex-col sm:gap-5 max-sm:py-0 p-5">
            <Link href={"/"} className="flex items-center group">
              <Image src={logo} height={40} width={40} alt="logo" className="size-24 max-sm:size-16 transition-transform group-hover:scale-105"></Image>
              <h1 className="text-2xl font-bold hidden sm:block ml-2">e4.<span className="text-blue-400">learnchess</span></h1>
            </Link>
            <button
              className="sm:hidden text-2xl text-gray-300 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              ☰
            </button>
          </div>
          <div
            className={`flex flex-col gap-2 text-xl font-medium p-5 min-lg:ml-10 min-lg:mt-36 border-r border-gray-800 sm:w-[200px] sm:block transition-all duration-300 ease-in-out ${isSidebarOpen ? "block" : "hidden"
              }`}
          >
            {
              sidebarContent.map((item, index) => {
                return (
                  <Link
                    key={index}
                    href={item.url}
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                  >
                    <h1 className="my-3">{item.title}</h1>
                  </Link>
                )
              })
            }
          </div>
        </div>

        <div className="mt-[100px] sm:mt-0 sm:ml-[200px] p-4">
          {children}
        </div>
      </body>
    </html>
  );
}