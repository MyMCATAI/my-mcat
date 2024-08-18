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
        { heading: "We&apos;re experts", text: 'Just relax! Our study methodology is tried and tested by 520+ scorers.', icon: icon },
        { heading: "We work with your schedule", text: `Even if you're busy, we prioritize content for you to maximize your score by test day.`, icon: icon },
        { heading: "We know what&apos;s on the test", text: `You won't miss a thing. Our content is based on the AAMC's content categories.`, icon: icon },
        { heading: "We&apos;re focused on impact above all else. ", text: `Students are our number one investment. We work for you and put you first above all else.`, icon: icon },
        { heading: "We know the best resources", text: 'Professionally curated content and resources from trusted sources like Khan Academy, UWorld, AAMC.', icon: icon },
        { heading: "We&apos;re just like you!", text: `Most test prep companies are staffed by people who haven't taken the test-but we're made by premeds for premeds.`, icon: icon },
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
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                        Don&apos;t worry, darling
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