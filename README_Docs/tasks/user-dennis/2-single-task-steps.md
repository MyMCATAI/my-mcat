<!-- README_Docs/tasks/user-dennis/tasks-steps.md -->

# User State Migration Plan

## 1. Analysis Phase
- [x] Identify all user-related state in current store.ts
  - UserProfile (profile, profileLoading, isProfileComplete, etc.)
  - UserInfo (userInfo, isSubscribed)
  - UserStats (coins, statsLoading)
  - Associated preferences (studyPreferences, interfaceSettings, tutorialProgress)
  - Onboarding state (onboardingComplete, lastVisitedRoute, onboardingRoute)

- [x] Document all user-related actions/methods in store.ts
  - Profile: updateProfile, setCompletedSteps, addCompletedStep
  - Preferences: updateStudyPreferences, updateInterfaceSettings, updateTutorialProgress
  - Onboarding: setOnboardingComplete, setLastVisitedRoute, setOnboardingRoute
  - UserInfo: refreshUserInfo, setIsSubscribed
  - Stats: updateCoins, updateCoinsDisplay

- [x] Identify all components that consume user state
  - Direct useUser consumers: DebugPanel, FriendInteraction/CoinModal, UserProfileModal, ProfileButton, RouteTracker, Dashboard layout
  - Via useUserInfo hook: Many components including Leaderboard, StreakDisplay, Quiz, etc.
  - Clerk vs Store: Some components use Clerk's useUser while others use our store's useUser

- [x] Map out dependencies between user state and other slices
  - Game state uses user coins/points
  - UI state might depend on user preferences (theme/darkMode)
  - No direct dependencies from Audio slice

## 2. Create userSlice.ts
- [x] Create basic slice structure following the pattern in audioSlice.ts
- [x] Define UserState interface with all necessary properties
- [x] Define UserActions interface with all necessary methods
- [x] Implement default/initial state values

## 3. Implement Core Functionality
- [x] Migrate state properties from store.ts
- [x] Implement all user-related actions/methods
- [x] Add proper TypeScript typing for all functions
- [x] Add error handling for critical operations
- [x] Ensure proper state immutability in all setters

## 4. Update selectors.ts
- [x] Add useUser hook that returns the user state and actions
- [x] Ensure proper typing for the hook return value
- [x] Test the hook functionality in isolation

## 5. Testing and Validation
- [x] Create test component to verify userSlice functionality
- [x] Create test page to access the test component
- [x] Verify that useUser hook returns correct state and actions
- [x] Verify that state updates correctly when actions are called

## 6. Component Migration
- [x] Identify all components using the old user state pattern
- [x] Update StoreInitializer.tsx to use useUserStore
- [x] Create vocabSlice.ts and update useVocab selectors
- [x] Update other imports to use the new useUser hook from selectors.ts
- [x] Replace direct store references with hook-based approach
- [x] Test each component after migration

## 7. Clean Up
- [x] Remove user-related code from store.ts
- [x] Update any cross-slice dependencies (if other slices depend on user state)
- [x] Document any breaking changes or API differences
- [x] Create a placeholder for the `useStore` for backward compatibility
- [x] Update relevant documentation

## 8. Testing
- [x] Test user authentication flows in test page
- [x] Test user preference saving/loading in test page
- [x] Test user profile functionality in test page
- [x] Verify that all components still function correctly

## 9. Final Review
- [x] Conduct code review of all changes
- [x] Verify no remaining references to old user state pattern
- [x] Check for any performance issues with the new implementation
- [x] Ensure proper error handling throughout the slice