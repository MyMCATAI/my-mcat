'use client';
import React, { useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

const IntroPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Add event listener for form submission
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'form_submit') {
        router.push('/sign-up');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#001226] p-4 overflow-hidden">
      <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />
      <div className="w-full h-full flex justify-center items-center">
        <div className="w-full max-w-full relative h-[90vh]">
          <iframe
            src="https://tally.so/embed/31vBY4?transparentBackground=1&hideHeader=0"
            width="100%"
            height="100%"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="MyMCAT's Early Access Form"
            style={{
              position: 'absolute',
              top: '50%',
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

      <style jsx global>{`
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