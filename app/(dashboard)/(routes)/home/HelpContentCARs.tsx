import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import MessageButton from '@/components/MessageButton';
import { useOutsideClick } from '@/hooks/use-outside-click';
import Image from 'next/image';

interface HelpContentCARsProps {
  onClose: () => void;
  onResetTutorials?: () => void;
}

const HelpContentCARs: React.FC<HelpContentCARsProps> = ({ onClose, onResetTutorials }) => {
  const helpRef = useRef<HTMLDivElement>(null);
  useOutsideClick(helpRef, onClose);

  const handleResetTutorials = () => {
    localStorage.setItem("carsTutorialPlayed", "false");
    if (onResetTutorials) {
      onResetTutorials();
    }
  };
  return (
    <div ref={helpRef} className="p-6 h-full overflow-y-auto relative bg-[--theme-mainbox-color] rounded-lg w-[32rem] z-50 border-2 border-[--theme-border-color]">
      {/* Close button */}
      <button
        onClick={onClose}
        className={"absolute top-4 right-4 p-2 hover:bg-[--theme-hover-color] rounded-full transition-colors duration-200"}
      >
        <X className={"h-5 w-5 text-[--theme-text-color]"} />
      </button>

      {/* Title */}
      <h2 className="text-[--theme-text-color] text-xs mb-6 opacity-60 uppercase tracking-wide text-center">
        CARS Help & Information
      </h2>

      {/* Content Sections */}
      <div className={"space-y-6 text-[--theme-text-color]"}>
        <section>
          <div className="flex flex-col items-center gap-6">
            <span className="text-base">Practice and learn CARs.</span>
            <button
              onClick={handleResetTutorials}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-all duration-200 shadow-md hover:shadow-lg text-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Tutorials
            </button>
          </div>
        </section>

        <section className={"py-2 border-t border-[--theme-doctorsoffice-accent]"}>
          <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
            Key Metrics
          </h3>
          <div className={"flex justify-between items-center p-2 bg-transparent border-2 rounded-lg mb-6"}
               style={{ borderColor: "var(--theme-border-color)" }}>
            <div className={"flex flex-col items-center w-1/4"}>
              <div className={"w-10 h-10 relative"}>
                <Image
                  src="/game-components/PixelHeart.png"
                  alt="Heart"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <span className={"text-xs mt-1"}>{"score"}</span>
            </div>
            <div className={"flex flex-col items-center w-1/4"}>
              <div className={"w-10 h-10 relative"}>
                <Image
                  src="/game-components/PixelWatch.png"
                  alt="Watch"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <span className={"text-xs mt-1"}>{"per passage"}</span>
            </div>
            <div className={"flex flex-col items-center w-1/4"}>
              <div className={"w-10 h-10 relative"}>
                <Image
                  src="/game-components/PixelCupcake.png"
                  alt="Diamond"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <span className={"text-xs mt-1"}>{"coins"}</span>
            </div>
            <div className={"flex flex-col items-center w-1/4"}>
              <div className={"w-10 h-10 relative"}>
                <Image
                  src="/game-components/PixelBook.png"
                  alt="Flex"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <span className={"text-xs mt-1"}>{"tests"}</span>
            </div>
          </div>
          <div className={"mt-4 space-y-2.5 text-sm"}>
            <p>
              <span className="font-medium">Score:</span>
              {"Averaged from last 10 passages"}
            </p>
            
            <p>
              <span className="font-medium">Time:</span>
              {" Target under 10 mins/passage"}
            </p>
            
            <p>
              <span className="font-medium">Coins:</span>
              {" Pay a coin a passage, earn back at 80%+ score"}
            </p>
            
            <p>
              <span className="font-medium">Tests:</span>
              {" Review for bonus coins"}
            </p>
          </div>
        </section>
        <section className={"py-2 border-t border-[--theme-doctorsoffice-accent]"}>
          <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
            System Design
          </h3>
          <ul className="text-sm space-y-2 list-disc pl-4">
            <li><span className="font-medium">Cost:</span>{" 1 coin per passage"}</li>
            <li><span className="font-medium">Difficulty:</span>{" Levels 1-3, based on recent scores"}</li>
            <li><span className="font-medium">Part 2:</span>{" Most passages have bonus questions"}</li>
            <li><span className="font-medium">Bugs:</span>{" Report for 2 coins if validated"}</li>
          </ul>
        </section>

        <section className={"py-2 border-t border-[--theme-doctorsoffice-accent]"}>
          <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
            CARS Strategies
          </h3>
          <div className={"grid grid-cols-1 gap-4"}>
            <a 
              href={"/blog/best-cars-strategy"}
              className={"block p-4 bg-[--theme-doctorsoffice-accent] rounded-lg shadow hover:shadow-lg hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-all duration-200"}
            >
              <div className={"space-y-2"}>
                <h4 className={"text-[--theme-text-color] font-medium"}>{"How To Read A CARs Passage"}</h4>
                <p className={"text-sm text-[--theme-text-color] opacity-80"}>
                  {"Master the scaffolding technique for better passage comprehension"}
                </p>
              </div>
            </a>

            <a 
              href={"/blog/how-to-answer-cars-questions"}
              className={"block p-4 bg-[--theme-doctorsoffice-accent] rounded-lg shadow hover:shadow-lg hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-all duration-200"}
            >
              <div className={"space-y-2"}>
                <h4 className={"text-[--theme-text-color] font-medium"}>{"How To Answer CARs Questions"}</h4>
                <p className={"text-sm text-[--theme-text-color] opacity-80"}>
                  {"Learn strategies for tackling different types of CARs questions effectively"}
                </p>
              </div>
            </a>

            <a 
              href={"/blog/cars-ai-help"}
              className={"block p-4 bg-[--theme-doctorsoffice-accent] rounded-lg shadow hover:shadow-lg hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-all duration-200"}
            >
              <div className={"space-y-2"}>
                <h4 className={"text-[--theme-text-color] font-medium"}>{"How To Use AI to Help with CARs"}</h4>
                <p className={"text-sm text-[--theme-text-color] opacity-80"}>
                  {"Discover how to leverage AI tools to improve your CARS practice"}
                </p>
              </div>
            </a>
          </div>

          <h3 className="border-t border-[--theme-doctorsoffice-accent] pt-2 text-xs mb-2 mt-6 text-center opacity-60 uppercase tracking-wide">
            Sidebar
          </h3>
          <ul className={"text-sm space-y-2 list-disc pl-4"}>
            <li>{"Videos are collected from YouTube to help with CARs."}</li>
            <li>{"Insights from r/MCAT sends a feed of Reddit content to you for you to search and review."}</li>
          </ul>
        </section>

        <section className={"py-2 border-t border-[--theme-doctorsoffice-accent]"}>
          <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
            Need Help?
          </h3>
          <p className={"text-sm leading-relaxed mb-4"}>
            {"Have questions about CARS or need assistance? Our support team and community are here to help!"}
          </p>
          <div className="flex justify-center gap-4">
            <MessageButton iconOnly withShadow />
            <a 
              href="https://discord.gg/rTxN7wkh6e"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-md border border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FaDiscord className="h-5 w-5" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpContentCARs; 