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
        { heading: "Data-Driven Strategy Insights", text: "We study your performance and provide insights to inform your strategy — such as 'you perform better when you highlight more.'", icon: icon },
        { heading: "Content Learning Suite", text: `We're beta-testing this feature at Rice and Princeton: learning Chemistry, Physics, Biology, and Psychology content.`, icon: icon },
        { heading: "Flashcard Integration", text: `Anki is boring. We plan on integrating flashcards seamlessly with content and prep — and making it FUN!`, icon: icon },
        { heading: "Practice Tests & Section Based Practice", text: `Our first practice test is being ruthelessly tested and modified to keep up with the AAMC's changing guidelines`, icon: icon },
        { heading: "Cupcake Ecosystem", text: 'We are serious about making learning fun and plan on a cupcake ecosystem with competitve learning challenges and rewards.', icon: icon },
        { heading: "An Interactive Polyverse", text: `This is a secret initiative that we're testing out but it's an entirely new way to interact with learning software. Shhh.`, icon: icon },
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
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 font-krungthep">
                        Features On The Way
                    </h1>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {items.map((item, index) => (
                        <li key={index} className='flex gap-4 my-4' ref={(el) => setItemRef(el, index)}>
                            <div className='mt-2 flex justify-center items-center' style={{ minWidth: '24px', minHeight: '24px' }}>
                                <Image src={item.icon} alt={item.text} className='w-full invert' />
                            </div>
                            <div>
                                <div>
                                    <h3 className="text-blue-300 text-xl font-semibold font-krungthep">{item.heading}</h3>
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