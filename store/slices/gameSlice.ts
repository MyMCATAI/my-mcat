import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { calculatePlayerLevel, getLevelNumber, getPatientsPerDay } from '../gameStoreUtils'
import { toast } from 'react-hot-toast'

/* --- Types ---- */
// Game state types
interface GameState {
  // Game progress
  patientsPerDay: number;
  streakDays: number;
  totalPatients: number;
  userLevel: string;
  userRooms: string[];
  
  // Active game session
  activeRooms: Set<string>;
  completeAllRoom: boolean;
  currentUserTestId: string | null;
  flashcardRoomId: string;
  isFlashcardsOpen: boolean;
  isGameInProgress: boolean;
  
  // Test results
  correctCount: number;
  testScore: number;
  userResponses: any[];
  wrongCount: number;
  
  // Clinic data state (moved from useClinicData)
  reportData: any | null;
  isClinicDataLoading: boolean;

  // Subject filtering
  selectedSubjects: string[];
  availableSubjects: {name: string; icon: string; color: string}[];
}

interface GameActions {
  // Game actions
  endGame: () => void;
  resetGameState: () => void;
  setActiveRooms: (rooms: Set<string> | ((prevRooms: Set<string>) => Set<string>)) => void;
  setCompleteAllRoom: (complete: boolean) => void;
  setCorrectCount: (count: number) => void;
  setFlashcardRoomId: (roomId: string) => void;
  setIsFlashcardsOpen: (isOpen: boolean) => void;
  setUserResponses: (responses: any[]) => void;
  setTestScore: (score: number) => void;
  setTotalPatients: (count: number) => void;
  setWrongCount: (count: number) => void;
  setStreakDays: (days: number) => void;
  setUserRooms: (rooms: string[]) => void;
  startGame: (userTestId: string) => void;
  unlockRoom: (roomId: string) => void;
  updateUserLevel: () => void;
  
  // Clinic data actions (from useClinicData)
  fetchClinicData: () => Promise<void>;
  resetClinicData: () => void;
  performDailyCalculations: () => Promise<void>;

  // Subject filtering actions
  setSelectedSubjects: (subjects: string[]) => void;
  toggleSubject: (subject: string) => void;
  resetSubjects: () => void;
}

export type GameSlice = GameState & GameActions;

export const useGameStore = create<GameSlice>()(
  devtools(
    (set, get) => ({
      // Game progress
      patientsPerDay: 4,
      streakDays: 0,
      totalPatients: 0,
      userLevel: "PATIENT LEVEL",
      userRooms: [],
      
      // Active game session
      activeRooms: new Set<string>(["WaitingRoom0"]),
      completeAllRoom: false,
      currentUserTestId: null,
      flashcardRoomId: "",
      isFlashcardsOpen: false,
      isGameInProgress: false,
      
      // Test results
      correctCount: 0,
      testScore: 0,
      userResponses: [],
      wrongCount: 0,
      
      // Clinic data state
      reportData: null,
      isClinicDataLoading: false,
      
      // Default subjects with metadata
      availableSubjects: [
        { name: "Chemistry", icon: "atoms", color: "#E6B800" },
        { name: "Biology", icon: "evolution", color: "#4CAF50" },
        { name: "Biochemistry", icon: "dna_n_biotechnology", color: "#2196F3" },
        { name: "Psychology", icon: "cognition", color: "#9C27B0" },
        { name: "Physics", icon: "force", color: "#800000" },
        { name: "Sociology", icon: "soconcom", color: "#FF5722" },
      ],
      
      // Initialize from localStorage or use all subjects
      selectedSubjects: (() => {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('ankiClinicSubjects');
          if (saved) {
            try {
              return JSON.parse(saved);
            } catch (e) {
              console.error('Failed to parse saved subjects', e);
            }
          }
        }
        return ["Chemistry", "Biology", "Biochemistry", "Psychology", "Physics", "Sociology"];
      })(),
      
      // Game Actions
      endGame: () => {
        set({ 
          isGameInProgress: false,
          currentUserTestId: null,
          userResponses: [],
          correctCount: 0,
          wrongCount: 0,
          testScore: 0,
        });
      },
      
      resetGameState: () => {
        set({ 
          isGameInProgress: false,
          currentUserTestId: null,
          activeRooms: new Set<string>(["WaitingRoom0"]),
          completeAllRoom: false,
          userResponses: [],
          correctCount: 0,
          wrongCount: 0,
          testScore: 0,
          isFlashcardsOpen: false,
        });
      },
      
      setActiveRooms: (rooms) => {
        if (typeof rooms === 'function') {
          set((state) => ({ 
            activeRooms: new Set(rooms(state.activeRooms)) 
          }));
        } else {
          set({ activeRooms: new Set(rooms) });
        }
      },
      
      setCompleteAllRoom: (complete) => {
        set({ completeAllRoom: complete });
      },
      
      setCorrectCount: (count) => {
        set({ correctCount: count });
      },
      
      setFlashcardRoomId: (roomId) => {
        set({ flashcardRoomId: roomId });
      },
      
      setIsFlashcardsOpen: (isOpen) => {
        set({ isFlashcardsOpen: isOpen });
      },
      
      setUserResponses: (responses) => {
        set({ userResponses: responses });
      },
      
      setTestScore: (score) => {
        set({ testScore: score });
      },
      
      setTotalPatients: (count) => {
        set({ totalPatients: count });
      },
      
      setWrongCount: (count) => {
        set({ wrongCount: count });
      },
      
      setStreakDays: (days) => {
        set({ streakDays: days });
      },
      
      setUserRooms: (rooms) => {
        set({ userRooms: rooms });
        get().updateUserLevel();
      },
      
      startGame: (userTestId) => {
        set({ 
          isGameInProgress: true,
          currentUserTestId: userTestId,
        });
      },
      
      unlockRoom: (roomId) => {
        const currentRooms = get().userRooms;
        if (!currentRooms.includes(roomId)) {
          const updatedRooms = [...currentRooms, roomId];
          set({ userRooms: updatedRooms });
          get().updateUserLevel();
        }
      },
      
      updateUserLevel: () => {
        const { userRooms } = get();
        const playerLevel = calculatePlayerLevel(userRooms);
        const levelNumber = getLevelNumber(playerLevel);
        const patientsPerDay = getPatientsPerDay(levelNumber);
        
        set({
          userLevel: playerLevel,
          patientsPerDay
        });
      },
      
      // Clinic data actions
      fetchClinicData: async () => {
        try {
          set({ isClinicDataLoading: true });
          
          // Use the correct API endpoint
          const [reportResponse, clinicResponse] = await Promise.all([
            fetch("/api/user-report", { 
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            }),
            fetch("/api/clinic", { 
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            }),
          ]);

          if (!reportResponse.ok || !clinicResponse.ok) {
            throw new Error('Failed to fetch clinic data');
          }
          
          const reportData = await reportResponse.json();
          const clinicData = await clinicResponse.json();
          
          console.log('[DEBUG] Clinic data fetched:', { reportData, clinicData });
          
          // Update Zustand state with the correct data structure
          set({
            reportData: reportData,
            userRooms: clinicData.rooms || [],
            streakDays: reportData.streak || 0,
            totalPatients: clinicData.totalPatientsTreated || 0,
            isClinicDataLoading: false
          });
          
          // Also update user level based on rooms
          get().updateUserLevel();
          
        } catch (error) {
          console.error('Error fetching clinic data:', error);
          toast.error('Failed to load clinic data');
          set({ isClinicDataLoading: false });
        }
      },
      
      resetClinicData: () => {
        set({
          reportData: null,
          isClinicDataLoading: false
        });
      },
      
      performDailyCalculations: async () => {
        try {
          set({ isClinicDataLoading: true });
          
          const response = await fetch("/api/daily-calculations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          
          // Update store state based on the response
          set({
            totalPatients: data.totalPatientsTreated || get().totalPatients,
            isClinicDataLoading: false
          });
          
          // Return the data for toast notifications in the component
          return data;
        } catch (error) {
          console.error('[ERROR] Failed to perform daily calculations:', error);
          toast.error('Failed to perform daily calculations');
          set({ isClinicDataLoading: false });
          throw error;
        }
      },

      // Subject filtering actions
      setSelectedSubjects: (subjects) => {
        set({ selectedSubjects: subjects });
        if (typeof window !== 'undefined') {
          localStorage.setItem('ankiClinicSubjects', JSON.stringify(subjects));
        }
      },
      
      toggleSubject: (subject) => {
        const currentSubjects = [...get().selectedSubjects];
        const index = currentSubjects.indexOf(subject);
        
        if (index >= 0) {
          // Only remove if we have more than one subject selected
          if (currentSubjects.length > 1) {
            currentSubjects.splice(index, 1);
          }
        } else {
          currentSubjects.push(subject);
        }
        
        set({ selectedSubjects: currentSubjects });
        if (typeof window !== 'undefined') {
          localStorage.setItem('ankiClinicSubjects', JSON.stringify(currentSubjects));
        }
      },
      
      resetSubjects: () => {
        const allSubjects = get().availableSubjects.map(s => s.name);
        set({ selectedSubjects: allSubjects });
        if (typeof window !== 'undefined') {
          localStorage.setItem('ankiClinicSubjects', JSON.stringify(allSubjects));
        }
      }
    }),
    {
      name: 'game-store'
    }
  )
); 