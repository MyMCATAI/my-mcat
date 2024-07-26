"use client";
import { useAuth } from "@clerk/nextjs";
import hero from "../public/heroimg.png";
import Image from "next/image";
import Link from "next/link";
import cat from "../public/hero.gif";
import laptop from "../public/laptop.png";
import bernie from "../public/Bernie.svg"

export const LandingHero = () => {
  return (
    <>
      <section className="bg-[#0e2247] py-20" id="home">
        <div className="container mx-auto px-6 pt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div className="text-center">
              <h1 className="text-3xl md:text-[44px] font-bold text-white mb-2">
                Study <span className="text-[#f2f64f]">smarter</span>, with a
                friend.
              </h1>
              <p className="text-lg md:text-[20px] text-white my-6">
                Take the stress out of your MCAT prep with Kalypso.
              </p>
              <div className="flex justify-center ">
                <Link target="/" href={"/intro"}>
                  <button className="bg-[#ffffff] text-[#0e2247] py-4 text-lg md:text-[20px] px-10 rounded-[20px]">
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
      <section className="bg-[#f2f2f2] ">
        <div className="container">
          <div className="flex">
            <div>
              <Image src={bernie} alt="image" width={200} height={200} />
            </div>
            <div className="mt-20">
              <h1 className="text-2xl text-[#0e2247]  font-bold  mb-2">
                `
                {
                  "Higher education should be a right for all , not  a privilege for few."
                }
                `
              </h1>
              <p className="text-[20px] text-[#0e2247]  font-bold  mb-2 ms-2">
                Senator Bernie Sanders of vermont
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
