"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-black p-4 fixed top-0 left-0 w-full z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href={"/"}>
          <div className="flex items-center">
            <div className="relative">
              {/* <Image src={logo} alt="Logo" width={48} height={48} /> */}
            </div>
            <div className="flex flex-col">
              <span className="text-white text-3xl">MyMCAT.ai</span>
            </div>
          </div>
        </Link>

        <div className="block lg:hidden">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none"
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

        {/* <div
          className={`lg:flex ${
            isOpen ? "hidden" : "hidden"
          } lg:block justify-center lg:justify-center py-2 px-5 rounded-[60px]`}
          style={{ backgroundColor: "#000000" }}
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.name);
              }}
              className={`px-4 py-1 ${
                activeSection === link.name
                  ? "text-black bg-white lg:rounded-[60px]"
                  : "text-white"
              }`}
            >
              {link.name}
            </a>
          ))}
        </div> */}
        <div className="flex items-center hidden lg:block">
          <Link href={"/sign-in"}>
            <button className="bg-white text-black py-2 text-lg md:text-[16px] px-4 rounded-[8px]">
              Login
            </button>
          </Link>
        </div>
      </div>

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#0E2247] shadow-lg z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:hidden`}
        style={{ borderRight: "1px solid #2D4778" }}
      >
        <svg
          onClick={toggleMenu}
          className="ml-auto mr-4 mt-4 mb-4 cursor-pointer"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="2"
            y1="2"
            x2="18"
            y2="18"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <line
            x1="18"
            y1="2"
            x2="2"
            y2="18"
            stroke="#ffffff"
            strokeWidth="2"
          />
        </svg>

        {/* <div>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => {
                scrollToSection(link.name);
                toggleMenu();
              }}
              className={`block px-4 py-4 border-b p-2  ${
                activeSection === link.name
                  ? "bg-[#ffffff] text-[#0E2247]"
                  : "text-[#ffffff]"
              }`}
              style={{ borderBottom: "2px solid #ffffff" }}
            >
              {link.name}
            </a>
          ))}
        </div> */}
        <div className="p-4">
          <Link href={"/sign-in"}>
            <button className="bg-white text-black py-2 text-lg w-full rounded-[8px]">
              Login
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};