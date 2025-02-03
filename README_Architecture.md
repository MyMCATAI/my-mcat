## Core Components

### 1. Frontend (Next.js App)
- **UI Framework**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS + Shadcn components
- **State Management**: React hooks + Context

### 2. Backend Services
- **Database**: PlanetScale (MySQL) via Prisma ORM
- **Authentication**: Clerk.dev
- **AI Services**: OpenAI API
- **Payments**: Stripe

### 3. Core Modules

```mermaid
graph TD
%% Auth & Onboarding Flow
Start[New User] --> Auth[Clerk Auth]
Auth --> Onboard[Onboarding]
Onboard --> Choice{User Choice}
Choice -->|Quick Start| QS[Free Features]
Choice -->|Full Features| Premium[Premium Setup]
%% Main Interface & Feature Gates
Auth --> A[User Interface]
A --> B[Feature Gates]
B --> C[Free Features]
B --> D[Premium Features]
%% Free Features
C --> E[Doctor's Office Game]
C --> F[CARS Practice]
E --> M[Room System]
E --> N[Coin Economy]
%% Premium Features
D --> G[Calendar System]
D --> H[Testing Suite]
D --> I[Adaptive Tutoring]
H --> O[Full Length Tests]
H --> P[Section Practice]
%% ITS Core Components
J[Data Collection] --> StudentModel[Student Model]
StudentModel --> K[Knowledge Model]
K --> PedagogicalModel[Pedagogical Model]
PedagogicalModel --> L[Content Selection]
L --> A
%% AI Integration
Q[Kalypso AI] --> R[Performance Analysis]
Q --> S[Study Recommendations]
R --> StudentModel
S --> PedagogicalModel
```

### 4. Key Subsystems

#### a. Doctor's Office Game
- Gamified learning environment
- Room/Subject unlocking system
- Patient scoring mechanism
- Coin-based economy

#### b. Testing System
- Full-length MCAT exams
- Section-specific practice
- Performance analytics
- Score tracking and predictions

#### c. Knowledge Engine
- Question bank management
- Content categorization
- Difficulty scaling
- Performance tracking

#### d. AI Integration
- Kalypso (AI tutor)
- Performance analysis
- Personalized feedback
- Study recommendations

## Data Flow Architecture

1. **User Interactions**
   - Practice questions
   - Full-length tests
   - Game activities
   - Flashcard responses

2. **Data Processing**
   ```
   User Action → Data Pulse → Knowledge Update → Content Selection
   ```

3. **Feedback Loops**
   - Performance tracking
   - Difficulty adjustment
   - Content recommendations
   - Study plan updates
