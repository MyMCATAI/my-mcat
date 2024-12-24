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
import AfterTestFeed, { UserResponseWithCategory } from "./AfterTestFeed";
import type { UserResponse } from "@prisma/client";
import { FetchedActivity } from "@/types";
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

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
  const flashcardsDialogRef = useRef<{ open: () => void, setWrongCards: (cards: any[]) => void, setCorrectCount: (count: number) => void } | null>(null);
  const [flashcardRoomId, setFlashcardRoomId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalMCQQuestions, setTotalMCQQuestions] = useState(0);
  const [correctMCQQuestions, setCorrectMCQQuestions] = useState(0);

  const afterTestFeedRef = useRef<{ setWrongCards: (cards: any[]) => void } | null>(null);

  // Game functionality
  const [activeRooms, setActiveRooms] = useState<Set<string>>(() => new Set());
  const [completeAllRoom, setCompleteAllRoom] = useState(false);
  const [currentUserTestId, setCurrentUserTestId] = useState<string | null>(
    null
  );

  // Check for completion
  // Initialization of activeRooms is done in OfficeContainer.tsx since currentLevelConfig is not available here
  const handleCompleteAllRoom = () => {
    setCompleteAllRoom(true);
  };

  // User Responses
  const [userResponses, setUserResponses] = useState<UserResponseWithCategory[]>([]);
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

  useEffect(() => {
    const initTest = async () => {
      const userTestId = await createNewUserTest();
      if (userTestId) {
        setCurrentUserTestId(userTestId);
      }
    };
    
    initTest();
  }, []);

  useEffect(() => {
    const finishTest = async () => {
      if (!isLoading && completeAllRoom) {
        // Finish all rooms

        // Fetch user responses
        if (currentUserTestId) {
          fetchUserResponses(currentUserTestId);

          // Dummy scoring logic
          const correctQuestionWeight = 1;
          const incorrectQuestionWeight = -0.5;
          let testScore =
            correctCount * correctQuestionWeight +
            wrongCount * incorrectQuestionWeight;
          testScore = Math.max(testScore, 0);
          setTestScore(testScore);

          // Update the UserTest with score
          fetch(`/api/user-test/${currentUserTestId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              score: testScore,
              finishedAt: new Date().toISOString(),
            }),
          }).catch(console.error);

          if (!isFlashcardsOpen && !largeDialogQuit) {
            setIsAfterTestDialogOpen(true);
          }
        }
      }
    }

    finishTest();
  }, [
    currentUserTestId,
    activeRooms.size,
    isFlashcardsOpen,
    fetchUserResponses,
    correctCount,
    wrongCount,
    testScore,
    isLoading,
    largeDialogQuit,
    completeAllRoom
  ]);

  useEffect(() => {
    const handleCoinReward = async () => {
      // User get 1 coin for 80% correct MCQs
      if (completeAllRoom) {
        const mcqQuestions = totalMCQQuestions;
        const mcqCorrect = correctMCQQuestions;
        const mcqPercentage = mcqQuestions > 0 ? (mcqCorrect / mcqQuestions) * 100 : 0;

        if (mcqQuestions > 0 && mcqPercentage >= 80) {
          const response = await fetch("/api/user-info", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              incrementScore: 1
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to increment coin");
          }

          toast.success("You earned 1 coin for 80%+ correct MCQs!");
        } else if (mcqQuestions > 0) {
          toast.error(`You need 80% correct MCQs to earn a coin. You got ${mcqPercentage.toFixed(1)}%`);
        }
      }
    }

    handleCoinReward();
  }, [completeAllRoom]);

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
      cost: 2,
      benefits: [
        "You are an intern learning the ropes.",
        "Psychology",
        "Sociology"
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
      cost: 4,
      benefits: [
        "You are a doctor in training with Kalypso.",
        "Biology"
      ],
    },
    {
      name: "FELLOWSHIP LEVEL",
      items: [
        { id: "HighCare1", src: "/game-components/HighCare1.png" },
        { id: "HighCare2", src: "/game-components/HighCare1.png" },
      ],
      cost: 6,
      benefits: [
        "You are a physician.",
        "Advanced Biology"
      ],
    },
    {
      name: "ATTENDING LEVEL",
      items: [
        { id: "OperatingRoom1", src: "/game-components/OperatingRoom1.png" },
        { id: "MedicalCloset1", src: "/game-components/MedicalCloset1.png" },
        { id: "MRIMachine2", src: "/game-components/MRIMachine.png" },
      ],
      cost: 8,
      benefits: [
        "You can do surgeries.",
        "Biochemistry"
      ],
    },
    {
      name: "PHYSICIAN LEVEL",
      items: [{ id: "MRIMachine1", src: "/game-components/MRIMachine.png" }],
      cost: 10,
      benefits: [
        "You can lead teams.",
        "Physics",
        "Chemistry"
      ],
    },
    {
      name: "MEDICAL DIRECTOR LEVEL",
      items: [
        { id: "CATScan1", src: "/game-components/CATScan1.png" },
        { id: "CATScan2", src: "/game-components/CATScan1.png" },
      ],
      cost: 12,
      benefits: [
        "You are now renowned.",
        "Advanced Chemistry",
        "Advanced Physics"
      ],
    }
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

  // Flashcards Dialog handlers
  useEffect(() => {
    if (flashcardRoomId !== "") {
      setIsFlashcardsOpen(true);
    }
  }, [flashcardRoomId]);


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

  const [activities, setActivities] = useState<FetchedActivity[]>([]);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/calendar-activity");
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      const activities = await response.json();
      setActivities(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to fetch activities. Please try again.");
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Add this handler for when clinic is unlocked
  const handleClinicUnlocked = async () => {
    await fetchData(); // Refetch all data to update scores and other stats
  };

  const handleOpenAfterTestFeed = () => {
    if(!currentUserTestId) return
    fetchUserResponses(currentUserTestId);
    setIsAfterTestDialogOpen(true);
  };

  const { setIsAutoPlay } = useMusicPlayer();

  useEffect(() => {
    setIsAutoPlay(true);
    return () => setIsAutoPlay(false);
  }, [setIsAutoPlay]);

  const [populateRoomsFn, setPopulateRoomsFn] = useState<(() => void) | null>(null);

  // Create a stable callback for setting the function
  const handleSetPopulateRooms = useCallback((fn: () => void) => {
    console.log("Setting new populateRooms function");
    setPopulateRoomsFn(() => fn);
  }, []);

  const [isGameInProgress, setIsGameInProgress] = useState(false);

  const handleNewGame = async () => {
    // Check if user has enough coins
    if (userScore < 1) {
      toast.error("You need 1 coin to start a new game!");
      return;
    }

    try {
      // Deduct coin
      const response = await fetch("/api/user-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          decrementScore: 1
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to deduct coin");
      }

      const { score: updatedScore } = await response.json();
      setUserScore(updatedScore);

      // Reset all game-related states
      setActiveRooms(new Set());
      setCompleteAllRoom(false);
      setIsAfterTestDialogOpen(false);
      setLargeDialogQuit(false);
      setUserResponses([]);
      setCorrectCount(0);
      setWrongCount(0);
      setTestScore(0);
      setTotalMCQQuestions(0);
      setCorrectMCQQuestions(0);

      flashcardsDialogRef.current?.setWrongCards([])
      flashcardsDialogRef.current?.setCorrectCount(0)
      afterTestFeedRef.current?.setWrongCards([])

      const userTestId = await createNewUserTest();
      if (userTestId) {
        setCurrentUserTestId(userTestId);
        setIsGameInProgress(true);
      }

      // Call populateRoomsFn if it exists
      if (typeof populateRoomsFn === 'function') {
        populateRoomsFn();
        toast.success("New game started! 1 coin deducted.");
      } else {
        console.error("populateRoomsFn is not a function");
        toast.error("Failed to start new game. Please try refreshing the page.");
      }
    } catch (error) {
      console.error("Error starting new game:", error);
      toast.error("Failed to start new game. Please try again.");
    }
  };

  const handleMCQAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectMCQQuestions(prev => prev + 1);
    }
  };

  // Add this state near the top of the component with other state declarations
  const [isFlashcardsTooltipOpen, setIsFlashcardsTooltipOpen] = useState(false);

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
          <OfficeContainer
            onNewGame={handleSetPopulateRooms}
            setCompleteAllRoom={setCompleteAllRoom}
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
            updateVisibleImages={updateVisibleImages}
            activeRooms={activeRooms}
            setActiveRooms={setActiveRooms}
            isFlashcardsOpen={isFlashcardsOpen}
            setIsFlashcardsOpen={setIsFlashcardsOpen}
          />
          {/* Button on the top left corner */}
          <div className="absolute top-4 left-4 flex gap-2 z-50">
            <button
              onClick={handleNewGame}
              className="bg-transparent border-2 border-[--theme-border-color] text-[--theme-hover-color]
                px-6 py-3 rounded-lg transition-all duration-300 
                shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 
                font-bold text-lg flex items-center gap-2
                opacity-90 hover:opacity-100
                hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
            >
              <span className="border-r border-[--theme-border-color] hover:border-white/30 pr-2">New Game</span>
              <span className="text-white">-1</span>
              <Image
                src="/game-components/PixelCupcake.png"
                alt="Coin"
                width={24}
                height={24}
                className="inline-block"
              />
            </button>
            {isGameInProgress && totalMCQQuestions>0 && (
              <button
                onClick={handleOpenAfterTestFeed}
                className="bg-gradient-to-r from-blue-500 to-blue-600
                hover:from-blue-600 hover:to-blue-700
                text-white px-6 py-3 rounded-lg transition-all duration-300 
                shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 
                font-bold text-lg flex items-center gap-2"
              >
                <span>Review</span>
              </button>
            )}
          </div>
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
                alt="Studycoin"
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
                  handleCompleteAllRoom={handleCompleteAllRoom}
                  onMCQAnswer={handleMCQAnswer}
                  setTotalMCQQuestions={setTotalMCQQuestions}
                  buttonContent={
                    <div className="relative">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsFlashcardsTooltipOpen(!isFlashcardsTooltipOpen);
                        }}
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
                      <div 
                        className={`absolute right-full top-1/2 -translate-y-1/2 mr-2 px-4 py-2 w-72 bg-gray-900 text-white text-sm rounded-lg transition-all duration-200 ${
                          isFlashcardsTooltipOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                        }`}
                      >
                        {"We're working on adding uploadable flashcards later. They'll be auto-tagged and made into multiple choice questions. If you REALLY, REALLY want us to prioritize this over the bajillion other things we gotta do, venmo Prynce $100 at @ShortKingsAnthem and say 'Pretty please uploadable flashcards.'"}
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
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
        ref={afterTestFeedRef}
        open={isAfterTestDialogOpen}
        onOpenChange={setIsAfterTestDialogOpen}
        userResponses={userResponses}
        correctCount={correctCount}
        wrongCount={wrongCount}
        largeDialogQuit={largeDialogQuit}
        setLargeDialogQuit={setLargeDialogQuit}
      ></AfterTestFeed>
      <div className="absolute bottom-4 right-4 z-[100]">
        <FloatingButton
          onTabChange={handleTabChange}
          currentPage="doctorsoffice"
          initialTab={activeTab}
          activities={activities}
          onTasksUpdate={fetchActivities}
        />
      </div>
      <WelcomeDialog
        isOpen={isWelcomeDialogOpen}
        onOpenChange={handleWelcomeDialogOpenChange}
        onClinicUnlocked={handleClinicUnlocked}
      />
    </div>
  );
};

export default DoctorsOfficePage;
