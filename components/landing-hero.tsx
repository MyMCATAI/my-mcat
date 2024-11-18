"use client";
import Image from "next/image";
import Link from "next/link";
import cat from "../public/hero.gif";
import laptop from "../public/laptop.png";
import { useLayoutEffect, useRef, useState } from 'react';
import BernieSvg from "../public/Bernie.svg";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LandingHero = () => {
  const quoteRef = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const meowSectionRef = useRef(null);
  const titleRef = useRef(null);
  const laptopRef = useRef(null);
  const catGifRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [laptopLoaded, setLaptopLoaded] = useState(false);
  const [catGifLoaded, setCatGifLoaded] = useState(false);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const [video2Loaded, setVideo2Loaded] = useState(false);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.load();
      const handleLoadedData = () => setVideoLoaded(true);
      video.addEventListener('loadeddata', handleLoadedData);
      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, []);

  useLayoutEffect(() => {
    if (videoLoaded && videoRef.current) {
      gsap.to(videoRef.current, {
        opacity: 1,
        duration: 1,
        ease: "power2.inOut"
      });
    }
  }, [videoLoaded]);

  useLayoutEffect(() => {
    if (laptopLoaded) {
      gsap.fromTo(laptopRef.current,
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 1, 
          ease: "power2.inOut",
          onComplete: () => {
            if (catGifLoaded) {
              gsap.fromTo(catGifRef.current, 
                { y: '100%', opacity: 0 },
                { y: '0%', opacity: 1, duration: 1, ease: "power2.out" }
              );
            }
          }
        }
      );
    }
  }, [laptopLoaded, catGifLoaded]);

  useLayoutEffect(() => {
    if (video2Loaded && videoRef2.current) {
      gsap.to(videoRef2.current, {
        opacity: 1,
        duration: 1,
        ease: "power2.inOut"
      });
    }
  }, [video2Loaded]);

  return (
    <>
      <section className="relative h-screen overflow-hidden bg-[#050010]" id="home">
        <video 
          ref={videoRef}
          className={`absolute top-0 left-0 w-full h-full object-cover ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={"https://my-mcat.s3.us-east-2.amazonaws.com/public/brush3.mp4"} type="video/mp4" />
          Your browser does not support the video tag.
        </video> 
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 max-w-6xl w-full">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white font-krungthep mb-4">
                <span>
                  <span className="text-[#f2f64f]">Score</span> beyond <span className="text-[#f2f64f]">a 520</span>
                </span>
              </h1>
              <p className="text-2xl md:text-3xl text-white my-8">
             Our AI-tutoring platform makes dream scores a reality.
              </p>
              <div className="flex justify-center">
                <Link href="/sign-up">
                  <button className="bg-[#ffffff] text-[#0e2247] py-4 text-xl md:text-2xl px-10 rounded-[20px]">
                    Register
                  </button>
                </Link>
              </div>
            </div>
            <div className="relative flex justify-center mt-6 lg:mt-0">
              <div ref={laptopRef} className="w-full opacity-0">
                <Image 
                  src={laptop} 
                  alt="Laptop" 
                  className="w-full" 
                  onLoadingComplete={() => setLaptopLoaded(true)}
                />
              </div>
              <div className="absolute top-[5%] left-[10%] w-[80%] h-[80%] overflow-hidden">
                <div ref={catGifRef} className="w-full h-full opacity-0">
                  <Image 
                    src={cat} 
                    alt="GIF" 
                    layout="fill" 
                    objectFit="contain" 
                    unoptimized
                    onLoadingComplete={() => setCatGifLoaded(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrated Bernie Quote into the Next Background Section */}
      <section 
        className="w-full py-16 bg-[#000c1e] relative"
      >
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url("/stars.jpeg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            mixBlendMode: 'screen',
          }}
        ></div>
       <div className="flex flex-col md:flex-row items-center justify-center gap-8 ml-3 mr-3 mb-12" ref={quoteRef}>
          <div>
            <BernieSvg width={260} height={260} />
          </div>
          <div className="">
            <h1 className="text-3xl md:text-3xl text-[#ffffff] font-bold mb-4 font-krungthep">
              &ldquo;Higher education should be a right for all, not a privilege for the few.&rdquo;
            </h1>
            <p className="text-xl text-[#ffffff] font-bold">
              Senator Bernie Sanders of Vermont
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingHero;