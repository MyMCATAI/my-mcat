'use client';
import React, { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { World, type WorldProps } from '../ui/globe';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

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
    const title = titleRef.current;
    const polygon = polygonRef.current;
    const textBox = textBoxRef.current;

    gsap.set([title, textBox], { opacity: 0, y: 50 });
    gsap.set(polygon, { opacity: 0, x: -50 });

    // Title animation
    gsap.to(title, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        end: 'bottom 20%',
        scrub: 1,
      }
    });

    // Polygon and textBox animations
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 100%',
        end: 'bottom 97%',
        scrub: 1,
      }
    });

    tl.to(polygon, { opacity: 1, x: 0, duration: 0.1 })
      .to(textBox, { opacity: 1, y: 0, duration: 0.3 }, '-=0.2');

    // Removed GSAP animation for the university logos carousel
  }, []);

  return (
    <>
      <section 
        className="bg-[#000c1e] pt-24 pb-32 relative opacity-90" 
        id="methodology" 
        ref={sectionRef}
        style={{
          backgroundImage: "url('/stars.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-[#011528] opacity-80"></div>
        <div 
          className="polygon absolute top-0 left-0 right-0 h-full bg-blue-200 opacity-20" 
          ref={polygonRef}
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)',
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
              <h1 className="text-5xl md:text-5xl font-bold text-green-500 text-left" ref={titleRef}>
                A mission-based social business.
              </h1>
              <div className="mt-12 bg-black p-5 rounded-lg mr-[10em]" style={{  boxShadow: '0px 0px 5px 0px rgba(35,185,97,255)' }} ref={textBoxRef}>
                <p className="text-white text-xl">
                  Make the world a smarter place. 
                </p>
                <p className="text-white text-xl mt-4">
                 We wrote that in our founding document, and it&apos;s something we believe to our core: that education is important, and that education desperately needs a revolution. For that reason, even over profit, we seek to build an organization that creates innovative solutions to improve education -- starting with medical education.
                </p>
                <p className="text-white text-xl mt-4">
                That means partnering with universities over investment firms. That means
                putting professors on our board rather than private equity leaders. It&apos;s not 
                just lip service either, it&apos;s a part of our policy:
                </p>
                <p className="text-white text-xl mt-4">
                For every five paying customers, we&apos;ll give one lower-income student free access. Email kalypso@mymcat.ai for more information.
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
              slidesPerView={4}
              loop={true}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
              }}
              className="mt-4"
            >
              {universityLogos.map((logo, index) => (
                <SwiperSlide key={index} className="flex items-center justify-center">
                  <Image src={logo} alt={`University logo ${index + 1}`} width={200} height={200} objectFit="contain" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
    </>
  );
}

export default MethodologyAndTestimonials;