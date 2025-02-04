# MYMCAT MVP

Created by Joshua Karki and Prynce Wade

WIP deployed at
https://my-mcatmy-mcat.vercel.app/

## Getting Started - Dev

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.



# Notes

- Shadcn framework 
- folders and url structure
- clerk auth setup
- PlanetScale prisma MySQL DB

## Current Services
Services
- AI LLM - https://openai.com/
- sql db - app.planetscale.com
- auth - dashboard.clerk.com

Backend DB
- prisma and planetscale
- run prisma with `npx prisma studio`
- run prisma db changes with `npx prisma generate`, `npx prisma db push `
- reset with `npx prisma migrate reset`

Stripe
- stripe login
- stripe listen --forward-to localhost:4242/webhook

run 
`stripe listen --forward-to localhost:3000/api/webhook`



# Prisma DB

Initial setup (optional)
```
npm i @prisma/client
npx prisma init
```

pushing changes (talk to josh before trying to push anything)

```
npx prisma db push
npx prisma generate
```

See data (this is mostly safe, and will allow you to view and update records one at a time if you like)

```npx prisma studio```


### Important: Database Migrations

⚠️ Always message Josh before making any database migrations or schema changes. Safety first!
- We do this to avoid breaking any of our sql tables.
- in order to make a change, we need to update out schema.prisma file, then generate a new migration file with `npx prisma migrate dev --name <name>`



### Running scripts

```
npm run "script-name"
```


## How to view/edit content

To update content/questions, etc. we can open prisma studio. to do this run

```
npx prisma studio
```

in your terminal.


Sometimes we update the backend content system, when this happens, you need to run a quick update to access it. (Also try this if you run into any errors with Prisma)


Run

```
git pull
```
Then run:
```
npx prisma generate
```

in your terminal.



# Testing Suite
- When we generate our schedule, we create events of type "Exam" these are full length tests
    - When generate these, we need to update how titles and activity test are set, title should be something like Full Length 1 and activity Text should be something like AAMC
- When we Complete an exam activity, we create a new FullLengthExam record associated to it, 
    - users should have to input their 4 scores for each section into it. For each one, we create a data pulse at that the Section level (cp, bb, ps, cars)
    - Users can then add additional data pulses as questions to the tests (2nd PR)

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