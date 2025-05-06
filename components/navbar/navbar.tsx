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

/* --- Constants ----- */
const SCROLL_THRESHOLD = 2;

/* --- Types ---- */
type Song = {
  title: string;
  url: string;
};

interface NavbarProps {
  subscription?: string;
  onVisibilityChange?: (isVisible: boolean) => void;
}

const Navbar = ({ subscription = "free", onVisibilityChange }: NavbarProps) => {
  /* ---- Refs --- */
  const ballerSectionRef = useRef(null);
  const prevScrollPos = useRef(0);
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  /* ---- State ----- */
  const pathname = usePathname();
  const { theme, window: uiWindow } = useUI();
  const { isSubscribed } = useUserInfo();
  const { isDesktop } = uiWindow;
  const [visible, setVisible] = useState(true);

  /* --- Effects --- */
  useEffect(() => {
    // Only apply scroll behavior on home page
    if (!pathname?.includes('/home')) {
      setVisible(true);
      return;
    }

    // Find the scroll container (the div with overflow-auto)
    scrollContainerRef.current = document.querySelector('.overflow-auto');
    if (!scrollContainerRef.current) {
      console.warn('Could not find scroll container');
      return;
    }

    const handleScroll = (e: Event) => {
      const container = e.target as HTMLElement;
      const currentScrollPos = container.scrollTop;
      
      // Simple logic: if scrolling down, hide; if scrolling up, show
      if (currentScrollPos > prevScrollPos.current + SCROLL_THRESHOLD) {
        setVisible(false);
      } else if (currentScrollPos < prevScrollPos.current - SCROLL_THRESHOLD) {
        setVisible(true);
      }

      // Always show at the very top
      if (currentScrollPos <= 0) {
        setVisible(true);
      }

      prevScrollPos.current = currentScrollPos;
    };

    // Initialize scroll position
    prevScrollPos.current = scrollContainerRef.current.scrollTop;
    
    // Add scroll listener to the container
    scrollContainerRef.current.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [pathname]);

  // Notify parent component of visibility changes
  useEffect(() => {
    onVisibilityChange?.(visible);
  }, [visible, onVisibilityChange]);

  // Hiding navbar on test questions page
  if (pathname?.includes('/test/testquestions')) {
    return null;
  }

  // Different navbar styles based on route
  const isHomePage = pathname?.includes('/home');
  
  return (
    <nav 
      className={`
        flex items-center justify-between h-16 z-10
        ${isHomePage ? 'fixed top-0 left-0 right-0 transition-transform duration-200 ease-in-out' : 'relative'}
        ${isHomePage && !visible ? '-translate-y-full' : 'translate-y-0'}
        transparent
      `}
    >
      {isDesktop ? (
        // Desktop layout - matching main branch styling
        <div className="flex items-center justify-between w-full pl-16">
          {/* Left section with logo and music player - aligned with hamburger */}
          <div className="flex items-center space-x-4">
            <Link href="/home" className="flex items-center">
              <div className="flex flex-col justify-center h-16">
                <span className={`text-xl font-krungthep ${theme === 'cleanWhite' ? 'text-black' : 'text-white'}`}>
                  <span className="font-bold">STUDY</span><span className="text-gray-400">VERSE</span>
                </span>
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
                  <p className="text-xs whitespace-nowrap" style={{ 
                    color: theme === 'cleanWhite' ? 'black' : 'var(--theme-text-color)' 
                  }}>
                    designed by <br />a certified baller
                  </p>
                </div>
                <div className="ml-4">
                  <Link href="https://www.instagram.com/an0thermanicmonday/" target="_blank" rel="noopener noreferrer">
                    <FaInstagram 
                      size={30} 
                      className="transition-colors duration-200 hover:fill-[var(--theme-hover-color)]"
                      style={{
                        color: theme === 'cleanWhite' ? 'black' : 'var(--theme-text-color)',
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
                <span className={`text-xl font-krungthep mb-1 ${theme === 'cleanWhite' ? 'text-black' : 'text-white'}`}>
                  <span className="font-bold">STUDY</span><span className="text-gray-400">VERSE</span>
                </span>
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
              <p className="ms-12 text-xs whitespace-nowrap" style={{ 
                color: theme === 'cleanWhite' ? '#2ab2b0' : 'var(--theme-text-color)' 
              }}>
                designed by <br />&nbsp;&nbsp;&nbsp;&nbsp;a certified baller
              </p>
              <div className="mx-2">
                <Link href="https://www.instagram.com/an0thermanicmonday/" target="_blank" rel="noopener noreferrer">
                  <FaInstagram 
                    size={30} 
                    className="transition-colors duration-200 hover:fill-[var(--theme-hover-color)]"
                    style={{
                      color: theme === 'cleanWhite' ? '#2ab2b0' : 'var(--theme-text-color)',
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
