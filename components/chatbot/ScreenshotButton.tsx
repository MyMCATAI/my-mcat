import React from 'react';
import { Camera } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ScreenshotButtonProps {
  onScreenshot: (blob: Blob) => void;
}

const ScreenshotButton: React.FC<ScreenshotButtonProps> = ({ onScreenshot }) => {
  const takeScreenshot = async () => {
    try {
      const canvas = await html2canvas(document.body);
      canvas.toBlob(async (blob) => {
        if (blob) {
          onScreenshot(blob);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  };

  return (
    <button
      onClick={takeScreenshot}
      className="p-1.5 bg-gray-400 text-white rounded-full hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      title="Send screen to your study buddy <3"
    >
      <Camera size={22} />
    </button>
  );
};

export default ScreenshotButton;