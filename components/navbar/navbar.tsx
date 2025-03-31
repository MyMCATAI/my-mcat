"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaLinkedin, FaInstagram } from 'react-icons/fa';

import { useUI } from '@/store/selectors';
import { useAudio } from '@/store/selectors';
import { useUserInfo } from "@/hooks/useUserInfo";

import { SubscriptionManagementButton } from "@/components/subscription-management-button";
import { ProfileButton } from '@/components/navbar/ProfileButton';
import { MailButton } from '@/components/navbar/MailButton';
import MusicPlayer from "@/components/navbar/musicplayer";

/* --- Types ---- */
type Song = {
  title: string;
  url: string;
};

interface NavbarProps {
  subscription?: string;
}

const Navbar = ({ subscription = "free" }: NavbarProps) => {
  /* ---- Refs --- */
  const ballerSectionRef = useRef(null);

  /* ---- State ----- */
  const pathname = usePathname();
  const { theme, window } = useUI();
  const { isSubscribed } = useUserInfo();
  const { isDesktop } = window;

  // Hiding navbar on test questions page
  if (pathname?.includes('/test/testquestions')) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between bg-transparent h-fit relative z-[40]">
      {isDesktop ? (
        // Desktop layout - matching main branch styling
        <div className="flex items-center justify-between w-full pl-16">
          {/* Left section with logo and music player - aligned with hamburger */}
          <div className="flex items-center space-x-4">
            <Link href="/home" className="flex items-center">
              <div className="flex flex-col justify-center h-16">
                <span className="text-xl text-white font-krungthep">mymcat.ai</span>
              </div>
            </Link>
            <div className="w-48">
              <MusicPlayer theme={theme} />
            </div>
          </div>
          
          {/* Right section with buttons and baller text - aligned with the section below */}
          <div className="flex items-center">
            <div className="flex flex-row items-center gap-2 sm:gap-4 md:gap-6 mr-2 sm:mr-4 md:mr-6">
              <MailButton />
              <div className="flex items-center relative z-[10] pr-4">
                <ProfileButton />
              </div> 
            </div>
            <span
              ref={ballerSectionRef}
              className="hidden lg:flex items-center justify-center w-full gradientbg py-3"
              style={{
                clipPath: "polygon(100% 0%, 100% 50%, 100% 100%, 18% 100%, 0 0)",
                opacity: 1,
                minWidth: "240px",
                width: "100%",
                marginRight: "-1px"
              }}
            >
              <div className="flex items-center ml-[30px]">
                <div className="flex flex-col justify-center">
                  <p className="text-xs whitespace-nowrap" style={{ color: 'var(--theme-text-color)' }}>
                    designed by <br />a certified baller
                  </p>
                </div>
                <div className="ml-4">
                  <Link href="https://www.instagram.com/an0thermanicmonday/" target="_blank" rel="noopener noreferrer">
                    <FaInstagram 
                      size={30} 
                      className="transition-colors duration-200 hover:fill-[var(--theme-hover-color)]"
                      style={{
                        color: 'var(--theme-text-color)',
                      }}
                    />
                  </Link>
                </div>
              </div>
            </span>
          </div>
        </div>
      ) : (
        // Mobile layout - original layout
        <>
          <div className="flex items-center space-x-2 sm:space-x-4 pl-16">
            <Link href="/home" className="flex items-center">
              <div className="flex flex-col">
                <span className="text-xl text-white font-krungthep mb-1">mymcat.ai</span>
              </div>
            </Link>
            <div className="w-32 sm:w-48">
              <MusicPlayer theme={theme} />
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex flex-row w-full items-center gap-1 sm:gap-2 md:gap-4">
              <MailButton />
              <div className="flex items-center relative z-[10] pr-2 sm:pr-4">
                <ProfileButton />
              </div> 
            </div>
            <span
              ref={ballerSectionRef}
              className="hidden md:flex items-center w-full gradientbg mr-[-1px] py-3"
              style={{
                clipPath: "polygon(100% 0%, 100% 50%, 100% 100%, 18% 100%, 0 0)",
                opacity: 1,
                width: "100%"
              }}
            >
              <p className="ms-12 text-xs whitespace-nowrap" style={{ color: 'var(--theme-text-color)' }}>
                designed by <br />&nbsp;&nbsp;&nbsp;&nbsp;a certified baller
              </p>
              <div className="mx-2">
                <Link href="https://www.instagram.com/an0thermanicmonday/" target="_blank" rel="noopener noreferrer">
                  <FaInstagram 
                    size={30} 
                    className="transition-colors duration-200 hover:fill-[var(--theme-hover-color)]"
                    style={{
                      color: 'var(--theme-text-color)',
                    }}
                  />
                </Link>
              </div>
            </span>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
