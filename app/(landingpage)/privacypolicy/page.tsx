'use client';

import React, { useEffect, useRef } from 'react';

const Page = () => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://app.termly.io/embed-policy.min.js";
    script.async = true;
    script.id = 'termly-jssdk';
    document.body.appendChild(script);

    // Set the name attribute after mount
    if (divRef.current) {
      divRef.current.setAttribute('name', 'termly-embed');
    }

    return () => {
      const scriptElement = document.getElementById('termly-jssdk');
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, []);

  return (
    <div 
      ref={divRef}
      data-name="termly-embed"
      data-id="c6e0d1ec-db80-48aa-83a9-06810ae93c5f"
      style={{
        color: 'white',
        paddingTop: '100px'
      }}
    ></div>
  );
};

export default Page;