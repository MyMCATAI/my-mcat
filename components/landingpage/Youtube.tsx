"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Youtube = () => {
  const missionTitleRef = useRef(null);
  const missionTextRef = useRef(null);
  const productTitleRef = useRef(null);
  const productTextRef = useRef(null);
  const missionVideoRef = useRef(null);
  const productVideoRef = useRef(null);

  useEffect(() => {
    const missionTitle = missionTitleRef.current;
    const missionText = missionTextRef.current;
    const productTitle = productTitleRef.current;
    const productText = productTextRef.current;
    const missionVideo = missionVideoRef.current;
    const productVideo = productVideoRef.current;

    gsap.set([missionTitle, missionText, productTitle, productText, missionVideo, productVideo], {
      opacity: 0,
      y: 50,
    });

    ScrollTrigger.batch([missionTitle, missionText, productTitle, productText], {
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.2, duration: 1 }),
      start: "top 80%",
    });

    ScrollTrigger.batch([missionVideo, productVideo], {
      onEnter: (batch) => gsap.to(batch, { opacity: 1, scale: 1, duration: 1, ease: "back.out(1.7)" }),
      start: "top 80%",
    });

  }, []);

  return (
    <>
      <div className="bg-[#0E2247]" id="mission">
        <div className="container mx-auto py-16">
          <div className="text-center md:text-left">
            <h1 ref={missionTitleRef} className="text-4xl md:text-[44px] font-bold text-white mb-2">
              Our mission
            </h1>
            <p ref={missionTextRef} className="text-lg lg:text-2xl text-white mb-6">
              Kalypso is a friendly cat that believes everyone deserves a fair shot.
            </p>
          </div>

          <div className="w-full aspect-video">
            <iframe
              ref={missionVideoRef}
              className="w-full h-full rounded-[20px]"
              src="https://www.youtube.com/embed/NEW3QcXWKEU?si=RiPpAz42l5OUBmlW"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
      <div className="bg-[#2D4778]">
        <div className="container mx-auto py-16">
          <div className="text-center lg:text-right">
            <h1 ref={productTitleRef} className="text-4xl md:text-[44px] font-bold text-white mb-2">
              Our product
            </h1>
            <p ref={productTextRef} className="text-lg lg:text-2xl text-white mb-6">
              Designed by an AI Engineer and a 99% Scorer.
            </p>
          </div>
          <div className="w-full aspect-video">
            <iframe
              ref={productVideoRef}
              className="w-full h-full rounded-[20px]"
              src="https://www.youtube.com/embed/njEqnfyzYjI?si=hShf98dN5kOMwAU2"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </>
  );
};

export default Youtube;
