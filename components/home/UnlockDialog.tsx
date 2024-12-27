import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { toast } from "react-hot-toast";

interface UnlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  unlockType: "game" | "ts";
  title: string;
  description: string;
  cost: number;
}

export const UnlockDialog = ({ 
  isOpen, 
  onClose, 
  unlockType,
  title,
  description,
  cost
}: UnlockDialogProps) => {
  const [userScore, setUserScore] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchUserScore = async () => {
      try {
        const response = await fetch("/api/user-info");
        if (!response.ok) throw new Error("Failed to fetch user score");
        const data = await response.json();
        setUserScore(data.score);
      } catch (error) {
        console.error("Error fetching user score:", error);
        toast.error("Failed to fetch user score");
      }
    };

    fetchUserScore();
  }, []);

  const handleUnlock = async () => {
    if (userScore < cost) {
      toast.error(`You need ${cost} coins to unlock this feature!`);
      return;
    }

    try {
      const response = await fetch("/api/user-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          unlockGame: true,
          decrementScore: cost,
          unlockType: unlockType
        }),
      });

      if (!response.ok) throw new Error("Failed to unlock feature");

      const data = await response.json();
      setUserScore(data.score);
      onClose();
      toast.success(`${title} unlocked! ${cost} coins deducted`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to unlock feature");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="mb-6">{description}</p>
          <div className="flex justify-between items-center">
            <span>Cost: {cost} coins</span>
            <button
              onClick={handleUnlock}
              className="bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] text-white px-4 py-2 rounded"
            >
              Unlock Now
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 