'use client'
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/e4.svg";
import Button from "./Button";

const sidebarContent = [{
  title: "Lessons",
  url: "/lessons",
}, {
  title: "Record Lines",
  url: "/record",
}, {
  title: "Custom Lines",
  url: "/custom",
},
{
  title: "Authenticate",
  url: "/auth/signup",
},
{
  title: "Credit",
  url: "/credit",
}];


export default function Navigation() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 w-full lg:w-auto bg-gray-900 lg:bg-transparent p-4 lg:p-0 shadow-lg lg:shadow-none z-50 ">
        <div className="flex w-full justify-between items-center gap-5  p-5">
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
          <Link href="/auth/signup" className="hidden lg:flex gap-5 items-center">
            <Button text="Sign Up" />
          </Link>
        </div>
      </div>
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
    </>
  );
}


const Sidebar = ({ isSidebarOpen, setSidebarOpen }: {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}) => {
  return (
    <div
      className={`fixed left-0 max-lg-right-0 top-28 flex flex-col gap-2 text-xl font-medium p-5 min-lg:ml-10 min-lg:mt-36 border-r border-gray-800 lg:w-[200px] lg:block transition-all duration-300 ease-in-out mt-10 max-lg:bg-white z-50 w-full ${isSidebarOpen ? "block" : "hidden"}`}
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
  )
}