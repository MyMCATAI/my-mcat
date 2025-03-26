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
import Link from 'next/link';

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

  const discordReviews = [
    '/landingpage/review4.png',
    '/landingpage/review1.png',
    '/landingpage/review2.png',
    '/landingpage/review3.png',
    '/landingpage/review5.png',
    '/landingpage/review6.png'
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
          {/* FAP Card */}
          <div className="mb-16 bg-[#011528] rounded-xl overflow-hidden shadow-lg" style={{ boxShadow: '0 0 20px rgba(35, 185, 97, 0.3)' }}>
            <div className="p-8 relative">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-green-500/20 to-transparent rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-radial from-blue-500/10 to-transparent rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
              
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-green-400 text-center mb-6 font-krungthep">
                  {"Commitment to Underserved"}
                </h2>
                
                <div className="text-white text-xl md:text-2xl leading-relaxed mb-8 text-center max-w-4xl mx-auto">                  
                  <div className="bg-gradient-to-r from-[#292a58]/30 to-[#23b961]/30 p-6 rounded-lg mb-6">
                    <p>
                      {"For all students on AAMC's Fee Assistance Program, we offer 6 months of free access to our most advanced technology ($800 value)."}
                    </p>
                  </div>
                  
                  <p className="mb-4">
                    {"Contact us with proof of your status for immediate approval."}
                  </p>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <a 
                    href="/sign-up" 
                    className="bg-gradient-to-r from-[#23b961] to-[#1a8d4a] text-white px-8 py-4 rounded-full text-xl font-semibold transition duration-300 hover:from-[#1a8d4a] hover:to-[#23b961] hover:-translate-y-1 shadow-lg flex items-center"
                  >
                    Register Now
                  </a>
                  <a 
                    href="mailto:Kalypso@mymcat.ai" 
                    className="bg-gradient-to-r from-[#292a58] to-[#1e2345] text-white px-8 py-4 rounded-full text-xl font-semibold transition duration-300 hover:from-[#1e2345] hover:to-[#292a58] hover:-translate-y-1 shadow-lg flex items-center"
                  >
                    Email Us
                  </a>
                </div>
              </div>
            </div>
          </div>

          <h2 
            className="text-4xl font-bold text-white text-center mb-6 font-krungthep"
          >
            {"A Message from Kalypso"}
          </h2>
          <div className="text-white text-2xl leading-relaxed mb-16">
            <p className="mb-4">
              {"Rita Charon wrote, "}
              <span className="italic">{"The effective practice of medicine requires narrative competence—that is, the ability to acknowledge, absorb, interpret, and act on the stories and plights of others."}</span>
            </p>
            
            <p className="mb-4">
              {"She was talking about doctors. But the same is true for MCAT prep."}
            </p>
            
            <p className="mb-4">
              {"Traditional prep tells you to sit through 700+ hours of videos, skim through textbooks, and brute-force practice questions. It divides learning into three rigid phases: content, practice, and testing."}
            </p>
            
            <p className="mb-4">
              <span className="font-semibold">{"But real learning doesn't work like that."}</span>
            </p>
            
            <p className="mb-4">
              {"Students absorb without retention. They drill questions without understanding. They take practice tests too late—only to realize they've been focusing on the wrong things the whole time."}
            </p>
            
            <p className="mb-4">
              <span className="font-semibold">{"My name is Kalypso, and I'm here to help change that."}</span>
            </p>
            
            <p className="mb-4">
              {"I don't just give you content. I understand you. I track your weaknesses, adjust your plan, and force you to engage. I integrate trusted resources like Anki, UWorld, and AAMC materials, building a personalized schedule that adapts as you improve. If you struggle with organic molecules, I won't let you ignore them. I'll surface videos, readings, targeted UWorld questions, and prioritized Anki flashcards exactly when you need them—not when it's too late."}
            </p>
            
            <p className="mb-4">
              <span className="font-semibold">{"Because real learning is active."}</span>
            </p>
            
            <p className="mb-8">
              {"And that's what medicine is, too. Empathy isn't just feeling for others; it's the act of understanding. Understanding your mistakes, your thinking, your growth. The world needs doctors who listen, who learn, who don't just memorize—but absorb."}
            </p>
            
            <p className="mb-4">
              <span className="text-green-400 text-4xl font-semibold">{"That's the kind of doctor we see in you."}</span>
            </p>
          </div>
          
          <div className="mt-16 pt-8 border-t border-white/10">
            {/* Information Cards with smoother transition */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
              <a 
                href="https://hpa.princeton.edu/news/free-early-access-program-mymcatai-software-designed-rice-student-increase-your-mcat-score"
                target="_blank"
                className="relative group overflow-hidden rounded-xl aspect-square transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
              >
                <Image 
                  src="/landingpage/PrincetonPage.jpg" 
                  alt="Princeton" 
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105 brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-green-400 text-lg font-bold mb-2">Featured on Princeton</h3>
                  <p className="text-white/90 text-sm">Read about our early access program</p>
                </div>
              </a>

              <a 
                href="/pricing"
                className="relative group overflow-hidden rounded-xl aspect-square transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
              >
                <Image 
                  src="/landingpage/OurMethodology.png" 
                  alt="Our Methodology" 
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105 brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-green-400 text-lg font-bold mb-2">Our Methodology</h3>
                  <p className="text-white/90 text-sm">How we systemize your prep</p>
                </div>
              </a>

              <a 
                href="https://louisville.edu/ideastoaction/-/files/featured/halpern/25-principles.pdf"
                target="_blank"
                className="relative group overflow-hidden rounded-xl aspect-square transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
              >
                <Image 
                  src="/landingpage/DrGraessar.png" 
                  alt="Dr. Graesser" 
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105 brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-green-400 text-lg font-bold mb-2">Research Foundation</h3>
                  <p className="text-white/90 text-sm">The science behind our methods</p>
                </div>
              </a>

              <a 
                href="https://en.wikipedia.org/wiki/Benefit_corporation"
                target="_blank"
                className="relative group overflow-hidden rounded-xl aspect-square transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
              >
                <Image 
                  src="/landingpage/Corporate.jpg" 
                  alt="Public Benefit Corporation" 
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105 brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-green-400 text-lg font-bold mb-2">Public Benefit Corp</h3>
                  <p className="text-white/90 text-sm">What does it mean to be mission based?</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Our Medical Students Section */}
      <section 
        className="py-20 relative"
        style={{
          background: `linear-gradient(#082041, #0a1a2f)`,
          position: 'relative',
          zIndex: 2
        }}
      >
        <div className="container mx-auto px-4">
          {/* TutorSlider component would be placed here */}
        </div>
      </section>

      {/* Discord Testimonials Section */}
      <section 
        className="bg-[#000c1e] py-32 relative opacity-90 overflow-hidden" 
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
            What Our Students Say
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
              {discordReviews.map((reviewPath, index) => (
                <SwiperSlide key={index} className="pb-12">
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
                      src={reviewPath}
                      alt={`Review ${index + 1}`}
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
            Universities Using Our Software
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
    </>
  );
}

export default MethodologyAndTestimonials;