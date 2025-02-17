"use client"
import React, { useState } from 'react';
import icon from '../../public/checkicon.png';


// test
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
        { heading: "Why did you start this company?", text: 'Because we want students who work hard to also score well.', icon: icon },
        { heading: "Who are your founders?", text: `Prynce is a 523 scorer and our product architect, front end engineer, AI wizard, and CEO. Josh is CTO, a computer science and tech genius who brings dreams to life. Both of them work together with the hopes of changing medical education for the better`, icon: icon },
        { heading: "Who else is on your team?", text: `Dennis is a senior software engineer. Esther is a data scientist. Sophie and Armaan are software interns. Vivian is a medical student who cares deeply about our mission. We also have tutors and instructors.`, icon: icon },
        { heading: "What if I do not like your app and think it's mediocre product?", text: `No one on our team is allowed to have high self esteem. Therefore, we welcome ANY and ALL criticism — that way, we don't get too big headed. `, icon: icon },
        { heading: "How is this different from ChatGPT?", text: 'AI is a very small part of the experience of our platform. It is a tool woven throughout that forces critical thinking. The real value is the adaptive learning system, the research-backed software, the classes, and more..', icon: icon },
        { heading: "How can I trust that your content is good?", text: `We have models trained on good AAMC-type questions and passages. We have content validation systems in place. We actually listen to feedback and modify our content to make it as close to AAMC-level as possible.`, icon: icon },
        { heading: "I don't understand what coins are?", text: `Coins are an accountability measure and a fun way to track your progress. The ideal student can unlock all features with 10 coins over time. And, for students who need a little more help, or lack a certain accountability, it will cost more. This way, the most talented and hardest working members of our community are rewarded.`, icon: icon },
        { heading: "How do you compare to other test prep companies?", text: `MyMCAT is a premium product focused on delivering quality that has a very clear mission. We charge to pay people to help deliver our mission.`, icon: icon },
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
                                    <p 
                                        className="text-md text-gray-800"
                                        dangerouslySetInnerHTML={{ __html: item.text }}
                                    />
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
