"use client";

import { useRef } from "react";
import Methodology from "./Mission";
import CheckListing from "./CheckListing";
import Faqs from "./Faqs";

const AnimatedContent = () => {
  return (
    <div style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Methodology />
      </div>
      <div style={{ background: 'white', position: 'relative', zIndex: 1 }}>
        <CheckListing />
      </div>
      <div style={{ background: 'white', position: 'relative', zIndex: 1 }}>
        <Faqs />
      </div>
    </div>
  );
};

export default AnimatedContent;