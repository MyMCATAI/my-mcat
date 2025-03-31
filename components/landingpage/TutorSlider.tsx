import React, { useState, useRef, useEffect, TouchEvent, MouseEvent } from 'react';
import Image from 'next/image';

// Custom styles for score animation
const pulseAnimation = {
  '@keyframes scorePulse': {
    '0%': { transform: 'scale(1)', textShadow: '0 0 10px rgba(255, 255, 255, 0.5)' },
    '50%': { transform: 'scale(1.05)', textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.4)' },
    '100%': { transform: 'scale(1)', textShadow: '0 0 10px rgba(255, 255, 255, 0.5)' },
  },
  '.animate-score-pulse': {
    animation: 'scorePulse 2s infinite ease-in-out',
  },
  '.drop-shadow-glow': {
    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))',
  }
};

// Map of school-specific gradient colors
const schoolGradients: Record<string, string> = {
  'JHU Medicine': 'from-blue-600 to-indigo-800', // Johns Hopkins blue
  'Rice': 'from-blue-700 to-gray-900', // Rice blue and gray
  'UCLA': 'from-blue-600 to-yellow-700', // UCLA blue and gold
  'Penn Medicine': 'from-red-700 to-blue-900', // Penn red and blue
  'CNU SOM': 'from-teal-600 to-blue-800', // Teal to blue for California Northstate
  'Harvard': 'from-red-700 to-red-900', // Harvard crimson
};

// Map of school-specific glow colors
const schoolGlowColors: Record<string, string> = {
  'JHU Medicine': 'rgba(37, 99, 235, 0.35)', // Blue glow for JHU
  'Rice': 'rgba(29, 78, 216, 0.35)', // Darker blue for Rice
  'UCLA': 'rgba(59, 130, 246, 0.35)', // Blue with hint of gold for UCLA
  'Penn Medicine': 'rgba(220, 38, 38, 0.35)', // Red glow for Penn
  'CNU SOM': 'rgba(13, 148, 136, 0.35)', // Teal glow for CNU
  'Harvard': 'rgba(168, 36, 36, 0.35)', // Crimson glow for Harvard
};

// Animation styles for the score
const scoreAnimation = {
  animation: 'pulse 2s infinite ease-in-out',
  display: 'inline-block',
};

const scoreTextShadow = {
  textShadow: '0 0 15px rgba(255, 255, 255, 0.7), 0 0 30px rgba(255, 255, 255, 0.4), 0 0 45px rgba(255, 255, 255, 0.2)'
};

const activeScoreStyle = {
  ...scoreAnimation,
  ...scoreTextShadow,
};

// Ensure consistent bio length with minimum length guarantee
const processBio = (bio: string): string => {
  const minLength = 120;
  if (bio.length >= minLength) return bio;
  
  // Add filler text if bio is too short
  return bio + ' ' + 'Specializes in personalized learning strategies and adapts teaching methods to each student\'s unique needs.'.substring(0, minLength - bio.length);
};

const tutors = [
  {
    name: 'Phillip',
    score: '520',
    institution: 'Harvard',
    role: 'Tutor',
    image: '/tutors/PhillipB.png',
    bio: "I'm Phillip! Harvard '23, soon to be an MSTP student at UMiami. I'll help you self-study to boost your MCAT score from 508 to 520 just like I did. In my free time, you can find me rock climbing or reading neuroscience articles."
  },
  {
    name: 'Chas',
    score: '526',
    institution: 'JHU Medicine',
    role: 'Tutor',
    image: '/tutors/ChasB.png',
    bio: "Hi, I'm Chas! Yale grad with a 526 MCAT score. Biochem expert with 5+ years of tutoring experience, helping students increase scores by 15+ points. I craft study plans, teach Anki, and create personalized guides to help you succeed."
  },

  {
    name: 'Kerol',
    score: '521',
    institution: 'Penn Medicine',
    role: 'Tutor',
    image: '/tutors/KerolF.png',
    bio: "I'm Kerol, a UPenn Medicine-bound student with a 4.0 GPA in cell biology and neuroscience from Rutgers. I improved my MCAT score by 18 points to 521 and have tutored over 100 students. I focus on CARS mastery and use cutting-edge techniques like metacognition and active recall to help students build confidence and test-taking skills."
  },
  {
    name: 'Prynce',
    score: '523',
    institution: 'Rice',
    role: 'Instructor',
    image: '/tutors/PrynceK.png',
    bio: processBio('Yoooooo, I\'m the founder of this website and experienced instructor/tutor. My favorite section is the CARs section, where I hit a 132, and now I\'m super excited to help you do the same!')
  },
  {
    name: 'Laura',
    score: '520',
    institution: 'UCLA',
    role: 'Tutor',
    image: '/tutors/LauraN.png',
    bio: "I'm Lauren, a Theater and Literature double major turned pre-med at UCLA who achieved a 520 MCAT score. I excel in all MCAT sections, admissions essays, and helping students overcome test anxiety. Outside of teaching, I enjoy community events and karaoke in New Orleans."
  },
  {
    name: 'Vivian',
    score: '512',
    institution: 'CNU SOM',
    role: 'Tutor',
    image: '/tutors/VivianZ.png',
    bio: processBio('Hi everyone! I\'m Vivian, an MS1. I improved my MCAT score from 495 to 512 by implementing major changes in content review, mindset, self-criticism, and thorough review. I\'d love to help you find the strategies and schedule that work best for you to reach your goal score.')  
  }
];

const TutorSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Add keyframes style to document head on component mount
  useEffect(() => {
    // Create a style element for the keyframes
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse {
        0% { 
          transform: scale(1); 
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.7), 0 0 30px rgba(255, 255, 255, 0.4);
        }
        50% { 
          transform: scale(1.05); 
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.9), 0 0 40px rgba(255, 255, 255, 0.6), 0 0 60px rgba(255, 255, 255, 0.3);
        }
        100% { 
          transform: scale(1); 
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.7), 0 0 30px rgba(255, 255, 255, 0.4);
        }
      }
      
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(0, 18, 38, 0.3);
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(59, 130, 246, 0.3);
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(59, 130, 246, 0.5);
      }
      
      @keyframes logoGlow {
        0% { 
          filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3)); 
          opacity: 0.35;
          transform: scale(1);
        }
        50% { 
          filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.5)); 
          opacity: 0.45;
          transform: scale(1.02);
        }
        100% { 
          filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3)); 
          opacity: 0.35;
          transform: scale(1);
        }
      }
      
      .logo-glow {
        animation: logoGlow 5s infinite ease-in-out;
      }
    `;
    document.head.appendChild(style);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Touch handling state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Mouse handling state for desktop swipe
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [endX, setEndX] = useState(0);
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  
  const getGradient = (institution: string) => {
    return schoolGradients[institution] || 'from-blue-600 to-blue-900';
  };

  const getGlowColor = (institution: string) => {
    return schoolGlowColors[institution] || 'rgba(37, 99, 235, 0.35)';
  };

  const handlePrev = () => {
    if (transitioning) return;
    
    setTransitioning(true);
    setActiveIndex((prev) => (prev === 0 ? tutors.length - 1 : prev - 1));
    
    setTimeout(() => {
      setTransitioning(false);
    }, 300);
  };

  const handleNext = () => {
    if (transitioning) return;
    
    setTransitioning(true);
    setActiveIndex((prev) => (prev === tutors.length - 1 ? 0 : prev + 1));
    
    setTimeout(() => {
      setTransitioning(false);
    }, 300);
  };

  const handleDotClick = (index: number) => {
    if (transitioning || index === activeIndex) return;
    
    setTransitioning(true);
    setActiveIndex(index);
    
    setTimeout(() => {
      setTransitioning(false);
    }, 300);
  };
  
  // Handle touch start event
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  // Handle touch move event
  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  // Handle touch end event
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNext();
    }
    
    if (isRightSwipe) {
      handlePrev();
    }
  };
  
  // Mouse events for desktop swiping
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };
  
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setEndX(e.clientX);
  };
  
  const onMouseUp = () => {
    if (!isDragging) return;
    
    const distance = startX - endX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNext();
    }
    
    if (isRightSwipe) {
      handlePrev();
    }
    
    setIsDragging(false);
  };
  
  // Mouse leave event to handle if user moves mouse outside the container while dragging
  const onMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };
  
  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (transitioning) return;
      
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [transitioning]);

  return (
    <div className="mb-20 w-full max-w-7xl mx-auto px-4">
      <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-6 font-krungthep">
        Our Tutors Will Help You
      </h2>
      <div className="text-white/80 text-center text-lg md:text-xl mb-12 max-w-2xl mx-auto">
       They were once in your shoes, and they know exactly what you need.
      </div>
      
      {/* Carousel container */}
      <div className="relative w-full">
        <div 
          className="flex justify-center items-center py-8" 
          ref={carouselRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="relative w-full max-w-4xl h-[650px]">
            {/* Touch/swipe indicator */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-[#001226]/70 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-800/50 md:hidden">
              <span className="text-white/70 text-xs flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h8m-8 5h8" />
                </svg>
                Swipe to navigate
              </span>
            </div>
            
            {tutors.map((tutor, index) => {
              // Calculate the active status and position
              const isActive = index === activeIndex;
              const isPrev = index === (activeIndex === 0 ? tutors.length - 1 : activeIndex - 1);
              const isNext = index === (activeIndex === tutors.length - 1 ? 0 : activeIndex + 1);
              
              let position = '';
              let opacity = 'opacity-0';
              let scale = 'scale-90';
              let zIndex = 'z-0';
              
              if (isActive) {
                position = 'left-1/2 -translate-x-1/2';
                opacity = 'opacity-100';
                scale = 'scale-100';
                zIndex = 'z-30';
              } else if (isPrev) {
                position = 'left-0 -translate-x-1/3';
                opacity = 'opacity-70';
                zIndex = 'z-20';
              } else if (isNext) {
                position = 'right-0 translate-x-1/3';
                opacity = 'opacity-70';
                zIndex = 'z-20';
              } else {
                position = 'left-1/2 -translate-x-1/2';
              }
              
              // Get the glow color for the active card
              const glowStyle = isActive ? { 
                boxShadow: `0 0 25px 2px ${getGlowColor(tutor.institution)}`,
                transition: 'box-shadow 0.3s ease-in-out' 
              } : {};

              // Define the score animation class
              const scoreAnimationClass = isActive ? 'animate-score-pulse' : '';
              
              return (
                <div 
                  key={index}
                  className={`absolute top-0 w-full max-w-xl mx-auto transition-all duration-300 ease-in-out ${position} ${opacity} ${scale} ${zIndex} ${!isActive && !isPrev && !isNext ? 'hidden' : ''}`}
                >
                  <div 
                    className="w-full bg-[#001226]/90 rounded-2xl overflow-hidden shadow-xl mx-auto border border-slate-800/50 backdrop-blur-md h-40rem flex flex-col"
                    style={glowStyle}
                  >
                    {/* Institution Banner */}
                    <div className={`w-full h-16 bg-gradient-to-r ${getGradient(tutor.institution)} relative overflow-hidden`}>
                      {/* School name */}
                      <div className="absolute inset-0 flex items-center px-6 z-10">
                        <div className="flex items-center">
                          <div className="text-white font-bold text-lg tracking-wide">{tutor.institution}</div>
                        </div>
                      </div>
                      
                      {/* University Logo Background */}
                      <div className="absolute inset-0 flex items-center justify-end overflow-hidden">
                        <div className="absolute right-0 w-52 h-52 -mr-10 mt-4 transform rotate-6">
                          <div className="absolute inset-0 rounded-full bg-white/5 filter blur-xl"></div>
                          <Image
                            src={`/tutors/${tutor.institution.split(' ')[0]}.png`}
                            alt=""
                            fill
                            className="object-contain logo-glow"
                            priority
                          />
                        </div>
                      </div>
                      
                      {/* Banner pattern overlay */}
                      <div className="absolute inset-0 opacity-10" 
                        style={{ 
                          backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)',
                          backgroundSize: '8px 8px'
                        }}>
                      </div>
                      
                      {/* Bottom shine line */}
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/30"></div>
                    </div>
                    
                    {/* Card content */}
                    <div className="p-8 flex flex-col flex-grow overflow-hidden">
                      <div className="flex items-start gap-6">
                        {/* Portrait */}
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-[#001226] to-[#00193d] p-1 flex-shrink-0">
                          <div className="w-full h-full rounded-lg overflow-hidden relative">
                <Image
                  src={tutor.image}
                  alt={tutor.name}
                  fill
                  className="object-cover"
                />
              </div>
                        </div>
                        
                        {/* Name and score */}
                        <div className="flex-grow">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-2xl md:text-3xl font-bold text-white">{tutor.name}</h3>
                            {/* Prominent Score - No MCAT label, bigger, white and animated */}
                            <div className="ml-2">
                              <span 
                                className="text-5xl md:text-7xl font-extrabold text-white transition-all duration-300"
                                style={isActive ? activeScoreStyle : {}}
                              >
                                {tutor.score}
                              </span>
                            </div>
                          </div>
                          <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-medium uppercase tracking-wide mb-3">{tutor.role}</div>
                          
                          {/* Bio section for mobile (visible only on small screens) */}
                          <div className="md:hidden mt-3 overflow-y-auto pr-1 custom-scrollbar" style={{ maxHeight: "6rem" }}>
                            <p className="text-white/90 text-sm leading-relaxed">
                              {tutor.bio}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Separator */}
                      <div className="my-6 h-px bg-slate-700/30 w-full"></div>
                      
                      {/* Bio section for desktop (hidden on small screens) */}
                      <div className="hidden md:block mt-6 flex-grow overflow-hidden">
                        <h4 className="text-white/60 text-xs font-normal uppercase tracking-widest mb-2 text-blue-300/70">Tutor Profile</h4>
                        <div className="bg-[#001226]/80 backdrop-blur-sm rounded-xl p-5 border border-slate-800/50 h-[10rem] overflow-y-auto custom-scrollbar">
                          <p className="text-white/90 leading-relaxed">
                            {tutor.bio}
                          </p>
                        </div>
                      </div>
                      
                      {/* Specialty area */}
                      <div className="mt-6">
                        <h4 className="text-white/60 text-xs font-normal uppercase tracking-widest mb-2 text-blue-300/70">Areas of Expertise</h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-blue-500/10 rounded-full text-blue-300 text-xs">
                            MCAT Prep
                          </span>
                          <span className="px-3 py-1 bg-blue-500/10 rounded-full text-blue-300 text-xs">
                            {tutor.institution.includes('JHU') ? 'Biochemistry' : 
                             tutor.institution.includes('Rice') ? 'Physics' :
                             tutor.institution.includes('UCLA') ? 'Psychology' :
                             tutor.institution.includes('Penn') ? 'Biology' : 'Chemistry'}
                          </span>
                          <span className="px-3 py-1 bg-blue-500/10 rounded-full text-blue-300 text-xs">
                            {tutor.score > '520' ? 'Advanced Strategy' : 'Foundations'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Availability status */}
                      <div className="mt-8 flex justify-between items-center bg-[#001226]/70 rounded-lg px-4 py-3 border border-slate-800/50">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                          <span className="text-green-400 text-sm">Available for Sessions</span>
                        </div>
                        <div className="text-xs text-white/40 font-medium uppercase tracking-wider">Elite Tutor</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
              </div>
            </div>
        
        {/* Indicator dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {tutors.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'w-6 bg-blue-500' 
                  : 'w-2 bg-slate-700 hover:bg-blue-400/50'
              }`}
              aria-label={`Go to tutor ${index + 1}`}
              disabled={transitioning}
            />
          ))}
        </div>
        
        {/* Alternative navigation buttons for mobile - adds extra clickable areas */}
        <div className="md:hidden flex justify-between mt-4">
          <button
            onClick={handlePrev}
            className="px-4 py-2 bg-[#001226]/90 rounded-md text-white hover:bg-blue-600 transition-all border border-slate-800/50"
            disabled={transitioning}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-[#001226]/90 rounded-md text-white hover:bg-blue-600 transition-all border border-slate-800/50"
            disabled={transitioning}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorSlider; 