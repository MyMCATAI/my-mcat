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
        { heading: "Who are your founders?", text: `Prynce is a 523 scorer and our product architect, designer, and CEO. Josh is a computer science and AI wizard that helped bring Kalypso to life. Both of them work together with the hopes of changing education for the better`, icon: icon },
        { heading: "How can I get access to the full MyMCAT", text: `We’re doing limited releases at select universities and cannot accept new students at the moment; however, our software is constantly growing and improving.`, icon: icon },
        { heading: "Can I integrate MyMCAT’s tutoring into my AAMC and UWorld Prep?", text: `Yes, we're beta-testing an adaptive schedule that will plan your prep around your life. `, icon: icon },
        { heading: "How does Kalypso differ from ChatGPT?", text: 'Kalypso is trained on the MCAT with dozens of textbooks and fine-tuned over hundreds of hours. They’re trained on the latest in ITS research and programmed to be interesting and engaging. Who doesn’t love cats?', icon: icon },
        { heading: "How can I trust that your content is good?", text: `Because we're one of the few companies that admits that they don't know everything, and are constantly modifying our content based upon YOUR feedback to make it as close to AAMC-level as possible.`, icon: icon },
        { heading: "Is this really free? No strings attached?", text: `Yes, with caveats. A social business puts mission first over profit, but we still need to make a profit to hire good people and create great services. While we don't pursue profit for profit's sake, we do pursue profit to fund our mission.`, icon: icon },
        { heading: "Okay, is it MyMCAT or Cupcake?", text: `MyMCAT is a service we offer. Cupcake is our parent company. MCAT Prep is only the first step of our journey, but an important one. We hope to create an outstanding product with users whose data will inform our approach to medical education and beyond. `, icon: icon },
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
