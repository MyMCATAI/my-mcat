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
        { heading: "What if I do not like your app and think it's mediocre product?", text: `No one on our team is allowed to have high self esteem. Therefore, we welcome ANY and ALL criticism — that way, we don't get too big headed. `, icon: icon },
        { heading: "How is this different from ChatGPT?", text: 'AI is a very small part of the experience of our platform. It is a tool woven throughout that forces critical thinking. The real value is the adaptive learning system, the research-backed software, the classes, and more.', icon: icon },
        { heading: "How can I trust that your content is good?", text: `We have models trained on good AAMC-type questions and passages. We have content validation systems in place. We actually listen to feedback and modify our content to make it as close to AAMC-level as possible.`, icon: icon },
        { heading: "Do I need to buy other resources?", text: `Yes, we recommend having UWorld and AAMC materials. We integrate with these resources to create a seamless study experience, but we don't replace them.`, icon: icon },
        { heading: "What makes your adaptive system special?", text: `Unlike other platforms that just track right/wrong answers, our system analyzes your response patterns, timing, and confidence levels to identify specific concept gaps and learning style preferences. This creates a truly personalized learning experience.`, icon: icon },
        { heading: "How long should I study with your platform?", text: `Most students see optimal results with 3-6 months of dedicated study time. However, our adaptive system adjusts to your pace and schedule, whether you're studying part-time or full-time.`, icon: icon },
        { heading: "What if I'm struggling with a specific section?", text: `Our platform identifies your weak areas and automatically adjusts your study plan, providing targeted practice and resources. Plus, you can always reach out to our community of tutors and fellow students for additional support.`, icon: icon },
        { heading: "How do you compare to other test prep companies?", text: `We're a public benefit corporation focused on making quality MCAT prep accessible. While other companies offer static courses, our adaptive platform evolves with you, providing personalized learning paths and active engagement tools.`, icon: icon },
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
