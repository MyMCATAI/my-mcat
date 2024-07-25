"use client";
import { useAuth } from "@clerk/nextjs";
import hero from "../public/heroimg.png";
import Image from "next/image";
import Link from "next/link";
import cat from "../public/hero.gif";
import laptop from "../public/laptop.png";

export const LandingHero = () => {
  return (
    <section className="bg-white py-16" id="home">
      <div className="container mx-auto px-6 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-[44px] font-bold text-black mb-2">
              Study smarter, with a friend.
            </h1>
            <p className="text-lg md:text-[20px] text-black-900 mb-6">
              Take the stress out of your MCAT prep with Kalypso.
            </p>
            <div className="flex justify-center md:justify-start">
              <Link target="/" href={"/intro"}>
                <button className="bg-[#2D4778] text-white py-3 text-lg md:text-[20px] px-6 rounded-[20px]">
                  Join the waitlist
                </button>
              </Link>
            </div>
          </div>
          <div className="relative flex justify-center mt-6 md:mt-0">
            <Image src={laptop} alt="Laptop" className="w-4/5" />
            <div className="absolute top-[5%] left-[10%] w-[80%] h-[80%]">
              <Image src={cat} alt="GIF" layout="fill" objectFit="contain" unoptimized/>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
