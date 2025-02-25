# Global State Management Overview

## Current Zustand Stores

### UI Store (`uiStore`)
```typescript
{
  // Device & Window Information
  window: {
    width: number
    height: number
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
  }
  
  // Route & Loading
  currentRoute: string
  isLoading: boolean
  
  // Theme Settings
  theme: {
    mode: 'light' | 'dark' | 'system'
    systemTheme: string
  }
}
```

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

### [ThemeContext](../contexts/ThemeContext.tsx)
- Theme Settings:
  - `theme: 'light' | 'dark' | 'system'`
  - `setTheme: (theme: string) => void`
  - `systemTheme: string`




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

4. Theme & UI - Low Priority
   - Already partially migrated (theme in uiStore)
   - Expand existing `uiStore` with additional UI controls

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