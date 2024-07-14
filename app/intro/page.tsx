'use client';
import React, { useState, useEffect } from 'react';
import Typewriter from "typewriter-effect";
import Image from 'next/image';

const IntroPage = () => {
  const [showGif, setShowGif] = useState(false);
  const [showIntroText, setShowIntroText] = useState(true);
  const [showFinalText, setShowFinalText] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const gifTimer = setTimeout(() => setShowGif(true), 2400);
    const hideGifTimer = setTimeout(() => {
      setShowGif(false);
      setShowIntroText(false);
    }, 6400);
    const showFinalTextTimer = setTimeout(() => setShowFinalText(true), 7100);
    const formTimer = setTimeout(() => setShowForm(true), 12500);

    return () => {
      clearTimeout(gifTimer);
      clearTimeout(hideGifTimer);
      clearTimeout(showFinalTextTimer);
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
          window.Tally.closePopup('wbk8Ao');
        }
      });
    }
  }, [showForm]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#001226] p-4">
      <div className="relative w-full max-w-lg">
        {showGif && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-4 animate-fadeIn">
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
                  .typeString('Hey! Thanks for tumbling into myMCAT.ai')
                  .start();
              }}
              options={{
                delay: 50,
                cursor: '',
              }}
            />
          </div>
        )}
      </div>

      {showFinalText && !formSubmitted && (
        <div className="text-center animate-fadeIn mt-8">
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
            width="1200"
            height="660"
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