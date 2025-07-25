
## Documentation Directory
- 📘 [README.md](./README.md) - Project overview & quickstart guide
- 🤖 [README_Developer-Instructions.md](./README_Developer-Instructions.md) - AI development setup
- 📚 [README_Docs/](./README_Docs/) - Technical documentation
  - 🏗️ [Architecture](README_Docs/architecture/architecture.md) - System design
  - 📋 [Technical Guide](README_Docs/technical.md) - Development standards

---
## Table of Contents

### Core Documentation
- [Documentation Directory](#documentation-directory)
- [Important Links](#important-links)
- [Getting Started](#getting-started)

### Technical Stack
- [Architecture and Tech Stack](#architecture-and-tech-stack)
  - [Frontend](#frontend)
  - [Backend / Services](#backend--services)
  - [Database Management](#database-management)

### Features & Systems
- [Testing Suite](#testing-suite)
- [Feature Gating and Onboarding](#feature-gating-and-onboarding-system)
  - [Overview](#overview)
  - [Onboarding Flow](#onboarding-flow)
  - [Legacy User Support](#legacy-user-support)
  - [Feature Access Control](#feature-access-control)
  - [Implementation Notes](#implementation-notes)

### Development
- [Development Guidelines](#development-guidelines)
  - [Database Management](#database-management-planetscale--prisma-orm)
  - [Implementation Details](#implementation-details)

---

## Important Links
- 💻 [GitHub Repo](https://github.com/MyMCATAI/my-mcat)
- 🎨 [Figma Design System](https://www.figma.com/design/1zHyaMNuWrFZMlFbZrQRqn/MyMCAT?node-id=0-1&t=1NwzkUWINHYYRDQ4-1)
- 🌐 [Vercel Deployed Production](https://my-mcat.vercel.app/)
- 🔐 [Clerk Auth Dashboard](https://dashboard.clerk.com)
- 💾 [PlanetScale Database](https://app.planetscale.com)
- 💳 [Payments (Stripe)](https://dashboard.stripe.com)

---

## Getting Started
Follow these steps to set up the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/MyMCATAI/my-mcat.git
   cd my-mcat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Obtain the `.env` file from the staff.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser at [http://localhost:3000](http://localhost:3000) to view the app.

---

## Architecture and Tech Stack

### Frontend
- **Framework**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS + Shadcn components
- **State Management**: React hooks + Context

### Backend / Services
- **Authentication**: Clerk.dev
- **AI Services**: OpenAI API
- **Payments**: Stripe
  - Run Stripe webhook listener:
    ```bash
    stripe listen --forward-to localhost:3000/api/webhook
    ```

### Database Management (PlanetScale + Prisma ORM)

- #### Initial Setup:
   ```bash
   npm i @prisma/client
   npx prisma init
   ```

- #### Making Database Changes:
   ```bash
   npx prisma db push       # Apply schema changes to the database
   npx prisma generate      # Update Prisma client after schema changes
   ```

- #### Viewing/Editing Data:
   ```bash
   npx prisma studio        # Safe way to view/edit records in the database
   ```

- #### Resetting the Database (if needed):
   ```bash
   npx prisma migrate reset # WARNING: This will erase all data!
   ```

---

# Testing Suite
- When we generate our schedule, we create events of type "Exam" these are full length tests
    - When generate these, we need to update how titles and activity test are set, title should be something like Full Length 1 and activity Text should be something like AAMC
- When we Complete an exam activity, we create a new FullLengthExam record associated to it, 
    - users should have to input their 4 scores for each section into it. For each one, we create a data pulse at that the Section level (cp, bb, ps, cars)
    - Users can then add additional data pulses as questions to the tests (2nd PR)

---

# Feature Gating and Onboarding System

## Overview
The application has two main user paths:
1. Free Users - Access to Doctor's Office Game and CARS practice
2. Premium Users - Full access to all features including calendar, testing suite, and adaptive tutoring

## Onboarding Flow
The onboarding system is designed to provide different experiences based on user subscription status:

### Free User Flow
1. Initial Choice Screen
   - Users choose between "Quick Start" (game only) or "Full Features"
   - Quick Start users skip detailed onboarding
   - Redirects directly to Doctor's Office game after basic info

2. Free User Home Screen
   - Simplified navigation
   - Game-focused statistics:
     - Current streak
     - Patients treated
     - Rooms unlocked
     - Flashcards answered
   - Prominent "Play Game" button
   - Leaderboard display
   - Upgrade prompts for premium features

### Premium User Flow
1. Complete Onboarding
   - Detailed user information collection
   - Study schedule preferences
   - Test date selection
   - Learning style assessment
   
2. Full Feature Access
   - Calendar generation
   - Testing suite
   - Adaptive tutoring
   - Advanced analytics

## Legacy User Support
- Users who created accounts before the feature gating implementation receive:
  - 1 month of complimentary Premium access
  - Full feature access during this period
  - Automatic access check based on userInfo.createdAt timestamp
  - Notification about premium trial period
  - Clear messaging about when premium access will expire

### Implementation Details
1. Eligibility Check
   ```typescript
   // Pseudo-code for reference
   const FEATURE_GATE_DATE = '2024-03-DD' // Set to deployment date
   const FREE_PREMIUM_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days in ms
   
   const isLegacyUser = userInfo.createdAt < new Date(FEATURE_GATE_DATE)
   const isInFreePremiumPeriod = (
     isLegacyUser && 
     (new Date() - userInfo.createdAt) < FREE_PREMIUM_DURATION
   )
   ```

2. Access Control
   - Legacy users maintain full access during trial period
   - Gradual transition to new system
   - Early notification of upcoming changes
   - Special upgrade offers for legacy users

3. User Communication
   - Clear messaging about grandfathered status
   - Countdown to end of premium access
   - Targeted upgrade prompts before expiration
   - Migration path to paid premium features

## Feature Access Control
- Free Users:
  - Doctor's Office Game
  - Daily CARS Practice
  - Basic Statistics
  
- Premium Users:
  - All Free Features
  - Calendar System
  - Testing Suite
  - Adaptive Tutoring
  - Advanced Analytics
  - Priority Support

## Implementation Notes
1. Navigation Control
   - Simplified navigation for free users
   - Modal popups for premium feature attempts
   - Clear upgrade paths and CTAs

2. Database Updates
   - User preference tracking
   - Game statistics storage
   - Subscription status management

3. UI/UX Considerations
   - Clear feature availability indicators
   - Seamless upgrade prompts
   - Engaging free user experience
   - Premium feature previews

## Development Guidelines
- Always check subscription status before rendering premium features
- Use the `useSubscriptionStatus` hook for access control
- Implement graceful fallbacks for unauthorized access attempts
- Maintain clear upgrade paths throughout the application


- I need to add some kind of blocker on all non premium pages that redirects to the onboarding page if the user is not subscribed

- remove score deductions for unlocks


- todo remove functionality for ts unlock, this can be tied to the subscription type
