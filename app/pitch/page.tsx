"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AnkiGameCard } from "@/app/(auth)/(routes)/onboarding/components/AnkiGameCard";
import { GoldSubscriptionCard } from "@/app/(auth)/(routes)/onboarding/components/GoldSubscriptionCard";
import { PremiumSubscriptionCard } from "@/app/(auth)/(routes)/onboarding/components/PremiumSubscriptionCard";
import Image from 'next/image';

// Constants
const PITCH_VIDEO_URL = "p6TCox21rVg"; // YouTube video ID
enum ProductType {
  MD_GOLD = 'md_gold'
}

export default function PitchPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTeam, setActiveTeam] = useState('mcat');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<typeof allTeam[0] | null>(null);
  const [selectedScore, setSelectedScore] = useState<string | null>(null);

  const handleUpgradeClick = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/stripe/checkout", {
        priceType: ProductType.MD_GOLD
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to initiate purchase");
    } finally {
      setIsLoading(false);
    }
  };

  const allTeam = [
    {
      name: "Immanuel C",
      role: "Tutor",
      university: "Yale",
      image: "/tutors/ChasB..png",
    },
    {
      name: "Ethan K",
      role: "Tutor",
      university: "UPenn",
      image: "/tutors/EthanK..png",
    },
    {
      name: "Prynce K",
      role: "MCAT Director",
      university: "Rice",
      image: "/tutors/PrynceK..png",
    },
    {
      name: "Vivian Z",
      role: "Instructor",
      university: "UCR",
      image: "/tutors/VivianZ..png",
    },
    {
      name: "Ali N",
      role: "Tutor",
      university: "Stanford",
      image: "/tutors/AliN..png",
    },
    {
      name: "Lauren N",
      role: "Instructor",
      university: "UCLA",
      image: "/tutors/LauraN..png",
    },
    {
      name: "Dennis C",
      role: "Senior Engineer",
      university: "UCLA",
      image: "/tutors/DennisC..png",
    },
    {
      name: "Esther C",
      role: "Data Scientist",
      university: "Berkeley",
      image: "/tutors/EstherC..png",
    },
    {
      name: "Sophie L",
      role: "Game Developer",
      university: "UIUC",
      image: "/tutors/SophieL..png",
    },
    {
      name: "Josh W",
      role: "Engineer",
      university: "Queen's University",
      image: "/tutors/JoshW..png",
    },
    {
      name: "Armaan A",
      role: "Engineer",
      university: "UH",
      image: "/tutors/ArmaanA..png",
    },
  ];

  const scores = [
    { score: "525", name: "Cynthia", image: "/scores/525..png" },
    { score: "523", name: "Barbara", image: "/scores/523..png" },
    { score: "519", name: "Trinity", image: "/scores/519..png" },
    { score: "516", name: "Kevin", image: "/scores/516..png" },
    { score: "520", name: "Sahaj", image: "/scores/520..png" },
  ];

  const nextSlide = () => {
    const maxIndex = allTeam.length - 8; // Maximum starting index (total - visible cards)
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 8));
  };

  const prevSlide = () => {
    const teamLength = activeTeam === 'mcat' ? allTeam.length : 0;
    setCurrentIndex((prev) => (prev - 2 < 0 ? teamLength - 2 : prev - 2));
  };

  return (
    <div className="min-h-screen bg-[url('/ShiningStars.png')] bg-cover bg-center bg-no-repeat">
      <div className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/40" /> {/* Dark overlay for better text readability */}
        
        {/* Back Button */}
        <button
          onClick={() => router.push('/home')}
          className="absolute left-8 top-8 flex items-center gap-2 px-4 py-2 text-white/90 
            hover:bg-white/10 rounded-lg transition-all duration-300 z-10"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Return to Home
        </button>

        <div className="relative px-6 mx-auto max-w-7xl z-10">
          <div className="text-center space-y-2 mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 mb-4">
              THE MEOW DISTINCTION
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium tracking-wide">
              by the MyMCAT.ai Team
            </p>
          </div>
          
          {/* Video Section */}
          <div className="mt-12 mb-16">
            <div className="relative aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.15)]">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${PITCH_VIDEO_URL}`}
                title="MCAT Preparation System"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0"
              />
            </div>
          </div>
          {/* Commitment Section */}
          <div className="max-w-4xl mx-auto mb-20 p-10 md:p-12 rounded-2xl bg-black/40 border border-white/10 
            backdrop-blur-sm text-center transform hover:scale-[1.01] transition-all duration-300
            shadow-[0_0_30px_rgba(0,123,255,0.2)] hover:shadow-[0_0_50px_rgba(0,123,255,0.4)]">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text 
              bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 mb-8">
              Obsessed With Your Excellence
            </h2>
            <p className="text-white/90 mb-10 text-xl md:text-2xl font-medium leading-relaxed">
              We train the doctors our patients deserve, and we refuse to sell mediocrity.
            </p>
            <div className="space-y-6 text-lg md:text-xl leading-relaxed">
              <p className="text-white/80">
                At MyMCAT.ai, you&apos;re not paying for marketing hype—you&apos;re paying for results. 
                Every dollar goes into building the most advanced MCAT prep system ever created—from 
                cutting-edge AI software to elite instructors who actually know how to teach.
              </p>
              <p className="text-white/80">
                We do not rely on investors. We rely on the contributions of the students that we serve. 
                Every month, we refine our system, run rigorous research studies, and develop 
                evidence-based learning strategies—just like real medical schools do.
              </p>
            </div>

            {/* Team Section - Two Row Grid with Navigation */}
            <div className="mt-12 text-center">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text 
                bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 mb-6">
                Meet Our Team
              </h2> 
              <div className="max-w-5xl mx-auto px-4 relative mb-4">
                <div className="grid grid-cols-4 gap-4 auto-rows-fr">
                  {allTeam.slice(currentIndex, currentIndex + 8).map((member) => (
                    <div key={member.name}>
                      <div className="h-64 p-4 rounded-xl bg-black/30 border border-white/10 
                        backdrop-blur-sm transform hover:scale-[1.02] transition-all duration-300
                        shadow-[0_0_20px_rgba(0,123,255,0.1)] hover:shadow-[0_0_30px_rgba(0,123,255,0.2)]
                        text-center flex flex-col items-center justify-center"
                      >
                        <div className="w-20 h-20 mb-3 rounded-full overflow-hidden border-2 border-white/10">
                          <Image 
                            src={member.image} 
                            alt={member.name} 
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                        <p className="text-blue-400 font-medium text-sm mb-1">{member.university}</p>
                        <p className="text-white/70 text-xs">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Next Button - Only shown if there are more cards */}
                {allTeam.length > 8 && (
                  <button
                    onClick={nextSlide}
                    className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 rounded-full 
                      bg-black/30 text-white/90 hover:bg-black/50 transition-all
                      border border-white/10 backdrop-blur-sm"
                  >
                    <svg 
                      className="w-6 h-6" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Software Testimonials Section */}
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text 
              bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 mb-2">
              Software Testimonials
            </h2>
            <p className="text-white/80 mb-6">What Our Users Say</p>

            {/* Video Section */}
            <div className="relative aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden 
              shadow-[0_0_50px_rgba(255,255,255,0.15)] mb-8">
              <video
                className="w-full h-full"
                controls
                preload="metadata"
              >
                <source 
                  src="https://my-mcat.s3.us-east-2.amazonaws.com/public/MyMCATaiSoftwareTestimonials.mp4" 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
            </div>

            <p className="text-white/80 text-lg mb-12">
              All testimonials can be verified on our{" "}
              <a 
                href="https://discord.gg/KPtDGJfK8t" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                Discord community
              </a>
            </p>

            {/* MD Gold Feature Section */}
            <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-[#1a1a2e] via-[#1a1a24] to-[#1a1a1a] 
              border border-amber-200/20 backdrop-blur-sm mb-16 transform hover:scale-[1.01] transition-all duration-300
              shadow-[0_0_30px_rgba(255,215,0,0.1)] hover:shadow-[0_0_50px_rgba(255,215,0,0.2)] group">
              
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Left side - Logo */}
                <div className="w-full md:w-1/3 flex flex-col items-center">
                  <div className="relative w-48 h-48">
                    <img
                      src="/MD_Premium_Pro.png"
                      alt="MD Gold"
                      className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                      style={{ animation: 'float 3s ease-in-out infinite' }}
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                      MD Gold Plan
                    </h3>
                    <p className="text-xl font-bold text-white/90 mt-2">$150 / month</p>
                  </div>
                </div>

                {/* Right side - Content */}
                <div className="w-full md:w-2/3 space-y-6">
                  <div className="space-y-4">
                    <p className="text-white/90 text-lg leading-relaxed">
                      Master the MCAT on your own terms with our{" "}
                      <a 
                        href="https://www.mymcat.ai/blog/weakness-finding-algorithm" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-yellow-300 transition-colors"
                      >
                        adaptive system
                      </a>
                      {" "}that figures out when and what to study.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span className="text-white/90">Review exams excellently</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span className="text-white/90">All content in one place</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span className="text-white/90">CARS Practice with Kalypso</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span className="text-white/90">Adaptive study schedule</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span className="text-white/90">Accountablility checks</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span className="text-white/90">Priority support</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-amber-200/20 pt-6 mt-6">
                    <p className="text-white/90 text-lg leading-relaxed">
                      By joining MD Gold, you're supporting our team and our community. You're making MCAT prep better for everyone.
                    </p>
                  </div>

                  <button
                    onClick={handleUpgradeClick}
                    disabled={isLoading}
                    className="w-full h-12 mt-6 px-8 rounded-lg font-medium text-white
                      bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600
                      transform hover:scale-105 transition-all duration-300 shadow-lg
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Loading..." : "Upgrade to Gold"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Video Section */}
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text 
              bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 mb-2">
              Class Testimonials
            </h2>
            <p className="text-white/80 mb-6">Summer 2024</p>
            <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-10 italic">
              "These brave soldiers embarked on our first class when we were in our infancy as a company, 
              and the entire cohort averaged a 14 point increase."
            </p>

            {/* Video Section */}
            <div className="relative aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden 
              shadow-[0_0_50px_rgba(255,255,255,0.15)] mb-12">
              <video
                className="w-full h-full"
                controls
                preload="metadata"
              >
                <source 
                  src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/testimonials.mp4" 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Results Section */}
            <div className="max-w-4xl mx-auto mb-16">
              {/* Score Grid */}
              <div className="grid grid-cols-2 gap-8">
                {/* Top Score */}
                <div className="text-white/90">
                  <p className="text-lg mb-4">Highest scorer was Emily with a 525.</p>
                  <button 
                    onClick={() => setExpandedCard('525')}
                    className="transform hover:scale-105 transition-transform duration-300 
                      bg-black/30 p-4 rounded-xl border border-white/10 backdrop-blur-sm
                      shadow-[0_0_20px_rgba(0,123,255,0.1)] hover:shadow-[0_0_30px_rgba(0,123,255,0.2)]"
                  >
                    <div className="w-20 h-20 mb-3 rounded-full overflow-hidden">
                      <Image 
                        src="/scores/525.png" 
                        alt="525 MCAT Score" 
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                </div>

                {/* Highest Increase */}
                <div className="text-white/90">
                  <p className="text-lg mb-4">Our highest increase was from 487 to 519.</p>
                  <button 
                    onClick={() => setExpandedCard('519')}
                    className="transform hover:scale-105 transition-transform duration-300
                      bg-black/30 p-4 rounded-xl border border-white/10 backdrop-blur-sm
                      shadow-[0_0_20px_rgba(0,123,255,0.1)] hover:shadow-[0_0_30px_rgba(0,123,255,0.2)]"
                  >
                    <div className="w-20 h-20 mb-3 rounded-full overflow-hidden">
                      <Image 
                        src="/scores/519.png" 
                        alt="519 MCAT Score" 
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* New Class Section */}
            <div className="mt-20 text-center">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text 
                bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 mb-2">
                Next Class: March - May
              </h2>
              <p className="text-white/90 text-lg max-w-3xl mx-auto">
                We're looking for people who are retakers to join this class.
              </p>
            </div>

            {/* MD Platinum Feature Section */}
            <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-[#1a1a3e] via-[#1a1a34] to-[#1a1a2a] 
              border border-sky-200/20 backdrop-blur-sm mb-16 transform hover:scale-[1.01] transition-all duration-300
              shadow-[0_0_30px_rgba(0,123,255,0.1)] hover:shadow-[0_0_50px_rgba(0,123,255,0.2)] group mt-12">
              
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Left side - Logo */}
                <div className="w-full md:w-1/3 flex flex-col items-center">
                  <div className="relative w-48 h-48">
                    <img
                      src="/MDPremium.png"
                      alt="MD Platinum"
                      className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                      style={{ animation: 'float 3s ease-in-out infinite' }}
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      MD Platinum Class
                    </h3>
                    <p className="text-xl font-bold text-white/90 mt-2">$3000</p>
                  </div>
                </div>

                {/* Right side - Content */}
                <div className="w-full md:w-2/3 space-y-6">
                  <div className="space-y-4">
                    <p className="text-white/90 text-lg leading-relaxed">
                      Join the most elite MCAT class ever created. Get taught the MCAT like medical schools teach medicine.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span className="text-white/90">40 hours of MCAT instruction</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span className="text-white/90">Instructor + Tutor combo</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span className="text-white/90">Peer-based learning groups</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span className="text-white/90">Medical educator curriculum</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span className="text-white/90">Full access to software suite</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span className="text-white/90">Direct access to founders</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-sky-200/20 pt-6 mt-6">
                    <p className="text-white/90 text-lg leading-relaxed">
                      Join our next class and experience the most comprehensive MCAT preparation available. 
                      Limited spots to ensure personalized attention.
                    </p>
                  </div>

                  <button
                    onClick={() => window.open('https://tally.so/r/mBAgq7', '_blank')}
                    className="w-full h-12 mt-6 px-8 rounded-lg font-medium text-white
                      bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600
                      transform hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    Apply for the Class
                  </button>
                </div>
              </div>
            </div>

            {/* Modal for expanded images */}
            {expandedCard && (
              <div 
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                onClick={() => setExpandedCard(null)}
              >
                <div className="relative max-w-4xl max-h-[90vh] p-4">
                  <img 
                    src={`/scores/${expandedCard}.png`} 
                    alt={`${expandedCard} MCAT Score`} 
                    className="w-full h-full object-contain"
                  />
                  <button 
                    onClick={() => setExpandedCard(null)}
                    className="absolute top-2 right-2 text-white/90 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-8 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-sm
      hover:bg-black/40 transition-all duration-300 transform hover:scale-[1.02]">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-white/80">{description}</p>
    </div>
  );
} 