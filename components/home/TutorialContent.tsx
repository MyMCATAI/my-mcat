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

  const openTutorial = (type: string) => {
    // Handle tutorial opening logic here
    console.log(`Opening ${type} tutorial`);
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

            <button 
              className="flex flex-col text-sm items-center bg-[--theme-mainbox-color] bg-opacity-75 text-[--theme-text-color] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
              onClick={() => window.location.href = '/blog'}
            >
              3. The Clinic
            </button>
            <button
              onClick={() => openTutorial('premium')}
              className="block w-full text-left px-4 py-2 bg-transparent rounded hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
            >
              4. MD Features
            </button>
            <button
              onClick={() => openTutorial('beta')}
              className="block w-full text-left px-4 py-2 bg-transparent rounded hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
            >
              5. Early Access Information
            </button>
          </div>
          <div className="flex justify-center gap-x-32 mt-12 mb-8">
            <a 
              href="https://discord.gg/yourdiscordlink" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center hover:opacity-80 transition-opacity"
            >
              <FaDiscord className="w-12 h-12 mb-4" />
              <span className="text-base font-semibold">JOIN OUR</span>
              <span className="text-base font-semibold">DISCORD</span>
            </a>
            
            <a 
              href="/blog" 
              className="flex flex-col items-center hover:opacity-80 transition-opacity"
            >
              <Image 
                src="/StudyVerseFavicon.png" 
                alt="Blog" 
                className="w-12 h-12 mb-4"
                width={48}
                height={48}
              />
              <span className="text-base font-semibold">READ OUR</span>
              <span className="text-base font-semibold">BLOG</span>
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