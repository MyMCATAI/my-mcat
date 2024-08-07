"use client";
import { useAuth } from "@clerk/nextjs";
import hero from "../public/heroimg.png";
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

  useEffect(() => {
    const quoteElement = quoteRef.current;

    // Set initial state (invisible)
    gsap.set(quoteElement, { opacity: 0, y: 50 });
     // Create the scroll-triggered animation
     gsap.to(quoteElement, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: quoteElement,
        start: "top 50%", // Starts animation when the top of the element hits 80% from the top of the viewport
        end: "top 10%", // Ends animation when the top of the element hits 50% from the top of the viewport
        toggleActions: "play none none reverse"
      }
    });
    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <>
      <section className="bg-[#0e2247] py-32" id="home">
        <div className="container mx-auto px-6 pt-32">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-20">
            <div className="text-center">
              <h1 className="text-3xl md:text-[44px] font-bold text-white mb-4">
                Study <span className="text-[#f2f64f]">smarter</span>, with a
                friend.
              </h1>
              <p className="text-lg md:text-[20px] text-white my-8">
                Take the stress out of your MCAT prep with Kalypso.
              </p>
              <div className="flex justify-center ">
                <Link target="/" href={"/intro"}>
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
      <section className="bg-[#f2f2f2] py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center gap-8" ref={quoteRef}>
            <div>
              <BernieSvg width={260} height={260} />
            </div>
            <div className="mt-8 md:mt-0">
              <h1 className="text-2xl md:text-3xl text-[#0e2247] font-bold mb-4">
                &ldquo;Higher education should be a right for all, not a privilege for the few.&rdquo;
              </h1>
              <p className="text-xl text-[#0e2247] font-bold mb-1 ms-1">
              Senator Bernie Sanders of Vermont
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};