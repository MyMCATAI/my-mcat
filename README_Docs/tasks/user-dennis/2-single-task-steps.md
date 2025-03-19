### Branch TODO:

### Branch Steps: Route and Navigation Tracking

# Feature #2: Track UI Globally

## Overview
Implement global UI state tracking to maintain consistent awareness of user navigation and context throughout the application. This will ensure Kalypso AI has proper context about what the user is doing at all times.

## Implementation Strategy
We'll extend the UISlice with a structured navigation object that tracks both the current page and subsections, along with contextual information specific to each route.

## Implementation Checklist

### 1. Extend UISlice with Enhanced Navigation Structure

- [ ] Add structured `navigation` object to UISlice state:
  - [ ] `page` property - tracks main route (e.g., '/home', '/cars', '/ats')
  - [ ] `subSection` object - contains route-specific subsection data
- [ ] Implement action creators:
  - [ ] `setNavigation` - updates both page and subsection data
  - [ ] `updateSubSection` - updates only subsection data
  - [ ] `clearNavigation` - resets navigation when needed

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

## Navigation Schema - Simplified for Initial Implementation

Below are the minimal navigation schemas for each major route, focused only on essential tracking data:

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

### 7. Doctors Office (Settings/Profile) Route
```javascript
navigation: {
  page: '/doctorsoffice',
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

### 2. Create Navigation Hook for Consistent Usage

- [ ] Create `useNavigation` hook in `hooks/useNavigation.ts`
- [ ] Implement core navigation methods:
  - [ ] `navigateTo` - change routes with URL updates
  - [ ] `updateSubSection` - update subsection data without changing page
  - [ ] Route-specific helpers (e.g., `navigateATS`, `navigateCARS`)

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

### 3. Implement Navigation Tracking Per Major Route

#### ATS Route
- [ ] Update ATS page to use the new navigation system
- [ ] Track concept selection (e.g., "Amino Acids")
- [ ] Track content type (video, reading, quiz, etc.)
- [ ] Update ATS navigation components to use new hooks

#### CARS Route
- [ ] Update CARS page to use the new navigation system
- [ ] Track passage information
- [ ] Track questions asked and explanation notes
- [ ] Update CARS components to use new hooks

#### Other Main Routes
- [ ] Home Dashboard
- [ ] Profile
- [ ] Flashcards
- [ ] Settings

### 4. Connect Kalypso to Navigation State

- [ ] Update Kalypso context provider to access navigation state
- [ ] Pass relevant navigation data to Kalypso
- [ ] Enable Kalypso to respond with context awareness

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

### 5. Add Debug Panel Integration

- [ ] Update DebugPanel to display current navigation state
- [ ] Show page and subsection information
- [ ] Format navigation data for readability

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

1. Test navigation through main routes:
   - [ ] Verify `navigation.page` updates correctly
   - [ ] Check subsection data is reset when changing routes

2. Test subsection updates:
   - [ ] ATS navigation with different concepts and content types
   - [ ] CARS navigation with different passages and questions
   - [ ] Verify subsection data updates without changing page

3. Test Kalypso integration:
   - [ ] Verify Kalypso receives proper navigation context
   - [ ] Test context-aware responses

## Expected Outcomes

1. Complete structured navigation tracking throughout the app
2. Contextual information available for Kalypso based on user's location
3. Simplified and consistent navigation API
4. Clear distinction between main page and subsection navigation
