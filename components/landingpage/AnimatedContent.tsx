"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Testimonials from "./Testimonials";
import Methodlogy from "./Methodlogy";
import Youtube from "./Youtube";
import CheckListing from "./CheckListing";
import Faqs from "./Faqs";

gsap.registerPlugin(ScrollTrigger);

const AnimatedContent = () => {
  const testimonialsRef = useRef(null);
  const methodologyRef = useRef(null);
  const youtubeRef = useRef(null);
  const checkListingRef = useRef(null);
  const faqsRef = useRef(null);

  useEffect(() => {
    // Testimonials animation
    gsap.to(testimonialsRef.current, {
      scrollTrigger: {
        trigger: testimonialsRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play reverse play reverse",
        scrub: true
      },
      opacity: 0,
      y: 50,
      duration: 1
    });

    // Methodology animation
    gsap.to(methodologyRef.current, {
      scrollTrigger: {
        trigger: methodologyRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play reverse play reverse",
        scrub: true
      },
      opacity: 0,
      x: -50,
      duration: 1
    });

    // Youtube animation
    gsap.to(youtubeRef.current, {
      scrollTrigger: {
        trigger: youtubeRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play reverse play reverse",
        scrub: true
      },
      opacity: 0,
      scale: 0.8,
      duration: 1
    });

    // CheckListing animation
    gsap.to(checkListingRef.current, {
      scrollTrigger: {
        trigger: checkListingRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play reverse play reverse",
        scrub: true
      },
      opacity: 0,
      y: 50,
      duration: 1
    });

    // FAQs animation
    gsap.to(faqsRef.current, {
      scrollTrigger: {
        trigger: faqsRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play reverse play reverse",
        scrub: true
      },
      opacity: 0,
      x: 50,
      duration: 1
    });
  }, []);

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div ref={testimonialsRef} style={{ background: 'white' }}>
        <Testimonials />
      </div>
      <div ref={methodologyRef} style={{ background: 'white' }}>
        <Methodlogy />
      </div>
      <div ref={youtubeRef} style={{ background: 'white' }}>
        <Youtube />
      </div>
      <div ref={checkListingRef} style={{ background: 'white' }}>
        <CheckListing />
      </div>
      <div ref={faqsRef} style={{ background: 'white' }}>
        <Faqs />
      </div>
    </div>
  );
};

export default AnimatedContent;