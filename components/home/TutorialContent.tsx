import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from 'next/image';
import { FaDiscord } from 'react-icons/fa';
import TutorialVidDialog from "@/components/ui/TutorialVidDialog";

const TutorialContent: React.FC = () => {
  const [isTutorialDialogOpen, setIsTutorialDialogOpen] = useState(false);
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState("");

  const openTutorialDialog = (videoUrl: string) => {
    setTutorialVideoUrl(videoUrl);
    setIsTutorialDialogOpen(true);
  };

  return (
    <ScrollArea className="h-full">
      <Card>
        <CardContent className="p-4 text-[--theme-text-color]">
          <h2 className="text-m font-bold mb-4">Welcome to MyMCAT!</h2>
          <p className="mb-4 text-m">Select a topic to learn more about our platform.</p>
          <div className="space-y-4">
            <button
              onClick={() => openTutorialDialog("https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/examstsxvideo.mp4")}
              className="block w-full text-m text-left px-4 py-2 bg-transparent rounded hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
            >
              1. Navigating the Platform
            </button>
            <a
              href="/blog/best-cars-strategy"
              className="block w-full text-m text-left px-4 py-2 bg-transparent rounded hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] border-b border-[--theme-text-color]"
            >
              2. CARs Strategies
            </a>

            <a 
              href="/blog"
              className="flex flex-col text-sm items-center bg-[--theme-mainbox-color] bg-opacity-75 text-[--theme-text-color] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
            >
              <Image
                src="/StudyverseFavicon.png"
                alt="Blog"
                width={48}
                height={48}
                className="mb-3"
              />
              <span className="text-[0.9rem]">Check out our blog to learn more about MCAT Prep and applying to medical school!</span>
            </a>

            <a 
              href="https://discord.gg/mXVkbzFq"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col text-sm bg-[--theme-mainbox-color] text-[--theme-text-color] bg-opacity-75 items-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
            >
              <FaDiscord className="text-[3rem] mb-3" />
              <span className="text-[0.9rem]">Join our discord if want a study buddy!</span>
            </a>
          </div>
        </CardContent>
      </Card>
      <TutorialVidDialog
        isOpen={isTutorialDialogOpen}
        onClose={() => setIsTutorialDialogOpen(false)}
        videoUrl={tutorialVideoUrl}
      />
    </ScrollArea>
  );
};

export default TutorialContent;