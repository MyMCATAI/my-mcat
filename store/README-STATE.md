# Global State Management Overview

## Current Context API State

### UserProfileContext
- Profile Status:
  - `isProfileComplete: boolean`
  - `completedSteps: string[]`
- User Preferences:
  - `studyPreferences: { dailyGoal: number, reminderTime: string }`
  - `interfaceSettings: { darkMode: boolean, fontSize: string }`
- Tutorial Progress:
  - `tutorialProgress: { currentStep: number, completedRoutes: string[] }`
  - `hasCompletedOnboarding: boolean`
- Navigation State:
  - `lastVisitedRoute: string`
  - `onboardingRoute: string`

### UserInfoContext
- Authentication:
  - `isAuthenticated: boolean`
  - `authToken: string`
  - `refreshToken: string`
- Permissions:
  - `userRole: 'student' | 'teacher' | 'admin'`
  - `permissions: string[]`
- Route Control:
  - `authorizedRoutes: string[]`
  - `restrictedRoutes: string[]`
  - `redirectAfterAuth: string`
- User Metadata:
  - `isGoldMember: boolean`
  - `accountType: 'free' | 'premium' | 'enterprise'`
  - `referralCode: string`
  - `referralCount: number`

### AudioContext
- Sound Settings:
  - `isBGMEnabled: boolean` // False when:
    - User is in system routes (/api, /auth)
    - User has manually disabled BGM in preferences
    - User's device has "reduced motion" settings enabled
  - `isSFXEnabled: boolean` // False when:
    - User is in quiet zones (preferences, profile pages)
    - User has manually disabled SFX
    - During assessment/quiz sections
  - `volume: { bgm: number, sfx: number }`
- Route Audio:
  - `audioEnabledRoutes: string[]` // List of routes where audio is allowed
  - `routeSoundPreferences: Record<string, { bgm: boolean, sfx: boolean }>` // Per-route override settings
  - `currentTrack: string | null` // Current playing BGM track, null in quiet zones

### ThemeContext
- Theme State:
  - `currentTheme: 'light' | 'dark' | 'system'`
  - `accentColor: string`
  - `customColors: Record<string, string>`
- UI Settings:
  - `fontSize: 'sm' | 'md' | 'lg'`
  - `borderRadius: number`
  - `animations: { reduced: boolean, speed: number }`

## Migration Status

### Already Migrated to Zustand
- UI State (`uiStore`):
  ```typescript
  {
    window: {
      width: number
      height: number
      isMobile: boolean
      isTablet: boolean
      isDesktop: boolean
    }
    activeTab: string
    currentRoute: string
    isLoading: boolean
  }
  ```

- Game State (`ankiClinicStore`):
  ```typescript
  {
    progress: {
      userLevel: string
      patientsPerDay: number
      totalPatients: number
      clinicCostPerDay: number
      activeRooms: Set<string>
    }
    quiz: {
      userResponses: UserResponseWithCategory[]
      correctCount: number
      wrongCount: number
      testScore: number
    }
  }
  ```

### Pending Migration
1. User Profile State → `userSlice`
2. Authentication State → `authSlice`
3. Audio Preferences → `audioSlice`
4. Theme Settings → `uiSlice`

### Keep in Context
- Real-time features
- Auth providers
- Complex DOM interactions

## Best Practices for Migration
- Use selective subscriptions
- Implement specialized hooks
- Maintain type safety
- Follow store organization patterns 