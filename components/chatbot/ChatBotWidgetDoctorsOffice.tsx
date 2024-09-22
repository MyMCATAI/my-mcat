import React, { useState } from 'react';
import { ReportData } from "@/types";

export interface ChatBotWidgetDoctorsOfficeProps {
  reportData: ReportData;
  onResponse: (message: string, dismissFunc: () => void) => void;
}

const ChatBotWidgetDoctorsOffice: React.FC<ChatBotWidgetDoctorsOfficeProps> = ({ reportData, onResponse }) => {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount((prevCount) => (prevCount + 1) % 3);
    
    // Example of using onResponse
    const message = `You clicked ${clickCount + 1} times. Your average test score is ${reportData.averageTestScore}.`;
    onResponse(message, () => console.log("Message dismissed"));
  };

  const getKalypsoGif = () => {
    switch (clickCount) {
      case 1:
        return '/kalypsodistressed.gif';
      case 2:
        return '/kalypsoapproval.gif';
      default:
        return '/kalypsoend.gif';
    }
  };

  return (
    <div className="relative w-48 h-48">
      <button
        onClick={handleClick}
        className="overflow-hidden"
        style={{
          width: '12rem',
          height: '12rem',
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <img
          src={getKalypsoGif()}
          alt="Kalypso"
          className={`w-full h-full object-cover transform scale-[1.8] translate-y-[40%] ${
            clickCount === 2 ? 'translate-x-[14%] translate-y-[45%]' : ''
          }`}
        />
      </button>
    </div>
  );
};

export default ChatBotWidgetDoctorsOffice;
