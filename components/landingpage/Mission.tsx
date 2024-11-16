'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

declare global {
  interface Window {
    Tally: {
      openPopup: (formId: string, options?: any) => void;
    };
  }
}

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const MethodologyAndTestimonials = () => {
  const sectionRef = useRef(null);
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
    { src: '/landingpage/JackWestinPricing.png', title: 'Wack Westin' },
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
  ];

  const productFeatures = [
    {
      title: "Struggle with fitting MCAT prep into your busy life?",
      description: ["We created an adaptive calendar that automatically adjusts to your schedule so ", "you never have to worry about when to study", ""],
      videoSrc: "https://my-mcat.s3.us-east-2.amazonaws.com/public/Schedule.mp4",
    },
    {
      title: "Confused about where to begin?",
      description: [
        "All of the content you will ever need is curated in one place. Our intelligent superkitty Kalypso learns your weaknesses and assigns you only the most relevant content. ","Never worry about what to study next again!",
      ],
      videoSrc: "https://my-mcat.s3.us-east-2.amazonaws.com/public/ATS.mp4",
    },
    {
      title: "Lacking motivation to study?",
      description: ["We have a comprehensive accountability system that lets you win coins, get reminders, and compete with fellow students."," We WILL keep you on track!"],
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

  return (
    <>
      {/* Blog Post Section */}
      <section
        className="py-8 relative"
        id="blog-post"
        style={{
          background: `linear-gradient(#12233c, #082041 250%, #A74A67, #EDFC54)`,
          position: 'relative',
          zIndex: 2
        }}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-[#021629] rounded-2xl p-8 mb-12 shadow-lg">
            <h2 
              className="text-4xl font-bold text-white text-center mb-12 font-krungthep"
            >
              Most People Study Wrong.
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <p 
                  className="text-white text-3xl leading-relaxed mb-8"
                >
                  Studying for the MCAT, and studying as a whole, is <span className="text-green-400 font-semibold">a cyclic process.</span>
                </p>
                <p 
                  className="text-white text-3xl leading-relaxed mb-8"
                >
                  A common mistake is having a "content review" phase followed by a "practice" phase. This linear approach is ineffective.
                </p>
                <p 
                  className="text-white text-3xl leading-relaxed"
                >
                  Our methodology follows a proven cycle, modeled by the diagram to the right.
                </p>
              </div>
              <div
                className="relative"
              >
                <Image 
                  src="/landingpage/cyclehowtostudy.png" 
                  alt="Cycle How to Study" 
                  width={600} 
                  height={400} 
                  className="rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            
            <div className="bg-[#091f33] rounded-2xl p-8 mb-12">
              <p className="text-white text-3xl leading-relaxed mb-4">
                Our system functions like this:
              </p>
              <ul className="list-disc list-inside text-3xl space-y-4">
                <li className="text-green-400">Take a practice test to assess your knowledge</li>
                <li className="text-green-400">Assigns targeted content that you need</li>
                <li className="text-green-400">Provides focused practice until mastery</li>
                <li className="text-green-400">Reassess with more practice tests and repeat</li>
              </ul>
            </div>

            <div 
              className="text-center"
            >
              <a 
                href="/blog" 
                className="inline-block bg-transparent text-white border-2 border-white py-3 px-8 rounded-full text-xl font-semibold transition duration-300 hover:bg-white hover:text-[#091f33] transform hover:-translate-y-1"
              >
                Read the Science Behind Our Methodology
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Existing "A World Of Your Own" Section */}
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
              <div className='flex justify-center items-center relative aspect-square' style={{ width: "100%", maxHeight: "600px" }}>
                <World globeConfig={globeConfig} data={globeData} />
              </div>
            </div>
            <div className="mx-4">
              <h1 className="text-4xl md:text-4xl font-bold text-left font-krungthep mb-6">
                A World Of Your Own
              </h1>
              <div className="mt-8 bg-[#00101e] p-6 rounded-lg w-full md:w-auto lg:mr-[8vw] xl:mr-[12vw]" style={{ boxShadow: '0px 0px 5px 0px rgba(35,185,97,255)' }} ref={textBoxRef}>
                <div className="flex flex-col items-center">
                  <Image 
                    src="/landingpage/pile.png" 
                    alt="Resource pile" 
                    width={600} 
                    height={400} 
                    className="mb-6"
                  />
                  <p className="text-white text-xl">
                  Our software <strong>integrates with every essential resource </strong>so that your prep is highly organized and customized. Although we are not affiliated with any of the above organizations, we help you get the most out of them.
                  </p>
                  <div className="flex justify-center">
                    <button 
                      onClick={openTallyPopup}
                      className="inline-block bg-[#091f33] text-white border border-white py-2 px-6 rounded-full text-xl font-semibold transition duration-300 hover:bg-white hover:text-black mt-7"
                    >
                      Click here to register!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New "How Our Product Works" Section */}
      <section className="bg-[#00101e] py-8 relative" id="how-it-works">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-24 mt-12 font-krungthep">
            Your Problems & Our Solutions
          </h2>
          {productFeatures.map((feature, index) => (
            <div key={index} className={`flex flex-col md:flex-row items-center mb-32 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-10' : 'md:pl-10'}`}>
                <h3 className="text-4xl mx-4 font-semibold text-green-500 mb-10 font-krungthep">{feature.title}</h3>
                <p className="text-white text-3xl mx-4 mb-12">
                  {feature.description.map((text, index) => 
                    index % 2 === 0 ? text : <span key={index} className="text-red-500">{text}</span>
                  )}
                </p>
              </div>
              <div className="w-full md:w-1/2 mt-14 md:mt-0">
                <video
                  className="w-full rounded-lg shadow-lg"
                  autoPlay
                  muted
                  loop
                  playsInline
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
          <h2 className="text-4xl font-bold text-green-500 text-center mb-10 font-krungthep">
           Our MCAT prep is fun!
          </h2>
          <p className="text-white text-3xl mb-10 text-center max-w-3xl mx-auto">
            We made Anki flashcards a fun, addictive experience with cards, multiple choice questions, patient questions, and a clinic to run!
          </p>
          <div className="flex justify-center mb-24">
            <video
              className="w-full rounded-lg shadow-lg"
              autoPlay
              muted
              loop
              playsInline
              src="https://my-mcat.s3.us-east-2.amazonaws.com/public/GamificationVideo.mp4"
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
                    <h3 className="text-5xl font-bold text-red-500 mb-8 animate-pulse" style={{
                      textShadow: '0 0 8px rgba(255, 0, 0, 0.7), 0 0 5px rgba(255, 0, 0, 0.5)',
                    }}>
                      {logo.title}
                    </h3>
                    <div className="flex-grow flex items-center">
                      <Image src={logo.src} alt={`${logo.title} Pricing`} width={800} height={1200} objectFit="contain" style={{ maxHeight: '100%', width: 'auto' }} />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="mt-32 text-center">
            <h3 className="text-3xl font-semibold text-white mb-12 font-krungthep">
              Our pricing, as the ONLY software solution in MCAT Prep:
            </h3>
            <p className="text-green-400 text-6xl font-bold mb-4">
              $19.99
            </p>
            <p className="text-white text-3xl mb-16">
              for a 10 coin pack
            </p>
            <p className="text-green-400 text-6xl font-bold mb-4">
              $34.99
            </p>
            <p className="text-white text-3xl mb-16">
              for a 25 coin pack
            </p>
            <p className="text-white font-krungthep text-2xl mt-16">
              We use a microtransaction coin system that rewards consistency and punishes slacking.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default MethodologyAndTestimonials;