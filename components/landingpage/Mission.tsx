'use client';
import React, { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { World, type WorldProps } from '../ui/globe';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

gsap.registerPlugin(ScrollTrigger);

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
        className="bg-[#000c1e] pt-24 pb-32 relative opacity-90 overflow-hidden" 
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
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="mt-6 md:mt-0 relative">
              <div className='flex justify-center items-center relative' style={{ width: "100%", height: "600px" }}>
                <World globeConfig={globeConfig} data={globeData} />
              </div>
            </div>
            <div className="mx-4 mt-6">
              <h1 className="text-5xl md:text-5xl font-bold text-green-500 text-left">
                A mission-based social business.
              </h1>
              <div className="mt-12 bg-black p-5 rounded-lg w-full md:w-auto md:mr-[10em]" style={{ boxShadow: '0px 0px 5px 0px rgba(35,185,97,255)' }} ref={textBoxRef}>
                <p className="text-white text-xl mb-4">
                  Test prep companies have failed to innovate. Kaplan&apos;s books haven&apos;t changed since 2015. Jack Westin and Blueprint rely on expensive and often inexperienced tutors, promising score increases that they often fail to deliver. They want you to believe you can buy a good score.
                </p>
                <p className="text-white text-xl mb-2">
                </p>
                <p className="text-white text-xl font-semibold mb-4">
                  But you can only work for it.
                </p>
                <p className="text-white text-xl mb-4">
                  At MyMCAT.ai, we&apos;re dedicated to helping students succeed through innovation and constant feedback. While we charge to stay healthy as an organization, all profits go toward improving our services so students can earn the score they deserve.
                </p>
                <p className="text-white text-xl mb-4">
                  As former premeds, we know firsthand how stressful and costly this process is. As current students, we know the value of a service that makes studying easy, effective, and engaging.
                </p>
                <p className="text-white text-xl italic mb-4">
                  For that reason, this vision guides every decision in our organization:
                </p>
                <p className="text-white text-2xl font-bold">
                  To make the world a smarter place.
                </p>
              </div>
            </div>
          </div>
          <div className='text-center mt-16 bg-transparent mx-auto p-6 text-lg' style={{ maxWidth: '80%' }}>
            <p className='text-white mb-24'>
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
        </div>
      </section>

      {/* New Pricing Section */}
      <section 
        className="bg-[#001226] pt-24 pb-32 relative" 
        id="pricing"
      >
        <div className="container-fluid relative z-10">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            The Excessive Pricing of Test Prep Companies
          </h2>
          <div className="max-w-4xl mx-auto">
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
            >
              {pricingLogos.map((logo, index) => (
                <SwiperSlide key={index}>
                  <div className="flex flex-col items-center">
                    <h3 className="text-3xl font-semibold text-red-500 mb-6">{logo.title}</h3>
                    <Image src={logo.src} alt={`${logo.title} Pricing`} width={800} height={1200} objectFit="contain" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="mt-24 text-center">
            <h3 className="text-3xl font-semibold text-white mb-8">
              Our pricing, as the ONLY software solution in MCAT Prep:
            </h3>
            <p className="text-green-400 text-6xl font-bold mb-6">
              $0 <span className="text-white text-4xl">with rate limits</span>
            </p>
            <p className="text-green-400 text-6xl font-bold mb-6">
              $24.99 <span className="text-white text-4xl">a month for unlimited access</span>
            </p>
            <p className="text-white text-xl mt-8">
              We plan on adding more services over time, but remain committed to a better product for a lower cost.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default MethodologyAndTestimonials;