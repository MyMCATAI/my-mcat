"use client";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
// Import assets using @/ alias
import cat from "@/public/hero.gif";
import laptop from "@/public/laptop.png";
import BernieSvg from "@/public/Bernie.svg";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* ----------------------------------------- Constants ------------------------------------------ */
const VIDEO_URL = "https://my-mcat.s3.us-east-2.amazonaws.com/public/brush3.mp4";
const DEMO_VIDEO_URL = "https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/MyMCAT+Software+and+Mission-VEED.mp4";
const BROWSER_REGEX = {
  safari: /^((?!chrome|android).)*safari/i,
  firefox: /firefox/i
};

// Add scroll configuration
const SCROLL_CONFIG = {
  duration: 1,
  ease: "power2.inOut"
};

/* ------------------------------------------ Types --------------------------------------------- */
interface BrowserState {
  isSafari: boolean;
  isFirefox: boolean;
}

interface VideoRefState {
  ref: React.RefObject<HTMLVideoElement>;
  loaded: boolean;
}

interface LandingHeroProps {
  onScrollClick?: () => void;
}

const LandingHero = ({ onScrollClick }: LandingHeroProps) => {
  /* -------------------------------------- State & Refs ---------------------------------------- */
  const shouldReduceMotion = useReducedMotion();
  const quoteRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const catContainerRef = useRef<HTMLDivElement>(null);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [browserType, setBrowserType] = useState<BrowserState>({
    isSafari: false,
    isFirefox: false
  });
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  /* -------------------------------- Animations & Effects -------------------------------------- */
  // Prevent auto-scroll on page load
  useLayoutEffect(() => {
    // Force scroll to top immediately
    if (typeof window !== 'undefined') {
      // Disable scroll restoration
      window.history.scrollRestoration = 'manual';
      
      // Force scroll to top
      window.scrollTo(0, 0);
      
      // Clear any existing scroll position
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      
      // Remove hash without scrolling
      if (window.location.hash) {
        history.pushState("", document.title, window.location.pathname);
      }
    }
  }, []);

  // Browser detection
  useEffect(() => {
    setBrowserType({
      isSafari: BROWSER_REGEX.safari.test(navigator.userAgent),
      isFirefox: BROWSER_REGEX.firefox.test(navigator.userAgent)
    });
  }, []);

  // Video loading
  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => setVideoLoaded(true);
    video.load();
    video.addEventListener('loadeddata', handleLoadedData);
    
    return () => video.removeEventListener('loadeddata', handleLoadedData);
  }, []);

  // Video animation
  useLayoutEffect(() => {
    if (!videoLoaded || !videoRef.current) return;

    gsap.to(videoRef.current, {
      opacity: 1,
      duration: 1,
      ease: "power2.inOut"
    });
  }, [videoLoaded]);

  // Cat animation
  useLayoutEffect(() => {
    if (!catContainerRef.current) return;

    gsap.fromTo(catContainerRef.current, 
      { y: '100%', opacity: 0 },
      { 
        y: '0%', 
        opacity: 1, 
        duration: 1.2, 
        ease: "power2.out",
        delay: 0.5
      }
    );
  }, []);

  /* --------------------------------------- Event Handlers ------------------------------------ */
  const handleScrollClick = () => {
    if (quoteRef.current) {
      gsap.to(window, {
        duration: SCROLL_CONFIG.duration,
        scrollTo: {
          y: quoteRef.current,
          offsetY: 0
        },
        ease: SCROLL_CONFIG.ease
      });
    }
  };

  const handleDemoClick = () => {
    setIsVideoModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
  };

  /* --------------------------------------- Render Methods ------------------------------------ */
  const renderVideoModal = () => (
    <AnimatePresence>
      {isVideoModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={handleCloseModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <video
              className="w-full h-full"
              controls
              autoPlay
              src={DEMO_VIDEO_URL}
            />
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
              aria-label="Close modal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderHeroContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 max-w-6xl w-full">
      {/* Left side - Text content */}
      <div className="text-center">
        <h1 className="text-4xl md:text-4xl font-bold text-white font-krungthep mb-4">
           Meow there, <span className="text-[#f2f64f]">I'm Kalypso!</span>
        </h1>
        <p className="text-xl md:text-2xl text-white my-8">
        MyMCAT.ai is a high-tech tutoring platform that transforms MCAT courses into video games.
        </p>
        <div className="flex justify-center gap-4">
          <motion.button
            onClick={handleDemoClick}
            className="bg-[#ffffff] text-[#0e2247] py-4 text-xl md:text-2xl px-10 rounded-[20px]"
            whileHover={{ scale: 1.05 }}
            animate={shouldReduceMotion ? {} : {
              boxShadow: [
                "0 0 0 0 rgba(255, 255, 255, 0.4)",
                "0 0 0 15px rgba(255, 255, 255, 0)",
              ],
            }}
            transition={{
              boxShadow: {
                duration: 1.5,
                repeat: Infinity,
              }
            }}
          >
            Watch Demo
          </motion.button>
          <Link href="/hiatus">
            <motion.button
              className="bg-black text-white py-4 text-xl border-white border md:text-2xl px-10 rounded-[20px]"
              whileHover={{ scale: 1.05 }}
            >
              Play for Free
            </motion.button>
          </Link>
        </div>
      </div>
      {/* Right side - Laptop and Cat */}
      <div className="relative flex justify-center mt-6 lg:mt-0">
        <div className="w-full">
          <Image 
            src={laptop} 
            alt="Laptop" 
            className="w-full"
            priority
          />
        </div>
        <div className="absolute top-[5%] left-[10%] w-[80%] h-[80%] overflow-hidden">
          <div ref={catContainerRef} className="w-full h-full opacity-0">
            <Image 
              src={cat} 
              alt="Hero Animation" 
              className="w-full h-full object-contain"
              fill
              priority
              unoptimized
              quality={75}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderScrollArrow = () => (
    <motion.div 
      className="absolute bottom-20 left-[calc(50%-8px)] transform -translate-x-1/2 cursor-pointer z-20"
      animate={shouldReduceMotion ? {} : { y: [0, 10, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      onClick={handleScrollClick}
      whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
      role="button"
      tabIndex={0}
      aria-label="Scroll to next section"
      onKeyDown={(e) => e.key === 'Enter' && handleScrollClick()}
    >
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M7 13l5 5 5-5"/>
        <path d="M7 6l5 5 5-5"/>
      </svg>
    </motion.div>
  );

  return (
    <>
      {renderVideoModal()}
      <section 
        className="relative h-screen overflow-hidden bg-[#171234]" 
        id="home"
      >
        <video 
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          autoPlay
          loop
          muted
          playsInline
          style={{ opacity: videoLoaded ? 1 : 0 }}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center">
          {renderHeroContent()}
        </div>
        {renderScrollArrow()}
      </section>

      {/* Bernie Quote Section */}
      <section 
        ref={quoteRef} 
        className="w-full py-16 bg-[#000c1e] relative"
      >
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat mix-blend-screen"
          style={{ backgroundImage: 'url("/stars.jpeg")' }}
        />
        <div 
          className="flex flex-col md:flex-row items-center justify-center gap-8 mx-3 mb-12"
        >
          <div>
            <BernieSvg width={260} height={260} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-4 font-krungthep">
              &ldquo;Higher education should be a right for all, not a privilege for the few.&rdquo;
            </h1>
            <p className="text-xl text-white font-bold">
              Senator Bernie Sanders of Vermont
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingHero;