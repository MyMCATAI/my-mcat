'use client';

import React, { useEffect } from 'react';

interface TallyPopupProps {
  formId: string;
  buttonText: string;
  options?: PopupOptions;
}

declare global {
  interface Window {
    Tally?: {
      openPopup: (formId: string, options?: PopupOptions) => void;
      closePopup: (formId: string) => void;
    };
  }
}

type PopupOptions = {
  key?: string;
  layout?: 'default' | 'modal';
  width?: number;
  alignLeft?: boolean;
  hideTitle?: boolean;
  overlay?: boolean;
  emoji?: {
    text: string;
    animation: 'none' | 'wave' | 'tada' | 'heart-beat' | 'spin' | 'flash' | 'bounce' | 'rubber-band' | 'head-shake';
  };
  autoClose?: number;
  showOnce?: boolean;
  doNotShowAfterSubmit?: boolean;
  customFormUrl?: string;
  hiddenFields?: {
    [key: string]: any;
  };
  onOpen?: () => void;
  onClose?: () => void;
  onPageView?: (page: number) => void;
  onSubmit?: (payload: any) => void;
};

const TallyPopup: React.FC<TallyPopupProps> = ({ formId, buttonText, options }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://tally.so/widgets/embed.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleClick = () => {
    if (window.Tally) {
      window.Tally.openPopup(formId, options);
    }
  };

  return (
    <button onClick={handleClick}>
      {buttonText}
    </button>
  );
};

export default TallyPopup;
