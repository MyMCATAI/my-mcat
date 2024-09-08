'use client';

import React, { useEffect } from 'react';

const Page = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://app.termly.io/embed-policy.min.js";
    script.async = true;
    script.id = 'termly-jssdk';
    document.body.appendChild(script);

    return () => {
      const scriptElement = document.getElementById('termly-jssdk');
      if (scriptElement) {
        document.body.removeChild(scriptElement);
      }
    };
  }, []);

  return (
    <div 
      data-name="termly-embed"
      data-id="c6e0d1ec-db80-48aa-83a9-06810ae93c5f"
      style={{
        color: 'white',
        paddingTop: '2rem',
      }}
    ></div>
  );
};

export default Page;