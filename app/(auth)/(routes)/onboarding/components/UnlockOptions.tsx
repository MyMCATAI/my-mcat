import { GoldSubscriptionCard } from "./GoldSubscriptionCard";
import { AnkiGameCard } from "./AnkiGameCard";
import { PremiumSubscriptionCard } from "./PremiumSubscriptionCard";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useOnboardingInfo } from "@/hooks/useOnboardingInfo";

export function UnlockOptions() {
  const { isGold } = useSubscriptionStatus();
  const router = useRouter();
  const { 
    onboardingInfo, 
  } = useOnboardingInfo();
  if (isGold) {
    return (
      <div className="w-full max-w-[90rem] mx-auto px-6 py-6 space-y-12 min-h-[800px] mt-40">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center text-center space-y-8 p-10"
        >
          <h2 className="text-3xl font-bold text-white">
            Congratulations on Taking the First Step!
          </h2>
          
          <p className="text-xl text-white/80 max-w-3xl">
            You&apos;ve taken the first step towards your MCAT journey and reaching your target score. 
            Our gold level access gives you everything you need to succeed on your MCAT.
          </p>
          
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-yellow-500 to-yellow-300 hover:from-yellow-400 hover:to-yellow-200 text-black font-bold py-6 px-12 text-lg"
            onClick={() => router.push('/examcalendar')}
          >
            Let&apos;s Get Started!
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[90rem] mx-auto px-6 py-6 space-y-12 min-h-[800px]">

<div className="text-center space-y-4">
              <h2 className="text-3xl font-light text-white">
                {`Great work${onboardingInfo?.firstName ? `, ${onboardingInfo.firstName}` : ''}! Let's choose your study path`}
              </h2>
              <p className="text-lg text-blue-200/80">
                Select the option that best fits your MCAT preparation needs
              </p>
            </div>

      <h2 className="text-3xl font-bold text-center text-white">
        Choose Your Path
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">        
          <AnkiGameCard />
          <GoldSubscriptionCard context="onboarding" />
        <PremiumSubscriptionCard context="onboarding" />
      </div>
    </div>
  );
} 