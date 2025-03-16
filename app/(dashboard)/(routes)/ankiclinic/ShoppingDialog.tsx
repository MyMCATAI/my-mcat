import React, { useState, forwardRef, useImperativeHandle, useCallback, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useUser } from "@clerk/nextjs";
import { Mail } from 'lucide-react';
import ThemeSwitcher from '@/components/home/ThemeSwitcher';
import { useWindowSize } from "@/store/selectors";

interface ImageItem {
  id: string;
  src: string;
}

export interface ImageGroup {
  name: string;
  items: ImageItem[];
  cost: number;
  benefits: string[];
}

interface ShoppingDistrictProps {
  imageGroups: ImageGroup[];
  visibleImages: Set<string>;
  toggleGroup: (groupName: string) => void;
  buttonContent?: React.ReactNode;
  userScore: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clinicRooms: string;
}

const ShoppingDistrict = forwardRef<{ open: () => void }, ShoppingDistrictProps>(({
  imageGroups,
  visibleImages,
  toggleGroup,
  buttonContent,
  userScore,
  isOpen,
  onOpenChange,
  clinicRooms
}, ref) => {
  const { user } = useUser();
  const windowSize = useWindowSize();
  const isMobile = !windowSize.isDesktop;

  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageForm, setMessageForm] = useState({ message: '' });
  const [isMounted, setIsMounted] = useState(false);
  const [purchasingLevel, setPurchasingLevel] = useState<number | null>(null);

  // Parse clinicRooms string into array
  const parsedClinicRooms = useMemo(() => {
    if (!clinicRooms || clinicRooms === "undefined") return [];
    
    try {
      return JSON.parse(clinicRooms);
    } catch (error) {
      console.error('Error parsing clinicRooms:', error);
      return [];
    }
  }, [clinicRooms]);

  const levelInfo = [
    { level: 1, title: "INTERN LEVEL", image: "/game-components/INTERNLEVEL.png", cost: 4 },
    { level: 2, title: "RESIDENT LEVEL", image: "/game-components/RESIDENTLEVEL.png", cost: 8 },
    { level: 3, title: "FELLOWSHIP LEVEL", image: "/game-components/FELLOWSHIPLEVEL.png", cost: 12 },
    { level: 4, title: "ATTENDING LEVEL", image: "/game-components/ATTENDINGLEVEL.png", cost: 16 },
    { level: 5, title: "PHYSICIAN LEVEL", image: "/game-components/PHYSICIANLEVEL.png", cost: 20 },
    { level: 6, title: "MEDICAL DIRECTOR LEVEL", image: "/game-components/MEDICALDIRECTORLEVEL.png", cost: 24 },
  ];

  const handleLevelClick = async (level: number) => {
    if (purchasingLevel !== null) return;
    
    const levelTitle = levelInfo[level - 1].title;
    const group = imageGroups.find(g => g.name === levelTitle);

    if (group) {
      const previousLevelPurchased = level === 1 || parsedClinicRooms.includes(levelInfo[level - 2].title);

      if (previousLevelPurchased) {
        if (parsedClinicRooms.includes(group.name)) {
          toast.error("This level is already purchased.");
        } else {
          setPurchasingLevel(level);
          try {
            await toggleGroup(group.name);
          } finally {
            setPurchasingLevel(null);
          }
        }
      } else {
        toast.error(`You need to purchase level ${level - 1} first.`);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to send a message.');
      return;
    }
    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageForm.message,
        }),
      });

      if (response.ok) {
        toast.success('Message sent successfully!');
        setShowMessageForm(false);
        setMessageForm({ message: '' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  };

  useImperativeHandle(ref, () => ({
    open: () => onOpenChange(true)
  }));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {buttonContent}
      </DialogTrigger>
      <DialogContent className={`${isMobile ? 'max-w-[98vw] h-[90vh] p-3' : 'max-w-[80vw] h-[80vh]'} bg-[--theme-doctorsoffice-accent] border text-[--theme-text-color] border-[--theme-border-color] flex flex-col rounded-xl`}>
        <DialogHeader className={`mb-2 ${isMobile ? 'px-1' : ''}`}>
          <DialogTitle className="text-[--theme-hover-text] text-center items-center justify-center rounded-lg bg-[--theme-hover-color] p-2 flex">
            <div className="flex items-center mr-4">
              <Image
                src="/game-components/PixelCupcake.png"
                alt="Cupcake Coin"
                width={24}
                height={24}
                className="mr-2"
              />
              <span>{userScore}</span>
            </div>
            <span className="flex-grow">Marketplace</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className={`flex-grow ${isMobile ? 'flex flex-col gap-2' : 'flex'}`}>
          {/* Card section */}
          <div className={`${isMobile ? 'w-full pb-1' : 'w-2/3 pr-2'}`}>
            <ScrollArea className={`${isMobile ? 'h-[40vh]' : 'h-[calc(80vh-120px)]'} overflow-visible`}>
              <div className="pr-4 pb-4 themed-scrollbar">
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-2'} p-1`}>
                  {levelInfo.map(({ level, title, image, cost }, index) => {
                    const group = imageGroups.find(g => g.name === title);
                    const isPurchased = parsedClinicRooms.includes(title);
                    const previousLevelPurchased = level === 1 || parsedClinicRooms.includes(levelInfo[level - 2].title);
                    const isAvailable = !isPurchased && previousLevelPurchased;

                    return (
                      <div
                        key={title}
                        onClick={() => isAvailable && purchasingLevel === null && handleLevelClick(level)}
                        onMouseEnter={() => setHoveredLevel(level)}
                        onMouseLeave={() => setHoveredLevel(null)}
                        className={`relative cursor-pointer transition-all duration-200 ${isMobile ? 'aspect-[5/2]' : 'aspect-[4/3]'} group w-full ${(!isAvailable || purchasingLevel !== null) && 'opacity-50 cursor-not-allowed'}`}
                      >
                        <div className={`absolute inset-0 transition-all duration-200 
                          ${isPurchased ? 'opacity-100' : 'opacity-100'}
                          border border-[--theme-border-color] rounded-lg overflow-hidden
                          ${hoveredLevel === level ? 'bg-[--theme-hover-color]' : 'bg-[--theme-leaguecard-color]'}`}>
                          <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 p-1 text-white flex justify-between items-center z-10">
                            <div>
                              <div className="text-xs font-krungthep">LEVEL {level}</div>
                              <div className="text-sm font-krungthep">{title}</div>
                            </div>
                            <div className="text-sm font-krungthep">{cost} Coins</div>
                          </div>
                          <div className={`absolute inset-0 transition-opacity duration-200 ${hoveredLevel === level ? 'opacity-10' : 'opacity-100'}`}>
                            <Image
                              src={image}
                              alt={title}
                              layout="fill"
                              objectFit="contain"
                              className="rounded-md"
                            />
                          </div>
                          {hoveredLevel === level && group && (
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                              <ul className="list-disc text-[--theme-hover-text]">
                                {group.benefits.map((benefit, index) => (
                                  <li key={index} className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{benefit}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {isPurchased && (
                            <div className="absolute inset-0 bg-green-500 bg-opacity-50 flex items-center justify-center">
                              <div className="text-white text-2xl font-bold">Purchased</div>
                            </div>
                          )}
                          {!isPurchased && !isAvailable && (
                            <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
                              <div className="text-white text-lg font-bold text-center">
                                Purchase previous level first
                              </div>
                            </div>
                          )}
                          {purchasingLevel === level && (
                            <div className="absolute inset-0 bg-[--theme-gradient-startstreak] bg-opacity-50 flex items-center justify-center">
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                <div className="text-white text-lg font-bold">Processing...</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </div>
          
          {/* Additional items section */}
          <div className={`${isMobile ? 'w-full flex-grow' : 'w-1/3'} flex flex-col`}>
            <div className="flex-grow bg-[--theme-leaguecard-color] p-3 rounded-lg mb-2 flex flex-col">
              <h3 className="text-lg font-semibold mb-2">Additional Items</h3>
              <div className="flex-grow flex flex-col items-center justify-center text-center gap-4">
                <div className="flex flex-col items-center gap-4 w-full">
                  <p>Change your theme:</p>
                  <ThemeSwitcher />
                  <div className="border-t border-[--theme-border-color] w-full my-3" />
                  <p>Do you want more features? Send us a message! :D</p>
                  {!showMessageForm ? (
                    <button 
                      onClick={() => setShowMessageForm(true)}
                      className="p-2 bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] rounded-full hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-opacity"
                    >
                      <Mail size={24} />
                    </button>
                  ) : (
                    <form onSubmit={handleSendMessage} className="w-full">
                      <textarea
                        placeholder="Your message"
                        value={messageForm.message}
                        onChange={(e) => setMessageForm({ message: e.target.value })}
                        className="w-full p-3 mb-3 rounded-lg resize-none text-gray-800 border border-[--theme-border-color]"
                        required
                        rows={isMobile ? 3 : 6}
                      />
                      <div className="flex justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setShowMessageForm(false)}
                          className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors min-w-[80px]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="py-2 px-4 bg-[--theme-hover-color] text-[--theme-hover-text] rounded-lg hover:opacity-80 transition-opacity min-w-[80px]"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ShoppingDistrict.displayName = 'ShoppingDistrict';

export default ShoppingDistrict;
