import { useState, useEffect } from 'react';
import SoftwareSection from './SoftwareSection';
import ClassSection from './ClassSection';

/* ----- Types ---- */
interface OptionsStepProps {
  isGold: boolean;
  user: any;
  handleUpgradeClick: () => void;
  handleApplyClick: () => void;
  pricingPeriod?: 'monthly' | 'biannual' | 'annual';
  setPricingPeriod?: (period: 'monthly' | 'biannual' | 'annual') => void;
  isSpecialStatus?: boolean;
  setIsSpecialStatus?: (status: boolean) => void;
}

const OptionsStep = ({ 
  isGold, 
  user, 
  handleUpgradeClick, 
  handleApplyClick,
  pricingPeriod: externalPricingPeriod,
  setPricingPeriod: externalSetPricingPeriod,
  isSpecialStatus: externalIsSpecialStatus,
  setIsSpecialStatus: externalSetIsSpecialStatus
}: OptionsStepProps) => {
  /* ---- State ----- */
  const [localIsSpecialStatus, setLocalIsSpecialStatus] = useState(false);
  const [localPricingPeriod, setLocalPricingPeriod] = useState<'monthly' | 'biannual' | 'annual'>('biannual');
  const [isLoading, setIsLoading] = useState(false);

  // Use either external or local state
  const pricingPeriod = externalPricingPeriod || localPricingPeriod;
  const isSpecialStatus = externalIsSpecialStatus !== undefined ? externalIsSpecialStatus : localIsSpecialStatus;
  
  /* ---- Event Handlers ----- */
  const handlePricingPeriodChange = (period: 'monthly' | 'biannual' | 'annual') => {
    if (externalSetPricingPeriod) {
      externalSetPricingPeriod(period);
    } else {
      setLocalPricingPeriod(period);
    }
  };

  const handleSpecialStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.checked;
    if (externalSetIsSpecialStatus) {
      externalSetIsSpecialStatus(newStatus);
    } else {
      setLocalIsSpecialStatus(newStatus);
    }
  };

  /* ---- Render Methods ----- */
  return (
    <div className="relative min-h-screen">
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-blue-500/10 rounded-full blur-3xl animate-drift"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-purple-500/10 rounded-full blur-3xl animate-drift-slow"></div>
        <div className="absolute w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* FAP Toggle */}
        {/* <div className="flex items-center justify-center mb-8">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={isSpecialStatus}
                onChange={handleSpecialStatusChange}
              />
              <div className={`w-12 h-6 rounded-full transition-all duration-500 border ${
                isSpecialStatus 
                  ? 'bg-gradient-to-r from-green-400 to-blue-500 border-blue-300' 
                  : 'bg-gray-800 border-gray-600 group-hover:bg-gray-700'
              }`}>
              </div>
              <div className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-all duration-500 ${
                isSpecialStatus ? 'transform translate-x-6 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''
              }`}>
              </div>
            </div>
            <span className="text-white text-lg">{`I'm FAP/Retaker/Nontrad`}</span>
          </label>
        </div> */}

        {/* Message about subsidized tuition */}
        {/* {isSpecialStatus && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 backdrop-blur-md animate-fadeIn">
              <p className="text-white/90 text-center leading-relaxed">
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {`MyMCAT.ai's team is committed to developing the doctors that the world needs. Thus, we subsidize tuition for FAP recipients (free) as well as retakers and nontrads (30% off).`}
                </span>
              </p>
            </div>
          </div>
        )} */}

        {/* Pricing Cards */}
        <div className="space-y-8">

          {/* Gold Course */}
          <div className="relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <span className="inline-block bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-sm font-bold px-4 py-1 rounded-full">
                Discounted Until March 8th
              </span>
            </div>
            <SoftwareSection
              isSpecialStatus={isSpecialStatus}
              pricingPeriod={pricingPeriod}
              setPricingPeriod={handlePricingPeriodChange}
              handleUpgradeClick={handleUpgradeClick}
              isLoading={isLoading}
              isGold={isGold}
              user={user}
            />
          </div>


          {/* Free Tier */}
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden hover:border-blue-400/20 transition-colors duration-300">
              <div className="flex flex-col md:flex-row">
                {/* Left Column - Benefits */}
                <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16">
                        <img
                          src="/game-components/PixelCupcake.png"
                          alt="Free Tier"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">Free Tier</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-5 h-5 mt-1 text-blue-400 flex-shrink-0">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">Comprehensive Anki Game</h4>
                            <p className="text-white/60 text-sm">4000+ flashcards and multiple choice questions</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-5 h-5 mt-1 text-blue-400 flex-shrink-0">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">Video Integration</h4>
                            <p className="text-white/60 text-sm">Thousands of integrated educational videos</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-5 h-5 mt-1 text-blue-400 flex-shrink-0">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">Base-tier Kalypso</h4>
                            <p className="text-white/60 text-sm">Access to our AI-powered superkitty.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-5 h-5 mt-1 text-blue-400 flex-shrink-0">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">Studyverse Community</h4>
                            <p className="text-white/60 text-sm">Access to our Discord community with MCAT resources</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="mt-8 md:mt-12 flex items-center gap-6">
                    <a 
                      href="https://mymcat.ai/ankiclinic" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span className="text-sm font-medium">Try our Anki game</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                    <a 
                      href="https://discord.gg/mymcat" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span className="text-sm font-medium">Join Studyverse</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Right Column - Free Badge */}
                <div className="w-full md:w-5/12 bg-white/5 p-8 md:p-12 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10">
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-4xl font-bold text-white mb-4">
                      Free
                    </div>
                    <p className="text-white/60 text-center">Start your MCAT journey today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Class */}
          <div className="transform hover:scale-[1.02] transition-all duration-300">
            <ClassSection
              isSpecialStatus={isSpecialStatus}
              handleApplyClick={handleApplyClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsStep; 