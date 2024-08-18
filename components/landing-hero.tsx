"use client";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import cat from "../public/hero.gif";
import laptop from "../public/laptop.png";
import { useLayoutEffect, useRef } from 'react';
import BernieSvg from "../public/Bernie.svg";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

gsap.registerPlugin(ScrollTrigger);

export const LandingHero = () => {
  const quoteRef = useRef(null);
  const videoRef = useRef(null);
  const meowSectionRef = useRef(null);
  const titleRef = useRef(null);
  const paragraph1Ref = useRef(null);
  const paragraph2Ref = useRef(null);
  const paragraph3Ref = useRef(null);
  const paragraph4Ref = useRef(null);
  const paragraph5Ref = useRef(null);

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
      const p1 = paragraph1Ref.current;
      const p2 = paragraph2Ref.current;
      const p3 = paragraph3Ref.current;
      const p4 = paragraph4Ref.current;
      const p5 = paragraph5Ref.current;

      gsap.set([title, p1, p2, p3, p4, p5], { opacity: 0, y: 50 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 40%",
          end: "bottom 10%",
          toggleActions: "play none none reverse",
        }
      });

      timeline
        .to(title, { opacity: 1, y: 0, duration: 0.3 })
        .to(p1, { opacity: 1, y: 0, duration: 0.4 }, "+=0.2")
        .to(p2, { opacity: 1, y: 0, duration: 0.4 }, "+=0.2")
        .to(p3, { opacity: 1, y: 0, duration: 0.4 }, "+=0.2")
        .to(p4, { opacity: 1, y: 0, duration: 0.4 }, "+=0.2")
        .to(p5, { opacity: 1, y: 0, duration: 0.4 }, "+=0.2");
    });

    return () => ctx.revert();
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
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="w-full md:w-[80%] mx-auto mb-40 text-center space-y-12">
            <h2 ref={titleRef} className="text-4xl text-center text-white font-bold mb-16 pt-16">Meow there!</h2>
            <p ref={paragraph1Ref} className="text-2xl text-center text-white mb-12">
              MyMCAT is a tech venture built by passionate, top-scoring students.
            </p>
            <p ref={paragraph2Ref} className="text-2xl text-center text-white mb-12">
              We believe the world needs <strong className="font-bold">a revolution in learning.</strong>
            </p>
            <p ref={paragraph3Ref} className="text-2xl text-center text-white mb-12">
              Where everyone has <strong className="font-bold">a fair shot.</strong>
            </p>
            <p ref={paragraph4Ref} className="text-2xl text-center text-white mb-12">
              Anyone can <strong className="font-bold">achieve greatness.</strong>
            </p>
            <p ref={paragraph5Ref} className="text-2xl text-center text-white mb-20">
              And that, no matter where you begin, you can...
            </p>
          </div>
        </div>

        <AppleCardsCarouselDemo />
      </section>
    </>
  );
};

const AppleCardsCarouselDemo = () => {
  const headingRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const headingElement = headingRef.current;
      gsap.set(headingElement, { opacity: 0, y: 50 });
      gsap.to(headingElement, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: headingElement,
          start: "top 70%",
          end: "top 50%",
          toggleActions: "play none none reverse"
        }
      });
    });

    return () => ctx.revert();
  }, []);

  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} layout={true} />
  ));

  return (
    <div id="about" className="relative z-10">
      <h2 ref={headingRef} className="max-w-7xl pl-4 flex flex-col justify-center items-center mx-auto mt-10 mb-7 text-center">
        <span className="text-5xl text-blue-200 font-semibold">
          Increase your MCAT score past 520+
        </span>
        <span className="text-2xl text-gray-300 mt-3 mb-6">
          with our first-of-its-kind tutoring software
        </span>
      </h2>

      <Carousel items={cards} />
    </div>
  );
};

const DummyContent = () => {
  const content = [
    {
      title: "No more worrying about when to study.",
      description: "Enter information about your schedule and we'll automatically plan your prep around your life.",
      videoSrc: "/landingpage/card1video1.mp4",
      videoAlt: "Kalypso calendar algorithm demonstration"
    },
    {
      title: "Personalized & adaptive study plans.",
      description: "Up until the day of your test, we'll create a personalized & flexible study plan that targets your weaknesses.",
      imageSrc: "/landingpage/card1image2.png",
      imageAlt: "Personalized study plan demonstration"
    },
    {
      title: "Accountability checks and progress reports.",
      description: "Kalypso will provide daily reports on your progress and pester you to hold you accountable.",
      imageSrc: "/landingpage/card1image3.png",
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
          {item.videoSrc ? (
            <video
              src={item.videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="md:w-full md:h-full h-full w-full mx-auto object-contain"
            >
              Your browser does not support the video tag.
            </video>
          ) : item.imageSrc ? (
            <Image
              src={item.imageSrc}
              alt={item.imageAlt || ""}
              height={700}
              width={700}
              className="md:w-full md:h-full h-full w-full mx-auto mt-3 object-contain"
            />
          ) : null}
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
      videoSrc: "/landingpage/card2video1.mp4",
      videoAlt: "Kalypso content integration demonstration"
    },
    {
      title: "Kalypso is an AI-powered superkitty that studies WITH you.",
      description: "Kalypso is trained on over 10,000 hours of MCAT data. He not only answers your questions, but ASKS you questions as you study. Oh, and he talks too!",
      videoSrc: "/landingpage/card2video2.mp4",
      videoAlt: "Interactive learning modules demonstration"
    },
    {
      title: "Cutting edge weakness algorithms designed by PhDs.",
      description: "We're constantly putting the most relevant content in front of you based on your responses to quizzes, flashcards, and tests. Study YOUR high yield.",
      imageSrc: "/landingpage/card2image3.png",
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
          {item.videoSrc ? (
            <video
              src={item.videoSrc}
              autoPlay={item.videoSrc !== "/landingpage/card2video2.mp4"}
              loop
              playsInline
              controls={item.videoSrc === "/landingpage/card2video2.mp4"}
              muted={item.videoSrc !== "/landingpage/card2video2.mp4"}
              className="md:w-full md:h-full h-full w-full mx-auto object-contain mt-6"
            >
              Your browser does not support the video tag.
            </video>
          ) : item.imageSrc ? (
            <Image
              src={item.imageSrc}
              alt={item.imageAlt || ""}
              height={700}
              width={700}
              className="md:w-full md:h-full h-full w-full mx-auto mt-3 object-contain"
            />
          ) : null}
        </div>
      ))}
    </>
  );
};

const DummyContent3 = () => {
  const content = [
    {
      title: "Better than UWorld.",
      description: "Practice questions are crafted entirely within AAMC logic and beta-tested thoroughly with top-scorers. Plus, they're fun reads.",
      videoSrc: "/landingpage/card3video1.mp4",
      videoAlt: "AAMC-style question example"
    },
    {
      title: "Supercharged review developed in beta testing with 524+ scorers.",
      description: "Our research has shown that the best learning is not a lecture, but a conversation. Kalypso will question your logic to improve critical thinking.",
      imageSrc: "/landingpage/card3image2a.png",
      imageAlt: "Kalypso-assisted review demonstration"
    },
    {
      title: "Data that works for you.",
      description: "Our testing suite suggests improvements to your approach using data on your timing, accuracy, and decision-making.",
      imageSrc: "/landingpage/card3image3.png",
      imageAlt: "Adaptive question selection visualization"
    }
  ];

  return (
    <>
      {content.map((item, index) => (
        <div key={`dummy-content3-${index}`} className="bg-black p-9 md:p-15 rounded-3xl mb-4">
          <p className="text-white text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-purple-400">{item.title}</span>{"   "}
            {item.description}
          </p>
          {item.videoSrc ? (
            <video
              src={item.videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="md:w-full md:h-full h-full w-full mx-auto mt-3 object-contain"
            >
              Your browser does not support the video tag.
            </video>
          ) : item.imageSrc ? (
            <Image
              src={item.imageSrc}
              alt={item.imageAlt || ""}
              height={700}
              width={700}
              className="md:w-full md:h-full h-full w-full mx-auto mt-3 object-contain"
            />
          ) : null}
        </div>
      ))}
    </>
  );
};

const data = [
  {
    category: "Advanced calendar algorithm.",
    title: "Your study should be planned around your life — not the other way around.",
    src: "/landingpage/landingpageaa.png",
    content: <DummyContent />,
  },
  {
    category: "State-of-the-art content.",
    title: "Tutoring software that personalizes Khan Academy, OpenStax, AAMC, and more.",
    src: "/landingpage/landingpagecarda.png",
    content: <DummyContent2 />,
  },
  {
    category: "High-quality practice.",
    title: "Developed by 132-scorers, written in AAMC logic, with Kalypso-assisted review.",
    src: "/landingpage/landingcardc.png",
    content: <DummyContent3 />,
  },
];