'use client';

import React, { useState, useEffect } from 'react';
import Typewriter from "typewriter-effect";
import Image from 'next/image';

const IntroPage = () => {
  const [showGif, setShowGif] = useState(false);
  const [showFinalText, setShowFinalText] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const gifTimer = setTimeout(() => setShowGif(true), 2600);
    const hideTimer = setTimeout(() => {
      setShowGif(false);
      setShowFinalText(true);
    }, 7000);
    const formTimer = setTimeout(() => setShowForm(true), 12500);

    return () => {
      clearTimeout(gifTimer);
      clearTimeout(hideTimer);
      clearTimeout(formTimer);
    };
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://tally.so/widgets/embed.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (showForm && window.Tally) {
      window.Tally.openPopup('wbk8Ao', {
        alignLeft: true,
        overlay: true,
        emoji: { text: '👋', animation: 'wave' },
        onSubmit: () => {
          setFormSubmitted(true);
          window.Tally.closePopup('wbk8Ao'); // Close the form after submission
        }
      });
    }
  }, [showForm]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#001226] p-4">
      {!showFinalText && (
        <div className="text-center mb-8">
          <Typewriter
            onInit={(typewriter) => {
              typewriter
                .typeString('Hey! Thanks for tumbling into myMCAT.ai')
                .pauseFor(2000)
                .callFunction(() => setShowGif(true))
                .pauseFor(4000)
                .callFunction(() => setShowGif(false))
                .start();
            }}
            options={{
              delay: 50,
              cursor: '',
            }}
          />
        </div>
      )}
      {showGif && (
        <div className="mt-8 animate-fadeIn">
          <Image
            src="/Kalypsotumble.gif"
            alt="Kalypso Tumble"
            width={500}
            height={500}
            className="rounded-lg"
          />
        </div>
      )}
      {showFinalText && !formSubmitted && (
        <div className="text-center animate-fadeIn">
          <Typewriter
            onInit={(typewriter) => {
              typewriter
                .typeString("Before we get started, kindly answer a few questions for us...")
                .start();
            }}
            options={{
              delay: 50,
              cursor: '',
            }}
          />
        </div>
      )}
      {formSubmitted && (
        <div className="animate-fadeIn mt-8">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/H58vbez_m4E?autoplay=1"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
      <style jsx global>{`
        .Typewriter__wrapper {
          font-size: 1.0rem;
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

export default IntroPage;