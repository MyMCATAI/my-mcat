# Knowledge Profile System Updates

## Major Changes Overview

The knowledge profile update system has been significantly enhanced with the following improvements:

1. **Subject-Content-Concept Mapping Integration**
   - Added comprehensive mapping of all MCAT concepts (70+ categories)
   - Built explicit relationships between subjects, content categories, and concept categories
   - Enables more precise tracking of knowledge across the MCAT curriculum

2. **Concept Category Filtering**
   - Added logic to filter out concept categories from DataPulse processing
   - Created a lookup system using `allConceptCategories` set for efficient filtering

3. **Time-Based Decay Enhancements**
   - Improved time decay calculations for more accurate representation of knowledge retention
   - Added explicit handling of time weights for concept mastery calculations

4. **Data Structure Improvements**
   - Enhanced organization of masteries with nested objects instead of flat structures
   - Added detailed tracking of individual source contributions to mastery scores
   - Structure now includes: `{ mymcat: { mastery, weight }, aamc: { mastery, weight }, ... }`

5. **Fine-Grained Mastery Calculation**
   - Added specific masteries tracking for each data source
   - Implemented more sophisticated blending of concept and content masteries
   - Added `lastUpdatedAt` timestamp to track when knowledge profiles were recalculated

6. **Error Handling and Performance**
   - Improved transaction management with Prisma batch operations
   - Enhanced error handling with detailed error logging
   - Added extensive commented-out code sections for future features or alternative approaches

## Specific Technical Changes

### Mastery Calculation Improvements

The system now tracks source-specific mastery values before combining:

```typescript
contentCategoryMasteries[contentCategory] = {
  mymcat: { mastery: 0, weight: BASE_WEIGHTS.mymcat },
  aamc: { mastery: 0, weight: BASE_WEIGHTS.aamc },
  uworld: { mastery: 0, weight: BASE_WEIGHTS.uworld },
  other: { mastery: 0, weight: 0 },
  finalMastery: 0
};
```

### Concept-to-Content Relationship Handling

Added explicit mapping between concept categories and their parent content categories:

```typescript
// Build the concept-to-content mapping from user responses
userResponses.forEach(response => {
  if (response.Category?.conceptCategory && response.Category?.contentCategory) {
    conceptToContentMap[response.Category.conceptCategory] = response.Category.contentCategory;
  }
});

// Also add mappings from the provided subject/content/concept mapping
subjectContentConceptMapping.forEach(mapping => {
  conceptToContentMap[mapping.conceptCategory] = mapping.contentCategory;
});
```

### Time Decay Weighting in Concept Mastery

Enhanced time decay weighting for more accurate knowledge representation:

```typescript
// Calculate time weights
const timeWeights = responses.map(r => calculateTimeDecayWeight(r.answeredAt));

// Calculate weighted correct/incorrect
const weightedCorrect = responses
  .filter(r => r.isCorrect)
  .reduce((sum, _, i) => sum + timeWeights[i], 0);

const weightedIncorrect = responses
  .filter(r => !r.isCorrect)
  .reduce((sum, _, i) => sum + timeWeights[i], 0);
```

### Knowledge Profile Update Process

Updated the upsert operation to include the new `lastUpdatedAt` field:

```typescript
prisma.knowledgeProfile.upsert({
  where: {
    userId_categoryId: {
      userId: userId,
      categoryId: categoryId,
    },
  },
  update: {
    // ... existing fields
    lastUpdatedAt: new Date()
  },
  create: {
    // ... existing fields
    lastUpdatedAt: new Date()
  },
})
```

## Future Enhancements

Several areas of the code have been prepared for future enhancements:

1. **Category Mapping System**
   - Commented code includes a more sophisticated category lookup system
   - Would enable automatic updates for categories with only DataPulse data

2. **Content-Concept Relationship Processing**
   - Code prepared for blending content category mastery with concept mastery
   - Would enable a more nuanced understanding of user knowledge

3. **Enhanced Data Source Weighting**
   - Framework established for more complex weighting of different data sources
   - Would allow for dynamic adjustment of source importance