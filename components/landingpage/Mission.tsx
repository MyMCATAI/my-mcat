'use client';

import React, { useEffect, useRef, useState } from 'react';
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
import TutorSlider from './TutorSlider';

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
  const [playingStates, setPlayingStates] = useState<{ [key: string]: boolean }>({});

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

  const testimonials = [
    {
      name: 'Kaya',
      videoUrl: 'https://my-mcat.s3.us-east-2.amazonaws.com/studyverse/Kaya.mov',
      points: '+13',
      review: 'Kaya was such a cool student. She has the lovely, bubbly personality that was lost in those large Kaplan classes, but at home right here at MyMCAT <3'
    },
    {
      name: 'Sanjay',
      videoUrl: 'https://my-mcat.s3.us-east-2.amazonaws.com/studyverse/Sanjay.mov',
      points: '+16',
      review: 'Sanjayyyy. He started at such a low score, 497, but fought so hard to get a great score on his actual MCAT! I wish he was going to vet school instead!'
    },
    {
      name: 'Eni',
      videoUrl: 'https://my-mcat.s3.us-east-2.amazonaws.com/studyverse/Eni.mov',
      points: '+21',
      review: 'Eni has a face that makes you smile. He started at a 492, lost, confused, and then with a little bit of guidance he was a star. You earned that 513 buddy!'
    }
  ];

  const handlePlay = (name: string) => {
    setPlayingStates(prev => ({ ...prev, [name]: true }));
  };

  const handlePause = (name: string) => {
    setPlayingStates(prev => ({ ...prev, [name]: false }));
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
          {/* PSA from Kalypso - Moved to top */}
          <div className="mb-16">
            <h2 
              className="text-4xl font-bold text-white text-center mb-6 font-krungthep"
            >
              {"A Tutor Over Your Shoulder"}
            </h2>
            <div className="text-white text-2xl leading-relaxed mb-16">
              <p className="mb-4">
                {"Hi, I'm Kalypso! I'm your dedicated MCAT study companion, here to help you "}<span className="text-green-400">STUDY LESS</span>{" and "}<span className="text-green-400">SCORE HIGHER</span>{"."}
              </p>
              
              <p className="mb-4">
                {"MyMCAT.ai is your complete studyverse—intelligently planning your schedule and curating the best free resources online. But I'm what makes it perfect for you. I track what you know and what you don't, constantly adjusting your study plan to focus on your weak spots."}
              </p>
              
              <p className="mb-4">
                {"When you're avoiding organic chemistry, I notice. When you're excelling at biochem but struggling with physics passages, I identify that pattern and shift your plan accordingly. When you have a tutor, I provide them with precise insights about your areas of improvement (no more guessing about your problem areas!)."}
              </p>
              
              <p className="mb-4">
                <span className="font-semibold">{"Because the difference between a good score and a great score isn't more hours—it's smarter hours."}</span>
              </p>
              
              <p className="mb-8">
                {"I integrate trusted resources like Anki, UWorld, and AAMC materials, building a personalized schedule that adapts as you improve. If you're struggling with specific concepts, I'll surface the right videos, readings, targeted UWorld questions, and prioritized Anki flashcards exactly when you need them."}
              </p>
              
              <p className="mb-4">
                <span className="text-green-400 text-4xl font-semibold">{"LET'S GET THIS MED!"}</span>
              </p>
            </div>
          </div>

          {/* Video Testimonials Section */}
          <section className="py-16 relative mb-8">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-[#011528] rounded-2xl p-6 shadow-lg transform transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl font-semibold text-white">{testimonial.name}</h3>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="relative aspect-[9/16] mb-4 rounded-xl overflow-hidden group">
                    <video
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      onPlay={() => handlePlay(testimonial.name)}
                      onPause={() => handlePause(testimonial.name)}
                      onEnded={() => handlePause(testimonial.name)}
                    >
                      <source src={testimonial.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    {!playingStates[testimonial.name] && (
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300 pointer-events-none flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <svg className="w-8 h-8 text-[#011528] ml-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-green-400 mb-4">{testimonial.points} points</p>
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-white/80 italic text-sm">
                      &quot;{testimonial.review}&quot;
                    </p>
                    <p className="text-green-400 text-sm mt-2">- Kalypso</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Our Tutors Section */}
          <section 
            className="py-16 relative mb-8"
            style={{
              position: 'relative',
              zIndex: 2
            }}
          >
            <div className="container mx-auto px-4">
              <TutorSlider />
              
              {/* Consultation Button */}
              <div className="flex justify-center mt-8 mb-16">
                <a 
                  href="/pricing"
                  className="inline-flex items-center bg-[#23b961] text-white py-3 px-8 rounded-full text-xl font-semibold transition duration-300 hover:bg-[#1a8d4a] hover:-translate-y-1 shadow-lg"
                >
                  Book a Consultation
                </a>
              </div>

              {/* Information Cards */}
              <div className="border-t border-white/10 pt-8">
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
        </div>
      </section>

      {/* FAP Card - Moved between Discord testimonials and Problems/Solutions */}
      <div className="bg-[#00101e] py-16 relative">
        <div className="container mx-auto px-4">
          <div className="mb-16 bg-[#011528] rounded-xl overflow-hidden shadow-lg max-w-4xl mx-auto" style={{ boxShadow: '0 0 20px rgba(35, 185, 97, 0.3)' }}>
            <div className="p-8 relative">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-green-500/20 to-transparent rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-radial from-blue-500/10 to-transparent rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
              
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-green-400 text-center mb-6 font-krungthep">
                  {"Hard-work = Medical School"}
                </h2>
                
                <div className="text-white text-xl md:text-2xl leading-relaxed mb-8 text-center max-w-4xl mx-auto">                  
                  <div className="bg-gradient-to-r from-[#292a58]/30 to-[#23b961]/30 p-6 rounded-lg mb-6">
                    <p>
                      {"We use a micro-transaction coin system that rewards you for consistency and correctness. You can use our entire software without paying a dime! And if you're slacking off, win-win! Our goal is to get really good doctors into medical school."}
                    </p>
                  </div>
                  
                  <p className="mb-4">
                    {"Alway be incentivized to study."}
                  </p>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <a 
                    href="/sign-up" 
                    className="bg-gradient-to-r from-[#23b961] to-[#1a8d4a] text-white px-8 py-4 rounded-full text-xl font-semibold transition duration-300 hover:from-[#1a8d4a] hover:to-[#23b961] hover:-translate-y-1 shadow-lg flex items-center"
                  >
                    Start for Free
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {/* Coin System Explanation Modal */}
      <div 
        id="coin-system-modal" 
        className="fixed inset-0 bg-black/80 z-50 hidden flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            const modal = document.getElementById('coin-system-modal');
            if (modal) modal.classList.add('hidden');
          }
        }}
      >
        <div className="bg-[#011528] rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
          <button 
            className="absolute top-4 right-4 text-white hover:text-green-400 text-2xl"
            onClick={() => {
              const modal = document.getElementById('coin-system-modal');
              if (modal) modal.classList.add('hidden');
            }}
          >
            ×
          </button>
          <h3 className="text-2xl font-bold text-green-400 mb-4 font-krungthep">The Genius Coin System Explained</h3>
          <div className="aspect-video w-full mb-4">
            <video
              className="w-full h-full rounded-lg"
              controls
              autoPlay
              src="https://my-mcat.s3.us-east-2.amazonaws.com/public/coin-system-explanation.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-white text-lg mb-4">
            The Genius Coin System rewards consistent study habits and correct answers. Every coin you earn unlocks more content and features.
          </p>
          <div className="flex justify-end">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              onClick={() => {
                const modal = document.getElementById('coin-system-modal');
                if (modal) modal.classList.add('hidden');
              }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>

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