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
    <nav className="flex items-center justify-between bg-transparent h-16 relative z-[40]">
      {isDesktop ? (
        // Desktop layout - matching main branch styling
        <div className="flex items-center justify-between w-full px-[2rem] lg:px-[2.7rem] xl:px-[7rem]">
          {/* Left section with logo and music player - aligned with hamburger */}
          <div className="flex items-center space-x-4">
            <Link href="/home" className="flex items-center ml-8">
              <div className="flex flex-col justify-center h-16">
                <span className="text-xl text-white font-krungthep">mymcat.ai</span>
              </div>
            </Link>
            <div className="w-48 ml-2">
              <MusicPlayer theme={theme} />
            </div>
          </div>
          
          {/* Right section with buttons and baller text - aligned with the section below */}
          <div className="flex items-center h-full">
            <div className="flex flex-row items-center gap-6 mr-6">
              <MailButton />
              <div className="flex items-center h-full relative z-[10]">
                <ProfileButton />
              </div> 
            </div>
            <span
              ref={ballerSectionRef}
              className="flex items-center justify-center w-full h-full gradientbg"
              style={{
                clipPath: "polygon(100% 0%, 100% 51%, 100% 73%, 18% 72%, 11% 48%, 0 0)",
                opacity: 1,
                minWidth: "240px", // Ensure enough width for the text
                height: "64px", // Match navbar height
                marginRight: "0" // Align with content area
              }}
            >
              <div className="flex items-center h-full" style={{ marginLeft: "30px" }}>
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
          <div className="flex items-center space-x-4 px-4">
            <Link href="/home" className="flex items-center">
              <div className="flex flex-col">
                <span className="text-xl text-white font-krungthep mb-1">mymcat.ai</span>
              </div>
            </Link>
            <div className="w-48">
              <MusicPlayer theme={theme} />
            </div>
          </div>
          <div className="flex items-center h-full">
            <div className="flex flex-row w-full items-center gap-4">
              {/* <SubscriptionManagementButton isGoldMember={isSubscribed} />*/}
              <MailButton />
              <div className="flex items-center w-full h-full relative z-[10]">
                <ProfileButton />
              </div> 
            </div>
            <span
              ref={ballerSectionRef}
              className="flex items-start w-full h-full gradientbg mr-[-1px]"
              style={{
                clipPath: "polygon(100% 0%, 100% 51%, 100% 73%, 18% 72%, 11% 48%, 0 0)",
                opacity: 1,
              }}
            >
              <p className="ms-12 mt-2 pr-1 text-xs whitespace-nowrap" style={{ color: 'var(--theme-text-color)' }}>
                designed by <br />&nbsp;&nbsp;&nbsp;&nbsp;a certified baller
              </p>
              <div className="mt-2 mx-2">
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
