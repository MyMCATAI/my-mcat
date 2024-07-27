'use client';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import test from '../../public/test.png';
import catoncouch from '../../public/catoncouch.png';
import cards from '../../public/cards.png';
import calender from '../../public/calendar.png';
import assistance from '../../public/assistance.png';

gsap.registerPlugin(ScrollTrigger);

const Methodology = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const itemRefs = useRef([]);
  const polygonRef = useRef(null);
  const catRef = useRef(null);
  const restEasyRef = useRef(null);

  const items = [
    { heading: 'Take a practice test.', text: 'in our testing suite that figures out what you know and don&apos;t know.', icon: test },
    { heading: 'Diagnose weaknesses.', text: 'with algorithms designed by a Princeton PhD.', icon: cards },
    { heading: 'Plan your prep.', text: 'Every day of your prep planned out in an adaptive schedule that syncs to your weaknesses & Google Calendar.', icon: calender },
    { heading: '24/7 tutoring assistance.', text: 'Kalypso is trained on 100+ hours worth of content (and helps you study!)', icon: assistance },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const itemElements = itemRefs.current;
    const polygon = polygonRef.current;
    const cat = catRef.current;
    const restEasy = restEasyRef.current;

    gsap.set([title, ...itemElements], { opacity: 0, y: 50 });
    gsap.set([polygon, cat], { opacity: 0, x: -50 });
    gsap.set(restEasy, { opacity: 0, x: 50 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 100%', // Start the animation earlier
        end: 'bottom 97%', // End the animation earlier
        scrub: 1,
      }
    });

    tl.to(title, { opacity: 1, y: 0, duration: 0.5 })
      .to(itemElements[0], { opacity: 1, y: 0, duration: 0.2 }, '+=0.1')
      .to(itemElements[1], { opacity: 1, y: 0, duration: 0.2 }, '+=0.1')
      .to(itemElements[2], { opacity: 1, y: 0, duration: 0.2 }, '+=0.1')
      .to(itemElements[3], { opacity: 1, y: 0, duration: 0.2 }, '-=0.1')
      .to([polygon, cat], { opacity: 1, x: 0, duration: 0.2 }, '-=0.2')
      .to(restEasy, { opacity: 1, x: 0, duration: 0.2 }, '-=0.2');

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <>
      <section className="bg-white pt-24 pb-32" id="methodology" ref={sectionRef}>
        <div className="container-fluid">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="mt-6 md:mt-0">
              <div className="polygon" ref={polygonRef}>
                {/* <p className='text-white' style={{ padding: "100px 30px" }}>Rest easy with us.</p> */}
              </div>
              <div className='mt-2 flex justify-center items-center' style={{ width: "80%" }}>
                <Image src={catoncouch} alt={"Image"} style={{ width: "80%", marginTop: "-160px", zIndex: "1" }} ref={catRef} />
              </div>
            </div>
            <div className="text-center mx-4 mt-10">
              <h1 className="text-3xl md:text-[38px] font-bold text-[#007AFF] mb-6" ref={titleRef}>
                Our methodology
              </h1>
              <ul className="grid grid-cols-1 gap-4">
                {items.map((item, index) => (
                  <li key={index} className='flex' ref={el => itemRefs.current[index] = el}>
                    <div style={{ minWidth: '100px', minHeight: '100px' }}>
                      <Image src={item.icon} alt={item.text} width={100} height={100} />
                    </div>
                    <div className='text-left pt-2 ps-3'>
                      <div>
                        <h3 className='text-xl' style={{ color: "#0E2247", fontWeight: 600 }}>{item.heading}</h3>
                      </div>
                      <div className='text-md'>
                        {item.text}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className='text-center doublediv mt-6 bg-[#0E2247] mx-3 p-6 text-lg' ref={restEasyRef} style={{ marginTop: '5rem', transform: 'translateX(+2rem)', width: '78%' }}>
                <p className='text-white'>
                  Rest easy. You're with the best of the best.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Methodology;