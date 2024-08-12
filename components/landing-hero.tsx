"use client";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import cat from "../public/hero.gif";
import laptop from "../public/laptop.png";
import { useEffect, useRef } from 'react';
import BernieSvg from "../public/Bernie.svg";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const LandingHero = () => {
  const quoteRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const quoteElement = quoteRef.current;
    gsap.set(quoteElement, { opacity: 0, y: 50 });
    gsap.to(quoteElement, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: quoteElement,
        start: "top 50%",
        end: "top 10%",
        toggleActions: "play none none reverse"
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <>
      <section className="relative h-screen overflow-hidden" id="home">
        <video 
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/brush3.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-20">
            <div className="text-center">
              <h1 className="text-3xl md:text-[44px] font-bold text-white mb-4">
                Study <span className="text-[#f2f64f]">smarter</span>, with a friend.
              </h1>
              <p className="text-lg md:text-[20px] text-white my-8">
                Take the stress out of your MCAT prep with Kalypso.
              </p>
              <div className="flex justify-center">
                <Link href="/intro">
                  <button className="bg-[#ffffff] text-[#0e2247] py-4 text-lg md:text-[20px] px-10 rounded-[20px]">
                    Join the waitlist
                  </button>
                </Link>
              </div>
            </div>
            <div className="relative flex justify-center mt-6 md:mt-0">
              <Image src={laptop} alt="Laptop" className="w-full" />
              <div className="absolute top-[5%] left-[10%] w-[80%] h-[80%]">
                <Image src={cat} alt="GIF" layout="fill" objectFit="contain" unoptimized/>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#080c1c] py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center gap-8" ref={quoteRef}>
            <div>
              <BernieSvg width={260} height={260}/>
            </div>
            <div className="mt-8 md:mt-0">
              <h1 className="text-2xl md:text-3xl text-white font-bold mb-4">
                &ldquo;Higher education should be a right for all, not a privilege for the few.&rdquo;
              </h1>
              <p className="text-xl text-white font-bold mb-1 ms-1">
                - Senator Bernie Sanders of Vermont
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};