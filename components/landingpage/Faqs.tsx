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
        { heading: "Why did you start this company?", text: 'Because our founder loves his students and wants to see them succeed, and thinks test prep companies are getting it wrong.', icon: icon },
        { heading: "Who are your founders?", text: `Prynce is a 523 scorer and our product architect, front end engineer, AI wizard, and CEO. Josh is CTO, a computer science and tech genius who makes this crap actually work. Both of them work together with the hopes of changing education for the better`, icon: icon },
        { heading: "If werewolves exist, then might there theoretically exist whenwolves?", text: `Bro, what?`, icon: icon },
        { heading: "What if I do not like your app and think it's mediocre product?", text: `No one on our team is allowed to have high self esteem. Therefore, we welcome ANY and ALL criticism and will pay you for the privilege. `, icon: icon },
        { heading: "How does Kalypso differ from ChatGPT?", text: 'Kalypso is trained on the MCAT with dozens of textbooks and fine-tuned over hundreds of hours. He is trained on the latest in ITS research and programmed to be interesting and engaging. Who doesn’t love cats?', icon: icon },
        { heading: "How can I trust that your content is good?", text: `Prynce has written content for multiple test prep companies. We actually listen to feedback and modify our content to make it as close to AAMC-level as possible.`, icon: icon },
        { heading: "I don't understand your financial model. Coins?", text: `Coins are an accountabiltiy measure. It's a way to track your progress and unlock features. The ideal student can unlock all features with 10 coins over time. The non-ideal student must buy coins.`, icon: icon },
        { heading: "What the heck is Studyverse?", text: `MyMCAT is a product offered by Studyverse. You are pilgrims for our future ambitions: a metaverse for studying for ALL students — from MCAT students to SAT students to college kids preparing for exams. Yes, we are that crazy.`, icon: icon },
    ];

    return (
        <section className='py-16' style={{ background: "#FAFAFA" }}>
            <div className="container mx-auto">
                <div className="text-center md:text-left mb-10">
                    <h1 className="text-3xl md:text-3xl font-[600] font-krungthep mb-4" style={{ color: "#0E2247" }}>
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
                                    stroke="#000000" // Change this to white
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
            </div>
        </section>
    );
};

export default Faqs;
