"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ONBOARDING_STEPS, useOnboardingInfo } from "@/hooks/useOnboardingInfo";
import { NameStep } from "./steps/NameStep";
import { CollegeStep } from "./steps/CollegeStep";
import { AcademicsStep } from "./steps/AcademicsStep";
import { GoalsStep } from "./steps/GoalsStep";
import { CoinIntroStep } from "./steps/CoinIntroStep";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useUser } from "@/store/selectors"; // Import useUser for onboardingComplete state

/* --- Constants ----- */
const TOTAL_STEPS = Object.keys(ONBOARDING_STEPS).length;

/* ----- Types ---- */
/* ---- State ----- */
/* ---- Refs --- */
/* ----- Callbacks --- */
/* --- Animations & Effects --- */
/* ---- Event Handlers ----- */
/* ---- Render Methods ----- */

const OnboardingModal = () => {
  const {
    onboardingInfo,
    handleNameSubmit,
    handleCollegeSubmit,
    handleAcademicsSubmit,
    handleGoalsSubmit,
    finalizeOnboarding,
    updateOnboardingInfo,
    currentStep,
    isLoading, 
    coinsSubmitState
  } = useOnboardingInfo();

  // Global onboarding state
  const { onboardingComplete } = useUser();
  
  // Local state to control modal visibility directly
  // Initialize based on the global state
  const [isModalOpen, setIsModalOpen] = useState(!onboardingComplete);

  const handleCoinsSubmit = async (data: { friendEmail?: string }) => {
    // Set local state to false immediately to close the modal visually
    setIsModalOpen(false);
    
    // Then, proceed with the finalization logic (updating global state, DB)
    await finalizeOnboarding();
  };

  const renderCurrentStep = () => {
    if (!onboardingInfo && currentStep !== ONBOARDING_STEPS.NAME) {
      // Optionally show a loading state or handle appropriately
      // For now, default to NameStep if info isn't loaded but step isn't NAME
      // This might need adjustment based on how useOnboardingInfo initializes
      return <NameStep onSubmit={handleNameSubmit} />;
    }

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
      case ONBOARDING_STEPS.COINS:
        return <CoinIntroStep
          onSubmit={handleCoinsSubmit}
          firstName={onboardingInfo?.firstName || "Future Doctor"}
          isLoading={coinsSubmitState.loading}
        />;
      default:
        // Fallback or loading state
        return <NameStep onSubmit={handleNameSubmit} />;
    }
  };

  // Get step title based on currentStep
  const getStepTitle = (step: number) => {
    switch (step) {
      case ONBOARDING_STEPS.NAME: return "Welcome!";
      case ONBOARDING_STEPS.COLLEGE: return "Your Background";
      case ONBOARDING_STEPS.ACADEMICS: return "Academic Details";
      case ONBOARDING_STEPS.GOALS: return "MCAT Goals";
      case ONBOARDING_STEPS.COINS: return "Get Started!";
      default: return "Onboarding";
    }
  };

  // Render the Dialog only if onboarding is not complete
  // The Dialog component itself handles open state based on the `open` prop
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent 
        className="max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0 overflow-hidden shadow-xl rounded-lg [&>button]:hidden" 
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()} 
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative" 
          >
            <Card className="w-full border-none bg-white text-gray-900 dark:bg-gray-50 dark:text-gray-900 shadow-none rounded-lg">
              <CardHeader>
                <CardTitle className="text-gray-900">{getStepTitle(currentStep)}</CardTitle>
                <CardDescription className="text-gray-600">Step {currentStep} of {TOTAL_STEPS}</CardDescription>
              </CardHeader>
              <CardContent className="text-gray-900">
                {renderCurrentStep()}
              </CardContent>
            </Card>
            
            {coinsSubmitState.loading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 rounded-lg">
                <p className="text-white text-lg animate-pulse">Finalizing...</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal; 