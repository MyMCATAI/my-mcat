import React, { useState } from 'react';
import { Check, X, Undo2, Star, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react';
import Slider from 'react-slick';

// Add these imports
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

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

interface ArrowProps {
  onClick?: () => void;
}

const PrevArrow: React.FC<ArrowProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
    >
      <ChevronLeft className="w-6 h-6 text-gray-600" />
    </button>
  );
};

const NextArrow: React.FC<ArrowProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
    >
      <ChevronRight className="w-6 h-6 text-gray-600" />
    </button>
  );
};

const FlashcardStack: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const [{ x, y, rotation }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotation: 0,
    config: physics.touchResponsive
  }));

  const { transform, opacity } = useSpring({
    opacity: isRevealed ? 1 : 0,
    transform: `perspective(600px) rotateX(${isRevealed ? 180 : 0}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  });

  const getSwipeDirection = (mx: number, my: number) => {
    if (Math.abs(mx) > Math.abs(my)) {
      return mx > settings.swipeThreshold ? 'right' : mx < -settings.swipeThreshold ? 'left' : 'none';
    } else {
      return my > settings.swipeThreshold ? 'down' : my < -settings.swipeThreshold ? 'up' : 'none';
    }
  };

  const handleSwipe = (direction: string) => {
    switch (direction) {
      case 'left':
        console.log('Incorrect');
        break;
      case 'right':
        console.log('Correct');
        break;
      case 'up':
        console.log('Weakness');
        break;
      case 'down':
        console.log('Strength');
        break;
    }
    setTimeout(() => {
      handleNext();
      setIsRevealed(false);
    }, 300);
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
      case 'rewind':
        handlePrevious();
        break;
    }
  };

  const bind = useDrag(({ active, movement: [mx, my], velocity: [vx, vy] }) => {
    const dir = getSwipeDirection(mx / 100, my / 100);  // Normalize movement
    const trigger = dir !== 'none';
    
    if (!active && trigger) {
      handleSwipe(dir);
    }
    
    api.start({
      x: active ? mx : 0,
      y: active ? my : 0,
      rotation: active ? mx / settings.rotationFactor : 0,
      config: active ? physics.touchResponsive : physics.animateBack,
    });
  });

  const handlePrevious = () => {
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
    setIsRevealed(false);
  };

  const handleNext = () => {
    setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
    setIsRevealed(false);
  };

  const toggleReveal = () => {
    setIsRevealed(prevState => !prevState);
  };

  const carouselSettings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "30px",
    slidesToShow: 4,
    speed: 500,
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerPadding: "30px",
        }
      }
    ]
  };
//TODO: Have it so that students can toggle terminal mode where they can type things in. 

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto mt-12 px-6 overflow-auto">
      <div className="absolute top-0 right-0 flex space-x-2 p-4 z-10">
        <button className="p-2 hover:bg-[#3D6788] rounded">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.25001 22L8.85001 18.8C8.63335 18.7167 8.42918 18.6167 8.23751 18.5C8.04585 18.3833 7.85835 18.2583 7.67501 18.125L4.70001 19.375L1.95001 14.625L4.52501 12.675C4.50835 12.5583 4.50001 12.4458 4.50001 12.3375V11.6625C4.50001 11.5542 4.50835 11.4417 4.52501 11.325L1.95001 9.375L4.70001 4.625L7.67501 5.875C7.85835 5.74167 8.05001 5.61667 8.25001 5.5C8.45001 5.38333 8.65001 5.28333 8.85001 5.2L9.25001 2H14.75L15.15 5.2C15.3667 5.28333 15.5708 5.38333 15.7625 5.5C15.9542 5.61667 16.1417 5.74167 16.325 5.875L19.3 4.625L22.05 9.375L19.475 11.325C19.4917 11.4417 19.5 11.5542 19.5 11.6625V12.3375C19.5 12.4458 19.4833 12.5583 19.45 12.675L22.025 14.625L19.275 19.375L16.325 18.125C16.1417 18.2583 15.95 18.3833 15.75 18.5C15.55 18.6167 15.35 18.7167 15.15 18.8L14.75 22H9.25001ZM12.05 15.5C13.0167 15.5 13.8417 15.1583 14.525 14.475C15.2083 13.7917 15.55 12.9667 15.55 12C15.55 11.0333 15.2083 10.2083 14.525 9.525C13.8417 8.84167 13.0167 8.5 12.05 8.5C11.0667 8.5 10.2375 8.84167 9.56251 9.525C8.88751 10.2083 8.55001 11.0333 8.55001 12C8.55001 12.9667 8.88751 13.7917 9.56251 14.475C10.2375 15.1583 11.0667 15.5 12.05 15.5Z" />
          </svg>
        </button>
        <button className="p-2 hover:bg-[#3D6788] rounded">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h4v2h-4v4h-2v-4H7v-2h4V8z" />
          </svg>
        </button>
        <button className="p-2 hover:bg-[#3D5788] rounded">
          <svg width="20" height="20" fill="#ffffff" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="m21.75 20.063-5.816-5.818a7.523 7.523 0 0 0 1.44-4.433c0-4.17-3.393-7.562-7.562-7.562-4.17 0-7.562 3.392-7.562 7.562s3.392 7.562 7.562 7.562a7.523 7.523 0 0 0 4.433-1.44l5.818 5.816 1.687-1.688ZM9.812 14.986a5.174 5.174 0 1 1-.002-10.35 5.174 5.174 0 0 1 0 10.349Z" />
          </svg>
        </button>
      </div>
      <div className="relative w-[75%] h-80 mb-4 mt-8">
        <div className="absolute inset-0 bg-[#001226] bg-opacity-100 rounded-lg shadow-md transform -translate-x-4 translate-y-6 border-blue-400 border-2"style={{ boxShadow: '0 0 5px 3px rgba(0, 123, 255, 0.5)'}}></div>
        <div className="absolute inset-0 bg-[#001226] bg-opacity-100 rounded-lg shadow-md transform -translate-x-2 translate-y-3 border-blue-400 border-2 bg-[url('/circuitpattern2.png')] bg-cover bg-blend-overlay" style={{ boxShadow: '0 0 5px 3px rgba(0, 123, 255, 0.5)'}}></div>
        <animated.div
          {...bind()}
          className="absolute inset-0 bg-[#001226] bg-opacity-90 rounded-lg shadow-md flex justify-center items-center p-6 cursor-pointer border-blue-400 border-2 bg-[url('/circuitpatternblue.png')] bg-cover bg-blend-overlay"
          onClick={toggleReveal}
          style={{
            x,
            y,
            rotateZ: rotation,
            touchAction: 'none',
            boxShadow: '0 0 5px 3px rgba(0, 123, 255, 0.5)',
          }}
        >
          <animated.div
            className="absolute inset-0 flex justify-center items-center text-white backface-hidden p-8 rounded-lg"
            style={{ opacity: opacity.to(o => 1 - o), transform }}
          >
            <p className="text-2xl text-center">{flashcards[currentCardIndex].problem}</p>
          </animated.div>
          <animated.div
            className="absolute inset-0 flex justify-center items-center text-white backface-hidden p-8"
            style={{
              opacity,
              transform,
              rotateX: '180deg',
            }}
          >
            <p className="text-2xl text-center">{flashcards[currentCardIndex].answer}</p>
          </animated.div>
        </animated.div>
      </div>
      <div className="flex justify-between w-full mt-8 text-sm">
        <p className="text-red-500">← Swipe left for incorrect</p>
        <p className="text-green-500">Swipe right for correct →</p>
      </div>
      <div className="flex justify-between w-full mt-5 text-sm">
        <p className="text-blue-500">↑ Swipe up for weakness</p>
        <p className="text-purple-500">Swipe down for strength ↓</p>
      </div>
      
      <div className="flex justify-center space-x-6">
        <button onClick={() => handleButtonAction('incorrect')} className="p-2 bg-red-500 text-white rounded-full">
          <X size={24} />
        </button>
        <button onClick={() => handleButtonAction('strength')} className="p-2 bg-gray-500 text-white rounded-full hover:bg-blue-500 transition-colors duration-200">
          <Trash2 size={24} />
        </button>
        <button onClick={() => handleButtonAction('rewind')} className="p-2 bg-gray-500 text-white rounded-full hover:bg-blue-500 transition-colors duration-200">
          <Undo2 size={24} />
        </button>
        <button onClick={() => handleButtonAction('weakness')} className="p-2 bg-gray-500 text-white rounded-full hover:bg-blue-500 transition-colors duration-200">
          <Star size={24} />
        </button>
        <button onClick={() => handleButtonAction('correct')} className="p-2 bg-green-500 text-white rounded-full">
          <Check size={24} />
        </button>
      </div>
      <div className="w-full max-w-4xl mx-auto mt-12">
        {/*<Slider {...carouselSettings}>
          {flashcards.map((card, index) => (
            <div key={index} className="px-2">
              <div className="bg-[#001226] rounded-lg shadow-md p-6 m-3 h-18 flex items-center justify-center border-2 border-blue-400">
                <p className="text-sm text-center text-white truncate">&nbsp;</p>
              </div>
            </div>
          ))}
        </Slider>*/}
      </div>
    </div>
  );
};

export default FlashcardStack;