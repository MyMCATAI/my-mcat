'use client';

import React, { useEffect, useRef } from 'react';

const Page = () => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      (function(d, s, id) {
        var js, tjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://app.termly.io/embed-policy.min.js";
        tjs.parentNode.insertBefore(js, tjs);
      }(document, 'script', 'termly-jssdk'));
    `;
    document.body.appendChild(script);

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
      data-id="db28699d-6ab1-478a-810e-eff7605c7808"
      style={{
        color: 'white',
        paddingTop: '100px'
      }}
    ></div>
  );
};

export default Page;