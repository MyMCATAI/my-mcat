### Branch TODO:

### Branch Steps: Route and Navigation Tracking

# Feature #2: Track UI Globally

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

### Architecture Decision: General Context vs Section-Specific Contexts

#### Approach 1: Section-Specific Context Objects (Original)
- **Pros**:
  - Clear organization by section
  - Strong typing for each section's unique data
  - Follows domain-driven design principles
  - Easy to understand what belongs where

- **Cons**:
  - More complex nested structure
  - Requires more code to update specific sections
  - May lead to duplication of similar structures

#### Approach 2: General Context Object (RECOMMENDED)
- **Pros**:
  - Simpler flat structure
  - More flexible for changing requirements
  - Easier to update single properties
  - Cleaner for components that need a subset of properties
  - Can still be type-safe with discriminated unions

- **Cons**:
  - May need careful property naming to avoid collisions
  - Less obvious organization at a glance
  - Potentially less strong typing

### Decision: EXTEND UISLICE with a general context object

The navigation and context state should live in UISlice, using a general context object that adapts based on the current route:

```typescript
// In uiSlice.ts
interface UIState {
  // General UI state
  theme: ThemeType;
  window: WindowSize;
  
  // Navigation state
  currentRoute: string;
  navigationHistory: string[];
  
  // General context - dynamic based on current route
  context: {
    // Common properties across all routes
    pageTitle?: string;
    lastUpdated?: string;
    
    // ATS route properties
    subject?: string;
    contentType?: 'video' | 'reading' | 'quiz' | 'highlight' | 'askKalypso';
    timestamp?: number;
    transcription?: string;
    
    // CARS route properties
    passageContent?: string;
    questionsAsked?: string[];
    explanationNotes?: string;
    
    // Other route-specific properties as needed
    [key: string]: any;
  }
}
```

This approach:
1. Keeps all state in one place (UISlice)
2. Uses a flexible structure that can adapt to any route
3. Makes it easy to update individual properties
4. Simplifies state subscription for components
5. Makes it easy to share context with Kalypso

## Implementation Steps

### 1. Extend UISlice with Enhanced Navigation and Context State

```typescript
// Add these to uiSlice.ts
interface UIState {
  // Existing state
  window: WindowSize;
  currentRoute: string;
  theme: ThemeType;
  
  // New navigation state
  navigationHistory: string[];
  
  // New general context state
  context: Record<string, any>;
}

// Add new actions
const setCurrentRoute = (route: string) => {
  set((state) => ({
    currentRoute: route,
    navigationHistory: [...state.navigationHistory, route].slice(-10) // Keep last 10
  }));
}

const setContext = (updates: Record<string, any>) => {
  set((state) => ({
    context: {
      ...state.context,
      ...updates
    }
  }));
}

const clearContext = () => {
  set(() => ({ context: {} }));
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
  const setContext = useUIStore(state => state.setContext);
  const clearContext = useUIStore(state => state.clearContext);
  
  // Navigate to a main route with URL change
  const navigateTo = (route: string) => {
    router.push(route);
    setCurrentRoute(route);
    clearContext(); // Clear context when changing routes
  };
  
  // Update context without changing URL
  const updateContext = (context: Record<string, any>) => {
    setContext(context);
  };
  
  // Navigate within ATS (common case)
  const navigateATS = (subject: string, contentType: string) => {
    // Only change URL to /ATS if not already there
    if (window.location.pathname !== '/ATS') {
      router.push('/ATS');
    }
    
    setCurrentRoute('/ATS');
    setContext({
      subject,
      contentType,
      lastUpdated: new Date().toISOString()
    });
  };
  
  return {
    navigateTo,
    updateContext,
    navigateATS
  };
}
```

### 3. Usage in Components with Selective Subscriptions

```typescript
// In any component needing navigation
import { useNavigation } from '@/hooks/useNavigation';
import { useUIStore } from '@/store/slices/uiSlice';

const MyComponent = () => {
  const { navigateTo, updateContext } = useNavigation();
  
  // Subscribe only to specific context properties to optimize re-renders
  const subject = useUIStore(state => state.context.subject);
  const contentType = useUIStore(state => state.context.contentType);
  
  const goToHome = () => navigateTo('/home');
  
  const openBiologyVideos = () => {
    navigateTo('/ATS');
    updateContext({
      subject: 'biology',
      contentType: 'video'
    });
  };
  
  // ...
};
```

### 4. Integration with Kalypso

```typescript
// In Kalypso context provider
import { useUIStore } from '@/store/slices/uiSlice';

const KalypsoContextProvider = ({ children }) => {
  // Get both route and context information
  const currentRoute = useUIStore(state => state.currentRoute);
  const context = useUIStore(state => state.context);
  
  // Build context object for Kalypso that includes navigation and content context
  const buildContextForKalypso = () => {
    return {
      currentRoute,
      ...context,
      // Additional useful information for Kalypso can be added here
    };
  };
  
  // ... rest of provider
};
```

### 5. Debug Panel Integration

```typescript
// In DebugPanel.tsx
const uiState = useUIStore();

// Format navigation and context for display
const displayState = {
  currentRoute: uiState.currentRoute,
  recentHistory: uiState.navigationHistory.slice(-3), // Show last 3
  context: uiState.context
};

// Then in the render:
<div>
  <h4 className="font-bold">Navigation & Context State</h4>
  <pre>{JSON.stringify(displayState, null, 2)}</pre>
</div>
```

## Benefits of General Context Approach

1. **Simpler State Structure**: Flat object is easier to understand and update
2. **Selective Subscriptions**: Components can subscribe to exactly what they need:
   ```typescript
   // Only re-render when specific properties change
   const transcript = useUIStore(state => state.context.transcript);
   const timestamp = useUIStore(state => state.context.timestamp);
   ```
3. **Optimized Re-renders**: When one part of context changes, only components that subscribe to that specific property will re-render
4. **Easier Updates**: Simpler API for updating context:
   ```typescript
   updateContext({ timestamp: currentTime, transcript: currentTranscript });
   ```
5. **More Flexible**: Easier to add new properties without changing the structure
6. **Fewer Nested Updates**: No need to worry about deeply nested state updates
7. **Cleaner Implementation**: Less code overall for the same functionality

## Next Steps

1. Implement the UISlice extensions with general context
2. Create the navigation hooks
3. Update all navigation calls in the app to use the new system
4. Add context updates in various components
5. Connect Kalypso to the context state
6. Update DebugPanel to show navigation and context state

## Future Considerations

1. Analytics integration to track user navigation patterns
2. Property validation for context to ensure type safety
3. Automatic context clearing when changing routes
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

### Context Information to Track Per Route

#### ATS Route Context
- [ ] Current subject
- [ ] Content type (video, reading, quiz, etc.)
- [ ] Content ID/title
- [ ] Timestamp (for videos)
- [ ] Transcription excerpts
- [ ] Progress percentage

#### CARS Route Context
- [ ] Passage content/ID
- [ ] Current question
- [ ] Questions asked
- [ ] User answers
- [ ] Explanation notes
- [ ] Test vs. review mode

#### Flashcards Route Context
- [ ] Current deck ID
- [ ] Current card
- [ ] Study statistics
- [ ] Session duration

#### Implementation Priority Order
1. [ ] Extend UISlice with navigation and context structure
   - [ ] Add `navigationHistory` array
   - [ ] Add `context` object
   - [ ] Add action creators

2. [ ] Create common `useNavigation` hook
   - [ ] Implement general navigation methods
   - [ ] Add context update helpers

3. [ ] Update main section navigation (Primary Routes)
   - [ ] Modify all route changes to update state
   - [ ] Add context tracking for each major section

4. [ ] Integrate with Kalypso
   - [ ] Provide context to AI
   - [ ] Enable context-aware responses

### Technical Requirements
- [ ] Persist navigation state in localStorage
- [ ] Handle back/forward browser navigation
- [ ] Maintain URL synchronization where appropriate
- [ ] Add analytics tracking for navigation events
- [ ] Implement selective subscriptions for performance optimization
