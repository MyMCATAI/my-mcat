"use client";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import cat from "../public/hero.gif";
import laptop from "../public/laptop.png";
import { useLayoutEffect, useRef, useState } from 'react';
import BernieSvg from "../public/Bernie.svg";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const LandingHero = () => {
  const quoteRef = useRef(null);
  const videoRef = useRef(null);
  const meowSectionRef = useRef(null);
  const titleRef = useRef(null);
  const laptopRef = useRef(null);
  const catGifRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [laptopLoaded, setLaptopLoaded] = useState(false);
  const [catGifLoaded, setCatGifLoaded] = useState(false);
  const videoRef2 = useRef(null);
  const [video2Loaded, setVideo2Loaded] = useState(false);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
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

      const section = meowSectionRef.current;
      const title = titleRef.current;

      gsap.set(title, { opacity: 0, y: 50 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 40%",
          end: "bottom 10%",
          toggleActions: "play none none reverse",
        }
      });

      timeline.to(title, { opacity: 1, y: 0, duration: 0.3 });
    });

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (videoLoaded) {
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
    if (video2Loaded) {
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
          className="absolute top-0 left-0 w-full h-full object-cover opacity-0"
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
        >
          <source src={"https://my-mcat.s3.us-east-2.amazonaws.com/public/brush3.mp4"} type="video/mp4" />
          Your browser does not support the video tag.
        </video> 
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-20">
            <div className="text-center">
              <h1 className="text-3xl md:text-[44px] font-bold text-white mb-4">
                <span className="text-[#f2f64f]"> Increase </span> your CARs score.
              </h1>
              <p className="text-lg md:text-[20px] text-white my-8">
                Make strategy easy with your learning companion, Kalypso.
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

      <section 
        ref={meowSectionRef} 
        className="w-full py-32 bg-[#000c1e] relative"
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
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <div className="w-full mx-auto mb-20 text-center space-y-12">
            <h2 ref={titleRef} className="text-[1.6rem] text-center text-white font-bold mb-16 pt-10">The most innovative and effective software for MCAT prep.</h2>
          </div>
          <div className="w-full mx-auto mb-20">
            <iframe 
              width="100%" 
              height="500" 
              src="https://www.youtube.com/embed/MAFlQ6fU4GM" 
              style={{ border: '2px solid #000' }}
              allow="autoplay; encrypted-media" 
              allowFullScreen
            ></iframe>
          </div>
          {/* New vertical sections */}
          <div className="space-y-8 text-white">
            <div className="text-center p-6 bg-opacity-20 bg-white rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Fun, engaging passages with AAMC-level questions.</h3>
              <p>Our MCAT passages are fun and engaging, with AI that tracks timing, accuracy, and drops HINTS when you&apos;re between two options.</p>
            </div>
            <div className="text-center p-6 bg-opacity-20 bg-white rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Cupcake reward system incentivizes daily CARs as a habit.</h3>
              <p>Stay motivated with our unique reward system that allows you to earn glory for your college.</p>
            </div>
            <div className="text-center p-6 bg-opacity-20 bg-white rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Kalypso helps you review passages intelligently.</h3>
              <p>Our adaptive technology identifies your strengths and areas for improvement, tailoring the experience to you.</p>
            </div>
            <div className="text-center p-6 bg-opacity-20 bg-white rounded-lg">
              <h3 className="text-xl font-semibold mb-4">CARs prep that will forever be free.</h3>
              <p>We&apos;re committed to making quality MCAT preparation accessible to all, with our core CARs prep always free.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};