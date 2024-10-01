'use client';
import React, { useState, useEffect } from 'react';
import Typewriter from "typewriter-effect";
import Image from 'next/image';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

const IntroPage = () => {
  const [showGif, setShowGif] = useState(false);
  const [showIntroText, setShowIntroText] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const gifTimer = setTimeout(() => setShowGif(true), 2400);
    const hideGifTimer = setTimeout(() => {
      setShowGif(false);
      setShowIntroText(false);
      setShowForm(true); // Show form immediately after intro text
    }, 6400);

    // Add event listener for form submission
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'form_submit') {
        router.push('/sign-up');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      clearTimeout(gifTimer);
      clearTimeout(hideGifTimer);
      window.removeEventListener('message', handleMessage);
    };
  }, [router]);

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
      </div>

      {showForm && (
        <>
          <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />
          <div className="w-full h-full flex justify-center items-center">
            <div className="w-full max-w-full relative h-[90vh]"> {/* Added relative positioning and height */}
              <iframe
                src="https://tally.so/embed/31vBY4?transparentBackground=1&hideHeader=0"
                width="100%"
                height="100%"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="MyMCAT's Early Access Form"
                style={{
                  position: 'absolute', // Changed to absolute positioning within the relative container
                  top: '70%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              ></iframe>
            </div>
          </div>
        </>
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
        /* Override page styles when form is shown */
        body, html {
          overflow: hidden;
          height: 100%;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default IntroPage;