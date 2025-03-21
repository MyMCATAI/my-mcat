# Knowledge Profile System Documentation


## Database Schema

```prisma
model KnowledgeProfile {
  id                   String    @id @default(cuid())
  userId               String
  categoryId           String
  correctAnswers       Int       @default(0)
  totalAttempts        Int       @default(0)
  lastAttemptAt        DateTime  @default(now())
  conceptMastery       Float?
  contentMastery       Float?
  completionPercentage Float     @default(0)
  completedAt          DateTime?
  category             Category  @relation(fields: [categoryId], references: [id])

  @@unique([userId, categoryId])
  @@index([userId])
  @@index([categoryId])
}
```

Key fields:
- `conceptMastery`: Measures mastery of specific topics (0-1 scale)
- `contentMastery`: Measures mastery of broader categories (0-1 scale)
- `correctAnswers` and `totalAttempts`: Track raw performance metrics
- `lastAttemptAt`: Records when the user last attempted questions in this category

## Mastery Score Calculation

The knowledge profile system uses sophisticated algorithms to calculate two distinct mastery scores:

### Concept Mastery Calculation [only takes into account myMcat responses rn]

Concept mastery measures a user's understanding of specific topics within a category. The calculation process:

1. **Time Decay Weighting**:
   ```typescript
   function calculateTimeDecayWeight(answeredAt: Date): number {
     const ageInDays = (Date.now() - answeredAt.getTime()) / (1000 * 60 * 60 * 24);
     return Math.exp(-TIME_DECAY_FACTOR * ageInDays);
   }
   ```
   - Uses an exponential decay function with a decay factor (TIME_DECAY_FACTOR = 0.1)
   - Newer responses have higher weights than older ones
   - A response from 7 days ago has approximately 50% of the weight of a response from today

2. **Weighted Mastery Calculation**:
   ```typescript
   const conceptMastery = calculateSourceMastery(
     weightedCorrect,
     weightedIncorrect,
     1,
     timeWeights
   );
   ```
   - `weightedCorrect`: Sum of time decay weights for correct responses
   - `weightedIncorrect`: Sum of time decay weights for incorrect responses
   - The final score is essentially a time-weighted ratio of correct to total responses

### Content Mastery Calculation

Content mastery measures understanding of broader content categories by combining data from multiple sources:

1. **Source Weighting**:
   ```typescript
   function getAdjustedWeights(
     hasAAMC: boolean,
     hasUWorld: boolean,
     hasMyMCAT: boolean
   ): SourceWeights {
     // Base weights prioritize official AAMC content
     let weights = { aamc: 0.5, uworld: 0.3, mymcat: 0.2 };
     // ...normalization logic
   }
   ```
   - AAMC data is weighted highest (0.5)
   - UWorld data has medium weight (0.3)
   - MyMCAT data has lowest weight (0.2)
   - Weights are normalized if some sources are missing

2. **Individual Source Mastery**:
   - For each source, calculate mastery as: correct / (correct + incorrect) * sourceWeight
   - MyMCAT mastery uses internal platform responses, tracked via the `UserResponse` model
   - AAMC responses amd Uworld responses uses positive/negative counts from data pulses, Stored in the `DataPulse` model
   - Official AAMC content is weighted more heavily, this ensures alignment with actual MCAT exam content
3. **Combined Mastery**:
   - The final Content Mastery is the sum of individual source masteries
   - This creates a weighted average that prioritizes official content

````
  const contentMasteries = Object.entries(contentGroupedResponses).reduce((acc, [contentCategory, responses]) => {
      // Calculate MyMCAT mastery
      const mymcatCorrect = responses.filter(r => r.isCorrect).length;
      const mymcatTotal = responses.length;
      const hasMymcat = mymcatTotal > 0;

      // Get external source masteries
      const externalSources = contentGroupedPulses[contentCategory] || {
        aamc: { positive: 0, negative: 0 },
        uworld: { positive: 0, negative: 0 }
      };

      const hasAAMC = externalSources.aamc.positive + externalSources.aamc.negative > 0;
      const hasUWorld = externalSources.uworld.positive + externalSources.uworld.negative > 0;

      // Get adjusted weights based on available sources
      const weights = getAdjustedWeights(hasAAMC, hasUWorld, hasMymcat);

      // Calculate individual masteries
      const mymcatMastery = hasMymcat ? 
        calculateSourceMastery(mymcatCorrect, mymcatTotal - mymcatCorrect, weights.mymcat) : 0;

      const aamcMastery = hasAAMC ? 
        calculateSourceMastery(
          externalSources.aamc.positive,
          externalSources.aamc.negative,
          weights.aamc
        ) : 0;

      const uworldMastery = hasUWorld ? 
        calculateSourceMastery(
          externalSources.uworld.positive,
          externalSources.uworld.negative,
          weights.uworld
        ) : 0;

      // Combine all sources
      const totalMastery = mymcatMastery + aamcMastery + uworldMastery;
      acc[contentCategory] = totalMastery;
      
      return acc;
    }, {} as Record<string, number>);
````
## API Routes

### 1. `/api/knowledge-profile/route.ts` (GET)

**Purpose**: Retrieves knowledge profiles for the current user.

**Process**:
1. Authenticates the user via Clerk
2. Fetches all knowledge profiles for the user with their associated categories
3. Groups profiles by section (e.g., "Chemistry", "Biology")
4. Sorts profiles within each section by mastery level (weakest first)
5. Calculates section summaries with average mastery and total concepts
6. Identifies the 5 weakest concepts across all sections

**Response Structure**:
```typescript
{
  sections: {
    [sectionName: string]: Array<{
      subject: string,
      content: string,
      concept: string,
      mastery: number,
      correctAnswers: number,
      totalAttempts: number,
      lastAttempt: Date
    }>
  },
  sectionSummaries: Array<{
    section: string,
    averageMastery: number,
    totalConcepts: number
  }>,
  weakestConcepts: Array<{
    subject: string,
    content: string,
    concept: string,
    mastery: number,
    section: string
  }>
}
```

### 2. `/api/knowledge-profile/update/route.ts` (POST)

**Purpose**: Updates knowledge profiles based on user responses and external data sources.

**Key Functions**:

1. `calculateTimeDecayWeight`: Applies a decay factor to older responses
   ```typescript
   function calculateTimeDecayWeight(answeredAt: Date): number {
     const ageInDays = (Date.now() - answeredAt.getTime()) / (1000 * 60 * 60 * 24);
     return Math.exp(-TIME_DECAY_FACTOR * ageInDays);
   }
   ```

2. `getAdjustedWeights`: Calculates weights for different sources (AAMC, UWorld, MyMCAT)
   ```typescript
   function getAdjustedWeights(
     hasAAMC: boolean,
     hasUWorld: boolean,
     hasMyMCAT: boolean
   ): SourceWeights
   ```

3. `calculateSourceMastery`: Computes mastery scores based on correct/incorrect answers
   ```typescript
   function calculateSourceMastery(
     correct: number,
     incorrect: number,
     weight: number = 1,
     timeWeights: number[] = []
   ): number
   ```

**Process**:
1. Fetches all user responses for the current user
2. Fetches all data pulses (external data) for the user
3. Groups responses by category (for concept mastery) and content category
4. Groups data pulses by content category
5. Calculates content masteries with weighted sources:
   - AAMC: 0.5 weight (highest priority)
   - UWorld: 0.3 weight (medium priority)
   - MyMCAT: 0.2 weight (lowest priority)
6. For each category:
   - Applies time decay to older responses
   - Calculates weighted concept mastery
   - Retrieves content mastery from the content category calculations
   - Updates or creates a KnowledgeProfile record

**Triggers**:
1. Daily update on home page visit:
   ```typescript
   // In app/(dashboard)/(routes)/home/page.tsx
   if (typeof window !== "undefined" && shouldUpdateKnowledgeProfiles()) {
     const response = await fetch("/api/knowledge-profile/update", {
       method: "POST",
     });

     if (response.ok) {
       updateKnowledgeProfileTimestamp();
     }
   }
   ```

2. Manual update via API handler:
   ```typescript
   // In components/util/apiHandlers.ts
   export const handleUpdateKnowledgeProfile = async () => {
     // Implementation details
   };
   ```

**Storage**:
- Uses localStorage to track when profiles were last updated
- Only updates once per day per device

### 3. `/api/knowledge-profile/reset/route.ts` (DELETE)

**Purpose**: Resets all user data related to knowledge profiles.

**Process**:
1. Authenticates the user via Clerk
2. Deletes all user responses for the given userId
3. Deletes all knowledge profiles for the given userId
4. Deletes all calendar activities for the given userId


## System Integration and Core Usage

The knowledge profile system forms the backbone of the adaptive learning experience in MyMCAT, with integration across multiple components:

### 1. Adaptive Learning System
- **Personalizing Content Selection**: Questions are selected based on mastery levels, focusing on areas where users need the most improvement
- **Tracking Progress Over Time**: The time-decay algorithm ensures recent performance has more impact than historical data
- **Balancing Content Sources**: By weighting AAMC (0.5), UWorld (0.3), and internal MyMCAT (0.2) data differently, the system prioritizes official exam-like content

### 2. Question Selection and Prioritization
- In `lib/question.ts`, knowledge profiles directly influence which questions are presented to users
- Uses concept and content mastery scores to influence question selection
- Provides personalized question difficulty based on user performance

### 3. Category Management
- Multiple category-related APIs include knowledge profile data
- **Category Completion Tracking**:
  ```typescript
  // Used in category APIs to track completion status
  const knowledgeProfile = await prisma.knowledgeProfile.upsert({
    where: {
      userId_categoryId: { userId, categoryId }
    },
    // ... update completion status
  });
  ```
- **Category Search and Filtering**:
  - Filters incomplete categories using knowledge profiles
  - Provides completion percentage and mastery data for category listings
  - Used in category search API for advanced filtering

```
\\In api/category/route.ts
if (useKnowledgeProfiles) {
      console.log('\nBefore sorting - Categories and their concept mastery:');
      sortedCategories.forEach(cat => {
        console.log(`${cat.conceptCategory}: concept mastery = ${cat.conceptMastery}, has profile = ${cat.hasProfile}`);
      });

      sortedCategories = sortedCategories
        .filter(cat => cat.hasContent)
        .sort((a, b) => {
          // Categories without profiles should come last
          if (!a.hasProfile && !b.hasProfile) return 0;
          if (!a.hasProfile) return 1;  // Move a to the end
          if (!b.hasProfile) return -1; // Move b to the end

          // Sort by concept mastery (weakest first)
          return a.conceptMastery - b.conceptMastery;
        });
```
### 4. Performance Analytics and Visualization
- `/api/user-statistics/route.ts` uses knowledge profiles for performance analytics
- Subject-by-subject performance breakdowns
- Progress tracking over time
- Comparison of performance across different content sources
- Identification of strengths and weaknesses
- **Performance Tracking**:
  ```typescript
  // In api/user-statistics/route.ts
  const knowledgeProfiles = await prisma.knowledgeProfile.findMany({
    where: { userId }
  });
  ```
  - Generates comprehensive performance analytics
  - Tracks progress across different subjects
  - Provides mastery-based insights for study planning

### 5. Test Generation
- `/api/test/route.ts` uses knowledge profiles to influence test content
- Creates balanced tests that cover a range of topics
- Includes more questions from areas with lower mastery
- Ensures appropriate difficulty based on the user's current skill level

### 6. Home Dashboard Integration
- Daily automatic updates to knowledge profiles triggered on the home page visit:
  ```typescript
  // In app/(dashboard)/(routes)/home/page.tsx
  useEffect(() => {
    if (typeof window !== "undefined" && shouldUpdateKnowledgeProfiles()) {
      const updateProfiles = async () => {
        const response = await fetch("/api/knowledge-profile/update", {
          method: "POST",
        });

        if (response.ok) {
          updateKnowledgeProfileTimestamp();
        }
      };
      
      updateProfiles();
    }
  }, []);
  ```
- Local storage-based update tracking
- Progress visualization in dashboard components

  ```typescript
  // In lib\utils.ts
  export const KNOWLEDGE_PROFILE_UPDATE_KEY = 'lastKnowledgeProfileUpdate';

  export const shouldUpdateKnowledgeProfiles = (): boolean => {
    const lastUpdate = localStorage.getItem(KNOWLEDGE_PROFILE_UPDATE_KEY);
    if (!lastUpdate) return true;

    const lastUpdateDate = new Date(lastUpdate);
    const currentDate = new Date();
    
    // Check if last update was on a different day
    return lastUpdateDate.toDateString() !== currentDate.toDateString();
  };

  export const updateKnowledgeProfileTimestamp = (): void => {
    localStorage.setItem(KNOWLEDGE_PROFILE_UPDATE_KEY, new Date().toISOString());
  };
  };
  ```
### 7. UWorld Integration
- **UWorld Data Processing**:
  - Used in `/api/uworld/update` and `/api/uworld/regenerate`
  - Incorporates UWorld performance data into mastery calculations
  - Influences content selection based on external performance data

### 8. Weekly Report Generation
- **Performance Analysis**:
  ```typescript
  // In lib\weekly-report-utils.ts
  const topSubjects = await prisma.knowledgeProfile.findMany({
    // ... query for top performing subjects
  });
  ```
  - Generates weekly performance summaries
  - Identifies top-performing subjects
  - Tracks progress over time

### 9. User Migration System
- **Profile Data Migration**:
  ```typescript
  // In api/user-migration/route.ts
    // Update KnowledgeProfile
      console.log("Updating KnowledgeProfile for devUserId:", devUser.id);
      await tx.knowledgeProfile.updateMany({
        where: { userId: devUser.id },
        data: { userId }
      });

  ```
- Handles knowledge profile data during user migrations

## Current api/knowledge-profile/update/route.ts in "main" branch:
```
\\In api/knowledge-profile/update/route.ts

// api/knowledge-profile/update/route.ts - OLD VERSION
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

interface SourceWeights {
  aamc: number;
  uworld: number;
  mymcat: number;
}

// Base weights when all sources are available
const BASE_WEIGHTS: SourceWeights = {
  aamc: 0.5,    // AAMC has highest weight
  uworld: 0.3,  // UWorld second
  mymcat: 0.2   // MyMCAT internal questions
};

const TIME_DECAY_FACTOR = 0.1; // Adjust this value to control decay rate

function calculateTimeDecayWeight(answeredAt: Date): number {
  const ageInDays = (Date.now() - answeredAt.getTime()) / (1000 * 60 * 60 * 24);
  return Math.exp(-TIME_DECAY_FACTOR * ageInDays);
}

function getAdjustedWeights(
  hasAAMC: boolean,
  hasUWorld: boolean,
  hasMyMCAT: boolean
): SourceWeights {
  let weights = { ...BASE_WEIGHTS };
  let totalWeight = 0;

  // Zero out weights for missing sources
  if (!hasAAMC) weights.aamc = 0;
  if (!hasUWorld) weights.uworld = 0;
  if (!hasMyMCAT) weights.mymcat = 0;

  // Calculate total of remaining weights
  totalWeight = weights.aamc + weights.uworld + weights.mymcat;

  // If no sources, default to equal weight for any that exist
  if (totalWeight === 0) {
    const availableSources = [hasAAMC, hasUWorld, hasMyMCAT].filter(Boolean).length;
    if (availableSources === 0) return BASE_WEIGHTS; // Fallback to base weights if somehow nothing exists
    const equalWeight = 1 / availableSources;
    if (hasAAMC) weights.aamc = equalWeight;
    if (hasUWorld) weights.uworld = equalWeight;
    if (hasMyMCAT) weights.mymcat = equalWeight;
    return weights;
  }

  // Normalize remaining weights to sum to 1
  const normalizer = 1 / totalWeight;
  return {
    aamc: weights.aamc * normalizer,
    uworld: weights.uworld * normalizer,
    mymcat: weights.mymcat * normalizer
  };
}

function calculateSourceMastery(
  correct: number,
  incorrect: number,
  weight: number = 1,
  timeWeights: number[] = []
): number {
  if (correct + incorrect === 0) return 0;
  
  // If no time weights provided, use equal weights
  const weights = timeWeights.length > 0 ? timeWeights : Array(correct + incorrect).fill(1);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  // Normalize weights to sum to 1
  const normalizedWeights = weights.map(w => w / totalWeight);
  
  // Calculate weighted mastery
  const mastery = (correct / (correct + incorrect)) * weight;
  
  return mastery;
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all user responses for the current user
    const userResponses = await prisma.userResponse.findMany({
      where: {
        userTest: {
          userId: userId
        },
        categoryId: { not: null }
      },
      include: {
        Category: {
          select: {
            id: true,
            contentCategory: true,
            conceptCategory: true
          }
        }
      }
    });

    // Get all data pulses for the user
    const dataPulses = await prisma.dataPulse.findMany({
      where: {
        userId: userId
      }
    });

    // Group responses by category (for concept mastery)
    const groupedResponses = userResponses.reduce((acc, response) => {
      if (!acc[response.categoryId!]) {
        acc[response.categoryId!] = [];
      }
      acc[response.categoryId!].push(response);
      return acc;
    }, {} as Record<string, typeof userResponses>);

    // Group responses by content category
    const contentGroupedResponses = userResponses.reduce((acc, response) => {
      const contentCategory = response.Category!.contentCategory;
      if (!acc[contentCategory]) {
        acc[contentCategory] = [];
      }
      acc[contentCategory].push(response);
      return acc;
    }, {} as Record<string, typeof userResponses>);

    // Group data pulses by content category
    const contentGroupedPulses = dataPulses.reduce((acc, pulse) => {
      if (!acc[pulse.name]) {
        acc[pulse.name] = {
          aamc: { positive: 0, negative: 0 },
          uworld: { positive: 0, negative: 0 }
        };
      }
      
      if (pulse.source.toLowerCase().includes('aamc')) {
        acc[pulse.name].aamc.positive += pulse.positive;
        acc[pulse.name].aamc.negative += pulse.negative;
      } else if (pulse.source.toLowerCase().includes('uworld')) {
        acc[pulse.name].uworld.positive += pulse.positive;
        acc[pulse.name].uworld.negative += pulse.negative;
      }
      
      return acc;
    }, {} as Record<string, { 
      aamc: { positive: number, negative: number },
      uworld: { positive: number, negative: number }
    }>);

    // Calculate content masteries with weighted sources
    const contentMasteries = Object.entries(contentGroupedResponses).reduce((acc, [contentCategory, responses]) => {
      // Calculate MyMCAT mastery
      const mymcatCorrect = responses.filter(r => r.isCorrect).length;
      const mymcatTotal = responses.length;
      const hasMymcat = mymcatTotal > 0;

      // Get external source masteries
      const externalSources = contentGroupedPulses[contentCategory] || {
        aamc: { positive: 0, negative: 0 },
        uworld: { positive: 0, negative: 0 }
      };

      const hasAAMC = externalSources.aamc.positive + externalSources.aamc.negative > 0;
      const hasUWorld = externalSources.uworld.positive + externalSources.uworld.negative > 0;

      // Get adjusted weights based on available sources
      const weights = getAdjustedWeights(hasAAMC, hasUWorld, hasMymcat);

      // Calculate individual masteries
      const mymcatMastery = hasMymcat ? 
        calculateSourceMastery(mymcatCorrect, mymcatTotal - mymcatCorrect, weights.mymcat) : 0;

      const aamcMastery = hasAAMC ? 
        calculateSourceMastery(
          externalSources.aamc.positive,
          externalSources.aamc.negative,
          weights.aamc
        ) : 0;

      const uworldMastery = hasUWorld ? 
        calculateSourceMastery(
          externalSources.uworld.positive,
          externalSources.uworld.negative,
          weights.uworld
        ) : 0;

      // Combine all sources
      const totalMastery = mymcatMastery + aamcMastery + uworldMastery;
      acc[contentCategory] = totalMastery;
      
      return acc;
    }, {} as Record<string, number>);

    // Update KnowledgeProfile for each category
    const updatePromises = Object.entries(groupedResponses).map(async ([categoryId, responses]) => {
      // Calculate time decay weights for each response
      const timeWeights = responses.map(r => calculateTimeDecayWeight(r.answeredAt));
      
      // Split responses into correct and incorrect, maintaining time weights
      const correctResponses = responses.filter((r, i) => r.isCorrect).map((r, i) => ({
        response: r,
        weight: timeWeights[i]
      }));
      
      const incorrectResponses = responses.filter((r, i) => !r.isCorrect).map((r, i) => ({
        response: r,
        weight: timeWeights[i]
      }));

      // Calculate weighted sums
      const weightedCorrect = correctResponses.reduce((sum, { weight }) => sum + weight, 0);
      const weightedIncorrect = incorrectResponses.reduce((sum, { weight }) => sum + weight, 0);

      const conceptMastery = calculateSourceMastery(
        weightedCorrect,
        weightedIncorrect,
        1,
        timeWeights
      );

      const latestResponse = responses.reduce((latest, current) => 
        latest.answeredAt > current.answeredAt ? latest : current
      );

      const contentCategory = responses[0].Category!.contentCategory;
      const contentMastery = contentMasteries[contentCategory];

      return prisma.knowledgeProfile.upsert({
        where: {
          userId_categoryId: {
            userId: userId,
            categoryId: categoryId,
          },
        },
        update: {
          correctAnswers: responses.filter(r => r.isCorrect).length,
          totalAttempts: responses.length,
          lastAttemptAt: latestResponse.answeredAt,
          conceptMastery: conceptMastery,
          contentMastery: contentMastery,
        },
        create: {
          userId: userId,
          categoryId: categoryId,
          correctAnswers: responses.filter(r => r.isCorrect).length,
          totalAttempts: responses.length,
          lastAttemptAt: latestResponse.answeredAt,
          conceptMastery: conceptMastery,
          contentMastery: contentMastery,
        },
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ message: "Knowledge profiles updated successfully" }, { status: 200 });
  } catch (error) {
    console.error('Error updating knowledge profiles:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

```