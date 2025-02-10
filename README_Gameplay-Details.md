# Gameplay Details

## Doctor's Office Game Structure
The Doctor's Office game follows a hierarchical component structure:

### Component Hierarchy

doctorsoffice/
├── `AnkiGameCard.tsx`            # Entry Point (in onboarding)
│
└── `page.tsx`                    # Main Container
    │
    ├── `OfficeContainer.tsx`     # Game Environment
    │   └── Room Components       # Individual clinic rooms
    │       ├── `WaitingRoom`     # Patient entry point
    │       ├── `ExamRoom`        # Quiz/test rooms
    │       └── `SpecialtyRoom`   # Advanced content
    │
    ├── Control Components        # Game Control Layer
    │   ├── `NewGameButton.tsx`   # Session control
    │   └── `ResourcesMenu.tsx`   # Resource management
    │
    ├── Dialog Components         # User Interface Layer
    │   ├── `ShoppingDialog.tsx`  # Room purchasing
    │   ├── `WelcomeDialog.tsx`   # User orientation
    │   ├── `FlashcardsDialog.tsx`# Study materials
    │   ├── `AfterTestFeed.tsx`   # Post-game feedback
    │   └── `TutorialVidDialog.tsx`# Game tutorials
    │
    └── Game State Components     # Game Logic Layer
        ├── `ScoreRandomizer.tsx` # Score calculations
        ├── `LevelSystem.tsx`     # Level management
        └── `CoinManager.tsx`     # Economy handling

### Component Roles 
1. **Entry Point**
- `AnkiGameCard.tsx`: Initial game access card in onboarding
- Provides game introduction and features
- Routes users to main game interface

2. **Core Game Container**
- `doctorsoffice/page.tsx`: Main game container
  - Manages game state and user progress
  - Coordinates between sub-components
  - Handles level system and scoring

3. **Game Environment**
- `OfficeContainer.tsx`: Main visual interface
  - Manages room visibility and interactions
  - Handles level-specific room configurations
  - Controls patient distribution
  - Manages active room selection (4 rooms per session)

4. **Supporting Components**
- `NewGameButton.tsx`: Controls game session starts
- `ResourcesMenu.tsx`: Manages game resources
- `ShoppingDialog.tsx`: Handles room purchases
- `WelcomeDialog.tsx`: User orientation
- `ScoreRandomizer.tsx`: Score calculations

### Game Flow
1. User accesses through AnkiGameCard
2. Main container initializes game state
3. OfficeContainer renders appropriate level
4. User interacts with rooms and patients
5. Supporting components handle specific actions

## Coin Economy
The game uses a coin-based reward system that encourages consistent study habits and high performance. Coins can be earned through various activities and spent on different features.

### Coin Transactions Table

| Activity | Coin Change | Game Suite | Description |
|----------|-------------|------------|-------------|
| Taking a quiz | -1 | Doctor's Office | Initial cost to take any quiz in the Doctor's Office |
| Quiz score 100% | +2 | Doctor's Office | Perfect score reward in Doctor's Office quizzes |
| Quiz score 70%+ | +1 | Doctor's Office | Good performance reward in Doctor's Office |
| Taking a passage | -1 | CARS Suite | Initial cost per CARS passage attempt |
| Passage score 80%+ | +1 | CARS Suite | Get your coin back for good CARS performance |
| Perfect passage (9 stars) on difficulty 3+ | +3 | CARS Suite | Maximum reward for challenging CARS passages |
| Perfect passage (9 stars) on lower difficulty | +2 | CARS Suite | Reward for perfect CARS performance |
| Passage with 6+ stars | +1 | CARS Suite | Decent CARS passage performance reward |
| Report validated bug/unfair question | +2 | All Suites | Compensation for helping improve any game section |
| Access ANKI game | -5 | Doctor's Office | One-time access fee to Doctor's Office |
| Access Adaptive Tutoring Suite | -5 | Tutoring Suite | One-time access fee to Adaptive Tutoring |
| Access Test Review (Premium) | -25 | All Suites | Premium feature access across all game modes |

### Star System for Passages
Passages use a 9-star rating system:
- Score stars (max 3):
  - 100% = 3 stars
  - 80%+ = 2 stars
  - Other = 1 star
- Timing stars (max 3):
  - Under 10 mins = 3 stars
  - Under 12 mins = 2 stars
  - Other = 1 star
- Technique stars (max 3):
  - Based on using highlighting, strikethrough, and other study techniques

### Level System
Your level determines how many patients you can treat per day:
- INTERN LEVEL: 4 patients/day
- RESIDENT LEVEL: 8 patients/day
- FELLOWSHIP LEVEL: 10 patients/day
- ATTENDING LEVEL: 16 patients/day
- PHYSICIAN LEVEL: 24 patients/day
- MEDICAL DIRECTOR LEVEL: 30 patients/day

### Additional Notes
- Coins can be purchased if needed
- Daily streaks and consistent practice are rewarded
- Premium features may require both coins and subscription status
- Bug reports and feedback are encouraged with coin rewards 