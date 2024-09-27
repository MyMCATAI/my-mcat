import React, { useState } from 'react';
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
}

const ShoppingDistrict: React.FC<ShoppingDistrictProps> = ({
  imageGroups,
  visibleImages,
  toggleGroup,
  buttonContent,
  userScore,
}) => {
  const { user } = useUser();
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageForm, setMessageForm] = useState({ message: '' });

  const levelInfo = [
    { level: 1, title: "INTERN LEVEL", image: "/game-components/INTERNLEVEL.png", cost: 5 },
    { level: 2, title: "RESIDENT LEVEL", image: "/game-components/RESIDENTLEVEL.png", cost: 15 },
    { level: 3, title: "FELLOWSHIP LEVEL", image: "/game-components/FELLOWSHIPLEVEL.png", cost: 25 },
    { level: 4, title: "ATTENDING LEVEL", image: "/game-components/ATTENDINGLEVEL.png", cost: 35 },
    { level: 5, title: "PHYSICIAN LEVEL", image: "/game-components/PHYSICIANLEVEL.png", cost: 60 },
    { level: 6, title: "MEDICAL DIRECTOR LEVEL", image: "/game-components/MEDICALDIRECTORLEVEL.png", cost: 80 },
  ];

  const additionalItems = [
    { name: "Team Vacation", cost: 1, benefits: ["Can take a break tomorrow and save your streak."] },
    { name: "Free Clinic Day", cost: 5, benefits: ["Treat 50 patients", "Double your chances of a 5 star review!"] },
    { name: "University Sponsorship", cost: 20, benefits: ["2x Boost Your Value for University in a Day"] },
  ];

  const handleLevelClick = (level: number) => {
    const group = imageGroups.find(g => g.cost === levelInfo[level - 1].cost);
    if (group) {
      const previousLevelPurchased = level === 1 || imageGroups
        .find(g => g.cost === levelInfo[level - 2].cost)?.items
        .every(item => visibleImages.has(item.id));

      if (previousLevelPurchased) {
        if (group.items.every(item => visibleImages.has(item.id))) {
          toast.error("This level is already purchased.");
        } else {
          toggleGroup(group.name);
        }
      } else {
        toast.error(`You need to purchase level ${level - 1} first.`);
      }
    }
  };

  const handleAdditionalItemClick = (itemName: string) => {
    toggleGroup(itemName);
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        {buttonContent}
      </DialogTrigger>
      <DialogContent className="max-w-[80vw] h-[80vh] bg-[--theme-doctorsoffice-accent] border text-[--theme-text-color] border-[--theme-border-color] flex flex-col">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-[--theme-hover-text] text-center items-center justify-center rounded-md bg-[--theme-hover-color] p-2 flex">
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
        <div className="flex-grow flex">
          <div className="w-2/3 pr-2">
            <ScrollArea className="h-[calc(80vh-120px)] overflow-visible">
              <div className="grid grid-cols-2 gap-2 p-1">
                {levelInfo.map(({ level, title, image, cost }, index) => {
                  const group = imageGroups.find(g => g.cost === cost);
                  const isPurchased = group ? group.items.every((item) => visibleImages.has(item.id)) : false;
                  const previousLevelPurchased = level === 1 || imageGroups
                    .find(g => g.cost === levelInfo[level - 2].cost)?.items
                    .every(item => visibleImages.has(item.id));
                  const isAvailable = isPurchased || previousLevelPurchased;

                  return (
                    <div
                      key={title}
                      onClick={() => isAvailable && handleLevelClick(level)}
                      onMouseEnter={() => setHoveredLevel(level)}
                      onMouseLeave={() => setHoveredLevel(null)}
                      className={`relative cursor-pointer transition-all duration-200 aspect-[4/3] group w-full ${!isAvailable && 'opacity-50 cursor-not-allowed'}`}
                    >
                      <div className={`absolute inset-0 transition-all duration-200 
                        ${isPurchased ? 'opacity-100' : 'opacity-100'}
                        border border-[--theme-border-color] rounded-md overflow-hidden
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
                                <li key={index} className="text-sm">{benefit}</li>
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
          <div className="w-1/3 flex flex-col">
            <div className="flex-grow bg-[--theme-leaguecard-color] p-2 rounded-md mb-2 flex flex-col">
              <h3 className="text-lg font-semibold mb-2">Additional Items</h3>
              <ScrollArea className="flex-grow mb-2">
                {additionalItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleAdditionalItemClick(item.name)}
                    className="mb-2 p-2 bg-[--theme-doctorsoffice-accent] rounded-md cursor-pointer hover:bg-[--theme-hover-color] transition-colors"
                  >
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm">Cost: {item.cost} Coins</p>
                    <ul className="list-disc pl-4 text-sm">
                      {item.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </ScrollArea>
              {!showMessageForm ? (
                <button 
                  onClick={() => setShowMessageForm(true)}
                  className="w-full py-2 px-4 bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] rounded-md hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-opacity mt-auto"
                >
                  Send a quick message
                </button>
              ) : (
                <form onSubmit={handleSendMessage} className="mt-auto">
                  <textarea
                    placeholder="Your message"
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({ message: e.target.value })}
                    className="w-full p-2 mb-2 rounded resize-none text-gray-800"
                    required
                    rows={6}
                  />
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setShowMessageForm(false)}
                      className="py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-[--theme-hover-color] text-[--theme-hover-text] rounded-md hover:opacity-80 transition-opacity"
                    >
                      Send
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShoppingDistrict;
