# Technical Specifications

## Directory
**Core Setup**
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)

**Component Guidelines**
- [Component Organization](#component-organization)
- [Component Structure](#component-structure)
  - Section Headers
  - Import Standards
  - Component Naming
  - Props & Types

**Development Guidelines**
- [Development Standards](#development-standards)
- [Routing & File Organization](#routing--file-organization)
  - Route Structure
  - Route-Component Relationship
  - File Naming
- [State Management](#state-management)
  - Local State
  - Context
  - Server State
- [Feature Implementation](#feature-implementation)
  - Premium Features
  - Authentication
  - Error Handling
- [Performance](#performance)
  - Loading States
  - Optimization
  - Testing

--- 
## Technology Stack
- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Clerk Auth
- shadcn/ui
- PlanetScale (Database)
- Prisma ORM
- Stripe (Payments)

## Project Structure
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

### Component Organization
1. Route Structure:
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

2. Route-Component Relationship:
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

3. Component Naming:
   ✅ Correct: CamelCase with default export

   ```
   const GameCard = () => { ... }
   export default GameCard;
   ```
   ❌ Incorrect: Named exports or kebab-case

   ``` 
   export const game_card = () => { ... }
   ```

4. Shared Components:
   - UI: `components/ui/`

## Development Standards

### Component Structure and Organization

Make sure to organize any functional React component with Section Headers:

Sections Headers (in order):
/* ------------------------------------------ Constants ----------------------------------------- */
/* -------------------------------------------- Types ------------------------------------------- */
/* ------------------------------------------- State -------------------------------------------- */
/* ------------------------------------------- Refs --------------------------------------------- */
/* ----------------------------------------- Callbacks ------------------------------------------ */
/* ------------------------------------ Animations & Effects ------------------------------------ */
/* ---------------------------------------- Event Handlers -------------------------------------- */
/* ---------------------------------------- Render Methods -------------------------------------- */


Note that each header is 100 characters wide in total
"Constants" and "Types" Section Headers should exist outside of the component

### Example component structure

```typescript
import { useState, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
```

### Styling & Animation

Always consider global variables in `globals.css` and reference those before you create new ones.

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

### Feature Control & Auth
- Free Features: 
  - Doctor's Office Game
  - Basic Statistics
  - Basic Passage Questions (in Game)
  
- Premium Features: 
  - CARS Practice (in /home/practice)
  - Calendar System (in /home/calendar)
  - Testing Suite (in /home/testing)
  - Analytics
  - Advanced Features

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

### Performance & Testing
- Performance:
  - Next/Image optimization
  - Dynamic imports
  - React Query caching
  - Suspense boundaries
  - Skeleton loaders
  - Loading indicators

- Testing:
  - Unit: Component logic
  - Integration: Feature flows
  - E2E: Critical paths
  - Accessibility
  - Loading states

### Integration Standards
- Database: Prisma with error handling
- Auth: Clerk.dev session management
- API: `/api/[feature]/[action]`
- Rate Limiting: Per route basis

### Import Standards

Standard import order:
```typescript
// 1. React and Next.js imports
import { useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

// 2. External libraries
import { motion, useReducedMotion } from "framer-motion";
import { useClerk } from "@clerk/nextjs";
import { toast } from "react-hot-toast";

// 3. Internal utilities and types
import { cn } from "@/lib/utils";
import { useUserInfo } from "@/hooks/useUserInfo";
import type { UserInfo } from "@/types";

// 4. Internal components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
```

Import groups should be separated by a blank line and ordered by scope (external → internal).

### Code Block Standards

1. In Markdown Files (.md):
   ```
   Use plain code blocks without language specifiers
   ```

2. Only use language tags when referencing specific files:
   ```typescript:components/MyComponent.tsx
   const MyComponent = () => {
     return <div>Hello</div>;
   };
   ```

3. For CLI commands and documentation:
   ```
   @Codebase
   What's my current task?
   ```

4. Never use language tags in .md files without file paths
   ❌ Incorrect:
   ```typescript
   const x = 1;
   ```
   
   ✅ Correct:
   ```
   const x = 1;
   ```
