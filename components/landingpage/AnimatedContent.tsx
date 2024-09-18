"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Methodology from "./Mission";
import CheckListing from "./CheckListing";
import Faqs from "./Faqs";

gsap.registerPlugin(ScrollTrigger);

const AnimatedContent = () => {
  const methodologyRef = useRef(null);
  const checkListingRef = useRef(null);
  const faqsRef = useRef(null);

  useEffect(() => {
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
      <div ref={methodologyRef} style={{ background: 'white' }}>
        <Methodology />
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