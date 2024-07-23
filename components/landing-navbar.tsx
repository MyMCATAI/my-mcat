"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import logo from "../public/logo.png";

export const LandingNavbar = () => {
  const { isSignedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Methodology", href: "#methodology" },
    { name: "Mission", href: "#mission" },
    { name: "Keypoints", href: "#keypoints" },
  ];

  const handleScroll = () => {
    const sections = navLinks.map(link => document.querySelector(link.href) as HTMLElement);
    const scrollPosition = window.scrollY + 100; // Adjust based on your offset needs

    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i] && scrollPosition >= sections[i].offsetTop) {
        setActiveSection(navLinks[i].name);
        break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className="bg-white p-4 fixed top-0 left-0 w-full z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-16 w-16">
            <Image src={logo} alt="Logo" className="w-full mr-4" />
          </div>
          <span className="text-black text-2xl font-semibold">myMCAT.ai</span>
        </div>

        <div className="block lg:hidden">
          <button
            onClick={toggleMenu}
            className="text-black focus:outline-none"
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

        <span
          className={`lg:flex ${
            isOpen ? "hidden" : "hidden"
          } lg:block justify-center lg:justify-center py-2 px-5 rounded-[60px]`}
          style={{ backgroundColor: "#efeff0" }}
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`px-4 py-1 ${
                activeSection === link.name
                  ? "text-[#007AFF] bg-white lg:rounded-[60px] lg:text-[#007AFF] lg:bg-white"
                  : "text-black"
              }`}
            >
              {link.name}
            </a>
          ))}
        </span>

        <div className="flex items-center hidden lg:block">
          <Link href={"/intro"}>
            <button className="bg-[#2D4778] text-white py-2 text-lg md:text-[16px] px-4 rounded-[8px]">
              Join the waitlist
            </button>
          </Link>
        </div>
      </div>

      <div
        className={`fixed top-0  left-0 h-full w-64 bg-[#0E2247] shadow-lg z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:hidden`}
        style={{ borderRight: "1px solid #2D4778" }}
      >
        <svg
          onClick={toggleMenu}
          className="ml-auto mr-4 mt-4 mb-4"
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

        <div>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={toggleMenu}
              className={`block px-4 py-4  border-b p-2  ${
                activeSection === link.name ? "bg-[#ffffff] text-[#0E2247]" : "text-[#ffffff]"
              }`}
              style={{ borderBottom: "2px solid #ffffff" }}
            >
              {link.name}
            </a>
          ))}
          <div className="flex items-center m-2 hidden">
            <Link href={isSignedIn ? "/intro" : "/intro"}>
              <button className="bg-[#2D4778] text-white py-3 my-4 text-lg md:text-[16px] px-4 rounded-[8px]">
                Join the waitlist
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
