"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const Product = () => {
  const [background, setBackground] = useState(250);
  const [isMobile, setIsMobile] = useState(false);

  const parallaxRef = useRef<HTMLDivElement>(null);
  const mountain3 = useRef<HTMLImageElement>(null);
  const mountain2 = useRef<HTMLImageElement>(null);
  const mountain1 = useRef<HTMLImageElement>(null);
  const cloudsBottom = useRef<HTMLImageElement>(null);
  const cloudsLeft = useRef<HTMLImageElement>(null);
  const cloudsRight = useRef<HTMLImageElement>(null);
  const stars = useRef<HTMLImageElement>(null);
  const sun = useRef<HTMLImageElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const video = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!parallaxRef.current || !mountain3.current || !mountain2.current || !mountain1.current ||
        !sun.current || !stars.current || !cloudsBottom.current || !cloudsLeft.current ||
        !cloudsRight.current || !copy.current || !video.current) {
      return; // Exit if any refs are null
    }

    // Batch DOM reads/writes for better performance
    const elements = {
      mountain3: mountain3.current,
      mountain2: mountain2.current,
      mountain1: mountain1.current,
      sun: sun.current,
      stars: stars.current,
      cloudsBottom: cloudsBottom.current,
      cloudsLeft: cloudsLeft.current,
      cloudsRight: cloudsRight.current,
      copy: copy.current,
      video: video.current
    };

    // Add will-change to optimize animations
    Object.values(elements).forEach(el => {
      if (el) {
        el.style.willChange = 'transform, opacity';
      }
    });

    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { duration: 1, ease: "power2.out" },
        scrollTrigger: {
          trigger: parallaxRef.current,
          start: "top top",
          end: "1500 bottom",
          scrub: 2,
          pin: true,
          onUpdate: (self) => {
            requestAnimationFrame(() => {
              setBackground(Math.ceil(self.progress * 100 + 20));
            });
          },
        },
      });

      // Batch animations for better performance
      if (isMobile) {
        tl.to([mountain3.current, mountain2.current, mountain1.current], {
          y: (i) => ["-=40", "-=15", "+=25"][i],
          stagger: 0.1
        }, 0);
        tl.to(sun.current, { y: "+=120", scale: 0.8 }, 0);
      } else {
        tl.to([mountain3.current, mountain2.current, mountain1.current], {
          y: (i) => ["-=80", "-=30", "+=50"][i],
          stagger: 0.1
        }, 0);
        tl.to(sun.current, { y: "+=210" }, 0);
      }

      // Optimize cloud animations
      const cloudElements = [cloudsBottom.current, cloudsLeft.current, cloudsRight.current];
      tl.to(cloudElements, { opacity: 0, stagger: 0.1 }, 0);
      
      // Optimize content fade-ins
      tl.to([copy.current, video.current], { opacity: 1, stagger: 0.1 }, 0.5);
    });

    return () => {
      ctx.revert();
      // Clean up will-change
      Object.values(elements).forEach(el => {
        if (el) {
          el.style.willChange = 'auto';
        }
      });
    };
  }, [isMobile]);

  return (
    <div id="about" className="relative">
      {" "}
      {/* Add id here and make it relative */}
      <div className="parallax-outer">
        <div
          ref={parallaxRef}
          style={{
            background: `linear-gradient(#021125, #143A6B ${background}%, #A74A67, #EDFC54)`,
          }}
          className="parallax overflow-hidden relative"
        >
          <Image
            ref={sun}
            className="sun absolute transform-gpu" // Added transform-gpu
            src="/parallax/sun.svg"
            alt="Sun"
            width={300}
            height={300}
            style={{ bottom: isMobile ? "10%" : "5%" }}
            priority // Added priority loading
          />
          <Image
            ref={mountain3}
            className="mountain-3 absolute bottom-0 left-0 w-full transform-gpu"
            src="/parallax/mountain-3.svg"
            alt="Mountain 3"
            layout="responsive"
            width={300}
            height={100}
            priority
          />
          <Image
            ref={mountain2}
            className="mountain-2 absolute bottom-0 left-0 w-full transform-gpu"
            src="/parallax/mountain-2.svg"
            alt="Mountain 2"
            layout="responsive"
            width={300}
            height={120}
            priority
          />
          <Image
            ref={mountain1}
            className="mountain-1 absolute bottom-0 left-0 w-full transform-gpu"
            src="/parallax/mountain-1.svg"
            alt="Mountain 1"
            layout="responsive"
            width={300}
            height={150}
            priority
          />
          <Image
            ref={cloudsBottom}
            className="clouds-bottom transform-gpu"
            src="/parallax/cloud-bottom.svg"
            alt="Clouds Bottom"
            width={300}
            height={250}
          />
          <Image
            ref={cloudsLeft}
            className="clouds-left transform-gpu"
            src="/parallax/clouds-left.svg"
            alt="Clouds Left"
            width={300}
            height={250}
          />
          <Image
            ref={cloudsRight}
            className="clouds-right transform-gpu"
            src="/parallax/clouds-right.svg"
            alt="Clouds Right"
            width={300}
            height={250}
          />
          <Image
            ref={stars}
            className="stars transform-gpu"
            src="/parallax/stars.svg"
            alt="Stars"
            width={300}
            height={300}
          />
          <div
            ref={copy}
            className="copy absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-screen-xl"
          >
            <h1 className="text-2xl md:text-2xl font-bold mb-10 text-center text-white font-krungthep">
              You&apos;re not alone.
            </h1>
            <div
              ref={video}
              className="video-container animate-fadeIn"
              style={{ opacity: 0 }}
            >
              <div
                className="video-wrapper border-4 border-white rounded-lg overflow-hidden shadow-1xl mx-auto"
                style={{ maxWidth: "70vw", width: "100%" }}
              >
                <video 
                  controls 
                  className="w-full aspect-video"
                  playsInline 
                  preload="metadata"
                >
                  <source
                    src="https://my-mcat.s3.us-east-2.amazonaws.com/public/mymcat.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Add a spacer div to ensure scrolling works correctly */}
      <div style={{ height: "50px" }}></div>
    </div>
  );
};

export default Product;
