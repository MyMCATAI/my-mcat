import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart } from 'lucide-react'; // Import the ShoppingCart icon
import Image from 'next/image';

interface ImageItem {
  id: string;
  src: string;
}

interface ImageGroup {
  name: string;
  items: ImageItem[];
}

interface ShoppingDialogProps {
  imageGroups: ImageGroup[];
  visibleImages: Set<string>;
  toggleGroup: (groupName: string) => void;
  buttonContent?: React.ReactNode;
}

const ShoppingDialog: React.FC<ShoppingDialogProps> = ({ imageGroups, visibleImages, toggleGroup, buttonContent }) => {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center justify-start gap-2 px-4 py-2 bg-[--theme-doctorsoffice-accent] border border-[--theme-border-color] text-[--theme-text-color] rounded-md hover:text-[--theme-hover-text] hover:bg-[--theme-hover-color] transition-colors w-full">
          {buttonContent || (
            <>
              <ShoppingCart size={20} />
              <span>Marketplace</span>
            </>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-[--theme-text-color]">Marketplace</DialogTitle>
        </DialogHeader>
        <div className="flex">
          <ScrollArea className="h-[400px] w-1/2 pr-4">
            <div className="flex flex-col gap-2">
              {imageGroups.map((group) => (
                <button
                  key={group.name}
                  onClick={() => toggleGroup(group.name)}
                  onMouseEnter={() => setHoveredImage(group.items[0].src)}
                  onMouseLeave={() => setHoveredImage(null)}
                  className={`px-4 py-2 rounded-md w-full text-left transition-colors ${
                    group.items.every(item => visibleImages.has(item.id))
                      ? "bg-[--theme-doctorsoffice-accent] text-black hover:text-[--theme-hover-text] hover:bg-[--theme-hover-color]"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {group.name}
                </button>
              ))}
            </div>
          </ScrollArea>
          <div className="w-1/2 pl-4 flex items-center justify-center">
            {hoveredImage && (
              <div className="relative w-full h-[300px]">
                <Image
                  src={hoveredImage}
                  alt="Hovered image"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShoppingDialog;
