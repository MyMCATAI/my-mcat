import Image from 'next/image'
import React from 'react'
import test from '../../public/test.png';
import catoncouch from "../../public/catoncouch.png"
import cards from "../../public/cards.png"
import calender from "../../public/calendar.png"
import assistance from "../../public/assistance.png"
const Methodology = () => {
    const items = [
        { heading: "Take a practice test.", text: 'in our testing suite that figures out what you know and don’t know.', icon: test },
        { heading: "Diagnose weaknesses.", text: `with algorithms designed by a Princeton PhD.`, icon: cards },
        { heading: "Plan your prep.", text: `Every day of your prep planned out in an adaptive schedule that syncs to your weaknesses & Google Calendar.`, icon: calender },
        { heading: "24/7 tutoring assistance.", text: `Kalypso is trained on 100+ hours worth of content (and helps you study!)`, icon: assistance },
    ];

    return (
        <>
            <section className="bg-white py-16" id='methodology'>
                <div className="container-fluid">
                    <div className="grid grid-cols-1 md:grid-cols-2 ">
                        <div className=" mt-6 md:mt-0">
                            <div className="polygon mt-2">

                                <p className='text-white' style={{ padding: "100px 30px" }}>Rest easy with us.</p>

                            </div>
                            <div className='mt-2 flex justify-center items-center' style={{ width: "80%" }}>
                                <Image src={catoncouch} alt={"Image"} style={{ width: "80%", marginTop: "-160px", zIndex: "1" }} />
                            </div>
                        </div>
                        <div className="text-center mx-4">
                            <h1 className="text-3xl md:text-[38px] font-bold text-[#007AFF] mb-6">
                                Our methodology
                            </h1>
                            <ul className="grid grid-cols-1 gap-4">
                                {items.map((item, index) => (
                                    <li key={index} className='flex'>
                                        <div   style={{ minWidth: '100px', minHeight: '100px' }}>
                                            <Image src={item.icon} alt={item.text}  width={100} height={100}  />
                                        </div>
                                        <div className='text-left pt-2 ps-3'>
                                            <div>
                                                <h3 className='text-xl' style={{ color: "#0E2247", fontWeight: 600 }}>{item.heading}</h3>
                                            </div>
                                            <div className='text-md'>
                                                {item.text}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                           
                           

                            <div className='text-left doublediv mt-3 bg-[#0E2247] mx-3' >
                                <p className='p-3 text-white'>In alpha and beta, we’ve seen an average of 14 points of

                                    increase -- with exceptional students going from 490 to 520.
                                </p>
                            </div>
                         
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Methodology;
