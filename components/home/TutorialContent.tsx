import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle, Mail } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import MessageButton from '@/components/MessageButton';

const TutorialContent: React.FC = () => {
  return (
    <ScrollArea className="h-full">
      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-[--theme-text-color] flex flex-col items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-4">
              <HelpCircle className="w-12 h-12" />
              <p className="text-center">Click this icon on every page for help.</p>
            </div>
            
            <div className="flex gap-4">
              <MessageButton iconOnly />
              <a 
                href="https://discord.gg/rTxN7wkh6e"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-md border border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-colors duration-200"
              >
                <FaDiscord className="h-5 w-5" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default TutorialContent;