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

  const productFeatures = [
    {
      title: "Comprehensive Hint System & Vocabulary Builder",
      description: ["For students who need a tiny nudge, you can press ", "hint", " to reveal questions that you got wrong. For ", "vocabulary", " you can use cmd+i and it defines a word for you and sends it to your vocab bank."],
      videoSrc: "/landingpage/hintandvocab.mp4",
    },
    {
      title: "Tutoring Assistant Programmed By a 132-Scorer",
      description: ["Real-time AI that you can talk to that helps you discern between answers and review your tests. It learns from you and ", "adapts your strategy", " to what&apos;s most effective for you! ", "Press play", " on the video!"],
      videoSrc: "/landingpage/aitutoringreview.mp4",
    },
    {
      title: "Competition & Reward System",
      description: ["Engage in friendly competition with peers and earn cupcakes that allow you to ", "fight for your school&apos;s ranking", " in The League, a competitive leaderboard for every school that has students enrolled in our program."],
      videoSrc: "/landingpage/competitionrewards.mp4",
    },
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
              <h1 className="text-5xl md:text-5xl font-bold text-green-500 text-left font-krungthep mb-12">
                A mission-oriented social business.
              </h1>
              <div className="mt-16 bg-black p-8 rounded-lg w-full md:w-auto md:mr-[10em]" style={{ boxShadow: '0px 0px 5px 0px rgba(35,185,97,255)' }} ref={textBoxRef}>
                <p className="text-white text-xl mb-2">
                  Our founder, Prynce, worked at a majority of the test prep companies in the MCAT space. He saw firsthand how these test prep companies have failed students by overpromising and underdelivering. They use slick advertising and faulty promises to convince students to buy, but often abandon students to inexperienced tutors after the first check clears.
                </p>
                <p className="text-white text-xl mb-2">
                  There needs to be a better way.
                </p>
                <p className="text-white text-xl mb-2">
                  Our vision is to democraticize education, starting with MCAT prep, starting with CARs prep, by charging fair prices and reinvesting profits into our offerings so that students have the tools they need to succeed. It&apos;s our belief that you cannot buy a good score, but you can work for it. Let us help you work for it. The world needs better doctors. Our patients need better doctors. 
                </p>
                <p className="text-white text-xl font-semibold">
                  Let us help you become that very doctor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New "How Our Product Works" Section */}
      <section className="bg-[#020e1a] py-8 relative font-krungthep" id="how-it-works">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-white text-center mb-16">
            How Our Product Works
          </h2>
          <div className="flex justify-center mb-24">
            <Image src="/softwarehomepage.png" alt="Software Homepage" width={800} height={450} className="rounded-lg shadow-lg" />
          </div>
          <ul className="text-white text-xl mb-32 list-none pl-0 max-w-2xl mx-auto space-y-8">
            <li className="mb-4 flex items-start">
              <span className="text-green-500 mr-2">1.</span>
              <span className="lowercase">metrics on score, time taken, cupcakes earned, and tests reviewed — monitored by your friend, Kalypso </span>
            </li>
            <li className="mb-4 flex items-start">
              <span className="text-green-500 mr-2">2.</span>
              <span className="lowercase">the free daily cars passage, taken in our testing suite, that&apos;s adapted to your weaknesses and difficulty level</span>
            </li>
            <li className="mb-4 flex items-start">
              <span className="text-green-500 mr-2">3.</span>
              <span className="lowercase">a list of previous exams and upcoming exams that you can run through with kalypso</span>
            </li>
            <li className="mb-4 flex items-start">
              <span className="text-green-500 mr-2">4.</span>
              <span className="lowercase">switch between the content learning suite, schedule, and testing suite (closed to beta testers @ rice.edu and princeton.edu)</span>
            </li>
            <li className="mb-4 flex items-start">
              <span className="text-green-500 mr-2">5.</span>
              <span className="lowercase">videos curated for your weaknesses on rhetorical analysis/generalized cars strategy & insights from reddit, as well as the ability to see &quot;the league&quot;</span>
            </li>
          </ul>
          {productFeatures.map((feature, index) => (
            <div key={index} className={`flex flex-col md:flex-row items-center mb-40 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                <h3 className="text-3xl font-semibold text-green-500 mb-4">{feature.title}</h3>
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
                  poster={`/video-thumbnails/${feature.title.toLowerCase().replace(/ /g, '-')}.jpg`}
                >
                  <source src={feature.videoSrc} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Moved University Logo Swiper */}
      <section className="bg-[#00162a] py-8 relative">
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
        className="bg-[#020e1a] pt-32 pb-40 relative" 
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
              className="mb-16 h-[40rem]" // Set a fixed height using rem
            >
              {pricingLogos.map((logo, index) => (
                <SwiperSlide key={index} className="h-full">
                  <div className="flex flex-col items-center justify-center h-full">
                    <h3 className="text-3xl font-semibold text-red-500 mb-6">{logo.title}</h3>
                    <div className="relative w-full h-[80%]">
                      <Image 
                        src={logo.src} 
                        alt={`${logo.title} Pricing`} 
                        layout="fill" 
                        objectFit="contain" 
                      />
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
              $0
            </p>
            <p className="text-white text-3xl mb-16">
              with rate limits
            </p>
            <p className="text-green-400 text-6xl font-bold mb-4">
              $24.99
            </p>
            <p className="text-white text-3xl mb-16">
              a month for unlimited access
            </p>
            <p className="text-white text-2xl mt-16">
              We plan on adding more services over time, but remain committed to a better product for a lower cost.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default MethodologyAndTestimonials;