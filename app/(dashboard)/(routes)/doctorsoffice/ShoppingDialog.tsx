import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
}

const ShoppingDialog: React.FC<ShoppingDialogProps> = ({ imageGroups, visibleImages, toggleGroup }) => {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-[--theme-border-color] bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] hover:text-[--theme-hover-text] hover:bg-[--theme-hover-color]">
          <ShoppingCart className="w-4 h-4 mr-2" /> {/* Add the ShoppingCart icon */}
          Marketplace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-[--theme-text-color]">Marketplace</DialogTitle>
        </DialogHeader>
        <div className="flex">
          <ScrollArea className="h-[400px] w-1/2 pr-4">
            <div className="flex flex-col gap-2">
              {imageGroups.map((group) => (
                <Button
                  key={group.name}
                  onClick={() => toggleGroup(group.name)}
                  onMouseEnter={() => setHoveredImage(group.items[0].src)}
                  onMouseLeave={() => setHoveredImage(null)}
                  variant={group.items.every(item => visibleImages.has(item.id)) ? "default" : "outline"}
                  className={group.items.every(item => visibleImages.has(item.id)) ? "bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}
                >
                  {group.name}
                </Button>
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
