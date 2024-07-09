"use client";

import TypewriterComponent from "typewriter-effect";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export const LandingHero = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="relative bg-[#2A507E] text-white font-bold py-20 overflow-hidden">
      {/* Banner Image */}
      <div 
        className="absolute top-0 right-0 w-2/3 h-full bg-cover bg-right"
        style={{ backgroundImage: "url('/banner.png')" }}
      />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left space-y-5 w-full md:w-1/2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold">
            MCAT SUITE
          </h1>
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 text-3xl sm:text-4xl md:text-5xl font-bold">
            <TypewriterComponent
              options={{
                strings: [
                  "Adaptive Learning.",
                  "UWorld Integration.",
                  "AAMC Materials.",
                  "Personalized Schedules."
                ],
                autoStart: true,
                loop: true,
              }}
            />
          </div>
          <div className="text-sm md:text-xl font-light text-zinc-300">
            Study smarter with an adaptive content schedule that integrates with UWorld and AAMC
          </div>
          <div className="pt-4">
            <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
              <Button variant="premium" className="md:text-lg p-4 md:p-6 rounded-full font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
          <div className="text-zinc-400 text-xs md:text-sm font-normal">
            Revolutionize your MCAT prep today
          </div>
        </div>
      </div>
    </div>
  );
};