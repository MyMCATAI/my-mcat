import React, { useEffect, useRef } from 'react';

const ElevenLabsWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || scriptLoaded.current) return;

    const loadScript = () => {
      const script = document.createElement('script');
      script.src = 'https://elevenlabs.io/convai-widget/index.js';
      script.async = true;
      script.type = 'text/javascript';
      script.onload = () => {
        console.log('ElevenLabs script loaded!');
        
        // Force a re-paint of the container to ensure the widget initializes
        setTimeout(() => {
          if (containerRef.current) {
            const widget = document.createElement('elevenlabs-convai');
            widget.setAttribute('agent-id', 'mJY8ySBldDTw9HVileNK');
            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(widget);
            console.log('ElevenLabs widget added to DOM');
          }
        }, 100);
      };

      document.body.appendChild(script);
      scriptLoaded.current = true;
    };

    loadScript();

    return () => {
      // Cleanup logic if needed
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full min-h-[80px] flex items-start"
      style={{ 
        minHeight: '80px',
        overflow: 'visible',
        position: 'relative'
      }}
    >
      {/* The widget will be inserted here programmatically */}
    </div>
  );
};

export default ElevenLabsWidget; 