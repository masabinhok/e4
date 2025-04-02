'use client'
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/e4.svg";

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
}];

export default function Navigation() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 w-full lg:w-auto bg-gray-900 lg:bg-transparent p-4 lg:p-0 shadow-lg lg:shadow-none z-50 border-b border-gray-800">
      <div className="flex justify-between items-center lg:flex-col lg:gap-5 max-lg:py-0 p-5">
        <Link href={"/"} className="flex items-center group">
          <Image src={logo} height={40} width={40} alt="logo" className="size-24 max-lg:size-16 transition-transform group-hover:scale-105"></Image>
          <h1 className="text-2xl font-bold hidden lg:block ml-2">e4.<span className="text-blue-400">learnchess</span></h1>
        </Link>
        <button
          className="lg:hidden text-2xl text-gray-300 hover:text-white transition-colors"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          ☰
        </button>
      </div>
      <div
        className={`flex flex-col gap-2 text-xl font-medium p-5 min-lg:ml-10 min-lg:mt-36 border-r border-gray-800 lg:w-[200px] lg:block transition-all duration-300 ease-in-out ${isSidebarOpen ? "block" : "hidden"}`}
      >
        {sidebarContent.map((item, index) => (
          <Link
            key={index}
            href={item.url}
            onClick={() => setSidebarOpen(false)}
            className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
          >
            <h1 className="my-3">{item.title}</h1>
          </Link>
        ))}
      </div>
    </div>
  );
} 