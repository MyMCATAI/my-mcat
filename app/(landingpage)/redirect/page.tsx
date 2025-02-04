'use client';
import React, { useState, useEffect } from 'react';
import Typewriter from "typewriter-effect";
import Image from 'next/image';

const RedirectPage = () => {
  const [showGif, setShowGif] = useState(false);
  const [showIntroText, setShowIntroText] = useState(true);
  const [showSignInMessage, setShowSignInMessage] = useState(false);

  useEffect(() => {
    const gifTimer = setTimeout(() => setShowGif(true), 2400);
    const hideGifTimer = setTimeout(() => {
      setShowGif(false);
      setShowIntroText(false);
      setShowSignInMessage(true);
    }, 6400);

    return () => {
      clearTimeout(gifTimer);
      clearTimeout(hideGifTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#001226] p-4 overflow-hidden">
      <div className="relative w-full max-w-lg">
        {showGif && (
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full mb-4 animate-fadeIn">
            <Image
              src="/Kalypsotumble.gif"
              alt="Kalypso Tumble"
              width={600}
              height={600}
              className="rounded-lg"
            />
          </div>
        )}
        {showIntroText && (
          <div className="text-center animate-fadeIn">
            <Typewriter
              onInit={(typewriter) => {
                typewriter
                  .typeString('Hey! Thanks for tumbling into myMCAT.ai.')
                  .start();
              }}
              options={{
                delay: 24,
                cursor: '',
              }}
            />
          </div>
        )}
        {showSignInMessage && (
          <div className="text-center animate-fadeIn">
            <Typewriter
              onInit={(typewriter) => {
                typewriter
                  .typeString('But please use a computer to access myMCAT.ai (so I can sit on your keyboard!)')
                  .start();
              }}
              options={{
                delay: 24,
                cursor: '',
              }}
            />
          </div>
        )}
      </div>

      <style jsx global>{`
        .Typewriter__wrapper {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
        }
        @media (min-width: 768px) {
          .Typewriter__wrapper {
            font-size: 1.5rem;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-in;
        }
      `}</style>
    </div>
  );
};

export default RedirectPage;
