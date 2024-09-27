import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import DialogTutorial from './DialogTutorial';

const TutorialContent: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState('');

  const openTutorial = (topic: string) => {
    setCurrentTopic(topic);
    setIsDialogOpen(true);
  };

  return (
    <ScrollArea className="h-full">
      <Card>
        <CardContent className="p-4 text-[--theme-text-color]">
          <h2 className="text-xl font-bold mb-4">Welcome to MyMCAT!</h2>
          <p className="mb-4">Select a topic to learn more about our platform.</p>
          <div className="space-y-4">
            <button
              onClick={() => openTutorial('navigation')}
              className="block w-full text-left px-4 py-2 bg-transparent rounded hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
            >
              1. Navigating the Platform
            </button>
            <button
              onClick={() => openTutorial('cars')}
              className="block w-full text-left px-4 py-2 bg-transparent rounded hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
            >
              2. CARs Strategies
            </button>
            <button
              onClick={() => openTutorial('premium')}
              className="block w-full text-left px-4 py-2 bg-transparent rounded hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
            >
              3. Doctor&apos;s Office
            </button>
            <button
              onClick={() => openTutorial('beta')}
              className="block w-full text-left px-4 py-2 bg-transparent rounded hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
            >
              4. MD Premium
            </button>
            <button
              onClick={() => openTutorial('beta')}
              className="block w-full text-left px-4 py-2 bg-transparent rounded hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
            >
              5. Beta Tester Information
            </button>
          </div>
        </CardContent>
      </Card>
      <DialogTutorial
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        topic={currentTopic}
        onClose={() => setIsDialogOpen(false)}
      />
    </ScrollArea>
  );
};

export default TutorialContent;