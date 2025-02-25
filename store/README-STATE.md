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

### Selectors (`selectors.ts`)
```typescript
// Combined selector
useUI() => { theme, window, currentRoute, setTheme, setWindowSize, setCurrentRoute }

// Individual selectors for performance
useTheme() => theme
useWindowSize() => window
useCurrentRoute() => currentRoute
```

## Completed Migrations
- ✅ Theme Management: Migrated from `ThemeContext` to Zustand UI Store
- ✅ Window Size: Implemented in UI Store with dedicated tracker component
- ✅ Route Tracking: Added to UI Store with RouteHandler component

## Current Context API State (To Be Migrated)

### [UserProfileContext](../contexts/UserProfileContext.tsx)
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

### [UserInfoContext](../contexts/UserInfoContext.tsx)
- User Data:
  - `userInfo: { score: number, firstName: string, unlocks: string[] }`
  - `isSubscribed: boolean`
- Score Management:
  - `incrementScore: () => Promise<void>`
  - `decrementScore: () => Promise<void>`

### [UserStatsContext](../contexts/UserStatsContext.tsx)
- Statistics:
  - `stats: { totalQuestions: number, correctAnswers: number }`
  - `streakData: { currentStreak: number, bestStreak: number }`
  - `lastActive: Date`

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

2. User Management - Medium Priority
   - Combine `UserProfileContext`, `UserInfoContext`, `UserStatsContext`
   - Create unified `userStore`
   - Will handle user data, scores, stats, and preferences

3. Media Management - Low Priority
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