"use client";

import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logo from "../public/logo.png";

const font = Montserrat({ weight: "600", subsets: ["latin"] });

export const LandingNavbar = () => {
  const { isSignedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo on the left */}
        <div className="flex items-center">
          <div className="h-16 w-16">
            <Image src={logo} alt="Logo" className="w-full mr-4" />
          </div>
          <span className="text-black text-2xl font-semibold">myMCAT.ai</span>
        </div>

        {/* Hamburger Menu Button - shown on small screens */}
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

        <span
          className={` lg:flex ${
            isOpen ? "block" : "hidden"
          } lg:block justify-center lg:justify-center py-2 px-5 rounded-[60px]`}
          style={{ backgroundColor: "#efeff0" }}
        >
          <a
            href="#"
            className="text-[#007AFF] px-4 py-1 bg-white rounded-[60px]"
          >
            Home
          </a>
          <a href="#" className="text-black px-4 py-1  ">
            About
          </a>
          <a href="#" className="text-black px-4 py-1  ">
            Services
          </a>
          <a href="#" className="text-black px-4 py-1  ">
            Contact
          </a>
        </span>

        {/* Buttons on the right */}
        <div className="flex items-center">
          <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
            <button className="bg-[#2D4778] text-white py-2 text-lg md:text-[16px] px-4 rounded-[8px]">
              Join the waitlist
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
