# AnkiClinic AdaptiveTutoring Integration Plan

## Overview
This document outlines the plan for integrating the AdaptiveTutoring System (ATS) into the AnkiClinic route (`/ankiclinic`) with a toggle functionality similar to how it's implemented in the Home page.

## Current Implementation Analysis

### Home Page Implementation
- The Home page (`/home`) has an AdaptiveTutoring component that can be toggled on/off via state
- It uses a sidebar layout alongside the main content
- The toggle functionality is handled by state in the parent component (page.tsx)

### OfficeContainer Structure
- The OfficeContainer in AnkiClinic currently has:
  - A game view on the left side 
  - A sidebar on the right side
  - No current implementation of AdaptiveTutoring

## Implementation Plan

### 1. State Management Changes

Add a new state variable to the AnkiClinic page.tsx:
```tsx
const [showAdaptiveTutoring, setShowAdaptiveTutoring] = useState(false);
```

### 2. Import AdaptiveTutoring Component

Import the AdaptiveTutoring component from the home route:
```tsx
import AdaptiveTutoring from "../home/AdaptiveTutoring";
```

### 3. UI Updates

Create a toggle button in the AnkiClinic header:
```tsx
<button 
  onClick={() => setShowAdaptiveTutoring(!showAdaptiveTutoring)}
  className="px-4 py-2 bg-[--theme-gradient-startstreak] rounded-lg text-white"
>
  {showAdaptiveTutoring ? "Return to Clinic" : "Adaptive Tutoring"}
</button>
```

### 4. Conditional Rendering

Update the main content area to conditionally render either the OfficeContainer or AdaptiveTutoring:
```tsx
{showAdaptiveTutoring ? (
  <div className="flex h-full w-full">
    <div className="flex-1">
      <AdaptiveTutoring
        toggleChatBot={toggleChatBot}
        setChatbotContext={setChatbotContext}
        chatbotRef={chatbotRef}
        onActivityChange={onActivityChange}
      />
    </div>
    {isSidebarOpen && (
      <div className="w-1/4 h-full">
        <SideBar
          chatbotRef={chatbotRef}
          chatbotContext={chatbotContext}
        />
      </div>
    )}
  </div>
) : (
  <div className="flex h-full w-full">
    <div className="flex-1">
      <OfficeContainer
        ref={officeContainerRef}
        onNewGame={handleSetPopulateRooms}
        visibleImages={visibleImages}
        imageGroups={imageGroups}
        updateVisibleImages={updateVisibleImages}
      />
    </div>
    {isSidebarOpen && (
      <div className="w-1/4 h-full">
        <SideBar
          chatbotRef={chatbotRef}
          chatbotContext={chatbotContext}
        />
      </div>
    )}
  </div>
)}
```

### 5. Implement Required Props and Functions

Define the functions required by AdaptiveTutoring:
```tsx
const toggleChatBot = () => {
  setIsSidebarOpen(!isSidebarOpen);
};

const setChatbotContext = (context: { contentTitle: string; context: string }) => {
  // Update the chatbot context
};

const onActivityChange = async (type: string, location: string, metadata?: any) => {
  // Track user activity
};
```

### 6. Styling Adjustments

Ensure consistent styling between the two views:
- Use relative sizing (rem, %) instead of fixed pixels
- Maintain the same layout structure for sidebar positioning
- Apply consistent theme colors and spacing

### 7. Store Integration

Update the store selectors to support the new functionality:
- Track which view is active in the AnkiClinic
- Persist user preference if needed

## Testing Checklist

- [ ] Toggle works correctly between OfficeContainer and AdaptiveTutoring
- [ ] Sidebar functions properly in both views
- [ ] AdaptiveTutoring retains all functionality from the home page
- [ ] Styling is consistent across both views
- [ ] Responsive design works on different screen sizes
- [ ] State is maintained appropriately when switching views
