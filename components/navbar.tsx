"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useProModal } from "@/hooks/use-pro-modal";
import { motion } from "framer-motion";
import axios from "axios";
import { FaLinkedin, FaInstagram } from 'react-icons/fa';
import MusicPlayer from "@/components/musicplayer";
import { useTheme } from '@/contexts/ThemeContext';

// Define the Song type
type Song = {
  title: string;
  url: string;
};

// Add the playlists object
const playlists: Record<string, Song[]> = {
  cyberSpace: [
    { title: "CS1", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace2.mp3" },
    { title: "CS2", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace1.mp3" },
    { title: "CS3", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace3.mp3" },
    { title: "CS4", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace4.mp3" },
  ],
  sakuraTrees: [
    { title: "ST1", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees1.mp3" },
    { title: "ST2", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees2.mp3" },
    { title: "ST3", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuratrees3.mp3" },
    { title: "ST4", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuratrees3.mp3" },
  ],
  sunsetCity: [
    { title: "SC1", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity1.mp3" },
    { title: "SC2", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity2.mp3" },
    { title: "SC4", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity4.mp3" },
    { title: "SC3", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity3.mp3" },
  ],
};

export const Navbar = ({ subscription = "free" }: { subscription: string }) => {
  const pathname = usePathname();
  const ballerSectionRef = useRef(null);
  const proModal = useProModal();
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme(); // Use the theme from context

  // Hiding navbar on test questions page
  if (pathname.includes('/test/testquestions')) {
    return null;
  }

  const isPro = subscription !== "free";

  return (
    <> 
      <nav className="flex items-center justify-between bg-transparent shadow-sm h-24 px-4">
        <div className="flex items-center space-x-4">
          <Link href="/home" className="flex items-center">
            <div className="flex flex-col">
              <span className="text-xl text-white">MyMCAT.ai</span>
            </div>
          </Link>
          <div className="w-48">
            <MusicPlayer theme={theme} />
          </div>
        </div>
        <div className="flex items-center h-full">
          <div className="flex items-center space-x-4 mr-4">
            <UserButton afterSignOutUrl="/" />
          </div>
          <span
            ref={ballerSectionRef}
            className="flex items-start h-full gradientbg"
            style={{
              clipPath: "polygon(100% 0%, 100% 51%, 100% 73%, 18% 72%, 11% 48%, 0 0)",
              opacity: 1,
              transform: "translateY(3px)",
            }}
          >
            <p className="ms-12 mt-5 pr-1 text-xs" style={{ color: 'var(--theme-text-color)' }}>
              designed by <br />&nbsp;&nbsp;&nbsp;&nbsp;a certified baller
            </p>
            <div className="mt-6 mx-3">
              <FaLinkedin 
                size={25} 
                className="transition-colors duration-200 hover:fill-[var(--theme-hover-color)]"
                style={{
                  color: 'var(--theme-text-color)',
                }}
              />
            </div>
            <div className="mt-5 mx-2">
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
      </nav>
    </>
  );
};
