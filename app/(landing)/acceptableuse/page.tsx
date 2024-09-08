'use client';

import React, { useEffect } from 'react';

const Page = () => {
  useEffect(() => {
    const loadTermlyScript = (d: Document, s: string, id: string) => {
      var js: HTMLScriptElement, tjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://app.termly.io/embed-policy.min.js";
      tjs.parentNode?.insertBefore(js, tjs);
    };

    loadTermlyScript(document, 'script', 'termly-jssdk');
  }, []);

  return (
    <>
      <h1>Acceptable Use Policy</h1>
      <div 
        data-name="termly-embed" 
        data-id="7c6850dd-f3c5-45a0-954a-e5392ba5d6c5"
      />
    </>
  );
};

export default Page;