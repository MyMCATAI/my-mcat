import { CustomVideo } from "../CustomVideo";
import Image from "next/image";
import { useState, useEffect } from "react";

/* ----- Types ---- */
interface SoftwareSectionProps {
  isSpecialStatus: boolean;
  pricingPeriod: 'monthly' | 'biannual' | 'annual';
  setPricingPeriod: (period: 'monthly' | 'biannual' | 'annual') => void;
  handleUpgradeClick: () => void;
  isLoading: boolean;
  isGold: boolean;
  user: any;
}

const SoftwareSection = ({
  isSpecialStatus,
  pricingPeriod,
  setPricingPeriod,
  handleUpgradeClick,
  isLoading,
  isGold,
  user
}: SoftwareSectionProps) => {
  /* ---- State ----- */
  const [showTestimonials, setShowTestimonials] = useState(false);

  /* ---- Helper Methods ----- */
  const getMonthlyPrice = (period: 'monthly' | 'biannual' | 'annual') => {
    switch (period) {
      case 'monthly':
        return 150;
      case 'biannual':
        return isSpecialStatus ? 83 : 133;  // 500/6 or 800/6
      case 'annual':
        return isSpecialStatus ? 67 : 100;  // 800/12 or 1200/12
    }
  };

  const getTotalPrice = (period: 'monthly' | 'biannual' | 'annual') => {
    switch (period) {
      case 'monthly':
        return 150;
      case 'biannual':
        return isSpecialStatus ? 500 : 800;
      case 'annual':
        return isSpecialStatus ? 800 : 1200;
    }
  };

  /* ---- Event Handlers ----- */
  const handlePeriodSelection = (period: 'monthly' | 'biannual' | 'annual') => {
    setPricingPeriod(period);
  };

  /* ---- Render Methods ----- */
  return (
    <div className="mt-8">
      {/* MD Gold Section */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-br from-black/30 via-black/20 to-black/10 backdrop-blur-xl rounded-3xl border border-amber-400/20 overflow-hidden hover:border-amber-400/40 transition-colors duration-300 shadow-[0_0_50px_rgba(251,191,36,0.1)] hover:shadow-[0_0_50px_rgba(251,191,36,0.2)]">
          {/* Pricing Banner - Dynamic based on selected period */}
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 p-6 text-center border-b border-amber-400/20">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
              {pricingPeriod === 'monthly' ? 'Monthly Access: $150' : 
               pricingPeriod === 'biannual' ? `6-Month Access: $${getTotalPrice('biannual')} ${isSpecialStatus ? '(44% off!)' : ''}` : 
               `Annual Access: $${getTotalPrice('annual')} ${isSpecialStatus ? '(56% off!)' : ''}`}
            </div>
            <p className="text-white/60 text-sm mt-1">
              ${getMonthlyPrice(pricingPeriod)}/month for comprehensive MCAT prep
            </p>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Left Column - Benefits */}
            <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 transform hover:scale-110 transition-transform duration-300">
                    <img
                      src="/MD_Premium_Pro.png"
                      alt="MD Gold"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">MD Gold Course</h2>
                    <p className="text-white/60">Our most popular option.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-5 h-5 mt-1 text-amber-400 flex-shrink-0">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Adaptive Study Schedule</h4>
                        <p className="text-white/60 text-sm">Study schedule that syncs with all resources.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-5 h-5 mt-1 text-amber-400 flex-shrink-0">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Adaptive Tutoring Suite</h4>
                        <p className="text-white/60 text-sm">All the content you need curated for you based on weaknesses.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-5 h-5 mt-1 text-amber-400 flex-shrink-0">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Test Taking Suite</h4>
                        <p className="text-white/60 text-sm">Review your FLs in one place and know when your next one is.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-5 h-5 mt-1 text-amber-400 flex-shrink-0">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">NVIDIA-tier algorithms</h4>
                        <p className="text-white/60 text-sm">Most advanced Kalypso with AAMC logic and voice-activation.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Link */}
                <div className="mt-8 md:mt-12 flex items-center gap-6">
                  <button 
                    onClick={() => setShowTestimonials(true)}
                    className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors group"
                  >
                    <span className="text-sm font-medium group-hover:underline">View student results</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button 
                    className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors group"
                  >
                    <span className="text-sm font-medium group-hover:underline">View full software in action</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Pricing */}
            <div className="w-full md:w-5/12 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 p-8 md:p-12 flex flex-col justify-between border-t md:border-t-0 md:border-l border-amber-400/20">
              <div>
                {/* Other Options Label */}
                <div className="text-sm text-white/60 mb-2">Select Your Plan:</div>
                
                {/* Pricing Toggle */}
                <div className="flex flex-col gap-2 mb-8">
                  <button 
                    onClick={() => handlePeriodSelection('biannual')}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                      pricingPeriod === 'biannual' 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg' 
                        : 'bg-black/20 text-white/80 hover:text-white border border-amber-400/20'
                    }`}
                  >
                    Bi-Annual Plan - ${getTotalPrice('biannual')}
                  </button>
                  <button 
                    onClick={() => handlePeriodSelection('annual')}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                      pricingPeriod === 'annual' 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg' 
                        : 'bg-black/20 text-white/80 hover:text-white border border-amber-400/20'
                    }`}
                  >
                    Annual Plan - ${getTotalPrice('annual')}
                  </button>
                  <button 
                    onClick={() => handlePeriodSelection('monthly')}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                      pricingPeriod === 'monthly' 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg' 
                        : 'bg-black/20 text-white/80 hover:text-white border border-amber-400/20'
                    }`}
                  >
                    Monthly Plan - ${getTotalPrice('monthly')}
                  </button>
                </div>
              </div>

              <div>
                <button
                  onClick={handleUpgradeClick}
                  disabled={isLoading}
                  className="w-full h-14 rounded-2xl font-bold text-lg text-black
                    bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500
                    hover:from-amber-400 hover:via-yellow-500 hover:to-amber-600
                    transform hover:scale-[1.02] hover:-translate-y-0.5
                    transition-all duration-300
                    shadow-[0_0_20px_rgba(251,191,36,0.3)]
                    hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    relative overflow-hidden
                    before:absolute before:inset-0
                    before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
                    before:translate-x-[-200%] hover:before:translate-x-[200%]
                    before:transition-transform before:duration-700
                    "
                >
                  {isLoading ? "Loading..." : 
                   isGold ? "Manage Subscription" : 
                   user ? `Join our Gold Course` : "Sign-up to join our Gold Course"}
                </button>
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
              src="https://my-mcat.s3.us-east-2.amazonaws.com/public/MyMCATaiSoftwareTestimonials.mp4"
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

export default SoftwareSection; 