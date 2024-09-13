// File: /components/chatbot/ChatBotWidgetNoChatBot.tsx
import React, { useState } from 'react';

type KalypsoState = 'wait' | 'talk' | 'end' | 'start';

const ChatBotWidgetNoChatBot = () => {
  const [kalypsoState, setKalypsoState] = useState<KalypsoState>('wait');
  const [kalypsoSrc, setKalypsoSrc] = useState('/kalypsowait.gif');

  const kalypsoStates: KalypsoState[] = ['talk', 'wait', 'end', 'start'];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleClick = () => {
    const nextIndex = (currentIndex + 1) % kalypsoStates.length;
    const nextState = kalypsoStates[nextIndex];
    setKalypsoState(nextState);
    setKalypsoSrc(`/kalypso${nextState}.gif`);
    setCurrentIndex(nextIndex);
  }; 

  return (
    <button
      className="overflow-hidden transition duration-120 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none"
      onClick={handleClick}
      aria-label="Kalypso"
      style={{
        width: '8rem',
        height: '8rem',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <img
        src={kalypsoSrc}
        alt="Kalypso"
        className="w-full h-full object-cover transform scale-[1.8] translate-y-[40%]"
      />
    </button>
  );
};

export default ChatBotWidgetNoChatBot;
