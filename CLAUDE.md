# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm test                 # Run Jest tests
npm run test:watch       # Run tests in watch mode
```

### Database Operations
```bash
npx prisma db push       # Apply schema changes to database
npx prisma generate      # Update Prisma client after schema changes
npx prisma studio        # Open database GUI (safe for viewing/editing)
npx prisma migrate reset # DANGER: Resets database (erases all data)
```

### Content Management Scripts
```bash
npm run create-categories          # Import categories from CSV
npm run create-questions          # Import questions from CSV
npm run create-content            # Import content from CSV
npm run create-passages           # Import passages from CSV
npm run upload-content            # Upload new content
npm run delete-content            # Delete content (use carefully)
```

### Stripe Webhook (for payments testing)
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Database**: MySQL via PlanetScale with Prisma ORM
- **Authentication**: Clerk.dev
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand with specialized slices
- **Payments**: Stripe integration
- **AI Services**: OpenAI API, ElevenLabs (audio)

### Route Structure
The app uses Next.js route groups for organization:

- `(auth)/`: Authentication routes (sign-in, sign-up)
- `(dashboard)/`: Protected app routes (ankiclinic game, home, testing)
- `(landingpage)/`: Public marketing pages
- `api/`: Backend API endpoints
- `blog/`: MDX-powered blog system

### Component Organization
Components are organized by domain in `/components/`:

- `ui/`: Reusable design system components (shadcn/ui based)
- `auth/`: Authentication components
- `home/`, `test/`, `calendar/`: Feature-specific components
- `chatgpt/`: AI chatbot integration
- Route-specific folders match app directory structure

**Important**: Components should be placed in `/components/[domain]/` NOT in route folders. Route folders should only contain `page.tsx`, `layout.tsx`, `loading.tsx`, and `error.tsx`.

### State Management
Uses Zustand with specialized slices in `/store/slices/`:

- `userSlice.ts`: User profile, onboarding, subscription
- `gameSlice.ts`: Doctor's Office game mechanics  
- `uiSlice.ts`: Theme, navigation, UI state
- `audioSlice.ts`: Audio system management
- `knowledgeSlice.ts`: Learning analytics

Key hooks in `/hooks/`:
- `useUserInfo()`: User data with subscription status
- `useSubscriptionStatus()`: Stripe subscription management
- `useOnboardingInfo()`: Onboarding flow state

### Feature Access Control
The app has tiered access:

**Free Users**: Basic game access, limited CARS practice
**Gold Users ($149.99/month)**: Full features including calendar, testing suite, AI tutoring

Always check subscription status before rendering premium features:
```typescript
import { useUserInfo } from "@/hooks/useUserInfo";

const PremiumFeature = () => {
  const { userInfo } = useUserInfo();
  
  if (!userInfo?.isSubscribed) {
    return <RestrictedContent />;
  }
  
  return <PremiumContent />;
};
```

### Database Schema Key Models
- `UserInfo`: User profiles with game progress and subscription data
- `Question`/`Passage`: MCAT content with categorization
- `UserResponse`: Learning analytics and performance tracking
- `Category`: Hierarchical content organization (Biology, Chemistry, etc.)
- `UserSubscription`: Stripe subscription management

### API Patterns
API routes use:
- Clerk `auth()` for authentication
- Zod schemas for request validation
- Centralized error handling
- Rate limiting for protection

### Game Mechanics
The "Doctor's Office" game includes:
- Room-based progression system
- Coin economy for unlocks
- Audio system with theme music
- Flashcard-based question practice
- Patient simulation mechanics

### Content System
- CSV-based content import via scripts
- Categories mapped to MCAT topics
- Difficulty-based question selection
- Passage-based reading comprehension

### Development Patterns

#### Component Structure
Follow this template for React components:
```typescript
//path/to/file
import { useState } from "react";
import { useUserInfo } from "@/hooks/useUserInfo";

/* ------------------------------------------ Constants ----------------------------------------- */
/* -------------------------------------------- Types ------------------------------------------- */
interface ComponentProps {
  className?: string;
}

const Component = ({ className }: ComponentProps) => {
/* ------------------------------------------- State -------------------------------------------- */
/* ------------------------------------------- Refs --------------------------------------------- */
/* ----------------------------------------- Callbacks ------------------------------------------ */
/* ------------------------------------ Animations & Effects ------------------------------------ */
/* ---------------------------------------- Event Handlers -------------------------------------- */
/* ---------------------------------------- Render Methods -------------------------------------- */

  return <div className={className}>Content</div>;
};

export default Component;
```

#### Import Order
1. React and Next.js imports
2. External library imports  
3. Internal utilities and types
4. Internal components

#### File Headers
Always include file path as first comment:
```typescript
//path/to/file.tsx
```

#### Styling
- Use Tailwind CSS with mobile-first approach
- Reference CSS variables in `globals.css` before creating new ones
- Use `cn()` utility for conditional classes
- Consider accessibility with ARIA attributes

### Testing
- Jest + React Testing Library setup
- Component tests in `__tests__` directories
- Accessibility testing encouraged
- Run tests with `npm test`

### Environment Variables
Obtain `.env` file from project maintainers. Required services:
- PlanetScale database URL
- Clerk authentication keys
- Stripe payment keys
- OpenAI API key
- SendGrid email keys

### Important Notes
- **Always contact Josh before making database schema changes**
- Never commit sensitive data or API keys
- Use TypeScript strict mode - all components must be typed
- Follow mobile-first responsive design
- Implement proper loading and error states
- Consider performance with large datasets (use virtualization for long lists)

### Common Workflows
1. **New Feature**: Check subscription requirements, create components in appropriate `/components/` directory, add proper error handling
2. **Database Changes**: Coordinate with team, test with `npx prisma studio`, apply with `npx prisma db push`
3. **Content Updates**: Use provided scripts, validate data integrity, test in development first
4. **Premium Features**: Always implement with `useUserInfo` subscription check and graceful fallbacks