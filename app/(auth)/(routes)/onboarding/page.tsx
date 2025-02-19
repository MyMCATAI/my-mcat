"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useOnboardingInfo } from "@/hooks/useOnboardingInfo";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { UnlockOptions } from "./components/UnlockOptions";
import { FriendReferral } from "./components/FriendReferral";
import { NameStep } from "./components/steps/NameStep";
import { CollegeStep } from "./components/steps/CollegeStep";
import { AcademicsStep } from "./components/steps/AcademicsStep";
import { GoalsStep } from "./components/steps/GoalsStep";
import { KalypsoDialogueStep } from "./components/steps/KalypsoDialogueStep";

// Add this component at the top of the file, after imports
const MigrationLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#001226]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="w-64 h-64 mx-auto mb-8">
          <Image
            src="/kalypsodiagnostic.png"
            alt="Kalypso Loading"
            width={256}
            height={256}
            className="rounded-full"
          />
        </div>
        <h2 className="text-2xl font-light text-white">
          Migrating Your Study Plan...
        </h2>
        <p className="text-blue-300/80 max-w-md mx-auto">
          Please wait while we migrate your study data. Kalypso is working hard to transfer all your progress!
        </p>
        <div className="flex justify-center mt-8">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </motion.div>
    </div>
  );
};

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

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
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    const checkMigration = async () => {
      try {
        setIsMigrating(true);
        const response = await fetch("/api/user-migration", {
          method: "POST"
        });
        
        const data = await response.json();
        
        if (data.needsMigration && data.migrationComplete) {
          toast.success(`Successfully migrated account for ${data.email}!`);
          router.push("/home");
        } else {
          setIsMigrating(false);
        }
      } catch (error) {
        console.error("Migration check failed:", error);
        setIsMigrating(false);
        toast.error(
          "Migration failed. Please reach out to josh on Discord or email josh@mymcat.ai for assistance.",
          { duration: 6000 }
        );
      }
    };

    checkMigration();
  }, [router]);

  // Add effect to check for successful payment return
  useEffect(() => {
    const checkPaymentAndRedirect = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const paymentStatus = searchParams.get('payment');

      if (paymentStatus === 'success') {
        router.push('/examcalendar');
      }
    };

    checkPaymentAndRedirect();
  }, [router]);

  if (isMigrating) {
    return <MigrationLoading />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#001226]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-6xl px-4 md:px-8 py-6 md:py-12"
      >
        {currentStep === ONBOARDING_STEPS.NAME && (
          <NameStep 
            onSubmit={handleNameSubmit}
            initialValue={onboardingInfo?.firstName || undefined}
          />
        )}

        {currentStep === ONBOARDING_STEPS.COLLEGE && (
          <CollegeStep
            onSubmit={handleCollegeSubmit}
            firstName={onboardingInfo?.firstName || "Future Doctor"}
            initialValues={{
              college: onboardingInfo?.college || undefined,
              isNonTraditional: onboardingInfo?.isNonTraditional || undefined,
              isCanadian: onboardingInfo?.isCanadian || undefined,
            }}
          />
        )}

        {currentStep === ONBOARDING_STEPS.ACADEMICS && (
          <AcademicsStep
            onSubmit={handleAcademicsSubmit}
            initialValues={{
              gpa: onboardingInfo?.gpa,
              currentMcatScore: onboardingInfo?.currentMcatScore,
              hasNotTakenMCAT: onboardingInfo?.hasNotTakenMCAT || undefined,
              mcatAttemptNumber: onboardingInfo?.mcatAttemptNumber || undefined,
            }}
          />
        )}

        {currentStep === ONBOARDING_STEPS.GOALS && (
          <GoalsStep
            onSubmit={handleGoalsSubmit}
            initialValues={{
              targetScore: onboardingInfo?.targetScore || undefined,
              targetMedSchool: onboardingInfo?.targetMedSchool || undefined,
            }}
          />
        )}

        {currentStep === ONBOARDING_STEPS.KALYPSO_DIALOGUE && (
          <KalypsoDialogueStep
            onComplete={handleKalypsoComplete}
            firstName={onboardingInfo?.firstName || undefined}
            targetScore={onboardingInfo?.targetScore|| undefined}
            targetMedSchool={onboardingInfo?.targetMedSchool|| undefined}
          />
        )}

        {currentStep === ONBOARDING_STEPS.REFERRAL && (
          <FriendReferral 
            onComplete={handleReferralComplete}
            createReferral={createReferral}
          />
        )}

        {currentStep === ONBOARDING_STEPS.UNLOCK && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 w-full"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-light text-white">
                {`Great work${onboardingInfo?.firstName ? `, ${onboardingInfo.firstName}` : ''}! Let's choose your study path`}
              </h2>
              <p className="text-lg text-blue-200/80">
                Select the option that best fits your MCAT preparation needs
              </p>
            </div>

            <UnlockOptions />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
