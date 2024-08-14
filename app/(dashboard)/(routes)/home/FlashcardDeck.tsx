import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Undo2, Star, Trash2 } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react';

interface Flashcard {
  problem: string;
  answer: string;
}

const flashcards: Flashcard[] = [
  { problem: "What is the function of the mitochondria?", answer: "The powerhouse of the cell, responsible for producing ATP through cellular respiration." },
  { problem: "What is the Henderson-Hasselbalch equation used for?", answer: "To calculate the pH of a buffer solution given the pKa and the concentrations of the acid and conjugate base." },
  { problem: "What is the role of tRNA in protein synthesis?", answer: "Transfer RNA (tRNA) brings specific amino acids to the ribosome during translation, matching them to the mRNA codons." },
  { problem: "What is Coulomb's law?", answer: "The electrostatic force between two charged particles is directly proportional to the product of their charges and inversely proportional to the square of the distance between them." },
  { problem: "What is the function of the nephron in the kidney?", answer: "The nephron is the functional unit of the kidney, responsible for blood filtration, reabsorption of useful substances, and secretion of wastes." },
];

const settings = {
  swipeThreshold: 0.5,
  rotationFactor: 10,
};

const physics = {
  touchResponsive: { friction: 50, tension: 2000 },
  animateBack: { friction: 10, tension: 200 }
};

const FlashcardStack: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [nextCardIndex, setNextCardIndex] = useState((currentCardIndex + 1) % flashcards.length);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    correctSoundRef.current = new Audio('/correctflash_v2.mp3');
    incorrectSoundRef.current = new Audio('/incorrectflash_v2.mp3');
  }, []);

  const [{ x, y, rotation, cardOpacity }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotation: 0,
    cardOpacity: 1,
    config: physics.touchResponsive
  }));

  const getSwipeDirection = (mx: number, my: number) => {
    const threshold = 50; // pixels
    if (Math.abs(mx) > Math.abs(my)) {
      return mx > threshold ? 'right' : mx < -threshold ? 'left' : 'none';
    } else {
      return my > threshold ? 'down' : my < -threshold ? 'up' : 'none';
    }
  };

  const playSound = (isCorrect: boolean) => {
    if (isCorrect && correctSoundRef.current) {
      correctSoundRef.current.play();
    } else if (!isCorrect && incorrectSoundRef.current) {
      incorrectSoundRef.current.play();
    }
  };
  
  const handleSwipe = (direction: string) => {
    setIsAnimatingOut(true);
    setIsRevealed(false);
    
    api.start({
      x: direction === 'left' ? -500 : direction === 'right' ? 500 : 0,
      y: direction === 'up' ? -500 : direction === 'down' ? 500 : 0,
      rotation: direction === 'left' ? -30 : direction === 'right' ? 30 : 0,
      cardOpacity: 0,
      config: { duration: 300 },
      onRest: () => {
        setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
        setNextCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
        setIsRevealed(false);
        setIsAnimatingOut(false);
        api.start({ x: 0, y: 0, rotation: 0, cardOpacity: 1, immediate: true });
      }
    });

    switch (direction) {
      case 'left':
      case 'up':
        playSound(false);
        console.log('Incorrect');
        break;
      case 'right':
      case 'down':
        playSound(true);
        console.log('Correct');
        break;
    }
  };

  const handleButtonAction = (action: string) => {
    switch (action) {
      case 'correct':
        handleSwipe('right');
        break;
      case 'incorrect':
        handleSwipe('left');
        break;
      case 'weakness':
        handleSwipe('up');
        break;
      case 'strength':
        handleSwipe('down');
        break;
      case 'undo':
        handlePrevious();
        break;
    }
  };

  const bind = useDrag(({ active, movement: [mx, my], velocity: [vx, vy], event, type }) => {
    const dir = getSwipeDirection(mx, my);
    const trigger = dir !== 'none';
    
    if (active) {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        setClickTimeout(null);
      }
    } else if (!active && trigger) {
      handleSwipe(dir);
    } else if (!active && !trigger) {
      if (type === 'pointerup') {
        const timeout = setTimeout(() => {
          toggleReveal();
        }, 100);
        setClickTimeout(timeout);
      }
    }
    
    api.start({
      x: active ? mx : 0,
      y: active ? my : 0,
      rotation: active ? mx / settings.rotationFactor : 0,
      config: active ? physics.touchResponsive : physics.animateBack,
    });
  });

  const handlePrevious = () => {
    const newCurrentIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
    setCurrentCardIndex(newCurrentIndex);
    setNextCardIndex(currentCardIndex);
    setIsRevealed(false);
  };

  const toggleReveal = () => {
    setIsRevealed(prevState => !prevState);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          handleSwipe('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          handleSwipe('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleSwipe('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleSwipe('right');
          break;
        case ' ':
          toggleReveal();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto mt-2 px-0 overflow-auto">
      <div className="flex justify-end items-center mb-2 w-full">
      <button className="p-2 hover:bg-[#3D5788] rounded mr-4">
          <svg width="20" height="20" fill="#ffffff" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="m21.75 20.063-5.816-5.818a7.523 7.523 0 0 0 1.44-4.433c0-4.17-3.393-7.562-7.562-7.562-4.17 0-7.562 3.392-7.562 7.562s3.392 7.562 7.562 7.562a7.523 7.523 0 0 0 4.433-1.44l5.818 5.816 1.687-1.688ZM9.812 14.986a5.174 5.174 0 1 1-.002-10.35 5.174 5.174 0 0 1 0 10.349Z" />
          </svg>
        </button>
        <button className="p-2 hover:bg-[#3D5788] rounded mr-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_iconCarrier">
              <path d="M11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8V11H16C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13H13V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V13H8C7.44771 13 7 12.5523 7 12C7 11.4477 7.44772 11 8 11H11V8Z" fill="#efefef"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM3.00683 12C3.00683 16.9668 7.03321 20.9932 12 20.9932C16.9668 20.9932 20.9932 16.9668 20.9932 12C20.9932 7.03321 16.9668 3.00683 12 3.00683C7.03321 3.00683 3.00683 7.03321 3.00683 12Z" fill="#efefef"/>
            </g>
          </svg>
        </button>
        <button className="p-2 hover:bg-[#3D5788] rounded">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="#ffffff"
            xmlns="http://www.w3.org/2000/svg"
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <path
              d="M9.25001 22L8.85001 18.8C8.63335 18.7167 8.42918 18.6167 8.23751 18.5C8.04585 18.3833 7.85835 18.2583 7.67501 18.125L4.70001 19.375L1.95001 14.625L4.52501 12.675C4.50835 12.5583 4.50001 12.4458 4.50001 12.3375V11.6625C4.50001 11.5542 4.50835 11.4417 4.52501 11.325L1.95001 9.375L4.70001 4.625L7.67501 5.875C7.85835 5.74167 8.05001 5.61667 8.25001 5.5C8.45001 5.38333 8.65001 5.28333 8.85001 5.2L9.25001 2H14.75L15.15 5.2C15.3667 5.28333 15.5708 5.38333 15.7625 5.5C15.9542 5.61667 16.1417 5.74167 16.325 5.875L19.3 4.625L22.05 9.375L19.475 11.325C19.4917 11.4417 19.5 11.5542 19.5 11.6625V12.3375C19.5 12.4458 19.4833 12.5583 19.45 12.675L22.025 14.625L19.275 19.375L16.325 18.125C16.1417 18.2583 15.95 18.3833 15.75 18.5C15.55 18.6167 15.35 18.7167 15.15 18.8L14.75 22H9.25001ZM12.05 15.5C13.0167 15.5 13.8417 15.1583 14.525 14.475C15.2083 13.7917 15.55 12.9667 15.55 12C15.55 11.0333 15.2083 10.2083 14.525 9.525C13.8417 8.84167 13.0167 8.5 12.05 8.5C11.0667 8.5 10.2375 8.84167 9.56251 9.525C8.88751 10.2083 8.55001 11.0333 8.55001 12C8.55001 12.9667 8.88751 13.7917 9.56251 14.475C10.2375 15.1583 11.0667 15.5 12.05 15.5Z"
              fill="#ffffff"
            />
          </svg>
        </button>
        {/* Search, Add, and Settings buttons */}
      </div>
      <div className="relative w-[75%] h-80 mb-4 mt-8">
        {/* Background cards */}
        <div className="absolute inset-0 bg-[#001226] bg-opacity-100 rounded-lg shadow-md transform -translate-x-4 translate-y-6 border-blue-400 border-2" style={{ boxShadow: '0 0 5px 3px rgba(0, 123, 255, 0.5)' }}></div>
        <div className="absolute inset-0 bg-[#001226] bg-opacity-100 rounded-lg shadow-md transform -translate-x-2 translate-y-3 border-blue-400 border-2 bg-[url('/circuitpattern2.png')] bg-cover bg-blend-overlay" style={{ boxShadow: '0 0 5px 3px rgba(0, 123, 255, 0.5)' }}></div>
        
        {/* Next card (always visible) */}
        <div className="absolute inset-0 bg-[#001226] bg-opacity-100 rounded-lg shadow-md flex justify-center items-center p-6 border-blue-400 border-2 bg-[url('/circuitpatternblue.png')] bg-cover bg-blend-overlay" style={{ boxShadow: '0 0 5px 3px rgba(0, 123, 255, 0.5)' }}>
          <p className="text-2xl text-center text-white">{flashcards[nextCardIndex]?.problem}</p>
        </div>
        
        {/* Current card */}
        <animated.div
          {...bind()}
          className="absolute inset-0 bg-[#001226] bg-opacity-100 rounded-lg shadow-md flex justify-center items-center p-6 cursor-pointer border-blue-400 border-2 bg-[url('/circuitpatternblue.png')] bg-cover bg-blend-overlay"
          style={{
            x,
            y,
            rotateZ: rotation,
            opacity: cardOpacity,
            touchAction: 'none',
            boxShadow: '0 0 5px 3px rgba(0, 123, 255, 0.5)',
          }}
        >
          <p className="text-2xl text-center text-white">
            {isRevealed ? flashcards[currentCardIndex]?.answer : flashcards[currentCardIndex]?.problem}
          </p>
        </animated.div>
      </div>
      <div className="flex justify-between w-full mt-12 text-sm">
        <p className="text-gray-500">←Swipe left (or A) for incorrect</p>
        <p className="text-gray-500">Spacebar to reveal answer</p>
        <p className="text-gray-500">Swipe right (or D) for correct →</p>
      </div>
      <div className="flex justify-between w-[98%] text-sm">
        <p className="text-gray-500">↑ Swipe up (or W) for weakness</p>
        <p className="text-gray-500"> Swipe down (or S) for strength ↓</p>
      </div>
    
      <div className="flex justify-center space-x-6 mt-4">
        <button className="p-2 bg-red-500 text-white rounded-full" onClick={() => handleButtonAction('incorrect')}>
         <X size={24} />
        </button>
        <button className="p-2 bg-gray-500 text-white rounded-full hover:bg-blue-500 transition-colors duration-200" onClick={() => handleButtonAction('incorrect')}>
          <Trash2 size={24} />
        </button>
        <button className="p-2 bg-gray-500 text-white rounded-full hover:bg-blue-500 transition-colors duration-200" onClick={() => handleButtonAction('undo')}>
          <Undo2 size={24} />
        </button>
        <button className="p-2 bg-gray-500 text-white rounded-full hover:bg-blue-500 transition-colors duration-200" onClick={() => handleButtonAction('correct')}>
          <Star size={24} />
        </button>
        <button className="p-2 bg-green-500 text-white rounded-full" onClick={() => handleButtonAction('correct')}>
          <Check size={24} />
        </button>
      </div>
    </div>
  );
};

export default FlashcardStack;