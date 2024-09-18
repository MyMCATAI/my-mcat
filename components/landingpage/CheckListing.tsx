'use client';
import React, { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import icon from '../../public/checkicon.png';

gsap.registerPlugin(ScrollTrigger);

const CheckListing = () => {
    const sectionRef = useRef(null);
    const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

    const items = [
        { heading: "Data-Driven Strategy Insights", text: "Collect data on your lowest performing and highest performing sessions to inform your strategy", icon: icon },
        { heading: "Content Learning Suite", text: `We're beta-testing this feature at Rice and Princeton, a way to learn content directed at your weaknesses.`, icon: icon },
        { heading: "Flashcard Integration", text: `Anki is boring and sucks. We plan on integrating flashcards seamlessly with content and prep.`, icon: icon },
        { heading: "Practice Tests & Section Based Practice", text: `Our first practice test is being ruthelessly tested and modified to keep up with the AAMC's changing guidelines`, icon: icon },
        { heading: "Cupcake Ecosystem Marketplace", text: 'We are serious about making learning fun and plan on cupcakes being a currency to incentivize learning.', icon: icon },
        { heading: "Friends of Kalypso", text: `Although our software handles tutoring, we plan on integrating human tutors for subjects you just can't seem to crack.`, icon: icon },
    ];

    const setItemRef = useCallback((el: HTMLLIElement | null, index: number) => {
        itemRefs.current[index] = el;
    }, []);

    useEffect(() => {
        const section = sectionRef.current;
        const itemElements = itemRefs.current;

        gsap.set(itemElements, { opacity: 0, y: 50 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top 90%',
                end: 'bottom 80%',
                scrub: 1,
            }
        });

        itemElements.forEach((item, index) => {
            if (item) {
                tl.to(item, { opacity: 1, y: 0, duration: 0.4 }, `+=${index * 0.2}`);
            }
        });

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <section className='bg-[#091f33] py-16' id='keypoints' ref={sectionRef}>
            <div className="container mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 font-['Krungthep']">
                        Features On The Way
                    </h1>
                    <p className="text-xl text-blue-300 mb-6">
                        We&apos;ve got you.
                    </p>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {items.map((item, index) => (
                        <li key={index} className='flex gap-4 my-4' ref={(el) => setItemRef(el, index)}>
                            <div className='mt-2 flex justify-center items-center' style={{ minWidth: '24px', minHeight: '24px' }}>
                                <Image src={item.icon} alt={item.text} className='w-full invert' />
                            </div>
                            <div>
                                <div>
                                    <h3 className='text-blue-300 text-xl font-semibold'>{item.heading}</h3>
                                </div>
                                <div className='text-sm md:text-md text-white'>
                                    {item.text}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default CheckListing;