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
      data-id="baa0360-e283-49d9-b273-19f54d765254"
      style={{
        color: 'white',
        paddingTop: '100px'
      }}
    ></div>
  );
};

export default Page;