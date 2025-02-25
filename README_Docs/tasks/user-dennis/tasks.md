//Talk


# Zustand State Management

## Why Zustand Over Context API
- **Simpler API**: No providers needed, just create and use stores
- **Better Performance**: Fine-grained updates and automatic memoization, lightweight, better performance
- **Less Boilerplate**: No need for reducers or complex setup


## Re-rendering Behavior
### Context API vs Zustand Examples

#### Example 1: Game Stats Component
**Current Implementation (Inefficient)**:
```typescript
// components/doctorsoffice/GameStats.tsx
const GameStats = () => {
  const gameStore = useAnkiClinicStore(); // Gets ENTIRE game state

  return (
    <div>
      <span>Score: {gameStore.quiz.testScore}</span>
      <span>Patients: {gameStore.progress.totalPatients}</span>
    </div>
  );
};
```

This re-renders when ANY game state changes (room states, user responses, active tabs) even though it only needs two numbers.

**Efficient Implementation**:
```typescript
// components/doctorsoffice/GameStats.tsx
const GameStats = () => {
  const testScore = useAnkiClinicStore(state => state.quiz.testScore);
  const totalPatients = useAnkiClinicStore(state => state.progress.totalPatients);

  return (
    <div>
      <span>Score: {testScore}</span>
      <span>Patients: {totalPatients}</span>
    </div>
  );
};
```

#### Example 2: Profile Button
**Current Implementation (Less Critical)**:
```typescript
// components/navbar/ProfileButton.tsx
const ProfileButton = () => {
  const { profile } = useProfileContext(); // Gets entire profile context
  const { user } = useUser();

  return (
    <div>
      <img src={profile.avatar} />
      <span>{user.primaryEmailAddress?.emailAddress}</span>
    </div>
  );
};
```

While this gets the entire profile context, it's less problematic because:
- Profile data changes infrequently
- Updates typically happen on specific pages
- Component is simple to re-render

**More Granular Implementation**:
```typescript
const ProfileButton = () => {
  const avatar = useProfileStore(state => state.avatar);
  const { user } = useUser(); // Still need Clerk for auth

  return (
    <div>
      <img src={avatar} />
      <span>{user.primaryEmailAddress?.emailAddress}</span>
    </div>
  );
};
```

### Impact Analysis
The GameStats example shows a more meaningful performance opportunity because:
1. Game state changes frequently during gameplay
2. Multiple components need different pieces of game state
3. State updates like room status shouldn't trigger score display re-renders

The ProfileButton example, while technically less efficient, has minimal real-world impact due to infrequent updates and simple rendering requirements.


## Re-rendering Behavior

### Context API vs Zustand
- **Context API**: Re-renders all consumers when any value in the context changes

Current Context API Usage (Inefficient):
**Anki Clinic - page.tsx**
```
const { profile, isLoading } = useProfileContext();
const { userInfo } = useUserInfo();
```

This means your AnkiClinic page re-renders when ANY value in these contexts changes, even if it's unrelated to what the page actually uses.


- **Zustand**: Only re-renders components that subscribe to specific state changes

```
// In app/layout.tsx
<UserInfoProvider>
  <UserProfileProvider>
    <AudioProvider>
      {children}
    </AudioProvider>
  </UserProfileProvider>
</UserInfoProvider>

```

**Granular Updates**: Components only re-render when their specific data changes
**Better Performance**: Looking at ProfileButton.tsx, it currently re-renders on any profile context change, but with Zustand, it would only re-render when relevant profile data changes
**Simpler Data Flow**: Instead of wrapping the app in multiple providers (UserInfoProvider, UserProfileProvider, AudioProvider), we'd have a single source of truth
**Easier Testing**: No need to wrap components in multiple providers during testing




### Selective Subscriptions

## Current Implementation
Our main store: `useAnkiClinicStore`

```
{
  ui: {
    activeTab: string
    isLoading: boolean
  },
  progress: {
    userLevel: string
    patientsPerDay: number
    totalPatients: number
    // ... game progress state
  },
  quiz: {
    userResponses: UserResponseWithCategory[]
    correctCount: number
    wrongCount: number
    // ... quiz state
  },
  actions: {
    setActiveTab: (tab: string) => void
    setUserLevel: (level: string) => void
    updateGameProgress: (data: Partial<Progress>) => void
    // ... other actions
  }
}
```

## Debug Mode
- Access via `/?debug=true` in URL
- Shows red panel with state info
- Persists across navigation
- Displays:
  - Current route
  - UI state
  - Progress state
  - Quiz state

## Best Practices

### 1. Store Organization
```
// Separate into slices
{
  ui: UISlice,
  user: UserSlice,
  game: GameSlice,
  actions: ActionsSlice
}
```

### 2. Action Patterns
```
// Prefer this:
actions: {
  setActiveTab: (tab) => set((state) => ({
    ui: { ...state.ui, activeTab: tab }
  }))
}

// Avoid this:
set({ ui: { activeTab: tab } }) // Might overwrite other ui state
```

### 3. Hook Usage
```
// Good - Selective state subscription
const activeTab = useStore(state => state.ui.activeTab)

// Avoid - Full state subscription
const store = useStore() // Will re-render on any state change
```

### 4. Middleware Usage
```
create(
  devtools(
    persist(
      (set) => ({
        // store definition
      }),
      { name: 'store-name' }
    )
  )
)
```

### 5. TypeScript Integration
```
interface StoreState {
  ui: UIState
  actions: {
    setActiveTab: (tab: string) => void
  }
}

create((set) => ({
  // Implementation with type safety
}))
```

## Migration Plan
1. Move context-based state to Zustand stores:
   - UserInfo → userSlice
   - Audio → audioSlice
   - Theme → uiSlice

2. Keep contexts only for:
   - Auth providers
   - Real-time features
   - Complex DOM interactions

3. Create specialized hooks:
```
// Instead of using store directly
export const useUserInfo = () => {
  const score = useStore(state => state.user.score)
  const incrementScore = useStore(state => state.actions.incrementScore)
  return { score, incrementScore }
}
```