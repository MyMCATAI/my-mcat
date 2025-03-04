# Global State Management Overview

## Current Zustand Stores

### UI Store (`store.ts`)
```typescript
{
  // Device & Window Information
  window: {
    width: number
    height: number
    isDesktop: boolean
  }
  
  // Route Information
  currentRoute: string
  
  // Theme Settings
  theme: ThemeType // 'cyberSpace' | 'sakuraTrees' | 'sunsetCity' | 'mykonosBlue'
  
  // Actions
  setWindowSize: (size: WindowSize) => void
  setCurrentRoute: (route: string) => void
  setTheme: (theme: ThemeType) => void
}
```

### User Store (`store.ts`)
```typescript
{
  // UserProfile state
  profile: UserProfile['profile'];
  profileLoading: boolean;
  isProfileComplete: boolean;
  completedSteps: string[];
  studyPreferences: {
    dailyGoal: number;
    reminderTime: string;
  };
  interfaceSettings: {
    darkMode: boolean;
    fontSize: string;
  };
  tutorialProgress: {
    currentStep: number;
    completedRoutes: string[];
  };
  hasCompletedOnboarding: boolean;
  lastVisitedRoute: string;
  onboardingRoute: string;
  
  // UserInfo state
  userInfo: UserInfoState['userInfo'];
  isSubscribed: boolean;
  
  // UserStats state
  coins: number;
  statsLoading: boolean;
  
  // Actions
  updateProfile: (updates: any) => Promise<void>;
  refreshUserInfo: () => Promise<void>;
  updateCoins: (amount: number) => Promise<void>;
  updateCoinsDisplay: (newAmount: number) => void;
  setIsSubscribed: (status: boolean) => void;
  setCompletedSteps: (steps: string[]) => void;
  addCompletedStep: (step: string) => void;
  updateStudyPreferences: (preferences: Partial<UserSlice['studyPreferences']>) => void;
  updateInterfaceSettings: (settings: Partial<UserSlice['interfaceSettings']>) => void;
  updateTutorialProgress: (progress: Partial<UserSlice['tutorialProgress']>) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setLastVisitedRoute: (route: string) => void;
  setOnboardingRoute: (route: string) => void;
}
```

### Selectors (`selectors.ts`)
```typescript
// UI Selectors
useUI() => { theme, window, currentRoute, setTheme, setWindowSize, setCurrentRoute }
useTheme() => theme
useWindowSize() => window
useCurrentRoute() => currentRoute

// User Selectors
useUser() => { 
  // All user-related state and actions
  profile, profileLoading, updateProfile, isProfileComplete, completedSteps,
  studyPreferences, interfaceSettings, tutorialProgress, hasCompletedOnboarding,
  lastVisitedRoute, onboardingRoute, setCompletedSteps, addCompletedStep,
  updateStudyPreferences, updateInterfaceSettings, updateTutorialProgress,
  setHasCompletedOnboarding, setLastVisitedRoute, setOnboardingRoute,
  userInfo, isSubscribed, coins, statsLoading, updateCoins, updateCoinsDisplay,
  setIsSubscribed, refreshUserInfo
}

// Individual Profile Selectors
useProfileComplete() => isProfileComplete
useCompletedSteps() => completedSteps
useStudyPreferences() => studyPreferences
useInterfaceSettings() => interfaceSettings
useTutorialProgress() => tutorialProgress
useOnboardingStatus() => { hasCompletedOnboarding, lastVisitedRoute, onboardingRoute }
```

## Completed Migrations
- ✅ Theme Management: Migrated from `ThemeContext` to Zustand UI Store
- ✅ Window Size: Implemented in UI Store with dedicated tracker component
- ✅ Route Tracking: Added to UI Store with RouteHandler component
- ✅ UserStats: Migrated from `UserStatsContext` to Zustand User Store
- ✅ UserInfo: Migrated from `UserInfoContext` to Zustand User Store
- ✅ UserProfile: Migrated from `UserProfileContext` to Zustand User Store
- ✅ Consolidated selectors: Combined user-related selectors into a single `useUser` selector

## Current Context API State (To Be Migrated)

### [VocabContext](../contexts/VocabContext.tsx)
- Vocabulary Management:
  - `vocabList: string[]`
  - `addVocabWord: (word: string) => void`
  - `removeVocabWord: (word: string) => void`
  - `isCmdIEnabled: boolean`
  - `toggleCmdI: () => void`

### [AudioContext](../contexts/AudioContext.tsx)
- Sound Control:
  - `volume: number`
  - `isMuted: boolean`
  - `playSound: (soundId: string) => void`
  - `stopAllLoops: () => Promise<void>`
  - `loopSound: (soundId: string) => Promise<void>`
  - `setVolume: (volume: number) => void`

### [MusicPlayerContext](../contexts/MusicPlayerContext.tsx)
- Music Player:
  - `isPlaying: boolean`
  - `currentTrack: string`
  - `isAutoPlay: boolean`
  - `setIsAutoPlay: (autoPlay: boolean) => void`

## Migration Plan

### Priority for Migration to Zustand
1. Game State (AnkiClinic) - High Priority
   - Currently using local state + context
   - Need to recreate `useAnkiClinicStore`
   - Will handle game progress, quiz state, and room management

2. Media Management - Low Priority
   - Combine `AudioContext`, `MusicPlayerContext`
   - Create `mediaStore`
   - Will handle sound effects, music, and volume controls

### Keep in Context API
- VocabContext (real-time features)
- Form-related contexts
- DOM-interaction heavy features

## Best Practices for Migration
1. State Splitting:
   - Keep related state together
   - Split by domain/feature
   - Consider update frequency

2. Performance:
   - Use selective subscriptions
   - Implement specialized selectors
   - Avoid unnecessary rerenders

3. Type Safety:
   - Maintain strict TypeScript types
   - Use proper type inference
   - Document state shape

4. Migration Process:
   - Migrate one context at a time
   - Write tests before migration
   - Update components gradually
   - Keep backward compatibility 

## Maintenance Guidelines
1. When adding new state:
   - Add to appropriate store file
   - Create selectors in selectors.ts
   - Update this README
   - Consider performance implications

2. When creating new selectors:
   - Add to selectors.ts
   - Create both combined and individual selectors
   - Document with JSDoc comments

3. When migrating contexts:
   - Update the "Completed Migrations" section
   - Remove from "To Be Migrated" section
   - Document any breaking changes 

## Migration Progress Notes
- UserStats and UserInfo contexts have been successfully migrated to Zustand
- The Zustand store now handles user data fetching and updates
- A `StoreInitializer` component has been added to initialize the store on app load
- User selectors have been consolidated into a single `useUser` selector for better organization
- TypeScript types have been moved to a shared `types/user.ts` file to avoid circular dependencies
- UserProfileContext has been migrated to Zustand with all profile-related state and actions
- A compatibility layer has been added to UserProfileContext.tsx to maintain backward compatibility
- Next steps: Migrate Game State (AnkiClinic) and implement Media Management store 