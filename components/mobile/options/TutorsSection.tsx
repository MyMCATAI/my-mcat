//components/mobile/options/TutorsSection.tsx
/* ----- Types ---- */
interface TutorsSectionProps {
  currentIndex: number;
  allTeam: Array<{
    name: string;
    role: string;
    university: string;
    image: string;
  }>;
  nextSlide: () => void;
}

const TutorsSection = ({ currentIndex, allTeam, nextSlide }: TutorsSectionProps) => {
  /* ---- Render Methods ----- */
  return (
    <div className="mt-24 text-center">
      <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-[#1a1a3e] via-[#1a1a34] to-[#1a1a2a] 
        border border-emerald-200/20 backdrop-blur-sm mb-16">
        <p className="text-white/90 text-lg mb-6">
          Join our Discord community to connect with our tutors while we set up our tutoring platform.
        </p>
        
        <a 
          href="https://discord.gg/KPtDGJfK8t" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-medium text-lg text-white
            bg-[#5865F2] hover:bg-[#4752C4]
            transition-all duration-300 transform hover:scale-105"
        >
          <svg width="24" height="24" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor"/>
          </svg>
          <span className="relative">Find Tutors on Discord</span>
        </a>
      </div>

      {/* Team Section */}
      <div className="mt-24 text-center mb-20">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text 
          bg-gradient-to-r from-blue-500 via-white to-blue-500 mb-8">
          Meet Our Team
        </h2>
        <div className="max-w-5xl mx-auto px-4 relative mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-fr">
            {allTeam.slice(currentIndex, currentIndex + 8).map((member) => (
              <div key={member.name}>
                <div className="h-64 p-4 rounded-xl bg-black/20 border border-white/10 
                  backdrop-blur-sm transform hover:scale-[1.02] transition-all duration-300
                  shadow-[0_0_20px_rgba(0,123,255,0.1)] hover:shadow-[0_0_30px_rgba(0,123,255,0.2)]
                  text-center flex flex-col items-center justify-center"
                >
                  <div className="w-20 h-20 mb-3 rounded-full overflow-hidden border border-white/10">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-white/90 mb-1">{member.name}</h3>
                  <p className="text-blue-400/80 font-medium text-sm mb-1">{member.university}</p>
                  <p className="text-white/70 text-sm">{member.role}</p>
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
  );
};

export default TutorsSection; 