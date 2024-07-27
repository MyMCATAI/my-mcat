"use client"
import React, { useState } from 'react';
import icon from '../../public/checkicon.png';

const Faqs = () => {
    const [expanded, setExpanded] = useState<number | null>(null);

    const toggleAccordion = (index:number) => {
        if (expanded === index) {
            setExpanded(null);
        } else {
            setExpanded(index);
        }
    };

    const items = [
        { heading: "How do you accomplish your mission?", text: 'Most nonprofits rely on donors, but we’re a business that uses our proceeds to fund low-income and underrepresented students. Every five paying customers means one approved student gets free access/support.', icon: icon },
        { heading: "Who are your founders?", text: `Shreyas is a 523 scorer and our architect, designer, and CEO. Josh is a computer science and AI wizard that helped bring Kalypso to life. Both of them work together with the hopes of changing education for the better`, icon: icon },
        { heading: "How can I get access to Kalypso?", text: `We’re launching later this year with our full product, but we’re also doing an early, limited release to get feedback.`, icon: icon },
        { heading: "Can I integrate Kalypso’s tutoring into my AAMC prep?", text: `We actually have a chrome extension that allows you to open the AAMC in an innovative browser and ask Kalypso questions. Isn’t that swell?`, icon: icon },
        { heading: "How does Kalypso differ from ChatGPT?", text: 'Kalypso is trained on the MCAT with dozens of textbooks and fine-tuned over hundreds of hours. Plus, they’re plucky and interesting. Who doesn’t love cats?', icon: icon },
        { heading: "What if I bought Kaplan, UWorld, AAMC?", text: `Good news. We strive to be the best resource so we integrate with what you have in our adaptive calendar so you can get the most out of the resources you already have.`, icon: icon },
        { heading: "Does Kalypso include practice questions and full practice tests?", text: `Yes! We include thousands of novel practic equations, flashcards, AAMC-level CARs passages, and a diagnostic test that’s the best in the industry. `, icon: icon },
        { heading: "Does Kalypso offer more than MCAT prep?", text: `We’re glad you asked. MCAT Prep is only the first step of our journey: we seek to personalize and gamify education for students from K-12 to college to graduate school. Sure, it’s a big dream. But everything great begins as a big dream. `, icon: icon },
    ];

    return (
        <section className='py-16' style={{ background: "#FAFAFA" }}>
            <div className="container mx-auto">
                <div className="text-center md:text-left mb-10">
                    <h1 className="text-3xl md:text-3xl font-[600] mb-4" style={{ color: "#0E2247" }}>
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
                                    <h3 className="text-lg font-[500] text-[#0E2247]">{item.heading}</h3>
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
                <div className="text-center md:text-left">
                    
              
                <button className=" bg-transparent text-[#0E2247] font-[600] py-3 text-md px-6 rounded-[60px] border-5 border-[#0E2247] mt-10" style={{ border: "2px solid #0E2247" }}>
                    EXPLORE ALL FAQs
                </button>
                </div>
            </div>
        </section>
    );
};

export default Faqs;
