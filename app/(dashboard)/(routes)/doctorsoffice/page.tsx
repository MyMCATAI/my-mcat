"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ResourcesMenu from "./ResourcesMenu";
import OfficeContainer from "./OfficeContainer";
import FloatingButton from "../home/FloatingButton";
import ShoppingDialog, { ImageGroup } from "./ShoppingDialog";
import { useRouter } from "next/navigation";
import { DoctorOfficeStats } from "@/types";
import { toast } from "react-hot-toast";
import Image from "next/image";
import {
  calculatePlayerLevel,
  getPatientsPerDay,
  calculateTotalQC,
  getClinicCostPerDay,
  getLevelNumber,
  calculateQualityOfCare,
} from "@/utils/calculateResourceTotals";
import WelcomeDialog from "./WelcomeDialog";
import FlashcardsDialog from "./FlashcardsDialog";
import StartChallengeComponent from "./StartChallengeComponent";
import AfterTestFeed from "./AfterTestFeed";
import type { UserResponse } from "@prisma/client";

const DoctorsOfficePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("doctorsoffice");
  const [userLevel, setUserLevel] = useState("PATIENT LEVEL");
  const [userScore, setUserScore] = useState(0);
  const [patientsPerDay, setPatientsPerDay] = useState(4);
  const router = useRouter();
  const [userRooms, setUserRooms] = useState<string[]>([]);
  const [reportData, setReportData] = useState<DoctorOfficeStats | null>(null);
  const [totalPatients, setTotalPatients] = useState(0);
  const [isAfterTestDialogOpen, setIsAfterTestDialogOpen] = useState(false);
  const [largeDialogQuit, setLargeDialogQuit] = useState(false);

  // Flashcards Dialog
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const flashcardsDialogRef = useRef<{ open: () => void } | null>(null);
  const [flashcardRoomId, setFlashcardRoomId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  // Add this useEffect

  // Game functionality
  const [showChallengeButton, setShowChallengeButton] = useState(true);
  const [activeRooms, setActiveRooms] = useState<Set<string>>(() => new Set());
  const [timer, setTimer] = useState<number>(60);
  const [currentUserTestId, setCurrentUserTestId] = useState<string | null>(
    null
  );

  // User Responses
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [testScore, setTestScore] = useState(0);

  const fetchUserResponses = useCallback(async (testId: string) => {
    try {
      const response = await fetch(
        `/api/user-test/${testId}?includeQuestionInfo=true`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user responses");
      }
      const data = await response.json();
      const responses = data.responses || [];
      setUserResponses(responses);

      // Calculate correct and wrong counts
      const correct =
        responses?.filter((response: UserResponse) => response.isCorrect)
          ?.length || 0;
      const wrong =
        responses?.filter((response: UserResponse) => !response.isCorrect)
          ?.length || 0;

      setCorrectCount(correct);
      setWrongCount(wrong);
    } catch (error) {
      console.error("Error fetching user responses:", error);
      toast.error("Failed to load test responses");
    }
  }, []);

  // Add this effect after your other useEffects
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!showChallengeButton && timer >= 0 && !isLoading) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Fetch user responses
            if (currentUserTestId) {
              fetchUserResponses(currentUserTestId);
            }

            // Dummy scoring logic
            const correctQuestionWeight = 1;
            const incorrectQuestionWeight = -0.5;
            const testScore =
              correctCount * correctQuestionWeight +
              wrongCount * incorrectQuestionWeight;
            setTestScore(testScore);

            // Update the UserTest with score when timer ends
            if (currentUserTestId) {
              fetch(`/api/user-test/${currentUserTestId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  score: testScore, // Scoring logic to be added here
                  finishedAt: new Date().toISOString(),
                }),
              }).catch(console.error);
            }
            if (!isFlashcardsOpen && !largeDialogQuit) {
              setIsAfterTestDialogOpen(true);
            }
            setActiveRooms(new Set());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    showChallengeButton,
    timer,
    currentUserTestId,
    activeRooms.size,
    isFlashcardsOpen,
    fetchUserResponses,
    correctCount,
    wrongCount,
    testScore,
    isLoading,
    largeDialogQuit,
  ]); // Organized dependency array

  const createNewUserTest = async () => {
    try {
      const response = await fetch("/api/user-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create user test");
      }

      const data = await response.json();
      setCurrentUserTestId(data.id);
      return data.id;
    } catch (error) {
      console.error("Error creating user test:", error);
      toast.error("Failed to start challenge");
      return null;
    }
  };

  const handleStartChallenge = async () => {
    const userTestId = await createNewUserTest();
    if (userTestId) {
      setShowChallengeButton(false);
    }
  };
  // Marketplace Dialog
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const marketplaceDialogRef = useRef<{ open: () => void } | null>(null);
  const [hasOpenedMarketplace, setHasOpenedMarketplace] = useState(false);

  const [isWelcomeDialogOpen, setIsWelcomeDialogOpen] = useState(false);

  // Add this state for clinic name
  const [clinicName, setClinicName] = useState<string | null>(null);

  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const [clinicCostPerDay, setClinicCostPerDay] = useState(0);

  const [isCalculating, setIsCalculating] = useState(false);
  const hasCalculatedRef = useRef(false);

  // Add this new state for streak days
  const [streakDays, setStreakDays] = useState(0);
  // Marketplace State
  const imageGroups = [
    {
      name: "INTERN LEVEL",
      items: [
        {
          id: "ExaminationRoom1",
          src: "/game-components/ExaminationRoom1.png",
        },
        { id: "WaitingRoom1", src: "/game-components/WaitingRoom1.png" },
        { id: "DoctorsOffice1", src: "/game-components/DoctorsOffice1.png" },
      ],
      cost: 5,
      benefits: [
        "4 patients a day",
        "1 cupcake coin a day",
        "Quality of Care (QC) = 1x",
        "You are an intern learning the ropes.",
      ],
    },
    {
      name: "RESIDENT LEVEL",
      items: [
        {
          id: "ExaminationRoom2",
          src: "/game-components/ExaminationRoom1.png",
        },
        { id: "Bathroom1", src: "/game-components/Bathroom1.png" },
        { id: "Bathroom2", src: "/game-components/Bathroom1.png" },
      ],
      cost: 15,
      benefits: [
        "8 patients a day",
        "1 cupcake coin a day",
        "Quality of Care (QC) = 1.25x",
        "You are a doctor in training with Kalypso.",
      ],
    },
    {
      name: "FELLOWSHIP LEVEL",
      items: [
        { id: "HighCare1", src: "/game-components/HighCare1.png" },
        { id: "HighCare2", src: "/game-components/HighCare1.png" },
      ],
      cost: 25,
      benefits: [
        "10 patients a day",
        "2 cupcake coins a day",
        "Quality of Care (QC) = 1.5x",
        "You are a physician.",
      ],
    },
    {
      name: "ATTENDING LEVEL",
      items: [
        { id: "OperatingRoom1", src: "/game-components/OperatingRoom1.png" },
        { id: "MedicalCloset1", src: "/game-components/MedicalCloset1.png" },
        { id: "MRIMachine2", src: "/game-components/MRIMachine.png" },
      ],
      cost: 35,
      benefits: [
        "Quality of Care (QC) = 1.5x",
        "2 cupcake coins a day",
        "You can do surgeries.",
      ],
    },
    {
      name: "PHYSICIAN LEVEL",
      items: [{ id: "MRIMachine1", src: "/game-components/MRIMachine.png" }],
      cost: 60,
      benefits: [
        "Quality of Care (QC) = 1.75x",
        "3 cupcake coins a day",
        "You can lead teams.",
        "UWorld Raffle Entry ($400 value)",
      ],
    },
    {
      name: "MEDICAL DIRECTOR LEVEL",
      items: [
        { id: "CATScan1", src: "/game-components/CATScan1.png" },
        { id: "CATScan2", src: "/game-components/CATScan1.png" },
      ],
      cost: 80,
      benefits: [
        "Quality of Care (QC) = 2x",
        "3 cupcake coins a day",
        "You are now renowned.",
        "30 min tutoring session.",
      ],
    },
    {
      name: "Team Vacation",
      items: [],
      cost: 1,
      benefits: ["Can take a break tomorrow and save your streak."],
    },
    {
      name: "Free Clinic Day",
      items: [],
      cost: 5,
      benefits: [
        "Treat 50 patients",
        "Double your chances of a 5-star review!",
      ],
    },
    {
      name: "University Sponsorship",
      items: [],
      cost: 20,
      benefits: ["2x boost your value for university in a day"],
    },
  ];

  const fetchData = async () => {
    try {
      const [reportResponse, clinicResponse] = await Promise.all([
        fetch("/api/user-report"),
        fetch("/api/clinic"),
      ]);

      if (!reportResponse.ok || !clinicResponse.ok)
        throw new Error("Failed to fetch user report");
      if (!clinicResponse.ok) throw new Error("Failed to fetch clinic data");

      const reportData: DoctorOfficeStats = await reportResponse.json();
      const clinicData = await clinicResponse.json();
      setReportData(reportData);
      setUserRooms(clinicData.rooms);
      setUserScore(clinicData.score);

      // Set streak days from the user report
      setStreakDays(reportData.streak || 0);

      // Calculate and set player level, patients per day, and clinic cost
      const playerLevel = calculatePlayerLevel(clinicData.rooms);
      const levelNumber = getLevelNumber(playerLevel);
      const patientsPerDay = getPatientsPerDay(levelNumber);
      const clinicCostPerDay = getClinicCostPerDay(levelNumber);

      setUserLevel(playerLevel);
      setPatientsPerDay(patientsPerDay);
      setClinicCostPerDay(clinicCostPerDay);
      setTotalPatients(clinicData.totalPatientsTreated || 0);

      const newVisibleImages = new Set<string>();
      clinicData.rooms.forEach((roomName: string) => {
        const group = imageGroups.find((g) => g.name === roomName);
        if (group) {
          group.items.forEach((item) => newVisibleImages.add(item.id));
        }
      });
      setVisibleImages(newVisibleImages);

      // Always show the welcome dialog when entering the page
      setIsWelcomeDialogOpen(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  // fetch user info
  useEffect(() => {
    fetchData();
    if (!hasCalculatedRef.current) {
      const timer = setTimeout(() => {
        performDailyCalculations();
        hasCalculatedRef.current = true;
      }, 3000);

      // Clean up the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, []);

  // Restart Challenge
  useEffect(() => {
    if (!isAfterTestDialogOpen && !showChallengeButton) {
      setShowChallengeButton(true);
      setTimer(60); // Reset timer to default value
    }
  }, [isAfterTestDialogOpen]);

  const performDailyCalculations = async () => {
    if (isCalculating) return;
    setIsCalculating(true);

    try {
      const response = await fetch("/api/daily-calculations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to perform daily calculations");
      }

      const data = await response.json();
      const {
        updatedScore,
        newPatientsTreated,
        totalPatientsTreated,
        patientsPerDay,
        clinicCostPerDay,
        error,
        alreadyUpdatedToday,
      } = data;

      if (error) {
        // Handle insufficient funds case
        toast.error(
          <div>
            <p>{error}</p>
            <p>Your current balance is {userScore} coins.</p>
            <p>Daily clinic cost: {clinicCostPerDay} coins</p>
          </div>,
          { duration: 5000 }
        );
        return;
      }

      if (alreadyUpdatedToday) {
        toast(
          <div>
            <p>{patientsPerDay} patients were already treated earlier today.</p>
            <p>Total patients: {totalPatientsTreated}</p>
          </div>,
          { duration: 5000 }
        );
        return;
      }

      setUserScore(updatedScore);
      setTotalPatients(totalPatientsTreated);

      if (newPatientsTreated > 0) {
        toast.success(
          <div>
            <p>Daily clinic update:</p>
            <ul>
              <li>New patients treated: {newPatientsTreated}</li>
              <li>Total patients treated: {totalPatientsTreated}</li>
              <li>New balance: {updatedScore} coins</li>
            </ul>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast(
          <div>
            <p>No new patients treated today.</p>
            <p>Daily clinic cost: {clinicCostPerDay} coins</p>
            <p>Current balance: {updatedScore} coins</p>
          </div>,
          { duration: 5000 }
        );
      }
    } catch (error) {
      console.error("Error performing daily calculations:", error);
      toast.error(
        "Failed to perform daily calculations. Please try again later."
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab !== "doctorsoffice") {
      router.push(`/home?tab=${tab}`);
    }
    setActiveTab(tab);
  };

  // Add this function to update user score
  const handleUpdateUserScore = (newScore: number) => {
    setUserScore(newScore);
  };

  // Marketplace Dialog handlers
  const handleOpenMarketplace = () => {
    setIsWelcomeDialogOpen(false);
    setIsMarketplaceOpen(true);
    setHasOpenedMarketplace(true);
    marketplaceDialogRef.current?.open();
  };

  // Flashcards Dialog handlers
  useEffect(() => {
    if (flashcardRoomId !== "") {
      setIsFlashcardsOpen(true);
    }
  }, [flashcardRoomId]);

  // Add a handler to close the dialog
  const handleCloseFlashcards = () => {
    setIsFlashcardsOpen(false);
    setFlashcardRoomId(""); // Reset the room ID when closing
  };

  const handleWelcomeDialogOpenChange = (open: boolean) => {
    setIsWelcomeDialogOpen(open);
  };

  const toggleGroup = async (groupName: string) => {
    const group = imageGroups.find((g) => g.name === groupName);
    if (!group) return;

    const allVisible = group.items.every((item) => visibleImages.has(item.id));

    if (allVisible) {
      return;
    } else {
      // Buying logic
      if (userScore < group.cost) {
        toast.error(`You need ${group.cost} coins to buy ${groupName}.`);
        return;
      }

      try {
        const response = await fetch("/api/clinic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: groupName, cost: group.cost }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update clinic rooms");
        }

        const { rooms: updatedRooms, score: updatedScore } =
          await response.json();
        setUserRooms(updatedRooms);
        setUserScore(updatedScore);
        setVisibleImages((prev) => {
          const newSet = new Set(prev);
          group.items.forEach((item) => newSet.add(item.id));
          return newSet;
        });
        // Refetch user data after successful purchase
        await fetchData();
        setIsMarketplaceOpen(false);

        toast.success(`Added ${groupName} to your clinic!`);
      } catch (error) {
        console.error("Error updating clinic rooms:", error);
        toast.error(
          (error as Error).message || "Failed to update clinic rooms"
        );
      }
    }
  };

  const updateVisibleImages = useCallback((newVisibleImages: Set<string>) => {
    setVisibleImages(newVisibleImages);
  }, []);

  return (
    <div className="fixed inset-x-0 bottom-0 top-[4rem] flex bg-transparent text-[--theme-text-color] p-4">
      <div className="flex w-full h-full max-w-full max-h-full bg-opacity-50 bg-black border-4 border-[--theme-gradient-startstreak] rounded-lg overflow-hidden">
        <div className="w-1/4 p-4 bg-[--theme-gradient-startstreak]">
          <ResourcesMenu
            reportData={reportData}
            userRooms={userRooms}
            totalCoins={userScore}
            totalPatients={totalPatients}
            patientsPerDay={patientsPerDay}
          />
        </div>
        <div className="w-3/4 font-krungthep relative rounded-r-lg">
          {showChallengeButton && (
            <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
              <div className="transform scale-150">
                <StartChallengeComponent
                  onClick={handleStartChallenge}
                  timer={timer} // Make sure these match
                  setTimer={setTimer} // the interface exactly
                />
              </div>
            </div>
          )}
          <OfficeContainer
            visibleImages={visibleImages}
            clinicName={clinicName}
            userScore={userScore}
            userRooms={userRooms}
            imageGroups={imageGroups}
            flashcardRoomId={flashcardRoomId}
            setFlashcardRoomId={setFlashcardRoomId}
            toggleGroup={toggleGroup}
            onUpdateUserScore={handleUpdateUserScore}
            setUserRooms={setUserRooms}
            updateVisibleImages={updateVisibleImages} // Add this line
            activeRooms={activeRooms}
            setActiveRooms={setActiveRooms}
            timer={timer}
            setTimer={setTimer}
            showChallengeButton={showChallengeButton}
            isFlashcardsOpen={isFlashcardsOpen}
            setIsFlashcardsOpen={setIsFlashcardsOpen}
          />
          {/* Fellowship Level button with coins and patients */}
          <div className="absolute top-4 right-4 z-50 flex items-center">
            {/* Patient count */}
            <div className="flex items-center bg-opacity-75 bg-gray-800 rounded-lg p-2 mr-2">
              <Image
                src="/game-components/patient.png"
                alt="Patient"
                width={32}
                height={32}
                className="mr-2"
              />
              <span className="text-white font-bold">{patientsPerDay}</span>
            </div>
            {/* Coins display */}
            <div className="flex items-center bg-opacity-75 bg-gray-800 rounded-lg p-2 mr-2">
              <Image
                src="/game-components/PixelCupcake.png"
                alt="Coin"
                width={32}
                height={32}
                className="mr-2"
              />
              <span className="text-white font-bold">{userScore}</span>
            </div>
            {/* Fellowship Level button with dropdown */}
            <div className="relative group">
              <button className="flex items-center justify-center px-6 py-3 bg-[--theme-doctorsoffice-accent] border-[--theme-border-color] text-[--theme-text-color] hover:text-[--theme-hover-text] hover:bg-[--theme-hover-color] transition-colors text-3xl font-bold uppercase group-hover:text-[--theme-hover-text] group-hover:bg-[--theme-hover-color]">
                <span>{userLevel || "PATIENT LEVEL"}</span>
              </button>
              <div className="absolute right-0 w-full shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
                <ShoppingDialog
                  ref={marketplaceDialogRef}
                  imageGroups={imageGroups}
                  visibleImages={visibleImages}
                  toggleGroup={toggleGroup}
                  userScore={userScore}
                  isOpen={isMarketplaceOpen}
                  onOpenChange={setIsMarketplaceOpen}
                  buttonContent={
                    <a
                      href="#"
                      className="block w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center transition-colors duration-150"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Marketplace
                    </a>
                  }
                />
                <FlashcardsDialog
                  ref={flashcardsDialogRef}
                  isOpen={isFlashcardsOpen}
                  onOpenChange={setIsFlashcardsOpen}
                  roomId={flashcardRoomId}
                  activeRooms={activeRooms}
                  setActiveRooms={setActiveRooms}
                  buttonContent={
                    <a
                      href="#"
                      className="block w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center transition-colors duration-150"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                        />
                      </svg>
                      Flashcards
                    </a>
                  }
                  currentUserTestId={currentUserTestId}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
                <a
                  href="#"
                  className="block w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center transition-colors duration-150"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Tutorial
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AfterTestFeed
        open={isAfterTestDialogOpen}
        onOpenChange={setIsAfterTestDialogOpen}
        userResponses={userResponses}
        correctCount={correctCount}
        wrongCount={wrongCount}
        testScore={testScore}
        largeDialogQuit={largeDialogQuit}
        setLargeDialogQuit={setLargeDialogQuit}
      ></AfterTestFeed>
      <div className="absolute bottom-4 right-4 z-[100]">
        <FloatingButton
          onTabChange={handleTabChange}
          currentPage="doctorsoffice"
          initialTab={activeTab}
        />
      </div>
      <WelcomeDialog
        isOpen={isWelcomeDialogOpen}
        onOpenChange={handleWelcomeDialogOpenChange}
      />
    </div>
  );
};

export default DoctorsOfficePage;
