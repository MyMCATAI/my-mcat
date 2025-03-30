"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-black p-4 fixed top-0 left-0 w-full z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
        <Link href={"/"}>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 md:w-12 md:h-12">
              <Image 
                src="/landingpage/mymcatstudyverse.png"
                alt="MyMCAT Study Universe Logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xl md:text-3xl font-krungthep">mymcat.ai</span>
            </div>
          </div>
        </Link>

        <div className="block lg:hidden">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className={!isOpen ? "block" : "hidden"}
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2 5h20v2H2V5zm0 6h20v2H2v-2zm0 6h20v2H2v-2z"
              />
              <path
                className={isOpen ? "block" : "hidden"}
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"
              />
            </svg>
          </button>
        </div>
        <div className="hidden lg:flex items-center space-x-4">
          <Link href={"/blog"}>
            <button className="border py-2 text-[16px] px-6 rounded-lg hover:bg-blue-500/10 hover:scale-105 hover:shadow-lg transition-all duration-300">
              Blog
            </button>
          </Link>
          <Link href={"/sign-in"}>
            <button 
              className="bg-white text-black py-2 text-[16px] px-6 rounded-lg hover:bg-white/90 hover:scale-105 hover:shadow-lg transition-all duration-300"
              onClick={() => {
                console.log('[LOGIN BUTTON] Login button clicked explicitly by user');
                localStorage.setItem('explicit_login_click', 'true');
              }}
            >
              Login
            </button>
          </Link>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMenu}
      />

      {/* Mobile menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-[#0E2247] shadow-lg z-50 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <span className="text-white text-lg font-medium">Menu</span>
          <button
            onClick={toggleMenu}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <Link href={"/blog"}>
            <button className="w-full border border-white text-white py-3 text-lg rounded-lg hover:bg-white/10 transition-colors duration-300">
              Blog
            </button>
          </Link>
          <Link href={"/sign-in"} >
            <button 
              className="w-full bg-white text-black py-3 text-lg rounded-lg hover:bg-white/90 transition-colors duration-300 mt-4"
              onClick={() => {
                console.log('[LOGIN BUTTON] Login button clicked explicitly by user');
                localStorage.setItem('explicit_login_click', 'true');
              }}
            >
              Login
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar; 