"use client"
import React, { useState } from 'react';
import icon from '../../public/checkicon.png';

const Faqs = () => {
    const [expanded, setExpanded] = useState(null);

    const toggleAccordion = (index) => {
        if (expanded === index) {
            setExpanded(null);
        } else {
            setExpanded(index); // Expand if not expanded
        }
    };

    const items = [
        { heading: "We're experts", text: 'Just relax! Our study methodology is tried and tested by 520+ scorers.', icon: icon },
        { heading: "We work with your schedule", text: `Even if you're busy, we prioritize content for you to maximize your score by test day.`, icon: icon },
        { heading: "We know what's on the test", text: `You won't miss a thing. Our content is based on the AAMC's content categories.`, icon: icon },
        { heading: "We care about you", text: `You're more than just a checkbook-this process is stressful, and our team is here to provide empathetic and engaging support.`, icon: icon },
        { heading: "We know the best resources", text: 'Professionally curated content and resources from trusted sources like Khan Academy, UWorld, AAMC.', icon: icon },
        { heading: "We're just like you!", text: `Most test prep companies are staffed by people who haven't taken the test-but we're made by premeds for premeds.`, icon: icon },
    ];

    return (
        <section className='py-16' style={{ background: "#FAFAFA" }}>
            <div className="container mx-auto">
                <div className="text-center md:text-left mb-10">
                    <h1 className="text-3xl md:text-5xl font-semi-bold mb-4" style={{ color: "#0E2247" }}>
                        Frequently Asked Questions
                    </h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item, index) => (
                        <div key={index} className="overflow-hidden mb-2">
                            <button
                                className="flex items-center justify-between w-full px-4 py-2"
                                style={{ borderBottom: "2px solid #0E2247" }}
                                onClick={() => toggleAccordion(index)}
                            >
                                <div className="flex items-center">
                                    <h3 className="text-lg font-medium text-blue-900">{item.heading}</h3>
                                </div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-6 w-6 transition-transform transform ${expanded === index ? 'rotate-0' : 'rotate-0'}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d={expanded === index ? ' M6 12h12' : 'M18 12H6m6 6V6'}
                                    />
                                </svg>
                            </button>
                            {expanded === index && (
                                <div className="p-4 bg-gray-50">
                                    <p className="text-md text-gray-800">{item.text}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <button className="bg-transparent text-[#0E2247] py-3 text-md px-6 rounded-[20px] border border-[#0E2247] my-2" style={{ border: "2px solid #0E2247" }}>
                    EXPLORE ALL FAQs
                </button>
            </div>
        </section>
    );
};

export default Faqs;
