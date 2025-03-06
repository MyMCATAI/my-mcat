# Global State Management Overview

## Zustand Best Practices

### Using Zustand Stores

```typescript
// Import selectors from the selectors.ts file
import { useUI, useUser, useGame } from '@/store/selectors';

// Component example
const MyComponent = () => {
  // Use the selector to access only what you need
  const { theme, setTheme } = useUI();
  const { userInfo, isSubscribed } = useUser();
  
  // Now you can use the state and actions
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('cyberSpace')}>
        Switch Theme
      </button>
    </div>
  );
};
```

### Best Practices

1. **Use Selectors**
   - Always import from `selectors.ts`, not directly from store files
   - Use the most specific selector for your needs to minimize re-renders
   - Example: `useTheme()` instead of `useUI()` if you only need theme data

2. **State Updates**
   - Use the provided actions to update state
   - Never modify state directly
   - Batch related updates when possible

3. **Performance Optimization**
   - Subscribe only to what you need
   - Use memoization for expensive computations
   - Consider using `shallow` equality for complex objects

4. **TypeScript Integration**
   - Leverage TypeScript for type safety
   - Use proper type inference with Zustand
   - Define interfaces for all state slices

5. **Debugging**
   - Use the debug panel with `?debug=true` URL parameter
   - Check state updates in React DevTools
   - Add meaningful action names for easier debugging

6. **Server-Side Rendering Compatibility**
   - Use dynamic imports with `ssr: false` for components that use browser APIs
   - Add proper checks for browser environment (`typeof window !== 'undefined'`)
   - Use `export const dynamic = 'force-dynamic'` for API routes that need dynamic rendering

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

### Game Store (`store.ts`)
```typescript
{
  // Game state for AnkiClinic
  userRooms: any[];
  userLevel: number;
  patientsPerDay: number;
  totalPatients: number;
  streakDays: number;
  isGameInProgress: boolean;
  currentUserTestId: string;
  isFlashcardsOpen: boolean;
  flashcardRoomId: string;
  activeRooms: Set<string>;
  completeAllRoom: boolean;
  correctCount: number;
  wrongCount: number;
  testScore: number;
  userResponses: any[];
  
  // Game actions
  unlockRoom: (roomId: string) => void;
  startGame: (userTestId: string) => void;
  endGame: () => void;
  setIsFlashcardsOpen: (isOpen: boolean) => void;
  setUserRooms: (rooms: any[]) => void;
  setFlashcardRoomId: (roomId: string) => void;
  setActiveRooms: (rooms: Set<string>) => void;
  setCompleteAllRoom: (complete: boolean) => void;
  resetGameState: () => void;
  setCorrectCount: (count: number) => void;
  setWrongCount: (count: number) => void;
  setTestScore: (score: number) => void;
  setUserResponses: (responses: any[]) => void;
  setStreakDays: (days: number) => void;
  setTotalPatients: (count: number) => void;
  updateUserLevel: (level: number) => void;
  
  // Debug state
  debugMode: boolean;
  
  // Debug actions
  setDebugMode: (enabled: boolean) => void;
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

// Game Selectors
useGame() => {
  // All game-related state and actions
  userRooms, userLevel, patientsPerDay, totalPatients, streakDays,
  isGameInProgress, currentUserTestId, isFlashcardsOpen, flashcardRoomId, 
  activeRooms, completeAllRoom, correctCount, wrongCount, testScore, userResponses,
  unlockRoom, startGame, endGame, setIsFlashcardsOpen, setUserRooms,
  setFlashcardRoomId, setActiveRooms, setCompleteAllRoom, resetGameState,
  setCorrectCount, setWrongCount, setTestScore, setUserResponses,
  setStreakDays, setTotalPatients, updateUserLevel,
  debugMode, setDebugMode
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
- ✅ Debug Mode: Implemented in Game Store with URL parameter control
- ✅ Route Transitions: Enhanced RouteHandler with smooth transitions and debug mode support
- ✅ Game State (AnkiClinic): Migrated core game state to Zustand Game Store
- ✅ Server-Side Rendering Fixes: Updated components to handle SSR properly

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
1. Media Management - Next Priority
   - Combine `AudioContext`, `MusicPlayerContext`
   - Create `mediaStore`
   - Will handle sound effects, music, and volume controls

2. Vocabulary Management - Low Priority
   - Migrate `VocabContext` to Zustand
   - Create `vocabStore`
   - Will handle vocabulary list and related functionality

### Keep in Context API
- Form-related contexts
- DOM-interaction heavy features

## Server-Side Rendering Improvements
- ✅ Fixed ankiclinic page build errors by:
  - Using dynamic imports with `ssr: false` for browser-dependent components
  - Adding proper browser environment checks
  - Making API routes dynamic with `export const dynamic = 'force-dynamic'`
- ✅ Added proper handling of browser-specific APIs:
  - Added checks for `typeof window !== 'undefined'` in utils
  - Ensured ReactDOM.unstable_batchedUpdates is only used in browser environment
  - Fixed document access with proper browser environment checks

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

5. Server-Side Rendering:
   - Always check for browser environment before using browser APIs
   - Use dynamic imports with `ssr: false` for components with browser dependencies
   - Make API routes dynamic when they use headers or other server-side features

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

4. When handling browser APIs:
   - Always check for browser environment with `typeof window !== 'undefined'`
   - Use dynamic imports with `ssr: false` for components with browser dependencies
   - Consider using Next.js's built-in features for handling SSR/CSR differences

## Migration Progress Notes
- UserStats and UserInfo contexts have been successfully migrated to Zustand
- The Zustand store now handles user data fetching and updates
- A `StoreInitializer` component has been added to initialize the store on app load
- User selectors have been consolidated into a single `useUser` selector for better organization
- TypeScript types have been moved to a shared `types/user.ts` file to avoid circular dependencies
- UserProfileContext has been migrated to Zustand with all profile-related state and actions
- A compatibility layer has been added to UserProfileContext.tsx to maintain backward compatibility
- Debug mode has been implemented with URL parameter control
- RouteHandler has been enhanced with smooth transitions and debug mode support
- Game State (AnkiClinic) has been migrated to Zustand with all core game functionality
- Server-side rendering issues have been fixed in the ankiclinic page and API routes
- Next steps: Complete Media Management store migration and implement Vocabulary Management store 