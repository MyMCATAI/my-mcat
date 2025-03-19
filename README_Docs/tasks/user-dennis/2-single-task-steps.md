# Feature #2: Track UI Globally

## Overview
Implement global UI state tracking to maintain consistent awareness of user navigation and context throughout the application. This will ensure Kalypso AI has proper context about what the user is doing at all times.

## Goals and Expected Outcomes
1. Complete structured navigation tracking throughout the app
2. Contextual information available for Kalypso based on user's location
3. Simplified and consistent navigation API
4. Clear distinction between main page and subsection navigation

## Implementation Strategy
We'll extend the UISlice with a structured navigation object that tracks both the current page and subsections, along with contextual information specific to each route. This involves transitioning from the current tab-based navigation within a single page to a full route-based navigation system with URL changes.

## Key Challenges
1. Maintaining state persistence across route navigation (previously maintained in parent component)
2. Ensuring proper activity tracking across route changes
3. Replacing parent-child prop communication with store-based approaches
4. Supporting both tab-based and route-based navigation during transition
5. Avoiding performance degradation from duplicate API calls and repeated initializations

## Transition Strategy and Key Challenges (Detailed)

The primary transition is from conditional rendering within a single route to separate routes with URL changes. This introduces several critical challenges that must be addressed:

### 1. State Persistence
- **Problem**: In the current HomePage component, all state persists across tab changes because it remains within the same component. When navigating to separate routes, this shared state is lost.
- **Solution**:
  - Move all tab-dependent state to the Zustand store (UISlice or dedicated slices)
  - Use `pageState` to track context that was previously shared across tabs
  - Implement store selectors that any route component can access
  - Consider using localStorage for persisting state that should survive page refreshes

### 2. Context Loss
- **Problem**: The `pageState` currently tracks things like `chatbotContext` and `activities` across tabs. When navigating between routes, this shared context would be lost.
- **Solution**: 
  - Create a dedicated context store that maintains this state across routes
  - Extract `chatbotContext` into a separate slice or context provider
  - Ensure the RouteTracker component updates these contexts on route changes
  - Implement lazy loading of contexts when navigating directly to a route

### 3. Activity Tracking
- **Problem**: The application tracks user activity with `currentStudyActivityId`. With route changes, the existing code for cleanup/tracking when switching tabs needs different handling.
- **Solution**:
  - Add route change listeners in RouteTracker that terminate activities properly
  - Create a central activity manager that works across routes
  - Ensure activity IDs are maintained in the store and accessible to all route components
  - Add guards to prevent duplicate activity creation when navigating

### 4. Initialization Logic
- **Problem**: Each new route will trigger its own initialization, potentially duplicating API calls that were previously shared.
- **Solution**:
  - Implement a shared initialization provider
  - Use React Query or a similar solution for caching API responses
  - Create initialization flags in the store to track what's already been loaded
  - Consider moving initialization logic to layout components where appropriate

### 5. Parent-Child Communication
- **Problem**: Components like `PracticeTests` receive props like `handleSetTab` and `chatbotRef` from the parent. In separate routes, these need reimplementation.
- **Solution**:
  - Replace prop passing with store-based communication
  - Create shared context providers for components that need access to common functionality
  - Use event emitters or pub/sub patterns for cross-component communication
  - Implement route-specific context providers when needed

### 6. Sidebar Synchronization
- **Problem**: The HoverSidebar uses `currentPage` to track the active item, which needs to align with the new URL-based routes.
- **Solution**:
  - Update HoverSidebar to use navigation state from the store
  - Create a mapping between route paths and sidebar items
  - Ensure bi-directional updates (sidebar clicks update routes and routes update sidebar)
  - Add active state detection based on URL patterns

### 7. Route-Specific Permissions/Guards
- **Problem**: The home page has logic to handle subscribers vs non-subscribers. Each new route needs to reimplement these permission checks.
- **Solution**:
  - Create a centralized permission system in the store
  - Implement route guards in the RouteTracker or layout components
  - Use Next.js middleware for route-level permissions where appropriate
  - Share authentication/subscription logic across route components

### 8. Component Events and Callbacks
- **Problem**: Components like `PracticeTests` have callbacks to the parent (e.g., `onActivitiesUpdate={fetchActivities}`). These need reimplementation.
- **Solution**:
  - Create a global event system using the store
  - Implement custom hooks for event handling across components
  - Use context providers for sharing callback functions
  - Consider using React Query mutations for data updates

### 9. Maintaining User Experience Consistency
- **Problem**: Users expect the same behavior as before, even with the URL structure change.
- **Solution**:
  - Ensure visual transitions between routes match the previous tab transitions
  - Maintain state exactly as it was in the tab-based system
  - Add loading states to prevent jarring transitions
  - Test thoroughly with real users to catch UX inconsistencies

### 10. Backward Compatibility
- **Problem**: Existing code, links, and user bookmarks may use the old tab-based system.
- **Solution**:
  - Add support for URL parameters that map to tabs (e.g., `/home?tab=Tests` redirects to `/practice-tests`)
  - Create compatibility layers in the RouteTracker
  - Implement redirect rules for common patterns
  - Monitor analytics for navigation patterns that might break

## Implementation Checklist

### Core Navigation Structure
1. **Extend UISlice with Enhanced Navigation**
   - [✅] Add structured `navigation` object to UISlice state:
     - [✅] `page` property - tracks main route (e.g., '/home', '/cars', '/ats')
     - [✅] `subSection` object - contains route-specific subsection data
   - [✅] Implement action creators:
     - [✅] `setNavigation` - updates both page and subsection data
     - [✅] `updateSubSection` - updates only subsection data 
     - [✅] `clearNavigation` - resets navigation when needed

2. **Create Consistent Navigation Utility**
   - [✅] Create `useNavigation` hook in `hooks/useNavigation.ts`
   - [✅] Implement core navigation methods:
     - [✅] `navigateTo` - change routes with URL updates
     - [✅] `updateSubSection` - update subsection data without changing page
     - [✅] Route-specific helpers (e.g., `navigateATS`, `navigateCARS`)

3. **State Management Transition**
   - [ ] Create store-level shared state for previously tab-dependent components
   - [ ] Identify state previously persisted across tab changes that needs to be shared
   - [ ] Implement mechanism to persist chatbotContext, activities, and other shared state
   - [✅] Update HoverSidebar to sync activeTab highlighting with actual current route

4. **Activity Tracking Adaptation**
   - [✅] Add route change listeners to properly terminate activities when navigating
   - [ ] Update RouteTracker to handle activity start/end between route navigation
   - [ ] Ensure API calls for activities aren't duplicated across routes
   - [ ] Account for refreshes and direct URL navigation in tracking system

### Per-Route Implementation

5. **Update Major Routes**
   - [ ] Home Dashboard
   - [ ] Adaptive Tutoring Suite (ATS)
     - [ ] Track concept selection (e.g., "Amino Acids")
     - [ ] Track content type (video, reading, quiz, etc.)
   - [ ] CARS Route
     - [ ] Track passage information
     - [ ] Track questions asked and explanation notes
   - [ ] Flashcards
   - [ ] Settings
   - [ ] Other main routes

6. **Component Communication**
   - [✅] Replace parent-child prop passing with store-based communication
   - [ ] Implement context providers for components that previously received callbacks
   - [ ] Create standardized method for route components to notify other components

7. **Progressive Migration**
   - [✅] Create compatibility layer for routes that support both navigation types
   - [ ] Handle URL parameters that previously triggered tab state changes
   - [ ] Ensure old tab-based links continue to work during transition
   - [ ] Create redirect strategy for old deep links

8. **Connect Kalypso to Navigation State**
   - [✅] Update Kalypso context provider to access navigation state
   - [✅] Pass relevant navigation data to Kalypso
   - [✅] Enable Kalypso to respond with context awareness

9. **Debug Panel Integration**
   - [ ] Update DebugPanel to display current navigation state
   - [ ] Show page and subsection information
   - [ ] Format navigation data for readability

### Performance and Edge Cases

10. **Performance Considerations**
   - [ ] Evaluate repeated initialization costs across separate route components
   - [ ] Consider code-splitting impact on previously tab-managed components
   - [ ] Implement shared data fetching to avoid redundant API calls
   - [ ] Add loading states for route transitions

## Navigation Schema - Initial Implementation

Below are the minimal navigation schemas for each major route:

### 1. Home Dashboard Route
```javascript
navigation: {
  page: '/home',
  subSection: {
    activeTab: 'Summary' // Options: 'Summary', 'KalypsoAI', 'AdaptiveTutoringSuite', 'CARS', 'flashcards', 'Tests'
  }
}
```

### 2. Adaptive Tutoring Suite (ATS) Route
```javascript
navigation: {
  page: '/ats',
  subSection: {
    concept: 'Amino Acids', // The current topic being studied
    contentType: 'Video', // Options: 'Video', 'Reading', 'Quiz', 'Notes'
    contentId: 'vid_12345'
  }
}
```

### 3. CARS (Critical Analysis & Reasoning) Route
```javascript
navigation: {
  page: '/cars',
  subSection: {
    testMode: true, // Whether in test mode or review mode
    passageId: 'passage_789',
    passageTitle: 'Philosophy of Science',
    currentQuestion: 3 // 1-indexed
  }
}
```

### 4. AnkiClinic (Flashcards) Route
```javascript
navigation: {
  page: '/ankiclinic',
  subSection: {
    currentDeck: 'biochemistry-101',
    deckCategory: 'Biology',
    cardIndex: 12,
    cardState: 'question' // 'question' or 'answer'
  }
}
```

### 5. Test/Quiz Route
```javascript
navigation: {
  page: '/test',
  subSection: {
    testId: 'test_456',
    testType: 'full-length', // 'full-length', 'section', 'practice', 'diagnostic'
    subject: 'Chemistry',
    currentSection: 'Organic',
    questionNumber: 15
  }
}
```

### 6. User Test Review Route
```javascript
navigation: {
  page: '/user-test',
  subSection: {
    testId: 'completed_test_789',
    viewMode: 'review', // 'review', 'analytics', 'explanation'
    score: 78, // Percentage
    questionIndex: 5 // Current question being reviewed
  }
}
```

### 7. Settings Route
```javascript
navigation: {
  page: '/settings',
  subSection: {
    activeSection: 'profile' // 'profile', 'settings', 'subscription', 'performance'
  }
}
```

### 8. Pricing/Subscription Route
```javascript
navigation: {
  page: '/pricing',
  subSection: {
    viewingPlan: 'premium' // 'basic', 'premium', 'professional'
  }
}
```

### 9. Blog/Resources Route
```javascript
navigation: {
  page: '/blog',
  subSection: {
    category: 'study-tips',
    articleId: 'blog_123'
  }
}
```

### 10. Onboarding Route
```javascript
navigation: {
  page: '/onboarding',
  subSection: {
    step: 3, // Current onboarding step
    totalSteps: 5
  }
}
```

## Code Examples

### UISlice Extension
```typescript
// Example UISlice extension
interface UIState {
  // Existing state
  window: WindowSize;
  theme: ThemeType;
  
  // Replace simple currentRoute with structured navigation
  navigation: {
    page: string; // e.g., '/home', '/cars', '/ats'
    subSection: Record<string, any>; // Generic object that adapts based on the route
  }
}

// Action creators
const setNavigation = (page: string, subSection: Record<string, any> = {}) => {
  set(() => ({
    navigation: {
      page,
      subSection
    }
  }));
}

const updateSubSection = (updates: Record<string, any>) => {
  set((state) => ({
    navigation: {
      ...state.navigation,
      subSection: {
        ...state.navigation.subSection,
        ...updates
      }
    }
  }));
}

const clearNavigation = () => {
  set(() => ({ 
    navigation: {
      page: '',
      subSection: {}
    }
  }));
}
```

### Navigation Hook
```typescript
// Example navigation hook
export function useNavigation() {
  const router = useRouter();
  const setNavigation = useUIStore(state => state.setNavigation);
  const updateSubSection = useUIStore(state => state.updateSubSection);
  const clearNavigation = useUIStore(state => state.clearNavigation);
  
  // Navigate to a main route with URL change
  const navigateTo = (route: string) => {
    router.push(route);
    setNavigation(route, {});
  };
  
  // Update subsection without changing URL or page
  const updateSection = (subSectionData: Record<string, any>) => {
    updateSubSection(subSectionData);
  };
  
  // Navigate to ATS with context
  const navigateATS = (concept: string, contentType: string) => {
    if (window.location.pathname !== '/ats') {
      router.push('/ats');
    }
    
    setNavigation('/ats', {
      concept,
      contentType
    });
  };
  
  // Navigate to CARS with context
  const navigateCARS = (passage: string) => {
    router.push('/cars');
    setNavigation('/cars', {
      passage
    });
  };
  
  return {
    navigateTo,
    updateSection,
    navigateATS,
    navigateCARS
  };
}
```

### Kalypso Integration
```typescript
// Example Kalypso integration
const KalypsoContextProvider = ({ children }) => {
  const navigation = useUIStore(state => state.navigation);
  
  const buildContextForKalypso = () => {
    // Format navigation data for Kalypso
    return {
      currentPage: navigation.page,
      ...navigation.subSection
    };
  };
  
  // Use the navigation in Kalypso initialization
};
```

### Debug Panel Implementation
```typescript
// Example Debug Panel implementation
const DebugNavigationPanel = () => {
  const navigation = useUIStore(state => state.navigation);
  
  return (
    <div className="debug-panel-section">
      <h3>Navigation State</h3>
      <div>
        <div>Current Page: {navigation.page}</div>
        <div>SubSection: 
          <pre>{JSON.stringify(navigation.subSection, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};
```

## Testing Plan

1. **Core Navigation Testing**
   - [ ] Verify `navigation.page` updates correctly when routes change
   - [ ] Check subsection data is reset when changing routes
   - [ ] Verify subsection data updates without changing page

2. **Specific Route Testing**
   - [ ] ATS navigation with different concepts and content types
   - [ ] CARS navigation with different passages and questions
   - [ ] Test user activity tracking across route changes

3. **Kalypso Integration Testing**
   - [✅] Verify Kalypso receives proper navigation context
   - [ ] Test context-aware responses based on different routes

4. **Edge Case Testing**
   - [ ] Direct URL access to routes (bypassing home page initialization)
   - [ ] Session timeout and re-authentication while on specific routes
   - [ ] Browser back/forward navigation between old and new navigation
   - [ ] Mobile device navigation with potential connection interruptions
