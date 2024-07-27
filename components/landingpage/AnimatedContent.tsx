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
    gsap.from(testimonialsRef.current, {
      scrollTrigger: {
        trigger: testimonialsRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      },
      opacity: 0,
      y: 50,
      duration: 1
    });

    // Methodology animation
    gsap.from(methodologyRef.current, {
      scrollTrigger: {
        trigger: methodologyRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      },
      opacity: 0,
      x: -50,
      duration: 1
    });

    // Youtube animation
    gsap.from(youtubeRef.current, {
      scrollTrigger: {
        trigger: youtubeRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      },
      opacity: 0,
      scale: 0.8,
      duration: 1
    });

    // CheckListing animation
    gsap.from(checkListingRef.current, {
      scrollTrigger: {
        trigger: checkListingRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      },
      opacity: 0,
      y: 50,
      duration: 1
    });

    // FAQs animation
    gsap.from(faqsRef.current, {
      scrollTrigger: {
        trigger: faqsRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      },
      opacity: 0,
      x: 50,
      duration: 1
    });
  }, []);

  return (
    <>
      <div ref={testimonialsRef}>
        <Testimonials />
      </div>
      <div ref={methodologyRef}>
        <Methodlogy />
      </div>
      <div ref={youtubeRef}>
        <Youtube />
      </div>
      <div ref={checkListingRef}>
        <CheckListing />
      </div>
      <div ref={faqsRef}>
        <Faqs />
      </div>
    </>
  );
};

export default AnimatedContent;