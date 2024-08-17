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
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

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

      <AppleCardsCarouselDemo />

      {/*<section className="bg-white py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center gap-8" ref={quoteRef}>
            <div>
              <BernieSvg width={260} height={260}/>
            </div>
            <div className="mt-8 md:mt-0">
              <h1 className="text-2xl md:text-3xl text-black font-bold mb-4">
                &ldquo;Higher education should be a right for all, not a privilege for the few.&rdquo;
              </h1>
              <p className="text-xl text-white font-bold mb-1 ms-1">
                - Senator Bernie Sanders of Vermont
              </p>
            </div>
          </div>
        </div>
      </section>*/}
    </>
  );
};

const AppleCardsCarouselDemo = () => {
  const headingRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const headingElement = headingRef.current;
    gsap.set(headingElement, { opacity: 0, y: 50 });
    gsap.to(headingElement, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: headingElement,
        start: "top 80%",
        end: "top 20%",
        toggleActions: "play none none reverse"
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} layout={true} />
  ));

  return (
    <div className="w-full h-full py-20 bg-[#000c1e] relative">
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url("/stars.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div>
      <div className="relative z-10">
        <h2 ref={headingRef} className="max-w-7xl pl-4 flex flex-col justify-center items-center mx-auto mt-20 mb-7 text-center">
          <span className="text-5xl text-blue-200 font-semibold">
            Increase your MCAT score past 520+
          </span>
          <span className="text-2xl text-gray-300 mt-6">
            with our first-of-its-kind tutoring software
          </span>
        </h2>

        <Carousel items={cards} />
      </div>
    </div>
  );
};

const DummyContent = () => {
  const content = [
    {
      title: "No more worrying about when to study.",
      description: "Enter information about your schedule and we'll automatically plan your prep around your life.",
      imageSrc: "/landingpage/landingpagecard1image0.gif",
      imageAlt: "Kalypso calendar algorithm demonstration"
    },
    {
      title: "Personalized & adaptive study plans.",
      description: "Up until the day of your test, we'll create a personalized & flexible study plan that targets your weaknesses.",
      imageSrc: "/landingpage/landingpagecard1image2.png",
      imageAlt: "Personalized study plan demonstration"
    },
    {
      title: "Accountability checks and progress reports.",
      description: "Kalypso will provide daily reports on your progress and pester you to hold you accountable.",
      imageSrc: "/landingpage/landingpagecard1image3.png",
      imageAlt: "Progress tracking demonstration"
    }
  ];

  return (
    <>
      {content.map((item, index) => (
        <div key={`dummy-content-${index}`} className="bg-black p-9 md:p-15 rounded-3xl mb-4">
          <p className="text-white text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-blue-400">{item.title}</span>{"   "}
            {item.description}
          </p>
          <Image
            src={item.imageSrc}
            alt={item.imageAlt}
            height={700}
            width={700}
            className="md:w-full md:h-full h-full w-full mx-auto object-contain"
          />
        </div>
      ))}
    </>
  );
};

const DummyContent2 = () => {
  const content = [
    {
      title: "Our innovative Adaptive Tutoring Suite (ATS) is all you need.",
      description: "Nearly 300 videos & readings organized by yield and weakness. Watch videos, read textbooks, and do practice questions without leaving our site.",
      imageSrc: "/landingpage/ats1.gif",
      imageAlt: "Kalypso content integration demonstration"
    },
    {
      title: "Kalypso is an AI-powered superkitty that studies WITH you.",
      description: "Trained on over 10,000 hours of MCAT data and programmed with the latest in ITS research, Kalypso not only answers your questions, but ASKS you questions as you study. Oh, and he talks too!",
      imageSrc: "/landingpage/interactive-modules.gif",
      imageAlt: "Interactive learning modules demonstration"
    },
    {
      title: "Cutting edge weakness algorithms designed by PhDs.",
      description: "Our team of experts regularly updates the content to ensure you're always studying the most relevant and up-to-date material.",
      imageSrc: "/landingpage/content-updates.gif",
      imageAlt: "Content updates demonstration"
    }
  ];

  return (
    <>
      {content.map((item, index) => (
        <div key={`dummy-content2-${index}`} className="bg-black p-9 md:p-15 rounded-3xl mb-4">
          <p className="text-white text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-green-400">{item.title}</span>{"   "}
            {item.description}
          </p>
          <Image
            src={item.imageSrc}
            alt={item.imageAlt}
            height={700}
            width={700}
            className="md:w-full md:h-full h-full w-full mx-auto object-contain"
          />
        </div>
      ))}
    </>
  );
};

const data = [
  {
    category: "Advanced calendar algorithm.",
    title: "Your study should be planned around your life —— not the other way around.",
    src: "/landingpage/kalypsocard1.png",
    content: <DummyContent />,
  },
  {
    category: "State-of-the-art content.",
    title: "Education software that personalizes Khan Academy, OpenStax, AAMC, and more.",
    src: "/landingpage/landingpagecardimage2.png",
    content: <DummyContent2 />,
  },
  {
    category: "High-quality practice.",
    title: "Written by a 99% scorer, identical to AAMC, with Kalypso-assisted review.",
    src: "/landingpage/landingpageimage3.png",
    content: <DummyContent />,
  },
];