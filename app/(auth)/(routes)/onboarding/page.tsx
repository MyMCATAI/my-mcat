"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useOnboardingInfo } from "@/hooks/useOnboardingInfo";
import { useRouter } from "next/navigation";
import { UnlockOptions } from "./components/UnlockOptions";
import { FriendReferral } from "./components/FriendReferral";
import { NameStep } from "./components/steps/NameStep";
import { CollegeStep } from "./components/steps/CollegeStep";
import { AcademicsStep } from "./components/steps/AcademicsStep";
import { GoalsStep } from "./components/steps/GoalsStep";
import { KalypsoDialogueStep } from "./components/steps/KalypsoDialogueStep";

const ONBOARDING_STEPS = {
  NAME: 1,
  COLLEGE: 2,
  ACADEMICS: 3,
  GOALS: 4,
  KALYPSO_DIALOGUE: 5,
  REFERRAL: 6,
  UNLOCK: 7,
} as const;

export default function OnboardingPage() {
  const { createReferral } = useUserInfo();
  const { 
    onboardingInfo, 
    handleNameSubmit,
    handleCollegeSubmit,
    handleAcademicsSubmit,
    handleGoalsSubmit,
    handleReferralComplete,
    handleKalypsoComplete,
    currentStep 
  } = useOnboardingInfo();
  const router = useRouter();

  // Render the appropriate step based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case ONBOARDING_STEPS.NAME:
        return <NameStep onSubmit={handleNameSubmit} />;
      case ONBOARDING_STEPS.COLLEGE:
        return <CollegeStep 
          onSubmit={handleCollegeSubmit} 
          firstName={onboardingInfo?.firstName || "Future Doctor"}
        />;
      case ONBOARDING_STEPS.ACADEMICS:
        return <AcademicsStep onSubmit={handleAcademicsSubmit} />;
      case ONBOARDING_STEPS.GOALS:
        return <GoalsStep onSubmit={handleGoalsSubmit} />;
      case ONBOARDING_STEPS.KALYPSO_DIALOGUE:
        return <KalypsoDialogueStep onComplete={handleKalypsoComplete} />;
      case ONBOARDING_STEPS.REFERRAL:
        return <FriendReferral onComplete={handleReferralComplete} createReferral={createReferral} />;
      case ONBOARDING_STEPS.UNLOCK:
        return <UnlockOptions />;
      default:
        return <NameStep onSubmit={handleNameSubmit} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#001226]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-6"
      >
        {renderStep()}
      </motion.div>
    </div>
  );
}
