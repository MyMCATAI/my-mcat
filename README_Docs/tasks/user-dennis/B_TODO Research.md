## ATS Notes 

✓ The following endpoints exist and are functional:

### 1. `/api/knowledge-profile/update/route.ts` (Line 81-269)
**Purpose**: Updates mastery levels with weighted scoring by processing all of a user's responses and data pulses

**Implementation Details**:
- Located in: `app/api/knowledge-profile/update/route.ts`
- Handles POST requests
- No request body needed - processes all user data automatically
- Uses source weighting defined in BASE_WEIGHTS (Line 10-15):
  - AAMC: 0.5
  - UWorld: 0.3
  - MyMCAT: 0.2
- Implements time decay with TIME_DECAY_FACTOR = 0.1 (Line 17)

**Example Call**:
```typescript
// POST request - No body needed, uses authenticated user's data
await fetch('/api/knowledge-profile/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

**What it does internally**:
1. Fetches all UserResponses for the authenticated user
2. Fetches all DataPulses for the user
3. Processes responses with time decay (older responses count less)
4. Applies source weighting (AAMC: 0.5, UWorld: 0.3, MyMCAT: 0.2)
5. Updates KnowledgeProfiles in the database

**Returns**:
```typescript
{
  message: "Knowledge profiles updated successfully"
}
```

### 2. `/api/category/route.ts` (Line 8-120)
**Purpose**: Handles category sorting based on mastery

**Implementation Details**:
- Located in: `app/api/category/route.ts`
- Handles GET requests
- Accepts query parameters:
  - useKnowledgeProfiles (boolean)
  - page (number)
  - pageSize (number)
  - excludeCompleted (boolean)
  - conceptCategories (string[])
  - searchQuery (string)
  - subjects (string[])

**Example Call**:
```typescript
// GET request
await fetch('/api/category?useKnowledgeProfiles=true&page=1&pageSize=6&excludeCompleted=true');
```

**Returns**:
```typescript
{
  items: [{
    id: "category_uuid",
    conceptCategory: "Enzymes",
    contentCategory: "Biochemistry",
    subjectCategory: "Biology",
    hasProfile: true,
    completedAt: null,
    completionPercentage: 45,
    conceptMastery: 0.3,
    contentMastery: 0.4,
    isCompleted: false,
    hasContent: true
  }],
  totalPages: 10,
  currentPage: 1,
  totalItems: 56
}
```

### 3. `/api/question-selection/route.ts` (Line 19-124)
**Purpose**: Implements Thompson sampling for selecting next questions

**Implementation Details**:
- Located in: `app/api/question-selection/route.ts`
- Handles POST requests
- Uses Thompson sampling with 80% algorithm, 20% randomness (Line 45-47)
- Can return either questions or study rooms based on selectionType parameter
- Includes fallback logic for when no questions match criteria

**Example Call**:
```typescript
// POST request
await fetch('/api/question-selection', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    section: "B/B",           // or "C/P", "P/S", "CARS"
    excludeIds: ["q1", "q2"], // questions to exclude
    selectionType: "questions" // or "rooms"
  })
});
```

**Returns**:
```typescript
{
  questions: [{
    id: "question_uuid",
    questionContent: "What is the role of...",
    difficulty: 0.7,
    categoryId: "category_uuid",
    // ... other question fields
  }],
  selectedCategories: [{
    id: "category_uuid",
    conceptCategory: "Enzymes",
    contentCategory: "Biochemistry",
    // ... other category fields
  }]
}
```

### 4. `/api/uworld/update/route.ts` (Line 21-124)
**Purpose**: Manages UWorld task generation using Thompson sampling

**Implementation Details**:
- Located in: `app/api/uworld/update/route.ts`
- Handles POST requests
- Takes todayUWorldActivity in request body
- Uses Thompson sampling with Laplace smoothing (Line 71-73)
- Generates tasks based on hours allocated
- Excludes CARS content category (Line 52-56)

**Example Call**:
```typescript
// POST request
await fetch('/api/uworld/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    hours: 2, // Number of study hours to generate tasks for
    calendarActivityIds: ["activity1", "activity2"] // Optional
  })
});
```

**Returns**:
```typescript
{
  message: "UWorld tasks updated successfully",
  tasks: [
    {
      text: "12 Q UWorld - Amino Acids",
      completed: false
    },
    {
      text: "12 Q UWorld - Enzymes",
      completed: false
    },
    {
      text: "Review UWorld",
      completed: false
    }
  ]
}
```

### Implementation Notes:
- All endpoints require authentication via Clerk
- Responses include error handling for unauthorized access
- Thompson sampling is used to balance exploration vs exploitation
- Source weighting: AAMC (0.5), UWorld (0.3), MyMCAT (0.2)
- Time decay is applied to older responses using exponential decay