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
      <h2 className={"text-[--theme-text-color] text-2xl font-semibold mb-6"}>
        {"CARS Help & Information"}
      </h2>

      {/* Content Sections */}
      <div className={"space-y-6 text-[--theme-text-color]"}>
        <section>
          <p className={"text-sm leading-relaxed mb-4"}>
            {"Welcome to the CARS practice section! Here you can practice CARS passages daily with high quality passages that feature AI help and feedback."}
          </p>
          <div className={"flex justify-center"}>
            <button
              onClick={handleResetTutorials}
              className={"px-4 py-2 text-sm border border-[--theme-border-color] bg-[--theme-bg-transparent] rounded-md hover:bg-[--theme-hover-color] transition-colors duration-200"}
            >
              {"Reset Tutorial"}
            </button>
          </div>
        </section>

        <section className={"py-2 border-t border-[--theme-doctorsoffice-accent]"}>
          <h3 className={"text-lg font-semibold mb-2 text-center"}>{"Key Metrics"}</h3>
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
              <span className={"font-medium"}>Score:</span>
              {" Your average score in the last ten passages."}
            </p>
            
            <p>
              <span className={"font-medium"}>Time:</span>
              {" Average time per passage. Aim for under 10 minutes."}
            </p>
            
            <p>
              <span className={"font-medium"}>Coins:</span>
              {" Costs 1 coin per passage. Score 80%+ to earn it back."}
            </p>
            
            <p>
              <span className={"font-medium"}>Tests:</span>
              {" Completed vs reviewed tests. Review for bonus coins."}
            </p>
          </div>
        </section>
        <section className={"py-2 border-t border-[--theme-doctorsoffice-accent]"}>
          <h3 className={"text-lg font-semibold mb-2 text-center"}>{"System Design"}</h3>
          <ul className={"text-sm space-y-2 list-disc pl-4"}>
            <li>{"Each CARS passage costs 1 coin, but score 100% in good time to earn the coin back."}</li>
            <li>{"Passages are rated Level 1-3. Your last three scores determine the difficulty."}</li>
            <li>{"Review passages thoroughly to increase your chances of scoring well."}</li>
            <li>{"Most passages have Part 2 available with new questions."}</li>
            <li>{"Report bugs or mistakes - earn 2 coins if we validate your report."}</li>
          </ul>
        </section>

        <section className={"py-2 border-t border-[--theme-doctorsoffice-accent]"}>
          <h3 className={"text-lg font-semibold mb-2 text-center"}>{"CARS Strategies"}</h3>
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

          <h3 className={"border-t border-[--theme-doctorsoffice-accent] pt-2 text-lg font-semibold mb-2 mt-6 text-center"}>{"Sidebar"}</h3>
          <ul className={"text-sm space-y-2 list-disc pl-4"}>
            <li>{"Videos from YouTube are a collection of videos collected to help with CARs."}</li>
            <li>{"Insights from r/MCAT sends a feed of Reddit content to you. You can search for content. You can press maximize in the top right to read a reddit post."}</li>
          </ul>
        </section>

        <section className={"py-2 border-t border-[--theme-doctorsoffice-accent]"}>
          <h3 className={"text-lg font-semibold mb-2 text-center"}>{"Need Help?"}</h3>
          <p className={"text-sm leading-relaxed mb-4"}>
            {"Have questions about CARS or need assistance? Our support team and community are here to help!"}
          </p>
          <div className={"flex justify-center gap-2"}>
            <MessageButton />
            <a 
              href={"https://discord.gg/rTxN7wkh6e"}
              target={"_blank"}
              rel={"noopener noreferrer"}
              className={"flex items-center gap-2 px-6 py-2 bg-gray-600 text-white text-m rounded-md hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-colors duration-200"}
            >
              <FaDiscord className={"h-4 w-4"} />
              <span>{"Join Discord"}</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpContentCARs; 