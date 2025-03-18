# Gameplay Details

## Doctor's Office Game Structure
The Doctor's Office game follows a hierarchical component structure:

### Component Hierarchy

ankiclinic/
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
- `ankiclinic/page.tsx`: Main game container
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
| Taking a quiz | -2 | Doctor's Office | Initial cost to take any quiz in the Doctor's Office |
| Quiz score 100% | +3 | Doctor's Office | Perfect score reward in Doctor's Office quizzes |
| Quiz score 70-99% | +2 | Doctor's Office | Good performance reward in Doctor's Office |
| Quiz score 50-70% | +1 | Doctor's Office | Okay performance reward in Doctor's Office |
| Quiz score 30-50% | 0 | Doctor's Office | Bad performance in Doctor's Office |
| Quiz score 0-30% | -1 | Doctor's Office | Really bad performance in Doctor's Office |
| Perfect passage (9 stars) on difficulty 3+ | +4 | CARS Suite | Maximum reward for challenging CARS passages |
| Perfect passage (9 stars) on lower difficulty | +3 | CARS Suite | Reward for perfect CARS performance |
| Passage with 6-8 stars | +2 | CARS Suite | Good CARS passage performance reward |
| Passage with 4-5 stars | +1 | CARS Suite | Decent CARS passage performance reward |
| Completing a task | +1 | All Suites | Reward for completing any task |
| Completing test review | +2 | All Suites | Reward for completing test review |
| Completing ATS topic | +1 | All Suites | Reward for completing an ATS topic |
| Starting Anki Clinic cycle in ATS | -2 | ATS | Initial cost to start Anki Clinic cycle |
| Missing daily tasks | -1 | All Suites | Penalty for missing tasks on calendar |
| Missing 7-day study period | -5 | All Suites | Penalty for missing 7-day study period with tasks |

### Streak Rewards
- 7-day streak: +1 coin per day
- 21-day streak: +2 coins per day

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