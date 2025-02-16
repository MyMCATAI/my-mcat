'use client';
import React from 'react';
import Image from 'next/image';
import icon from '../../public/checkicon.png';
import { FaDiscord } from "react-icons/fa";

const CheckListing = () => {
    const items = [
        { 
            heading: "Community-Driven Learning", 
            text: "Join our thriving community of pre-med students. Study together in real-time, share resources, and get instant help from peers and tutors in our active Discord.", 
            icon: icon 
        },
        { 
            heading: "AI-Powered AAMC Analysis", 
            text: "Our advanced AI breaks down AAMC Full Lengths question-by-question, providing personalized insights and comparing your approach with top scorers.", 
            icon: icon 
        },
        { 
            heading: "Adaptive Learning System", 
            text: "Experience a learning algorithm that evolves with you. Get real-time feedback on your study strategy and personalized recommendations based on your performance.", 
            icon: icon 
        },
        { 
            heading: "Premium Practice Platform", 
            text: "Access our curated question bank designed by 520+ scorers, featuring AAMC-style passages and detailed explanations that surpass traditional resources.", 
            icon: icon 
        },
        { 
            heading: "Smart Progress Tracking", 
            text: "Monitor your improvement with our comprehensive analytics dashboard. Identify knowledge gaps and receive targeted study recommendations.", 
            icon: icon 
        },
        { 
            heading: "Continuous Innovation", 
            text: "Join a platform that's constantly evolving. We're dedicated to developing cutting-edge features based on user feedback and MCAT research.", 
            icon: icon 
        },
    ];

    return (
        <section className='bg-[#091f33] py-16 mb-12' id='keypoints'>
            <div className="container mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 font-krungthep">
                        Features
                    </h1>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {items.map((item, index) => (
                        <li key={index} className='flex gap-4 my-4'>
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

                {/* Updated sign-up section with centered Discord link */}
                <div className="mt-20 text-center">
                    <h2 className="text-5xl font-bold text-white mb-8 font-krungthep">
                        Join our Discord!
                    </h2>
                    <p className="text-blue-300 text-xl mb-12">
                        Geez, what are you waiting for?
                    </p>
                    <div className="flex justify-center">
                        <a 
                            href="https://discord.gg/DcHWnEu8Xb"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex flex-col items-center gap-4 bg-[#001226] rounded-xl px-16 py-8 hover:bg-[#0a1f33] transition-all duration-300"
                            style={{
                                boxShadow: '0 0 6px 2px rgba(0, 123, 255, 0.7), inset 0 2px 8px rgba(49, 49, 244, 0.8)',
                                minWidth: '20rem'
                            }}
                        >
                            <FaDiscord className="text-8xl text-[#5865F2] hover:text-[#4752C4] transition-all duration-300 hover:scale-110" />
                            <span className="text-white text-xl font-semibold hover:text-blue-300 transition-colors duration-300">
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CheckListing;