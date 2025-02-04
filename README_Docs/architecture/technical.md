# Technical Specifications

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
```typescript
app/
├── (auth)/                  # Auth-related routes
├── (dashboard)/             # Protected dashboard routes
│   ├── game/               # Doctor's Office Game
│   ├── practice/           # CARS Practice
│   ├── calendar/           # Premium Calendar
│   └── testing/            # Premium Testing Suite
├── (marketing)/            # Public marketing pages
└── api/                    # API routes

components/                 # Root components directory
├── (auth)/                # Auth route components
├── (dashboard)/           # Dashboard route components
├── landing/              # Landing page components
├── ui/                   # Shared UI components
└── forms/                # Shared form components
```

## Development Standards

### Component Structure
```typescript
// Example component structure
interface ComponentProps {
  className?: string;
  // Additional props
}

/* ----------------------------------------- Constants ------------------------------------------ */
/* ------------------------------------------ Types --------------------------------------------- */

const Component = () => {
  /* -------------------------------------- State & Refs ---------------------------------------- */
  /* -------------------------------- Animations & Effects -------------------------------------- */
  /* --------------------------------------- Event Handlers ------------------------------------ */
  /* --------------------------------------- Render Methods ------------------------------------ */
  return (/* JSX */);
};
```

### Styling & Animation
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
- Free Features: Game, CARS Practice, Basic Stats
- Premium Features: Calendar, Testing Suite, Analytics
- Auth Flow: Clerk.dev -> Onboarding -> Feature Gates
- Subscription: Premium feature management

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

### Component Organization
1. Route Components:
   ```typescript
   // ✅ Correct: Page components in app/
   app/(dashboard)/game/page.tsx
   
   // ✅ Correct: Route components in components/
   components/(dashboard)/game/GameCard.tsx
   ```

2. Component Naming:
   ```typescript
   // ✅ Correct: CamelCase with default export
   const GameCard = () => { ... }
   export default GameCard;
   
   // ❌ Incorrect: Named exports or kebab-case
   export const game_card = () => { ... }
   ```

3. Shared Components:
   - UI: `components/ui/`
   - Forms: `components/forms/`
   - Layout: `components/layout/`

### Documentation Standards
```typescript
// Markdown Code Blocks
// ✅ Correct: Use bash for all markdown content
```bash
## Section Title
- List item
- Another item
```

// ❌ Incorrect: Don't use markdown
```markdown
## Section Title
- List item
- Another item
```

// Rationale: Using bash provides better syntax highlighting 
// and consistency across our documentation