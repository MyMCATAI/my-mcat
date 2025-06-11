# KalypsoOnboarding Component Documentation

## Overview

The `KalypsoOnboarding.tsx` component is a streamlined onboarding experience for MyMCAT.ai that introduces users to the platform through an interactive chat interface with "Kalypso," an AI character. This component guides users through a simplified 3-step setup process to collect their information and welcome them to the platform.

## Purpose

- **User Introduction**: Welcome new users to the MyMCAT.ai platform
- **Data Collection**: Gather user demographics and study preferences
- **Personalization**: Prepare users for their customized study experience
- **Engagement**: Provide an interactive, friendly onboarding experience

## Component Structure

### Props Interface
```typescript
interface KalypsoOnboardingProps {
  isOpen: boolean;           // Controls modal visibility
  onClose: () => void;       // Callback for closing the modal
  onComplete: (showCoinReward?: boolean) => void; // Callback when onboarding completes
}
```

## Core Features

### 1. Multi-Step Process
The onboarding follows a simplified 3-step process:

| Step | Title | Purpose | Audio File |
|------|-------|---------|------------|
| 0 | Introduction | Welcome and introduction to Kalypso | `/audio/KOnboarding1.mp3` |
| 1 | Demographics | Collect user information | `/audio/KOnboarding2.mp3` |
| 2 | Calendar View | Show personalized schedule | `/kalypso/KalypsoVoiceStudySchedule.mp3` |

### 2. Voice Integration
- **Audio Playback**: Each step includes Kalypso's voice narration
- **Audio Management**: Prevents overlapping audio playback

### 3. Dynamic Content Rendering
The component conditionally renders different sub-components based on the current state:
- `DemographicsStep`: Collects user information
- `CalendarView`: Displays final calendar

## State Management

### Primary State Variables
```typescript
const [currentStep, setCurrentStep] = useState(0);
const [isCompleting, setIsCompleting] = useState(false);
const [kalypsoMessage, setKalypsoMessage] = useState('');
const [showKalypsoChat, setShowKalypsoChat] = useState(false);
const [showFinalCalendar, setShowFinalCalendar] = useState(false);
const [showDemographics, setShowDemographics] = useState(false);
```

### State Flow
```mermaid
graph TD
    A[Step 0: Introduction] --> B[Step 1: Demographics]
    B --> C[Demographics Collection]
    C --> D[Step 2: Calendar View]
```

## Key Functions

### Audio Management
```typescript
const playKalypsoVoice = useCallback((audioFile: string) => {
  // Prevents overlapping audio playback
  // Creates audio element with 70% volume
  // Manages audio state with refs
}, []);
```

### Step Navigation
```typescript
const handleStepAction = useCallback(async () => {
  // Handles progression through onboarding steps
  // Manages state transitions
  // Triggers audio playback for each step
}, [currentStep, onComplete, playKalypsoVoice, stepMessages]);
```

### Data Persistence
```typescript
const handleDemographicsComplete = useCallback(async (data) => {
  // Saves user demographic data to database via API
  // Proceeds directly to calendar view
}, []);
```

## Component Dependencies

### External Components
- `KalypsoAvatar`: The animated Kalypso character
- `CalendarView`: Displays final calendar
- `ChatBubble`: Container for chat content
- `StepNavigation`: Navigation controls
- `DemographicsStep`: Demographics form

### Hooks & Libraries
- `useRouter` (Next.js): Navigation
- `useUserInfo`: User data management
- `useAudio`: Audio store access
- `framer-motion`: Animations
- `react-hot-toast`: Notifications

## Animation & UX

### Motion Effects
- **Fade in/out**: Smooth transitions between steps
- **Slide animations**: Content appears with upward motion
- **Staggered timing**: Delayed animations for better UX

### User Experience Features
- **Audio Feedback**: Voice narration for each step
- **Progress Indication**: Step navigation shows progress
- **Responsive Design**: Works on mobile and desktop

## API Integration

### Onboarding Data Endpoint
```typescript
// PUT /api/user-info/onboarding
{
  firstName: string;
  college: string;
  isNonTraditional: boolean;
  isCanadian: boolean;
  currentMcatScore: number | null;
  hasNotTakenMCAT: boolean;
  mcatAttemptNumber: string;
  targetScore: number;
  currentStep: number;
}
```

## Error Handling

- **Audio Errors**: Graceful fallback when audio fails to play
- **API Errors**: Toast notifications for failed data saves
- **State Recovery**: Proper cleanup on component unmount

## Accessibility Features

- **Reduced Motion**: Respects user's motion preferences
- **Keyboard Navigation**: Supports keyboard interactions
- **Screen Reader Support**: Semantic HTML structure
- **Audio Controls**: Volume management and playback controls

## Performance Considerations

- **Memoization**: Uses `useMemo` and `useCallback` for optimization
- **Audio Management**: Prevents memory leaks with proper cleanup
- **State Optimization**: Minimal re-renders through careful state design

## Usage Example

```typescript
import KalypsoOnboarding from './KalypsoOnboarding';

const MyComponent = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const handleComplete = (showCoinReward?: boolean) => {
    setShowOnboarding(false);
    // Handle completion logic
  };
  
  return (
    <KalypsoOnboarding
      isOpen={showOnboarding}
      onClose={() => setShowOnboarding(false)}
      onComplete={handleComplete}
    />
  );
};
```

## Future Enhancements

- **Analytics Integration**: Track user progress through onboarding
- **A/B Testing**: Test different onboarding flows
- **Internationalization**: Support multiple languages
- **Progress Persistence**: Save and resume onboarding progress 