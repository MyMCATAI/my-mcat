import { useState } from 'react';
import Image from 'next/image';
import { CustomVideo } from '../CustomVideo';

/* ----- Types ---- */
interface ClassSectionProps {
  isSpecialStatus: boolean;
  handleApplyClick: () => void;
}

interface Score {
  score: string;
  name: string;
  image: string;
}

const scores: Score[] = [
  { score: "525", name: "Cynthia", image: "/scores/525.png" },
  { score: "523", name: "Barbara", image: "/scores/523.png" },
  { score: "519", name: "Trinity", image: "/scores/519.png" },
  { score: "516", name: "Kevin", image: "/scores/516.png" },
  { score: "520", name: "Sahaj", image: "/scores/520.png" },
];

const ClassSection = ({ isSpecialStatus, handleApplyClick }: ClassSectionProps) => {
  /* ---- State ----- */
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showTestimonials, setShowTestimonials] = useState(false);

  /* ---- Render Methods ----- */
  return (
    <div className="mt-12">
      {/* MD Platinum Section */}
      <div className="max-w-6xl mx-auto px-4">
        {/* Special deal banner */}
        {isSpecialStatus && (
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-400 text-white font-bold py-3 px-6 rounded-full
              shadow-lg text-sm animate-pulse">
              $1,000 OFF FOR RETAKERS/NONTRADS!
            </div>
          </div>
        )}

        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden hover:border-purple-400/20 transition-colors duration-300">
          <div className="flex flex-col md:flex-row">
            {/* Left Column - Benefits */}
            <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16">
                    <img
                      src="/MDPremium.png"
                      alt="MD Platinum"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">MD Platinum Class</h2>
                    <p className="text-white/60">All of the above, plus the best education we can offer.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-5 h-5 mt-1 text-purple-400 flex-shrink-0">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">40 Hours of PBL-Based Instruction</h4>
                        <p className="text-white/60 text-sm">Teach you like medical schools teach medicine.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-5 h-5 mt-1 text-purple-400 flex-shrink-0">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Instructor + Tutor Combo</h4>
                        <p className="text-white/60 text-sm">Meet an instrucotr once a week and a tutor twice a week.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-5 h-5 mt-1 text-purple-400 flex-shrink-0">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">An AAMC Curriculum</h4>
                        <p className="text-white/60 text-sm">We use AAMC guidelines and FLs to design your course.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-5 h-5 mt-1 text-purple-400 flex-shrink-0">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Full Software Integration</h4>
                        <p className="text-white/60 text-sm">Software is seamlessly integrated into your course.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Link and Meet Instructors */}
                <div className="mt-8 md:mt-12 flex items-center gap-6">
                  <button 
                    onClick={() => setShowTestimonials(true)}
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <span className="text-sm font-medium">View student results</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button 
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <span className="text-sm font-medium">Meet your Instructors</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Pricing */}
            <div className="w-full md:w-5/12 bg-white/5 p-8 md:p-12 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10">
              <div>
                <div className="mb-8">
                  <div className="text-4xl font-bold text-white mb-2">
                    ${isSpecialStatus ? '4,000' : '5,000'}
                  </div>
                  <p className="text-white/60 text-sm">March - May 2024</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-white/80">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">3-month intensive program</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm">Limited spots available</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={handleApplyClick}
                  className="w-full h-12 rounded-xl font-medium text-white
                    bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600
                    transform hover:scale-[1.02] transition-all duration-300 shadow-lg"
                >
                  Apply for the Class
                </button>
                <p className="mt-3 text-white/60 text-sm text-center">Limited spots to ensure personalized attention</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Modal */}
      {showTestimonials && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTestimonials(false)}
        >
          <div className="relative max-w-4xl w-full aspect-video">
            <video 
              src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/testimonials.mp4"
              controls
              autoPlay
              className="w-full h-full rounded-lg"
            />
            <button 
              onClick={() => setShowTestimonials(false)}
              className="absolute top-2 right-2 text-white/90 hover:text-white bg-black/50 rounded-full p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassSection; 