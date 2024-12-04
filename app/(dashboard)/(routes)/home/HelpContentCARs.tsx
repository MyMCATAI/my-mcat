import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import MessageButton from '@/components/MessageButton';
import { useOutsideClick } from '@/hooks/use-outside-click';

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
    <div ref={helpRef} className={"p-6 h-full overflow-y-auto relative bg-[--theme-mainbox-color] rounded-lg"}>
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
          <h3 className={"text-lg font-semibold mb-2"}>{"Getting Started"}</h3>
          <p className={"text-sm leading-relaxed mb-4"}>
            {"Welcome to the CARS practice section! Here you can practice CARS passages and track your progress."}
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

        <section>
          <h3 className={"text-lg font-semibold mb-2"}>{"Practice Strategy"}</h3>
          <ul className={"text-sm space-y-2 list-disc pl-4"}>
            <li>{"Start with untimed practice to build comprehension"}</li>
            <li>{"Gradually work up to timed passages (10 minutes each)"}</li>
            <li>{"Review explanations thoroughly, even for correct answers"}</li>
            <li>{"Track your progress with the analytics dashboard"}</li>
          </ul>
          
          {/* Add blog links section */}
          <div className={"grid grid-cols-1 gap-4 mt-4"}>
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
        </section>

        <section>
          <h3 className={"text-lg font-semibold mb-2"}>{"Using Kalypso"}</h3>
          <ul className={"text-sm space-y-2 list-disc pl-4"}>
            <li>{"Click Kalypso's icon to get passage-specific tips"}</li>
            <li>{"Ask about reading strategies and time management"}</li>
            <li>{"Get help understanding difficult questions"}</li>
            <li>{"Review your performance patterns with AI insights"}</li>
          </ul>
        </section>

        <section>
          <h3 className={"text-lg font-semibold mb-2"}>{"Need Help?"}</h3>
          <p className={"text-sm leading-relaxed mb-4"}>
            {"Have questions about CARS or need assistance? Our support team and community are here to help!"}
          </p>
          <div className={"flex ml-2 gap-2"}>
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