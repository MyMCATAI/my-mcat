import { useState } from 'react';

/* ----- Types ---- */
export interface SelectedOptions {
  software: boolean;
  class: boolean;
  tutors: boolean;
}

interface InterestToggleProps {
  selectedOptions: SelectedOptions;
  onOptionToggle: (option: keyof SelectedOptions) => void;
  isSpecialStatus: boolean;
  onSpecialStatusChange: (status: boolean) => void;
}

export const InterestToggle = ({ 
  selectedOptions, 
  onOptionToggle, 
  isSpecialStatus, 
  onSpecialStatusChange 
}: InterestToggleProps) => {
  return (
    <div className="mt-12 mb-8 max-w-4xl mx-auto">
      <div className="relative p-8 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 
        border border-white/20 backdrop-blur-lg shadow-[0_0_30px_rgba(59,130,246,0.2)] overflow-hidden">
        
        {/* Animated background effects */}
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl animate-pulse" 
          style={{ animationDelay: '1s' }}></div>
        
        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-center text-transparent bg-clip-text 
            bg-gradient-to-r from-blue-400 via-white to-purple-400 mb-8">
            What are you interested in?
          </h3>
          
          {/* Toggle Buttons with Icons */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <button 
              onClick={() => onOptionToggle('software')}
              className={`flex items-center gap-3 px-8 py-5 rounded-xl font-medium text-lg transition-all duration-500 ${
                selectedOptions.software 
                  ? 'bg-gradient-to-r from-blue-600/90 to-blue-400/90 text-white shadow-[0_0_20px_rgba(0,123,255,0.6)] transform scale-105 hover:scale-110' 
                  : 'bg-black/30 text-white/80 hover:bg-black/40 border border-white/10 hover:border-white/30 hover:scale-105'
              }`}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Software
            </button>
            <button 
              onClick={() => onOptionToggle('class')}
              className={`flex items-center gap-3 px-8 py-5 rounded-xl font-medium text-lg transition-all duration-500 ${
                selectedOptions.class 
                  ? 'bg-gradient-to-r from-purple-600/90 to-pink-400/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] transform scale-105 hover:scale-110' 
                  : 'bg-black/30 text-white/80 hover:bg-black/40 border border-white/10 hover:border-white/30 hover:scale-105'
              }`}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Class
            </button>
            <button 
              onClick={() => onOptionToggle('tutors')}
              className={`flex items-center gap-3 px-8 py-5 rounded-xl font-medium text-lg transition-all duration-500 ${
                selectedOptions.tutors 
                  ? 'bg-gradient-to-r from-green-600/90 to-emerald-400/90 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)] transform scale-105 hover:scale-110' 
                  : 'bg-black/30 text-white/80 hover:bg-black/40 border border-white/10 hover:border-white/30 hover:scale-105'
              }`}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Tutors
            </button>
          </div>
          
          {/* Custom Futuristic Checkbox */}
          <div className="flex items-center justify-center">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isSpecialStatus}
                  onChange={(e) => onSpecialStatusChange(e.target.checked)}
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
          </div>
          
          {/* Message about subsidized tuition */}
          {isSpecialStatus && (
            <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 backdrop-blur-md animate-fadeIn">
              <p className="text-white/90 text-center leading-relaxed">
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {`MyMCAT.ai's team is committed to developing the doctors that the world needs. Thus, we subsidize tuition for FAP recipients (free) as well as retakers and nontrads (30% off).`}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterestToggle; 