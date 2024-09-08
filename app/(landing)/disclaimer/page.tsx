'use client';

import React, { useEffect } from 'react';

const Page = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://app.termly.io/embed-policy.min.js";
    script.id = 'termly-jssdk';
    script.async = true;
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
      data-id="bbaa0360-e283-49d9-b273-19f54d765254"
    ></div>
  );
};

export default Page;