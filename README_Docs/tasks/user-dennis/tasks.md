TODO: 


## Zustand State
1. Navigation/Route State
```
{
  currentRoute: string
  previousRoute: string | null
  activeTab: string
  isFlashcardsOpen: boolean
  isMarketplaceOpen: boolean
  isTutorialOpen: boolean
}
```
2. Audio State
```
{
  volume: {
    sfx: number
    music: number
    voice: number
    effects: number
  }
  isPlaying: boolean
  currentSong: string | null
  activeLoops: Set<string>
  routeSpecificSounds: {
    doctorsoffice: {
      ambient: string
      isFlashcardsOpen: boolean
    }
    // other routes...
  }
}
```
3. User Profile State
```
{
  userInfo: {
    id: string
    level: number
    score: number
    isSubscribed: boolean
    unlocks: string[]
    streak: number
  }
  activities: Activity[]
  studyProgress: {
    correctCount: number
    wrongCount: number
    testScore: number
  }
}
```
4. UI State
```
{
  modals: {
    welcomeDialog: boolean
    referralModal: boolean
    afterTestDialog: boolean
    streakPopup: boolean
  }
  theme: {
    current: string
    isDark: boolean
  }
  loading: {
    isLoading: boolean
    loadingMessage: string | null
  }
}
```
5. Game Activity State
```
{
  doctorsOffice: {
    activeRooms: Set<string>
    userLevel: string
    patientsPerDay: number
    clinicCostPerDay: number
    isGameInProgress: boolean
    currentUserTestId: string | null
  }
  // other game states...
}

```