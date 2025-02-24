import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { DoctorOfficeStats, UserResponseWithCategory } from "@/types"

interface AnkiClinicState {
  // Game UI State
  ui: {
    activeTab: string
    isLoading: boolean
  }
  
  // Game Progress
  progress: {
    userLevel: string
    patientsPerDay: number
    totalPatients: number
    clinicCostPerDay: number
    userRooms: string[]
    activeRooms: Set<string>
    isGameInProgress: boolean
    currentUserTestId: string | null
    reportData: DoctorOfficeStats | null
  }

  // Quiz/Test State
  quiz: {
    userResponses: UserResponseWithCategory[]
    correctCount: number
    wrongCount: number
    testScore: number
    totalMCQQuestions: number
    correctMCQQuestions: number
    flashcardRoomId: string
  }

  // Actions
  actions: {
    setActiveTab: (tab: string) => void
    setUserLevel: (level: string) => void
    updateGameProgress: (data: Partial<AnkiClinicState['progress']>) => void
    resetGameState: () => void
    // ... other actions
  }
}

export const useAnkiClinicStore = create<AnkiClinicState>()(
  devtools(
    (set) => ({
      // Initial state
      ui: {
        activeTab: "ankiclinic",
        isLoading: false
      },
      
      progress: {
        userLevel: "PATIENT LEVEL",
        patientsPerDay: 4,
        totalPatients: 0,
        clinicCostPerDay: 0,
        userRooms: [],
        activeRooms: new Set(),
        isGameInProgress: false,
        currentUserTestId: null,
        reportData: null
      },

      quiz: {
        userResponses: [],
        correctCount: 0,
        wrongCount: 0,
        testScore: 0,
        totalMCQQuestions: 0,
        correctMCQQuestions: 0,
        flashcardRoomId: ""
      },

      // Actions
      actions: {
        setActiveTab: (tab) => set((state) => ({ 
          ui: { ...state.ui, activeTab: tab } 
        })),

        setUserLevel: (level) => set((state) => ({
          progress: { ...state.progress, userLevel: level }
        })),

        updateGameProgress: (data) => set((state) => ({
          progress: { ...state.progress, ...data }
        })),

        resetGameState: () => set((state) => ({
          progress: {
            ...state.progress,
            activeRooms: new Set(),
            isGameInProgress: false,
            currentUserTestId: null
          },
          quiz: {
            userResponses: [],
            correctCount: 0,
            wrongCount: 0,
            testScore: 0,
            totalMCQQuestions: 0,
            correctMCQQuestions: 0,
            flashcardRoomId: ""
          }
        }))
      }
    }),
    { name: 'AnkiClinic Store' }
  )
) 