import React, { useState, useRef } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";
import { useOutsideClick } from "@/hooks/use-outside-click";

interface ImageData {
  url: string;
  title: string;
}

interface ExplanationImagesProps {
  questionContent: string;
  isFullScreen?: boolean;
}

export const ExplanationImages: React.FC<ExplanationImagesProps> = ({ 
  questionContent,
  isFullScreen = false
}) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [hasLoadedImages, setHasLoadedImages] = useState(false);
  const imageDialogRef = useRef<HTMLDivElement>(null);

  useOutsideClick(imageDialogRef, () => {
    setSelectedImage(null);
  });

  const fetchImages = async () => {
    if (!questionContent || hasLoadedImages) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/tavily?query=${encodeURIComponent(questionContent.substring(0, 200))}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch images');
      
      const data = await response.json();
      
      if (!data.images || !Array.isArray(data.images)) {
        console.log('No valid images array in response');
        return;
      }

      const validImages = data.images.filter((img: ImageData) => {
        const isValid = img && img.url && typeof img.url === 'string';
        if (!isValid) console.log('Invalid image data:', img);
        return isValid;
      });

      setImages(validImages);
      setHasLoadedImages(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load images';
      console.error('Error fetching images:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = (image: ImageData) => {
    setSelectedImage(image);
  };

  if (!hasLoadedImages && !isLoading) {
    return (
      <div className="mt-4">
        <Button
          onClick={fetchImages}
          className="flex items-center gap-2 bg-[--theme-hover-color] text-white hover:bg-[--theme-hover-color]/90"
        >
          <ImageIcon className="w-4 h-4" />
          Show Related Images
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="w-full h-[12rem] rounded-lg" />
        ))}
      </div>
    );
  }

  if (error || !images.length) {
    return null;
  }

  return (
    <>
      <div className="mt-4">
        <h4 className="text-md font-semibold mb-2 text-[--theme-hover-color]">
          Related Images
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="relative group cursor-pointer"
              onClick={() => handleImageClick(image)}
            >
              <img
                src={image.url}
                alt={image.title || ''}
                className="w-full h-48 object-cover rounded-lg transition-transform duration-200 group-hover:scale-[1.02]"
              />
              {image.title && image.title !== `Related image ${index + 1}` && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {image.title}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div 
          ref={imageDialogRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedImage(null);
            }
          }}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={selectedImage.url}
              alt={selectedImage.title || ''}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            {selectedImage.title && selectedImage.title !== `Related image` && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white p-2 text-sm rounded-lg">
                {selectedImage.title}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}; 