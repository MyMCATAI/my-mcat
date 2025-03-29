# HomePage & ChatContainer Optimization Checklist

## Implementation Order Recommendation
For minimal risk during implementation, follow this order:
1. Create Zustand store for activities (#5)
2. Optimize Local Storage (#8)
3. Implement error boundaries (#6)
4. Simplify welcome message flow (#3) 
5. Centralize loading states (#2)
6. Eliminate duplicate API calls (#1)
7. Reduce unnecessary re-renders (#4)
8. Lazy load components (#9)
9. Implement Suspense loading states (#7)

## 1. Eliminate Duplicate API Calls

- [ ] **Consolidate Calendar Activity Fetching**
  - Current issue: Both `useExamActivities` hook and HomePage component fetch similar calendar data
  - File: `app/(dashboard)/(routes)/home/page.tsx` (lines ~209-217) and `components/chatgpt/ChatContainer.tsx`
  - Solution: Lift the data fetching to HomePage only and pass activities down to ChatContainer as props

```typescript
// Step 1: Update the ChatContainer props interface in components/chatgpt/ChatContainer.tsx
interface ChatContainerProps {
  className?: string;
  chatbotRef?: React.MutableRefObject<{
    sendMessage: (message: string, messageContext?: string) => void;
  }>;
  // Add new props
  examActivities?: CalendarActivity[];
  studyActivities?: CalendarActivity[];
  examLoading?: boolean;
  studyLoading?: boolean;
}

// Step 2: In page.tsx, pass data down
const { activities: examActivities, loading: examLoading } = useExamActivities();
const { activities: studyActivities, loading: studyLoading } = useAllCalendarActivities();

// Then in render:
{activePage === 'KalypsoAI' && (
  <ChatContainer 
    chatbotRef={chatbotRef} 
    examActivities={examActivities}
    studyActivities={studyActivities}
    examLoading={examLoading}
    studyLoading={studyLoading}
  />
)}

// Step 3: In ChatContainer.tsx, use props instead of hooks when available
// Replace the existing hook calls with:
const {
  examActivities: propExamActivities,
  studyActivities: propStudyActivities,
  examLoading: propExamLoading,
  studyLoading: propStudyLoading,
} = props;

// Use passed props when available, fall back to hooks when not
const examActivities = propExamActivities || useExamActivities().activities;
const studyActivities = propStudyActivities || useAllCalendarActivities().activities;
const examLoading = propExamLoading !== undefined ? propExamLoading : useExamActivities().loading;
const studyLoading = propStudyLoading !== undefined ? propStudyLoading : useAllCalendarActivities().loading;
```

**Note**: This approach maintains backward compatibility so ChatContainer can work both standalone and as a child component.

## 2. Streamline Loading State Management

- [ ] **Centralize Loading States**
  - Current issue: ChatContainer implements its own loading logic separate from HomePage
  - File: `components/chatgpt/ChatContainer.tsx` (lines ~147-176)
  - Solution: Use a single source of truth for loading states while maintaining component-specific loading visualization

```typescript
// In ChatContainer.tsx, modify prefetchWelcomeMessage:
const prefetchWelcomeMessage = async () => {
  // Check loading state from props first (if provided), then fall back to internal state
  const isLoading = (props.examLoading !== undefined && props.studyLoading !== undefined) 
    ? (props.examLoading || props.studyLoading) 
    : (examLoading || studyLoading);
    
  if (isLoading) {
    console.log('[ChatContainer] Waiting for activities to load before generating welcome message');
    // Set a fallback message if we need to show something immediately
    const loadingMessage = `Hello ${userInfo?.firstName || 'there'}! I'm loading your recent activities...`;
    setWelcomeMessage(loadingMessage);
    setIsWelcomeMessageTemporary(true);
    return;
  }
  
  // Rest of the function...
}
```

**Note**: This approach allows ChatContainer to work with both parent-provided loading states or self-managed loading states, preventing any UI regressions.

## 3. Optimize Welcome Message Generation

- [ ] **Simplify Welcome Message Flow**
  - Current issue: Two-step message update (temporary → final) with complex cache logic
  - File: `components/chatgpt/ChatContainer.tsx` (lines ~147-277)
  - Solution: Generate message once when all data is available

```typescript
// Simplified approach with safeguards
useEffect(() => {
  // Skip if we already have a welcome message and it's not temporary
  if (welcomeMessage && !isWelcomeMessageTemporary) {
    return;
  }

  // Define keys once to ensure consistency
  const localStorageKey = `welcome-message-${userInfo?.userId || 'anonymous'}`;
  
  // Only generate when we have all required data
  if (!examLoading && !studyLoading && userInfo) {
    // Check cache first
    try {
      const cachedData = localStorage.getItem(localStorageKey);
      if (cachedData) {
        const { message, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        // Use cache if it's less than 6 hours old
        if (now - timestamp < 6 * 60 * 60 * 1000) {
          setWelcomeMessage(message);
          setIsWelcomeMessageTemporary(false);
          return;
        }
      }
    } catch (e) {
      console.error('[ChatContainer] Error parsing cached welcome message:', e);
    }
    
    // Generate new message
    const gameState = {
      streakDays,
      testScore,
      userLevel,
      totalPatients
    };
    
    const templateMessage = generateWelcomeMessage({
      userInfo,
      examActivities,
      studyActivities,
      gameState
    });
    
    console.log('[ChatContainer] Generated template welcome message');
    
    // Update state
    setWelcomeMessage(templateMessage);
    setIsWelcomeMessageTemporary(false);
    
    // Cache for future sessions
    localStorage.setItem(localStorageKey, JSON.stringify({
      message: templateMessage,
      timestamp: Date.now()
    }));
  }
}, [
  examLoading, studyLoading, userInfo, 
  examActivities, studyActivities, 
  welcomeMessage, isWelcomeMessageTemporary, 
  streakDays, testScore, userLevel, totalPatients
]);
```

**Note**: This approach simplifies the flow while keeping cache functionality and preserving the existing behavior.

## 4. Reduce Unnecessary Re-renders

- [ ] **Optimize Dependency Arrays**
  - Current issue: Too many dependencies in useMemo/useCallback functions
  - File: `app/(dashboard)/(routes)/home/page.tsx` (lines ~700-755)
  - Solution: Split up the large content useMemo into smaller, focused memoized components

```typescript
// In page.tsx:

// Step 1: Properly memoize callbacks that will be passed to child components
const handleIntroVideoComplete = useCallback(async () => {
  try {
    await setHasSeenIntroVideo(true);
    toast.success("Introduction video completed!");
  } catch (error) {
    console.error("[HomePage] Failed to update intro video status:", error);
    toast.error("Failed to update your profile. Please try again.");
  }
}, [setHasSeenIntroVideo]);

// Step 2: Create memoized child components
const KalypsoTab = memo(({ 
  hasSeenIntroVideo, 
  onIntroComplete, 
  chatbotRef,
  examActivities,
  studyActivities,
  examLoading,
  studyLoading
}) => (
  <div className="h-full overflow-hidden">
    {!hasSeenIntroVideo ? (
      <IntroVideoPlayer onComplete={onIntroComplete} />
    ) : (
      <ChatContainer 
        chatbotRef={chatbotRef} 
        examActivities={examActivities}
        studyActivities={studyActivities}
        examLoading={examLoading}
        studyLoading={studyLoading}
      />
    )}
  </div>
));

// Step 3: In the render function
{(activePage === 'KalypsoAI' || !activePage) && (
  <KalypsoTab 
    hasSeenIntroVideo={hasSeenIntroVideo}
    onIntroComplete={handleIntroVideoComplete}
    chatbotRef={chatbotRef}
    examActivities={examActivities}
    studyActivities={studyActivities}
    examLoading={examLoading}
    studyLoading={studyLoading}
  />
)}
```

- [ ] **Use useCallback for Event Handlers in ChatContainer**
  - Current issue: Some functions in ChatContainer are recreated on every render
  - File: `components/chatgpt/ChatContainer.tsx`
  - Solution: Wrap all event handlers with useCallback with proper dependency arrays

```typescript
// In ChatContainer.tsx
// Example for toggleAudio handler:
const toggleAudio = useCallback(() => {
  // Prevent rapid toggling by enforcing a minimum time between toggles
  const now = Date.now();
  const timeSinceLastToggle = now - lastToggleTime;
  
  console.log('[ChatContainer] toggleAudio called, time since last toggle:', timeSinceLastToggle, 'ms');
  
  // Only allow toggle if it's been at least 500ms since the last toggle
  if (timeSinceLastToggle < 500) {
    console.log('[ChatContainer] Ignoring toggle, too soon after last toggle');
    return;
  }
  
  setLastToggleTime(now);
  
  if (!audioEnabled) {
    console.log('[ChatContainer] Enabling audio and playing sound');
    audio.playSound('chatbot-open');
  } else {
    console.log('[ChatContainer] Disabling audio');
  }
  setAudioEnabled(!audioEnabled);
}, [audioEnabled, lastToggleTime, audio]);

// Do the same for other event handlers:
// - handleSendMessage
// - handleTabClick
// - handleCalendarNavigate
// - handleSelectEvent
// - handleEventUpdate
// - playAudio
// - stopAudio
```

## 5. Implement Proper Data Sharing with Zustand

- [ ] **Create a Dedicated Store Slice for Activities**
  - Current issue: Activity data exists in component state instead of global store
  - File: Create new file `store/slices/activitiesSlice.ts`
  - Solution: Implement a new slice for shared calendar activity data with graceful migration path

```typescript
// In new file store/slices/activitiesSlice.ts
import { create } from 'zustand';
import type { CalendarActivity } from '@/types/calendar';

interface ActivitiesState {
  examActivities: CalendarActivity[];
  studyActivities: CalendarActivity[];
  examLoading: boolean;
  studyLoading: boolean;
  fetchActivities: () => Promise<void>;
  // Add methods to update activities
  setExamActivities: (activities: CalendarActivity[]) => void;
  setStudyActivities: (activities: CalendarActivity[]) => void;
}

export const useActivitiesStore = create<ActivitiesState>((set) => ({
  examActivities: [],
  studyActivities: [],
  examLoading: true,
  studyLoading: true,
  setExamActivities: (activities) => set({ examActivities: activities }),
  setStudyActivities: (activities) => set({ studyActivities: activities }),
  fetchActivities: async () => {
    set({ examLoading: true, studyLoading: true });
    try {
      const [examData, studyData] = await Promise.all([
        fetch('/api/exam-activities').then(res => res.json()),
        fetch('/api/study-activities').then(res => res.json())
      ]);
      
      set({ 
        examActivities: examData, 
        studyActivities: studyData,
        examLoading: false,
        studyLoading: false
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
      set({ examLoading: false, studyLoading: false });
    }
  }
}));

// Then in selectors.ts:
export const useActivities = () => useActivitiesStore(state => ({
  examActivities: state.examActivities,
  studyActivities: state.studyActivities,
  examLoading: state.examLoading,
  studyLoading: state.studyLoading,
  fetchActivities: state.fetchActivities,
  setExamActivities: state.setExamActivities,
  setStudyActivities: state.setStudyActivities
}));

// Migration plan - Phase 1: In existing components that use the old hooks,
// update the central store when new data is fetched, but keep using the old hooks
// Example in custom hooks:

// In useExamActivities.ts:
export function useExamActivities() {
  // Original logic
  const [activities, setActivities] = useState<CalendarActivity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add store update
  const { setExamActivities } = useActivitiesStore();
  
  // In the fetch function:
  const fetchActivities = useCallback(async () => {
    // ... existing fetch logic
    setActivities(data);
    // Update central store
    setExamActivities(data);
    // ... rest of function
  }, [setExamActivities]);
  
  // Rest of hook
}

// Phase 2: After confirming Phase 1 works, refactor components to use the store directly
```

**Note**: This two-phase migration approach allows gradual adoption of the central store without breaking existing functionality.

## 6. Improve Error Handling

- [ ] **Implement Consistent Error Boundaries**
  - Current issue: Errors in data fetching might not be properly caught and displayed
  - File: Both `app/(dashboard)/(routes)/home/page.tsx` and `components/chatgpt/ChatContainer.tsx`
  - Solution: Add dedicated error boundary components and consistent error UI

```typescript
// Create a new file: components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error!);
      }
      return this.props.fallback || (
        <div className="p-4 bg-red-500 bg-opacity-10 border border-red-500 text-red-500 rounded-lg">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Usage in HomePage:
<ErrorBoundary 
  fallback={(error) => (
    <div className="gradientbg p-4 rounded-lg">
      <h2 className="text-xl text-white mb-2">Error Loading Content</h2>
      <p className="text-white opacity-80">Please refresh the page or try again later.</p>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-4 p-2 bg-black bg-opacity-50 rounded text-xs text-red-300 overflow-auto">
          {error.toString()}
        </pre>
      )}
    </div>
  )}
>
  {/* Main content */}
</ErrorBoundary>
```

**Note**: Error boundaries only catch rendering errors, so we still need try/catch blocks for data fetching and event handlers.

## 7. Implement Better Loading States with Suspense

- [ ] **Use React Suspense for Loading States**
  - Current issue: Manual loading state management with multiple flags
  - Files: Both HomePage and ChatContainer
  - Solution: Add Suspense boundaries with appropriate fallbacks around async components

```typescript
// IMPLEMENTATION NOTE: This is a more advanced change and should be done last after
// all other optimizations are working. Start with applying Suspense to non-critical components.

// Step 1: Create custom wrappers for data fetching that work with Suspense
// utilities/suspense.ts
export function createResource<T>(promise: Promise<T>): { read: () => T } {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let result: T;
  let error: any;
  
  const suspender = promise.then(
    (data) => {
      status = 'success';
      result = data;
    },
    (e) => {
      status = 'error';
      error = e;
    }
  );
  
  return {
    read() {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'error') {
        throw error;
      } else {
        return result;
      }
    }
  };
}

// Step 2: Update a component to use Suspense-compatible data fetching
// Example for a profile component:
const ProfileWithSuspense = () => {
  const userResource = useMemo(() => {
    return createResource(fetchUserProfile());
  }, []);
  
  const user = userResource.read(); // This will suspend if data is not ready
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
    </div>
  );
};

// Step 3: Use Suspense in the parent component
<Suspense fallback={<ProfileSkeleton />}>
  <ProfileWithSuspense />
</Suspense>
```

**Note**: Implementing Suspense requires a significant refactoring of how data is fetched and should be done incrementally, starting with leaf components.

## 8. Optimize Local Storage Usage

- [ ] **Implement Storage Expiration Cleanup**
  - Current issue: Potential localStorage bloat from welcome messages
  - File: `components/chatgpt/ChatContainer.tsx` (line ~173)
  - Solution: Add cache cleanup for old entries

```typescript
// Add to ChatContainer mount effect:
// Clean up old cached messages
const cleanupLocalStorage = () => {
  console.log('[ChatContainer] Running localStorage cleanup');
  const keys = Object.keys(localStorage);
  const now = Date.now();
  let cleanedItems = 0;
  
  keys.forEach(key => {
    if (key.startsWith('welcome-message-')) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.timestamp && (now - data.timestamp > 7 * 24 * 60 * 60 * 1000)) {
          // Remove items older than 7 days
          localStorage.removeItem(key);
          cleanedItems++;
        }
      } catch (e) {
        // Invalid JSON, remove the item
        localStorage.removeItem(key);
        cleanedItems++;
      }
    }
  });
  
  if (cleanedItems > 0) {
    console.log(`[ChatContainer] Cleaned up ${cleanedItems} stale items from localStorage`);
  }
};

// Add to component mount effect
useEffect(() => {
  console.log('[ChatContainer] Component mounted, prefetching welcome message');
  
  // Run cleanup first
  cleanupLocalStorage();
  
  // Rest of the effect...
}, []);
```

**Note**: This is a safe, non-breaking change that can be implemented immediately.

## 9. Lazy Load Components

- [ ] **Implement Lazy Loading for Heavy Components**
  - Current issue: All components loaded upfront regardless of active tab
  - File: `app/(dashboard)/(routes)/home/page.tsx`
  - Solution: Use dynamic imports for tab components with proper loading states

```typescript
// At the top of the file:
// For components NOT visible in the initial render or above the fold:
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Replace direct imports with lazy imports for appropriate components
const AdaptiveTutoring = dynamic(() => import('./AdaptiveTutoring'), {
  loading: () => <LoadingSpinner message="Loading tutoring suite..." />
});

const PracticeTests = dynamic(() => import('./PracticeTests'), {
  loading: () => <LoadingSpinner message="Loading practice tests..." />
});

const FlashcardDeck = dynamic(() => import('./FlashcardDeck'), {
  loading: () => <LoadingSpinner message="Loading flashcards..." />
});

// IMPORTANT: Do NOT lazy load components that are likely to be shown immediately
// Keep direct imports for:
// - ChatContainer (if KalypsoAI is the default tab)
// - Any components visible above the fold
```

**Note**: Only apply lazy loading to components used in non-default tabs to prevent layout shifting in the initial render.