import { GoldSubscriptionCard } from "./GoldSubscriptionCard";
import { AnkiGameCard } from "./AnkiGameCard";
import { PremiumSubscriptionCard } from "./PremiumSubscriptionCard";

export function UnlockOptions() {
  return (
    <div className="w-full max-w-[90rem] mx-auto px-6 py-6 space-y-12 min-h-[800px]">
      <h2 className="text-3xl font-bold text-center text-white">
        Choose Your Path
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">        
          <AnkiGameCard />
          <GoldSubscriptionCard />
        <PremiumSubscriptionCard />
        </div>
    </div>
  );
} 