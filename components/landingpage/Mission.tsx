'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import dynamic from 'next/dynamic';
import { WorldProps } from '../ui/globe';

const World = dynamic(() => import('../ui/globe').then((mod) => mod.World), {
  ssr: false,
});

gsap.registerPlugin(ScrollTrigger);

// Add this near the top of your file, after the imports
declare global {
  interface Window {
    Tally: {
      openPopup: (formId: string, options?: any) => void;
    };
  }
}

const MethodologyAndTestimonials = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const polygonRef = useRef(null);
  const textBoxRef = useRef(null);

  const universityLogos = [
    '/landingpage/CornellLogo.png',
    '/landingpage/Princeton.png',
    '/landingpage/RiceLogo.png',
    '/landingpage/Tulane.png',
    '/landingpage/URichmond.png',
    '/landingpage/UTDallas.png',
  ];

  const pricingLogos = [
    { src: '/landingpage/BlueprintPricing.png', title: 'Blueprint' },
    { src: '/landingpage/KaplanPricing.png', title: 'Kaplan' },
    { src: '/landingpage/PrincetonReviewPricing.png', title: 'Princeton Review' },
    { src: '/landingpage/JackWestinPricing.png', title: 'Jack Westin' },
  ];

  const globeConfig: WorldProps['globeConfig'] = {
    pointSize: 1,
    globeColor: 'black',
    showAtmosphere: true,
    atmosphereColor: '#23b961',
    atmosphereAltitude: 0.2,
    emissive: '#000000',
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: 'rgba(255,255,255,0.7)',
    ambientLight: '#ffffff',
    directionalLeftLight: '#ffffff',
    directionalTopLight: '#ffffff',
    pointLight: '#ffffff',
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    autoRotate: true,
    autoRotateSpeed: 1,
  };

  const globeData: WorldProps['data'] = [
    {
      order: 1,
      startLat: 40.7128,
      startLng: -74.0060,
      endLat: 51.5074,
      endLng: -0.1278,
      arcAlt: 0.3,
      color: '#ff0000',
    },
    // Add more data points as needed
  ];

  const productFeatures = [
    {
      title: "Comprehensive Hint System & Vocabulary Builder",
      description: ["For students who need a tiny nudge, you can press ", "hint", " to reveal questions that you got wrong. For ", "vocabulary", " you can use cmd+i and it defines a word for you and sends it to your vocab bank."],
      videoSrc: "https://my-mcat.s3.us-east-2.amazonaws.com/public/hintandvocab.mp4",
    },
    {
      title: "Tutoring Assistant Programmed By a 132-Scorer",
      description: [
        `Real-time AI that you can talk to that helps you discern between answers and review your tests. It learns from you and `,
        `adapts your strategy`,
        ` to what's most effective for you! `,
        `Press play`,
        ` on the video!`,
      ],
      videoSrc: "https://my-mcat.s3.us-east-2.amazonaws.com/public/aitutoringreview.mp4",
    },
    {
      title: "Competition & Reward System",
      description: ["Engage in friendly competition with peers and earn cupcakes that allow you to ", "fight for your school's ranking", " in The League, a competitive leaderboard for every school that has students enrolled in our program."],
      videoSrc: "https://my-mcat.s3.us-east-2.amazonaws.com/public/competitionrewards.mp4",
    },
  ];

  const openTallyPopup = () => {
    if (typeof window !== 'undefined' && window.Tally) {
      window.Tally.openPopup('31vBY4', {
        layout: 'modal',
        width: 700,
        autoClose: 5000,
        hideTitle: true,
      });
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    const textBox = textBoxRef.current;

    gsap.set(textBox, { opacity: 0, y: 50 });

    // TextBox animation
    gsap.to(textBox, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      scrollTrigger: {
        trigger: section,
        start: 'top 100%',
        end: 'bottom 97%',
        scrub: 1,
      }
    });

  }, []);

  return (
    <>
      <section 
        className="bg-[#000c1e] pt-32 pb-40 relative opacity-90 overflow-hidden" 
        id="methodology" 
        ref={sectionRef}
        style={{
          backgroundImage: "url('/stars.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-[#011528] opacity-100"></div>
        <div 
          className="polygon absolute top-0 left-0 right-0 h-[120%] bg-[#292a58] opacity-100" 
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)',
          }}
        ></div>
        <div className="container-fluid relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="mt-6 md:mt-0 relative">
              <div className='flex justify-center items-center relative' style={{ width: "100%", height: "600px" }}>
                <World globeConfig={globeConfig} data={globeData} />
              </div>
            </div>
            <div className="mx-4">
              <h1 className="text-4xl md:text-4xl font-bold text-green-500 text-left font-krungthep mb-6">
                A Public Benefit Corporation.
              </h1>
              <div className="mt-8 bg-black p-6 rounded-lg w-full md:w-auto lg:mr-[8vw] xl:mr-[12vw]" style={{ boxShadow: '0px 0px 5px 0px rgba(35,185,97,255)' }} ref={textBoxRef}>
                <p className="text-white text-lg mb-2">
                  {"Unlike every test prep company, we are a PBC. That means that we are legally required to benefit society and do so proudly. As long as test prep is unaffordable, our healthcare system will continue to be stratified with rich doctors serving mostly rich communities. And, so long as test prep is boring, students will be diiscouraged to try and break this paradigm."}
                </p>
                <p className="text-white text-lg mb-2">
                  {"Because test prep is expensive and boring, we proudly proclaim ourselves as 'anti test prep': affordable and engaging. We're releasing our CARs suite first so you can get a head start and compete with peers nationwide for recognition and rewards."}
                </p>
                <p className="text-white text-lg mb-2">
                  {"Our first beta results speak volumes: students averaged a 516, with a remarkable 15-point improvement — significantly outperforming traditional methods at a fraction of the cost."}
                </p>
                <p className="text-white text-lg mb-2">
                  {"Most companies want you to believe that you can purchase success. We firmly believe it's earned."}
                </p>
                <p className="text-white text-lg mb-6">
                  <strong>{"Let us empower you to earn the score of your dreams."}</strong>
                </p>
                <div className="flex justify-center space-x-4">
                  <button 
                    onClick={openTallyPopup}
                    className="inline-block bg-[#091f33] text-white border border-green-400 py-2 px-6 rounded-full text-lg font-semibold transition duration-300 hover:bg-white hover:text-black"
                  >
                    Register for Early Access
                  </button>
                  <a 
                    href="https://www.law.cornell.edu/wex/public_benefit_corporation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#091f33] text-white border border-green-400 py-2 px-6 rounded-full text-lg font-semibold transition duration-300 hover:bg-white hover:text-black"
                  >
                    Learn More About PBCs
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New "How Our Product Works" Section */}
      <section className="bg-[#00101e] py-8 relative" id="how-it-works">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-white text-center mb-16 font-krungthep">
            The Daily CARs Suite
          </h2>
          <div className="flex justify-center mb-24">
            <Image src="/softwarehomepage.png" alt="Software Homepage" width={800} height={450} className="rounded-lg shadow-lg" />
          </div>
          <ul className="text-white text-xl mb-32 list-none pl-0 max-w-2xl mx-auto font-krungthep space-y-8">
            <li className="mb-4 flex items-start">
              <span className="text-green-500 mr-2">1.</span>
              <span className="lowercase">stats monitored by your friend Kalypso</span>
            </li>
            <li className="mb-4 flex items-start">
              <span className="text-green-500 mr-2">2.</span>
              <span className="lowercase">cars passage in our adaptive testing suite</span>
            </li>
            <li className="mb-4 flex items-start">
              <span className="text-green-500 mr-2">3.</span>
              <span className="lowercase">previous and upcoming exams</span>
            </li>
            <li className="mb-4 flex items-start">
              <span className="text-green-500 mr-2">4.</span>
              <span className="lowercase">button to switch to content learning suite (beta testers @ rice and princeton only for now)</span>
            </li>
            <li className="mb-4 flex items-start">
              <span className="text-green-500 mr-2">5.</span>
              <span className="lowercase">personalized videos and a lens into the premed forum</span>
            </li>
          </ul>
          {productFeatures.map((feature, index) => (
            <div key={index} className={`flex flex-col md:flex-row items-center mb-40 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                <h3 className="text-3xl font-semibold text-green-500 mb-4 font-krungthep">{feature.title}</h3>
                <p className="text-white text-xl mb-6">
                  {feature.description.map((text, index) => 
                    index % 2 === 0 ? text : <span key={index} className="text-red-500">{text}</span>
                  )}
                </p>
              </div>
              <div className="w-full md:w-1/2 mt-8 md:mt-0">
                <video
                  className="w-full rounded-lg shadow-lg"
                  autoPlay={index !== 1}
                  muted={index !== 1}
                  loop={index !== 1}
                  playsInline
                  controls={index === 1}
                 //  poster={`/video-thumbnails/${feature.title.toLowerCase().replace(/ /g, '-')}.jpg`}
                >
                  <source src={feature.videoSrc} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Product Feature Section */}
      <section className="bg-[#00101e] py-8 relative" id="hardcore-gaming">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-green-500 text-center mb-10 font-krungthep">
            Hardcore Gaming Meets Test Prep
          </h2>
          <p className="text-white text-2xl mb-10 text-center max-w-2xl mx-auto">
            Your performance in the suite directly leads to patient outcomes. Study for the MCAT and win coins to build and upgrade your clinic so you can treat patients, with motivating rewards and risks!
          </p>
          <div className="flex justify-center mb-24">
            <video
              className="w-full rounded-lg shadow-lg"
              autoPlay
              muted
              loop
              playsInline
              src="/landingpage/gamificationvideo.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Moved University Logo Swiper */}
      <section className="bg-[#00101e] py-8 relative">
        <div className='text-center bg-transparent mb-24 mx-auto p-3 text-lg' style={{ maxWidth: '80%' }}>
          <p className='text-white mb-16 font-krungthep text-3xl'>
            Universities Represented By Our Beta Testers:
          </p>
          <Swiper
            modules={[Autoplay]}
            spaceBetween={20}
            slidesPerView={2}
            loop={true}
            autoplay={{
              delay: 1000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            className="mt-4"
          >
            {universityLogos.map((logo, index) => (
              <SwiperSlide key={index} className="flex items-center justify-center h-[150px]">
                <Image src={logo} alt={`University logo ${index + 1}`} width={200} height={200} objectFit="contain" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* New Pricing Section */}
      <section 
        className="bg-[#11294e] pt-32 pb-40 relative" 
        id="pricing"
      >
        <div className="container-fluid relative z-10">
          <h2 className="text-4xl font-bold text-white text-center mb-24 font-krungthep">
            The Excessive Pricing of Test Prep Companies
          </h2>
          <div className="max-w-4xl mx-auto mb-32">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              autoplay={{
                delay: 6000,
                disableOnInteraction: false,
              }}
              pagination={{ clickable: true }}
              className="mb-16"
              style={{ height: '40rem' }}
            >
              {pricingLogos.map((logo, index) => (
                <SwiperSlide key={index}>
                  <div className="flex flex-col items-center h-full">
                    <h3 className="text-3xl font-semibold text-red-500 mb-6">{logo.title}</h3>
                    <div className="flex-grow flex items-center">
                      <Image src={logo.src} alt={`${logo.title} Pricing`} width={800} height={1200} objectFit="contain" style={{ maxHeight: '100%', width: 'auto' }} />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="mt-32 text-center">
            <h3 className="text-3xl font-semibold text-white mb-24 font-krungthep">
              Our pricing, as the ONLY software solution in MCAT Prep:
            </h3>
            <p className="text-green-400 text-6xl font-bold mb-4">
              $0/mo
            </p>
            <p className="text-white text-3xl mb-16">
              w/ rate limits
            </p>
            <p className="text-green-400 text-6xl font-bold mb-4">
              $24.99/mo
            </p>
            <p className="text-white text-3xl mb-16">
              w/ unlimited access
            </p>
            <p className="text-white font-krungthep text-2xl mt-16">
              We remain committed to a better product for a lower cost.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default MethodologyAndTestimonials;
