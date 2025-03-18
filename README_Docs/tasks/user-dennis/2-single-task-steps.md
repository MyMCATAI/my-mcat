### Branch TODO:

### Branch Steps: Route and Navigation Tracking

## Navigation State Management Strategy

### Problem Analysis
1. **Inconsistent route tracking**: 
   - Not all section changes are reflected in the URL (e.g., entering ATS keeps `/home` in the URL)
   - Subsection navigation doesn't update `currentRoute` in UI state
   - Kalypso lacks contextual awareness of what the user is doing

2. **Current approach limitations**:
   - `useUIStore` has a `currentRoute` state, but it's not consistently updated
   - URL changes happen in components without state synchronization
   - No tracking of deeper navigation contexts (sections within sections)
   - No persistence of navigation state

### Architecture Decision: Extend UISlice vs New ATSSlice

#### Option 1: Extend UISlice (RECOMMENDED)
- **Pros**:
  - Central location for all routing-related state
  - Maintains separation of concerns (UI layer handles routes)
  - Simpler integration with existing code
  - Avoids creating extra slices for functionality closely related to UI
  - More consistent with current architecture

- **Cons**:
  - UISlice becomes more complex
  - Could mix general UI state with route-specific logic

#### Option 2: Create New ATSSlice
- **Pros**: 
  - Cleaner separation of concerns for ATS-specific state
  - More scalable for future ATS features
  - Progress tracking fits naturally in dedicated slice

- **Cons**:
  - Splits routing logic across multiple slices
  - Duplication between UI and ATS routing logic
  - Requires more coordination between slices
  - More complex implementation

### Decision: EXTEND UISLICE but with clear subsections

The routing state should live in UISlice, but we'll create dedicated sections for different app areas:

```typescript
// In uiSlice.ts
interface UIState {
  // General UI state
  theme: ThemeType;
  window: WindowSize;
  
  // Navigation state
  currentRoute: string;
  navigationHistory: string[];
  
  // Section-specific navigation
  sectionStates: {
    ats?: {
      activeSubject: string;
      learningMode: LearningMode;
      lastViewedContent: string;
    },
    cars?: {
      activeSection: string;
      // other CARS-specific navigation state
    },
    // other sections as needed
  }
}
```

This approach:
1. Keeps routing in one place (UISlice)
2. Organizes section-specific state clearly
3. Makes it easy to share navigation info with Kalypso

## Implementation Steps

### 1. Extend UISlice with Enhanced Navigation State

```typescript
// Add these to uiSlice.ts
interface NavigationState {
  currentRoute: string;         // Primary route (/home, /ATS, etc)
  navigationHistory: string[];  // Record of past routes
  sectionContext: {            // Section-specific navigation context
    ats?: ATSNavigationContext;
    cars?: CarsNavigationContext;
    // other sections as needed
  }
}

interface ATSNavigationContext {
  activeSubject: string;
  learningMode: 'highlight' | 'video' | 'reading' | 'practice' | 'askKalypso';
  lastViewedContent: string;
}

// Add new actions
const setCurrentRoute = (route: string) => {
  set((state) => ({
    currentRoute: route,
    navigationHistory: [...state.navigationHistory, route].slice(-10) // Keep last 10
  }));
}

const setSectionContext = (section: string, context: any) => {
  set((state) => ({
    sectionContext: {
      ...state.sectionContext,
      [section]: {
        ...state.sectionContext[section],
        ...context
      }
    }
  }));
}
```

### 2. Create Navigation Hooks for Consistent Usage

```typescript
// In a new hooks/useNavigation.ts file
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/slices/uiSlice';

export function useNavigation() {
  const router = useRouter();
  const setCurrentRoute = useUIStore(state => state.setCurrentRoute);
  const setSectionContext = useUIStore(state => state.setSectionContext);
  
  // Navigate to a main route with URL change
  const navigateTo = (route: string) => {
    router.push(route);
    setCurrentRoute(route);
  };
  
  // Update section context without changing URL
  const updateSectionContext = (section: string, context: any) => {
    setSectionContext(section, context);
  };
  
  // Navigate within ATS (common case)
  const navigateATS = (subject: string, mode: string) => {
    // Only change URL to /ATS if not already there
    if (window.location.pathname !== '/ATS') {
      router.push('/ATS');
    }
    
    setCurrentRoute('/ATS');
    setSectionContext('ats', {
      activeSubject: subject,
      learningMode: mode,
      lastAccessed: new Date().toISOString()
    });
  };
  
  return {
    navigateTo,
    updateSectionContext,
    navigateATS
  };
}
```

### 3. Usage in Components

```typescript
// In any component needing navigation
import { useNavigation } from '@/hooks/useNavigation';

const MyComponent = () => {
  const { navigateTo, navigateATS } = useNavigation();
  
  const goToHome = () => navigateTo('/home');
  
  const openBiologyVideos = () => navigateATS('biology', 'video');
  
  // ...
};
```

### 4. Integration with Kalypso

```typescript
// In Kalypso context provider
import { useUIStore } from '@/store/slices/uiSlice';

const KalypsoContextProvider = ({ children }) => {
  const { currentRoute, sectionContext } = useUIStore();
  
  // Build context object for Kalypso that includes navigation state
  const buildContextForKalypso = () => {
    return {
      currentRoute,
      currentSection: getCurrentSection(currentRoute),
      sectionDetails: sectionContext[getCurrentSection(currentRoute)],
      // ... other context
    };
  };
  
  // Helper to extract section from route
  const getCurrentSection = (route: string) => {
    if (route === '/ATS') return 'ats';
    if (route.includes('/CARS')) return 'cars';
    // ... other mappings
    return 'general';
  };
  
  // ... rest of provider
};
```

### 5. Debug Panel Integration

Ensure DebugPanel reads and displays navigation state:

```typescript
// In DebugPanel.tsx
const uiState = useUIStore();

// Format navigation for display
const displayNavigationState = {
  currentRoute: uiState.currentRoute,
  recentHistory: uiState.navigationHistory.slice(-3), // Show last 3
  atsContext: uiState.sectionContext?.ats || 'Not in ATS',
  carsContext: uiState.sectionContext?.cars || 'Not in CARS'
};

// Then in the render:
<div>
  <h4 className="font-bold">Navigation State</h4>
  <pre>{JSON.stringify(displayNavigationState, null, 2)}</pre>
</div>
```

## Benefits of This Approach

1. **Clear Organization**: Navigation state remains in UISlice but is well-structured
2. **Single Source of Truth**: One place for determining where the user is
3. **Flexible**: Can track section-specific context without changing URLs
4. **Persistent**: State persists between sessions via Zustand persistence
5. **Compatible**: Works with both URL-based and state-based navigation
6. **Developer-Friendly**: Easy to understand and extend

## Next Steps

1. Implement the UISlice extensions
2. Create the navigation hooks
3. Update all navigation calls in the app to use the new system
4. Add section context updates in ATS components
5. Connect Kalypso context to navigation state
6. Update DebugPanel to show navigation state

## Future Considerations

1. Analytics integration to track user navigation patterns
2. Deeper section context for more granular tracking
3. Breadcrumb generation from navigation state
4. Session replay capabilities using navigation history

## Comprehensive Navigation Tracking Checklist

Based on the entire codebase, here's a complete checklist of all sections/areas that should be tracked in the UI state for complete user navigation awareness:

### Main Sections to Track (Primary Routes)
- [ ] Landing Page (`/`)
- [ ] Home Dashboard (`/home`)
- [ ] ATS - Adaptive Tutoring Suite (`/ATS`)
- [ ] CARS - Critical Analysis and Reasoning (`/CARS`)
- [ ] Profile (`/profile`)
- [ ] Settings (`/settings`)
- [ ] Flashcards (`/flashcards`)
- [ ] Resources (`/resources`)
- [ ] Help (`/help`)
- [ ] Onboarding (`/onboarding`)

### Subsections to Track (No URL Changes)

#### ATS Subsections
- [ ] Subject Selection  
  - [ ] Track active subject
  - [ ] Track previously viewed subjects
  - [ ] Track completion status per subject
  
- [ ] Learning Mode
  - [ ] Highlight mode
  - [ ] Video mode
  - [ ] Reading mode
  - [ ] Practice mode
  - [ ] Ask Kalypso mode
  
- [ ] Content Progress
  - [ ] Current content item ID
  - [ ] Progress percentage in current content
  - [ ] Last accessed timestamps

#### CARS Subsections
- [ ] Passage Selection
  - [ ] Current passage ID
  - [ ] Passage category/type
  
- [ ] Question Navigation
  - [ ] Current question index
  - [ ] Answered/unanswered status
  - [ ] Flagged questions
  
- [ ] Review Mode
  - [ ] Track when user is in review vs. test mode
  - [ ] Track which passages/questions are being reviewed

#### Flashcard Subsections
- [ ] Deck Selection
  - [ ] Current deck ID
  - [ ] Previously studied decks
  
- [ ] Study Session
  - [ ] Current card index
  - [ ] Study session stats (correct/incorrect)
  - [ ] Session duration

#### Profile Subsections
- [ ] Account Settings
- [ ] Study Statistics
- [ ] Subscription Management
- [ ] Achievement Tracking

### Dialog/Modal States to Track
- [ ] Active modal/dialog type
- [ ] Previous screen before modal opened
- [ ] Modal navigation history (for multi-step modals)

### Contextual Learning States
- [ ] Current study session duration
- [ ] Session goals/progress
- [ ] Break reminders/status
- [ ] Study streak information

### Implementation Priority Order
1. [ ] Extend UISlice with navigation structure
   - [ ] Add `navigationHistory` array
   - [ ] Add `sectionContext` object
   - [ ] Add action creators for navigation

2. [ ] Create common `useNavigation` hook
   - [ ] Implement general navigation methods
   - [ ] Add section-specific navigation helpers

3. [ ] Update main section navigation (Primary Routes)
   - [ ] Modify all route changes to update state
   - [ ] Add entry point tracking for each major section

4. [ ] Implement ATS tracking
   - [ ] Add subject selection tracking
   - [ ] Add learning mode tracking
   - [ ] Add content progress tracking

5. [ ] Implement CARS tracking
   - [ ] Add passage selection tracking
   - [ ] Add question navigation tracking
   - [ ] Add review mode state

6. [ ] Add remaining subsection tracking
   - [ ] Flashcards subsections
   - [ ] Profile subsections
   - [ ] Modal/dialog tracking

7. [ ] Enhance DebugPanel
   - [ ] Add navigation state visualization
   - [ ] Add history view
   - [ ] Add section context details 

8. [ ] Integrate with Kalypso
   - [ ] Provide navigation context to AI
   - [ ] Enable section-aware responses

### Technical Requirements
- [ ] Persist navigation state in localStorage
- [ ] Handle back/forward browser navigation
- [ ] Maintain URL synchronization where appropriate
- [ ] Add analytics tracking for navigation events
