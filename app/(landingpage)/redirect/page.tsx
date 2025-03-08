'use client';
import React, { useState, useEffect } from 'react';
import Typewriter from "typewriter-effect";
import Image from 'next/image';
import Link from 'next/link';

const RedirectPage = () => {
  const [showGif, setShowGif] = useState(false);
  const [showIntroText, setShowIntroText] = useState(true);
  const [showSignInMessage, setShowSignInMessage] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const gifTimer = setTimeout(() => setShowGif(true), 2400);
    const hideGifTimer = setTimeout(() => {
      setShowGif(false);
      setShowIntroText(false);
      setShowSignInMessage(true);
    }, 6400);
    const showVideoTimer = setTimeout(() => {
      setShowVideo(true);
    }, 9000);
    const showButtonTimer = setTimeout(() => {
      setShowButton(true);
    }, 11000);

    return () => {
      clearTimeout(gifTimer);
      clearTimeout(hideGifTimer);
      clearTimeout(showVideoTimer);
      clearTimeout(showButtonTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#001226] p-4 overflow-hidden">
      {/* Main content container with fixed height to prevent shifting */}
      <div className="fixed inset-0 flex flex-col items-center justify-center p-4 -mt-32">
        <div className="w-full max-w-lg flex flex-col items-center gap-8">
          <div className="h-[160px] flex items-center justify-center">
            {showGif && (
              <div className="animate-fadeIn">
                <Image
                  src="/Kalypsotumble.gif"
                  alt="Kalypso Tumble"
                  width={160}
                  height={160}
                  className="rounded-lg"
                />
              </div>
            )}
          </div>
          
          <div className="text-center">
            {showIntroText && (
              <div className="animate-fadeIn">
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
              <div className="animate-fadeIn">
                <Typewriter
                  onInit={(typewriter) => {
                    typewriter
                      .typeString('Great news! You can now access myMCAT.ai on mobile devices too!')
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

          {showVideo && (
            <div className="w-full max-w-2xl animate-fadeIn">
              <p className="text-white text-center mb-4 text-lg">
                Check out what we have for you:
              </p>
              <div className="relative rounded-lg overflow-hidden shadow-2xl">
                <video
                  className="w-[120%]"
                  autoPlay
                  muted
                  loop
                  playsInline
                  src="https://my-mcat.s3.us-east-2.amazonaws.com/public/GamePortion.mp4"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="text-zinc-400 text-center mt-4 text-sm italic">
                P.S. Our mobile support is now live! Kalypso has finally returned our phones 🐱✨
              </p>
            </div>
          )}
          
          {showButton && (
            <div className="animate-fadeIn mt-4">
              <Link href="/ankiclinic">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg">
                  Continue to your personal AnkiClinic
                </button>
              </Link>
            </div>
          )}
        </div>
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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-in;
        }
      `}</style>
    </div>
  );
};

export default RedirectPage;
