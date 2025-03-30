"use client";
import { motion } from "framer-motion";
import { ONBOARDING_STEPS, useOnboardingInfo } from "@/hooks/useOnboardingInfo";
import { NameStep } from "./components/steps/NameStep";
import { CollegeStep } from "./components/steps/CollegeStep";
import { AcademicsStep } from "./components/steps/AcademicsStep";
import { GoalsStep } from "./components/steps/GoalsStep";
import { KalypsoDialogueStep } from "./components/steps/KalypsoDialogueStep";


export default function OnboardingPage() {
  const { 
    onboardingInfo, 
    handleNameSubmit,
    handleCollegeSubmit,
    handleAcademicsSubmit,
    handleGoalsSubmit,
    handleKalypsoComplete,
    currentStep 
  } = useOnboardingInfo();

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
        return <KalypsoDialogueStep onComplete={handleKalypsoComplete} 
        firstName={onboardingInfo?.firstName || "Future Doctor"}
        targetScore={onboardingInfo?.targetScore}
        targetMedSchool={onboardingInfo?.targetMedSchool}
        />;
      default:
        return <NameStep onSubmit={handleNameSubmit} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#001226] px-4 sm:px-6 md:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl p-4 sm:p-6 md:p-8 rounded-lg"
      >
        {renderStep()}
      </motion.div>
    </div>
  );
}
