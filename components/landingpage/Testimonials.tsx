"use client";
import React from "react";
import Image from "next/image";
import ali from "../../public/ali.jpg";
import arthur from "../../public/arthur.jpg";
import kyle from "../../public/kyle.png";
import yasmin from "../../public/jasmin.png";
import CountUp from "react-countup";
import StarRatings from "react-star-ratings";

const Testimonials = () => {
  const testimonials = [
    {
      text: `I'm gonna be real. I had no clue what I was doing. Karki’s methodology got me from my middling
                  diagnostic to a 516 on my actual test, all within three months.`,
      name: "Yasmin Maurice",
      description: "516, Tulane",
      image: yasmin,
      rating: 5,
    },
    {
      text: `My first test was SO stressful and chaotic. I did poorly. On my retake, I needed a plan.
                  Karki developed one that got me a score I would’ve never imagined possible.`,
      name: "Ali Nassari",
      description: "517, UT Austin",
      image: ali,
      rating: 5,
    },
    {
      text: `Karki’s software created a personalized strategy to help me succeed, planning my days for me. On my
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
                  Couldn’t recommend Karki more.`,
      name: `Arthur Cowan`,
      description: "519, SDSU",
      image: arthur,
      rating: 5,
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#0E2247" }}>
            Testimonials
          </h1>
        </div>
        <div className="w-full md:w-[60%] m-auto pb-10 text-center">
          <p className="text-black text-xl mb-3">Meow there!</p>
          <p className="text-black text-xl mb-3">
            Kalypso is an MCAT tech company and social business built by premeds for premeds, focused on{" "}
            <strong className="font-bold">innovation & accessibility.</strong>
          </p>
          <p className="text-black text-xl mb-3">
            We use the latest technology and algorithms to deliver your potential.{" "}
          </p>
          <p className="text-black text-xl mb-3">
            Because your patients deserve only the best.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="px-2 text-center col-span-1">
            <div className="mt-20">
              <div className="text-center text-5xl font-bold">
                <CountUp start={0} end={14} duration={2.75} suffix=" +" />
              </div>
              <p className="text-black text-2xl mb-0">Average increase in beta</p>
            </div>
            <div className="mt-20">
              <div className="text-center text-5xl font-bold">
                <CountUp start={0} end={514} duration={2.75} suffix=" +" />
              </div>
              <p className="text-black text-2xl mb-0">Average score in beta</p>
            </div>
          </div>
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="w-full mx-auto bg-white border shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-3">
                  <p className="mt-4 text-sm text-black font-medium mb-4 min-h-[80px]">{testimonial.text}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Image className="w-10 h-10 rounded-full mr-2" src={testimonial.image} alt="Avatar" />
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
