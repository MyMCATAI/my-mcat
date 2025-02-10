# Technical Specifications

## Directory
  [Core Setup](#core-setup)
   - [Technology Stack](#technology-stack)
   - [Project Structure](#project-structure)

  [Feature Control](#feature-control)
   - [Free Features](#free-features)
   - [Premium Features](#premium-features)
   - [Feature Gates](#feature-gates)

  [Component Guidelines](#component-guidelines)
   - [Route Structure](#route-structure)
   - [Route-Component Relationship](#route-component-relationship)
   - [Component Naming](#component-naming)
   - [Shared Components](#shared-components)
   - [State & Error Management](#state--error-management)
   - [File Headers & Comments](#file-headers--comments)
   - [Import Standards](#import-standards)
   - [Section Headers](#section-headers)
   - [Styling & Animation](#styling--animation)
   - [Component Optimization](#component-optimization)
   - [Component Testing](#component-testing)

  [Database Guidelines](#database-guidelines)
  [Authentication Guidelines](#authentication-guidelines)
  [Documentation Guidelines](#documentation-guidelines)

------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## Core Setup

### Technology Stack
- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Clerk Auth
- shadcn/ui
- PlanetScale (Database)
- Prisma ORM
- Stripe (Payments)

### Project Structure
```
my-mcat/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth-related routes
│   ├── (dashboard)/       # Protected dashboard routes
│   │   └── game/         # Doctor's Office Game
│   ├── (home)/           # Home routes
│   │   ├── calendar/    # Premium Calendar
│   │   ├── testing/     # Premium Testing Suite
│   │   └── practice/    # CARS Practice (Premium)
│   ├── (landingpage)/    # Landing page routes
│   ├── (marketing)/      # Public marketing pages
│   └── api/             # API routes
│
├── components/            # Root components directory
│   ├── auth/            # Auth components
│   ├── dashboard/       # Dashboard components
│   ├── home/           # Home components
│   ├── landing/        # Landing page components
│   ├── landingpage/    # Landing page specific components
│   ├── ui/             # Shared UI components
│   └── forms/          # Shared form components
│
└── ... other project files
```

------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## Feature Control
This section details what features are available to free and premium users. 

### Free Features
- Doctor's Office Game
- Basic Passage Questions
- Basic Statistics
- Core Game Features
- Daily CARS Practice (limited)

### Premium Features
- CARS Practice (full access)
- Calendar System
- Testing Suite
- Adaptive Tutoring
- Analytics Dashboard
- Advanced Features

### Feature Gates
All premium features must:
- Use `useSubscriptionStatus` hook for access control
- Implement graceful fallbacks for free users
- Show upgrade prompts when appropriate
- Track user preferences and feature access attempts

Example implementation:
```typescript
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { trackFeatureAccess } from "@/lib/analytics";

const PremiumFeature = () => {
  const { isSubscribed } = useSubscriptionStatus();

  useEffect(() => {
    trackFeatureAccess("feature-name", isSubscribed);
  }, [isSubscribed]);

  if (!isSubscribed) {
    return <UpgradePrompt feature="feature-name" />;
  }

  return <PremiumContent />;
};
```

------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## Component Guidelines

This section outlines the location to create and place components, as well as coding best practices and styling for all `.tsx` components.

### Route Structure
✅ Correct: Keep route folders minimal
```
app/(landingpage)/
├── page.tsx           # Page component
└── layout.tsx         # Layout wrapper
```

✅ Correct: Store components in dedicated component directory
```
components/landingpage/
├── landing-navbar.tsx
├── hero-section.tsx
└── feature-grid.tsx
```

❌ Incorrect: Don't put components in route folders
```
app/(landingpage)/
├── page.tsx
├── layout.tsx
├── navbar.tsx        // Should be in components/landingpage/
└── hero.tsx         // Should be in components/landingpage/
```

### Route-Component Relationship:
   - Keep route folders (`app/*`) minimal with just:
     - `page.tsx`: Main page component
     - `layout.tsx`: Route layout wrapper
     - `loading.tsx`: Loading states
     - `error.tsx`: Error boundaries
   - Store all components in corresponding `components/[route-name]` directory
   - Example:
     ```
     app/(landingpage)/* → components/landingpage/*
     app/(dashboard)/* → components/dashboard/*
     app/(home)/* → components/home/*
     ```

### Component Naming:
   ✅ Correct: CamelCase with default export

   ```
   const GameCard = () => { ... }
   export default GameCard;
   ```
   ❌ Incorrect: Named exports or kebab-case

   ``` 
   export const game_card = () => { ... }
   ```

### Shared Components:
  Store all shared components in `components/ui`

### State & Error Management
```typescript
// State Management
- Local: useState
- Complex: Context
- Server: React Query
- Forms: React Hook Form

// Error Handling
try {
  await operation();
} catch (error) {
  toast.error("User-friendly message");
  console.error(error);
}
```


### File Headers & Comments
- Must include relative path as first line (this helps when we copy and paste full files into other LLM tools)
- TypeScript/JavaScript: Use `// path/to/file`
- Markdown: Use `<!-- path/to/file -->`
- Never include root project folder
- Always include file extension

### Import Standards
Import groups should be ordered by scope (external → internal).
Standard import order:
```typescript
//path/to/file
import { useState, useRef, useCallback } from "react"; // React and Next.js imports
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion"; // External libraries
import { useClerk } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils"; // Internal utilities and types
import { useUserInfo } from "@/hooks/useUserInfo";
import type { UserInfo } from "@/types";
import { Button } from "@/components/ui/button"; // Internal components
import { Input } from "@/components/ui/input";
```


### Section Headers
All React components should use these headers in order (if they exist)
```typescript
/* ------------------------------------------ Constants ----------------------------------------- */
/* -------------------------------------------- Types ------------------------------------------- */
/* ------------------------------------------- State -------------------------------------------- */
/* ------------------------------------------- Refs --------------------------------------------- */
/* ----------------------------------------- Callbacks ------------------------------------------ */
/* ------------------------------------ Animations & Effects ------------------------------------ */
/* ---------------------------------------- Event Handlers -------------------------------------- */
/* ---------------------------------------- Render Methods -------------------------------------- */
```
Note: Each header is 100 characters wide. Constants and Types go outside the component.

#### Component Example
```typescript
//path/to/file
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------ Constants ----------------------------------------- */
/* -------------------------------------------- Types ------------------------------------------- */

interface ComponentProps {
  className?: string;
  // Additional props
}

const Component = ({ className }: ComponentProps) => {
/* ------------------------------------------- State -------------------------------------------- */
/* ------------------------------------------- Refs --------------------------------------------- */
/* ----------------------------------------- Callbacks ------------------------------------------ */
/* ------------------------------------ Animations & Effects ------------------------------------ */
/* ---------------------------------------- Event Handlers -------------------------------------- */
/* ---------------------------------------- Render Methods -------------------------------------- */

  // Implementation following above structure
  return (/* JSX */);
};

export default Component;
```

### Styling & Animation
Use Tailwind CSS and consider global variables in `globals.css` and reference those before you create new ones.

```typescript
// Use CSS variables and mobile-first approach
className="bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] p-4 md:p-6 lg:p-8"

// Framer Motion with reduced motion support
const prefersReducedMotion = useReducedMotion();
const animation = prefersReducedMotion ? {} : {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};
```

### Component Optimization
Consider the following optimizations within components:

#### Performance
- Memoization
  - `useMemo` for expensive computations
  - `useCallback` for stable callbacks
  - `memo` for expensive components
- Rendering
  - Virtualize long lists
  - Use CSS transforms over layout props
  - Avoid layout thrashing

#### Assets & Code
- Loading
  - Next/Image optimization
  - Lazy loading with `next/dynamic`
  - Preload critical assets
- Code Splitting
  - Dynamic imports
  - Route-based splitting
  - Suspense boundaries

#### Data & State
- Caching
  - React Query/SWR strategies
  - Local storage when appropriate
- State
  - Colocate state
  - Batch updates
  - Use context selectively

#### Resource Management
- Cleanup
  - Clear timers/listeners
  - Cancel pending requests
  - Clean WebSocket connections
- Loading States
  - Skeleton loaders
  - Progress indicators
  - Transition animations



### Component Testing
Tests are not required, but if the developer prompts and asks for a test they should follow these guidelines:

#### Test Categories
- Unit Tests
  - Component rendering
  - Props validation
  - State changes
  - Event handlers
  - Custom hooks
  - Error boundaries

- Integration Tests
  - Component interactions
  - Data flow
  - Route transitions
  - API interactions
  - Authentication flows

- User Flows
  - Critical user paths
  - Form submissions
  - Premium feature access
  - Error scenarios
  - Loading states

#### Testing Standards
```typescript
// Component test template
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Mock external dependencies
    // Reset test state
  });

  // Rendering
  it('renders without crashing', () => {});
  it('matches snapshot', () => {});
  
  // Props & State
  it('handles required props correctly', () => {});
  it('manages state updates properly', () => {});
  
  // User Interaction
  it('responds to user events correctly', () => {});
  it('validates user input properly', () => {});
  
  // Integration
  it('interacts with other components correctly', () => {});
  it('handles API calls properly', () => {});
  
  // Error & Edge Cases
  it('handles error states gracefully', () => {});
  it('manages loading states correctly', () => {});
});
```

#### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation
- ARIA attributes
- Color contrast
- Focus management

#### Performance Testing
- Component render time
- Memory leaks
- Network requests
- State updates
- Animation performance


------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## Database Guidelines
<!-- TODO: Josh -->
- Database: Prisma with error handling

------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## Authentication Guidelines
<!-- TODO: Josh -->

- Auth: Clerk.dev session management
------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Documentation Guidelines
> These rules apply to all .md documentation files in the project

### Code Formatting
Use code backticks (`) to format:
- File paths: `app/components/Button.tsx`
- Components: `<Button>`
- Functions: `handleClick()`
- Variables: `isLoading`
- API endpoints: `/api/knowledge-profile/update`
- Imports: `import { useState }`
- Any technical reference

### Code Blocks 
Within Documentation
- Do not use language tags for code examples...

### Link Formatting
- Use proper markdown links...
