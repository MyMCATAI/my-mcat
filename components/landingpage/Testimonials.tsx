"use client";
import React from "react";
import Image from "next/image";
import ali from "../../public/ali.jpg";
import arthur from "../../public/arthur.jpg";
import kyle from "../../public/kyle.png";
import yasmin from "../../public/jasmin.png";
import CountUp from "react-countup";
import StarRatings from "react-star-ratings";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Testimonials = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const paragraph1Ref = useRef(null);
  const paragraph2Ref = useRef(null);
  const paragraph3Ref = useRef(null);
  const paragraph4Ref = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const p1 = paragraph1Ref.current;
    const p2 = paragraph2Ref.current;
    const p3 = paragraph3Ref.current;
    const p4 = paragraph4Ref.current;
    const stats = statsRef.current;

    gsap.set([title, p1, p2, p3, p4, stats], { opacity: 0, y: 50 });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 50%",
        end: "bottom 10%",
        toggleActions: "play none none reverse",
      }
    });

    timeline
      .to(title, { opacity: 1, y: 0, duration: 0.3 })
      .to(p1, { opacity: 1, y: 0, duration: 0.3 }, "+=0.1")
      .to(p2, { opacity: 1, y: 0, duration: 0.3 }, "+=0.1")
      .to(p3, { opacity: 1, y: 0, duration: 0.3 }, "+=0.1")
      .to(p4, { opacity: 1, y: 0, duration: 0.3 }, "+=0.1")
      .to(stats, { opacity: 1, y: 0, duration: 0.9 }, "+=0.5");

    return () => {
      timeline.kill();
    };
  }, []);

  const testimonials = [
    {
      text: `I&apos;m gonna be real. I had no clue what I was doing. Kalypso got me from my middling
                  diagnostic to a 516 on my actual test, all within three months.`,
      name: "Yasmin Maurice",
      description: "516, Tulane",
      image: yasmin,
      rating: 5,
    },
    {
      text: `My first test was SO stressful and chaotic. I did poorly. On my retake, I needed a plan.
                  Kalypso developed one that got me a score I would&apos;ve never imagined possible.`,
      name: "Ali Nassari",
      description: "517, UT Austin",
      image: ali,
      rating: 5,
    },
    {
      text: `Kalypso created a personalized strategy to help me succeed, planning my days for me. On my
                  official retake, I scored a 518 — I owe much of that to him.
                `,
      name: "Kyle Peeples",
      description: "518, Tulane",
      image: kyle,
      rating: 5,
    },
    {
      text: `Brilliant, eager to help, hilarious, with an infectious energy that just inspired me to keep
                  pushing.
                  Couldn&apos;t recommend Kalypso more.`,
      name: `Arthur Cowan`,
      description: "519, SDSU",
      image: arthur,
      rating: 5,
    },
  ];

  return (
    <section ref={sectionRef} className="bg-white py-32">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="w-full md:w-[80%] mx-auto mb-40 text-center space-y-12">
          <h2 ref={titleRef} className="text-4xl font-bold mb-16 pt-16">Meow there!</h2>
          <p ref={paragraph1Ref} className="text-2xl mb-12">
            Kalypso is an MCAT tech company and social business built by premeds for premeds, focused on{" "}
            <strong className="font-bold">innovation & accessibility.</strong>
          </p>
          <p ref={paragraph2Ref} className="text-2xl mb-12">
            We use the latest technology and algorithms to deliver your potential.
          </p>
          <p ref={paragraph3Ref} className="text-2xl mb-20">
            Because our patients deserve only the best...
          </p>
          <p ref={paragraph4Ref} className="text-2xl mb-20">
            ...And that&apos;s you!
          </p>
        </div>
        <div ref={statsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-24 mb-24">
          <div className="px-2 text-center col-span-1">
            <div className="mt-20">
              <div className="text-center text-5xl font-bold">
                <CountUp start={0} end={14} duration={4.75} suffix=" +" />
              </div>
              <p className="text-black text-2xl mb-0">Average increase in beta</p>
            </div>
            <div className="mt-20">
              <div className="text-center text-5xl font-bold">
                <CountUp start={0} end={514} duration={4.75} suffix=" +" />
              </div>
              <p className="text-black text-2xl mb-0">Average score in beta</p>
            </div>
          </div>
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="w-full mx-auto bg-white border shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-3">
                  <p className="mt-4 text-sm text-black font-medium mb-4 min-h-[20px]">{testimonial.text}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Image className="w-10 h-10 rounded-full mr-2" src={testimonial.image} alt="Avatar" width={40} height={40} />
                      <div className="text-sm">
                        <p className="text-black font-medium mb-0">{testimonial.name}</p>
                        <p className="text-gray-400 text-[10px]">{testimonial.description}</p>
                      </div>
                    </div>
                    <div>
                      <StarRatings
                        rating={testimonial.rating}
                        starRatedColor="gold"
                        numberOfStars={5}
                        name="rating"
                        starDimension="20px"
                        starSpacing="2px"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
