import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DailyDialogProps {
  isFirstVisit: boolean;
  onClose: () => void;
}

const DailyDialog: React.FC<DailyDialogProps> = ({ isFirstVisit, onClose }) => {
  const [typedText, setTypedText] = useState('');

  const handleSubmit = () => {
    onClose();
  };

  const welcomeText = isFirstVisit ? "Welcome to Your Doctor's Office!" : "Welcome Back!";
  const followUpText = isFirstVisit 
    ? "This is where you'll manage your medical practice and interact with patients." 
    : "Ready to start another day of practice?";

  useEffect(() => {
    const fullText = followUpText;
    let index = 0;

    const typingTimer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingTimer);
      }
    }, 20);

    return () => clearInterval(typingTimer);
  }, [followUpText]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[--theme-leaguecard-color] p-8 rounded-lg shadow-lg max-w-md w-full border-2 border-[--theme-border-color]">
        <h2 className="text-2xl font-bold mb-4 text-[--theme-text-color]">
          {welcomeText}
        </h2>
        <p className="mb-4 text-[--theme-text-color]">
          {typedText}
        </p>
        <Button onClick={handleSubmit} className="w-full bg-[--theme-doctorsoffice-accent] border-2 border-[--theme-border-color] text-[--theme-text-color] hover:text-[--theme-hover-text] hover:bg-[--theme-hover-color] transition-colors">
          {isFirstVisit ? "Start My Practice" : "Begin Today's Session"}
        </Button>
      </div>
    </div>
  );
};

export default DailyDialog;
