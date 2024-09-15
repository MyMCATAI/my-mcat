'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import YouTube from 'react-youtube';

gsap.registerPlugin(ScrollTrigger);

const Product = () => {
  const [background, setBackground] = useState(250);
  const [isMobile, setIsMobile] = useState(false);

  const parallaxRef = useRef(null);
  const mountain3 = useRef(null);
  const mountain2 = useRef(null);
  const mountain1 = useRef(null);
  const cloudsBottom = useRef(null);
  const cloudsLeft = useRef(null);
  const cloudsRight = useRef(null);
  const stars = useRef(null);
  const sun = useRef(null);
  const copy = useRef(null);
  const btn = useRef(null);
  const video = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let ctx = gsap.context(() => {
      var tl = gsap.timeline({
        defaults: { duration: 1, ease: "power2.in" }, // Added ease: "power2.in"
        scrollTrigger: {
          trigger: parallaxRef.current,
          start: "top top",
          end: "2000 bottom",
          scrub: 1, // Changed from true to 1 for smoother scrubbing
          pin: true,
          onUpdate: (self) => {
            setBackground(Math.ceil(self.progress * 100 + 20))
          },
        },
      });
      
      if (isMobile) {
        tl.to(mountain3.current, { y: "-=40" }, 0);
        tl.to(mountain2.current, { y: "-=15" }, 0);
        tl.to(mountain1.current, { y: "+=25" }, 0);
        tl.to(sun.current, { y: "+=120", scale: 0.8 }, 0);
      } else {
        tl.to(mountain3.current, { y: "-=80" }, 0);
        tl.to(mountain2.current, { y: "-=30" }, 0);
        tl.to(mountain1.current, { y: "+=50" }, 0);
        tl.to(sun.current, { y: "+=210" }, 0);
      }

      tl.to(stars.current, { top: 0 }, 0.3);
      tl.to(cloudsBottom.current, { opacity: 0 }, 0);
      tl.to(cloudsLeft.current, { x: "-20%", opacity: 0 }, 0);
      tl.to(cloudsRight.current, { x: "20%", opacity: 0 }, 0);
      tl.to(copy.current, { y: "-10%", opacity: 1 }, 0.6);
      tl.to(video.current, { opacity: 1 }, 0.8);
      tl.to(btn.current, { opacity: 1 }, 0.9);
    });
    return () => ctx.revert();
  }, [isMobile]);

  return (
    <div className="parallax-outer">
      <div
        ref={parallaxRef}
        style={{ background: `linear-gradient(#021125, #143A6B ${background}%, #A74A67, #EDFC54 )` }}
        className='parallax overflow-hidden'
      >
        <Image ref={sun} className='sun absolute' src="/parallex test/sun.svg" alt="Sun" width={300} height={300} style={{ bottom: isMobile ? '10%' : '5%' }} />
        <Image ref={mountain3} className='mountain-3 absolute bottom-0 left-0 w-full' src="/parallex test/mountain-3.svg" alt="Mountain 3" layout="responsive" width={300} height={100} />
        <Image ref={mountain2} className='mountain-2 absolute bottom-0 left-0 w-full' src="/parallex test/mountain-2.svg" alt="Mountain 2" layout="responsive" width={300} height={120} />
        <Image ref={mountain1} className='mountain-1 absolute bottom-0 left-0 w-full' src="/parallex test/mountain-1.svg" alt="Mountain 1" layout="responsive" width={300} height={150} />
        <Image ref={cloudsBottom} className='clouds-bottom' src="/parallex test/cloud-bottom.svg" alt="Clouds Bottom" width={300} height={250} />
        <Image ref={cloudsLeft} className='clouds-left' src="/parallex test/clouds-left.svg" alt="Clouds Left" width={300} height={250} />
        <Image ref={cloudsRight} className='clouds-right' src="/parallex test/clouds-right.svg" alt="Clouds Right" width={300} height={250} />
        <Image ref={stars} className='stars' src="/parallex test/stars.svg" alt="Stars" width={300} height={300} />
        <div ref={copy} className="copy lg:bottom-[5%] xl:bottom-[15%] relative z-100 w-full max-w-screen-xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold mb-8">The Anti-Test Prep Software</h1>
          <div ref={video} className="youtube-video animate-fadeIn" style={{ opacity: 0 }}>
            <div className="video-wrapper border-4 border-white rounded-lg overflow-hidden shadow-1xl mb-8 mx-auto" style={{ maxWidth: '1200px', width: '100%' }}>
              <YouTube
                videoId="9Vi2AUgOfZU"
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 0,
                  },
                }}
                className="aspect-video mt-3 h-[180px] sm:h-[300px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;