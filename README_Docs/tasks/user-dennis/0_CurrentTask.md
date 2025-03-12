# ATS State Management and Routing Strategy

## Current Issues
1. Route not updating when entering ATS (`currentRoute` stays at "/home")
2. No tracking of selected subjects within ATS
3. No tracking of learning mode (Highlight, Video, Reading, Practice, Ask Kalypso)
4. Kalypso lacks context about user's current learning activity

## Proposed Solution

### 1. Routing Updates
- Change URL to `/ATS` when entering Adaptive Tutoring Suite
- Update `currentRoute` in UI state to reflect this change
- Keep subject selection in Zustand state only (no URL changes)
- Single route approach for cleaner navigation

### 2. State Management Strategy

```typescript
interface ATSState {
  // Currently active subject (e.g., "video-lectures")
  activeSubject: string;
  
  // Current learning mode within the active subject
  learningMode: 'highlight' | 'video' | 'reading' | 'practice' | 'askKalypso';
  
  // Available subjects with their learning progress
  subjects: {
    [key: string]: {  // key is subject name (e.g., "video-lectures")
      learningProgress: {
        highlight: number;
        video: number;
        reading: number;
        practice: number;
      }
    }
  };
}
```

### Rationale for State Structure
1. **Simple Active Subject Tracking**: Single string instead of array of selected items
2. **Efficient Subject Management**: Object lookup by subject name instead of array iteration
3. **Progress Tracking**: Maintains progress for each learning mode per subject
4. **Type Safety**: Strict typing for learning modes and progress values
5. **Performance**: O(1) lookup for active subject and its progress

### Integration with Kalypso
1. Kalypso will have access to:
   - Current subject being studied
   - Current learning mode
   - Progress in each mode for the subject
   - Historical subject selection patterns

2. Benefits:
   - More contextual responses based on current learning activity
   - Can reference specific content from current subject
   - Can suggest switching learning modes based on progress
   - Can track effectiveness of different learning modes per subject

### Implementation Phases
1. **Phase 1**: Set up routing and basic state management
   - Implement URL change to `/ATS`
   - Create ATSStore
   - Track active subject selection

2. **Phase 2**: Add learning mode tracking
   - Implement mode selection state
   - Track progress per mode
   - Persist progress data

3. **Phase 3**: Kalypso Integration
   - Update Kalypso context with ATS state
   - Implement contextual responses
   - Add learning recommendations

### Technical Considerations
1. Keep URL simple at `/ATS` for all ATS interactions
2. Implement state persistence with localStorage/IndexedDB
3. Consider implementing undo/redo for state changes
4. Add analytics tracking for learning patterns
5. Ensure state updates trigger appropriate UI feedback

### Next Steps
1. Create new ATSStore using Zustand
2. Update routing logic in ATS component to only change to `/ATS`
3. Implement subject selection persistence
4. Add learning mode tracking
5. Update Kalypso context provider to include ATS state 