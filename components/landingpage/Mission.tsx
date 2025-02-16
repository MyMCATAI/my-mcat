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
import { FaDiscord } from 'react-icons/fa';

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
    { src: '/landingpage/JackWestinPricing.png', title: 'Wack Westin' },
    { src: '/landingpage/KaplanPricing.png', title: 'Kaplan' },
    { src: '/landingpage/PrincetonReviewPricing.png', title: 'Princeton Review' },
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
      title: "Smart Study Scheduling",
      description: ["Our AI calendar prevents burnout by spacing out your study sessions. It knows ", "when you're most likely to get tired and adjusts automatically", ""],
      videoSrc: "https://my-mcat.s3.us-east-2.amazonaws.com/public/Schedule.mp4",
      paperLink: "https://rdcu.be/d92N7",
      paperText: "Read about Distributed Practice & Retrieval-Based Learning →"
    },
    {
      title: "Finding & Fixing Weak Spots",
      description: [
        "Like a GPS for your MCAT prep, our system finds exactly where you're struggling and ", "creates a personalized path to improve those areas",
      ],
      videoSrc: "https://my-mcat.s3.us-east-2.amazonaws.com/public/ATS.mp4",
      paperLink: "https://www.sciencedirect.com/science/article/pii/S0377221720302526",
      paperText: "Explore Multi-Armed Bandits in Adaptive Learning Systems →"
    },
    {
      title: "CARS Section Mastery",
      description: ["Our CARS practice system starts at your level and gradually gets harder, ", "building your skills step by step like a video game", ""],
      videoSrc: "https://my-mcat.s3.us-east-2.amazonaws.com/public/CARsTracker.mp4",
      paperLink: "https://files.eric.ed.gov/fulltext/EJ1124247.pdf",
      paperText: "Research on Scaffolding in Reading Comprehension →"
    },
    {
      title: "Making Study Fun",
      description: ["We turn boring flashcards into an engaging game with points, rewards, and friendly competition. ", "Because studying doesn't have to feel like work"],
      videoSrc: "https://my-mcat.s3.us-east-2.amazonaws.com/public/competitionrewards.mp4",
      paperLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8596077/",
      paperText: "Study on Dopaminergic Learning Enhancement Through Gamification →"
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
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 
            className="text-4xl font-bold text-white text-center mb-6 font-krungthep"
          >
            Our Mission
          </h2>
          <div className="text-white text-2xl leading-relaxed mb-8">
            <p className="mb-4">
              MyMCAT.ai isn&apos;t just another test prep company — we&apos;re a research company obsessed with scientifically increasing MCAT scores.
            </p>
            <p className="mb-4">
              We started as a beta test at Rice University and Princeton, building a smarter way to study. Today, we&apos;ve scaled into a platform serving thousands, built on scientifically proven learning methods: <span className="text-green-400">gamification, the testing effect, spaced repetition, interleaving, metacognition, desirable difficulty, and active recall</span>.
            </p>
            <p className="mb-4">
              But we don&apos;t just use research—we conduct it. Our team runs internal data science studies to refine our methods, testing what actually works to improve MCAT scores. Every feature we build is backed by real student performance data.
            </p>
            <p className="mb-4">
              Our classes aren&apos;t like Kaplan&apos;s lecture halls—they&apos;re built like real medical school classrooms, with class sizes so small that we turn away nearly half of all applicants to maintain quality.
            </p>
            <p className="mb-4">
              Unlike corporate test prep companies, we&apos;re a Public Benefit Corporation (PBC)—meaning we prioritize student outcomes over profits. Because our goal is the same as medical schools:
            </p>
            <p className="text-green-400 text-3xl font-semibold text-center mt-8 mb-8">
              Educate the doctors that our patients deserve.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mt-16 px-8">
            <a 
              href="https://hpa.princeton.edu/news/free-early-access-program-mymcatai-software-designed-rice-student-increase-your-mcat-score"
              target="_blank"
              className="relative group overflow-hidden rounded-xl aspect-[4/3] transition-transform duration-300 hover:-translate-y-2"
            >
              <Image 
                src="/landingpage/PrincetonPage.jpg" 
                alt="Princeton" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-90 mix-blend-soft-light"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-white text-2xl font-bold mb-3">Featured on Princeton</h3>
                <p className="text-white/90 text-base">Read our founder&apos;s email in our early access program.</p>
              </div>
            </a>

            <a 
              href="/pitch"
              className="relative group overflow-hidden rounded-xl aspect-[4/3] transition-transform duration-300 hover:-translate-y-2"
            >
              <Image 
                src="/landingpage/OurMethodology.png" 
                alt="Our Methodology" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-90 mix-blend-soft-light"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-white text-2xl font-bold mb-3">Our Methodology</h3>
                <p className="text-white/90 text-base">Head to our page to read about how we systemize your prep.</p>
              </div>
            </a>

            <a 
              href="https://louisville.edu/ideastoaction/-/files/featured/halpern/25-principles.pdf"
              target="_blank"
              className="relative group overflow-hidden rounded-xl aspect-[4/3] transition-transform duration-300 hover:-translate-y-2"
            >
              <Image 
                src="/landingpage/drgraessar.png" 
                alt="Dr. Graesser" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-90 mix-blend-soft-light"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/30 to-black/10" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-white text-2xl font-bold mb-3">Research Foundation</h3>
                <p className="text-white/90 text-base">Read Dr. Art Graessar&apos;s paper on designing environments.</p>
              </div>
            </a>

            <a 
              href="https://en.wikipedia.org/wiki/Benefit_corporation"
              target="_blank"
              className="relative group overflow-hidden rounded-xl aspect-[4/3] transition-transform duration-300 hover:-translate-y-2"
            >
              <Image 
                src="/landingpage/Corporate.jpg" 
                alt="Public Benefit Corporation" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-90 mix-blend-soft-light"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-white text-2xl font-bold mb-3">Public Benefit Corporations</h3>
                <p className="text-white/90 text-base">Read about PBCs and how we&apos;re different than test prep companies.</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Discord Testimonials Section */}
      <section 
        className="bg-[#000c1e] pt-32 pb-40 relative opacity-90 overflow-hidden" 
        id="testimonials" 
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
          <h1 className="text-4xl md:text-4xl font-bold text-center font-krungthep mb-16 text-white">
            Discord Testimonials
          </h1>
          
          <div className="max-w-5xl mx-auto px-4">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              pagination={{ clickable: true }}
              className="mb-16"
            >
              {[4, 1, 2, 3, 5, 6].map((num) => (
                <SwiperSlide key={num} className="pb-12">
                  <div className="bg-[#00101e] rounded-lg p-8 shadow-lg" style={{ boxShadow: '0px 0px 15px 0px rgba(35,185,97,0.3)' }}>
                    <div className="flex justify-center mb-8">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <Image
                      src={`/landingpage/review${num}.png`}
                      alt={`Review ${num}`}
                      width={800}
                      height={400}
                      className="rounded-lg mx-auto mb-8"
                      style={{ maxHeight: '400px', width: 'auto', objectFit: 'contain' }}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            <div className="flex justify-center space-x-6 mt-12">
              <a 
                href="https://discord.gg/DcHWnEu8Xb"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-[#5865F2] text-white py-3 px-8 rounded-full text-xl font-semibold transition duration-300 hover:bg-[#4752C4] hover:-translate-y-1"
              >
                <FaDiscord className="mr-2 text-2xl" />
                Join Discord
              </a>
              <button 
                onClick={openTallyPopup}
                className="inline-flex items-center bg-[#23b961] text-white py-3 px-8 rounded-full text-xl font-semibold transition duration-300 hover:bg-[#1a8d4a] hover:-translate-y-1"
              >
                Register Now
              </button>
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
                <p className="text-white text-3xl mx-4 mb-6">
                  {feature.description.map((text, index) => 
                    index % 2 === 0 ? text : <span key={index} className="text-red-500">{text}</span>
                  )}
                </p>
                <a 
                  href={feature.paperLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-300 mx-4 text-lg"
                >
                  {feature.paperText} →
                </a>
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
            Bored of Anki?
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
              src="https://my-mcat.s3.us-east-2.amazonaws.com/public/GamePortion.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Moved University Logo Swiper */}
      <section className="bg-[#00101e] py-16 relative">
        <div className='text-center bg-transparent mb-32 mx-auto p-8 text-lg' style={{ maxWidth: '85%' }}>
          <p className='text-white mb-20 font-krungthep text-3xl'>
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
            className="mt-8"
          >
            {universityLogos.map((logo, index) => (
              <SwiperSlide key={index} className="flex items-center justify-center h-[180px]">
                <Image 
                  src={logo} 
                  alt={`University logo ${index + 1}`} 
                  width={200} 
                  height={200} 
                  className="object-contain opacity-85 hover:opacity-100 transition-opacity duration-300" 
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Pricing Section with Globe */}
      <section 
        className="bg-[#11294e] pt-32 pb-40 relative" 
        id="pricing"
      >
        <div className="container-fluid relative z-10">
          <h2 className="text-4xl font-bold text-white text-center font-krungthep">
            Mission-Driven Pricing
          </h2>

          {/* Globe Section - Reduced size and added proper spacing */}
          <div className="w-full max-w-[40rem] aspect-square mx-auto">
            <div className="relative w-full h-full">
              <World 
                globeConfig={{
                  ...globeConfig,
                  pointSize: 0.75, // Reduced point size
                  atmosphereAltitude: 0.15 // Reduced atmosphere size
                }} 
                data={globeData} 
              />
            </div>
          </div>
          
          <p className="text-white text-xl text-center max-w-2xl mx-auto mb-16">
            We charge less than the value we bring. Although we hire the best from all over the world and pay them a fair wage, we&apos;re committed to our mission of educating better doctors.
          </p>

          {/* Pricing Tiers - Now horizontal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
            {/* Basic Access */}
            <div className="text-center p-8 rounded-lg bg-[#0a1c36] hover:bg-[#0d2242] transition-all duration-300">
              <h3 className="text-white text-2xl mb-4">Basic Access</h3>
              <p className="text-green-400 text-5xl font-bold mb-4">Freemium</p>
              <p className="text-white/50 text-xl">Access to our Anki game.</p>
            </div>
            
            {/* Premium Access */}
            <div className="text-center p-8 rounded-lg bg-[#0a1c36] hover:bg-[#0d2242] transition-all duration-300">
              <h3 className="text-white text-2xl mb-4">Premium Access</h3>
              <p className="text-green-400 text-5xl font-bold mb-4">$150/mo</p>
              <p className="text-white/50 text-xl">Full platform access</p>
            </div>
            
            {/* VIP Classes */}
            <div className="text-center p-8 rounded-lg bg-[#0a1c36] hover:bg-[#0d2242] transition-all duration-300">
              <h3 className="text-white text-2xl mb-4">VIP Classes</h3>
              <p className="text-green-400 text-5xl font-bold mb-4">$3000-5000</p>
              <p className="text-white/50 text-xl">Elite instruction.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default MethodologyAndTestimonials;