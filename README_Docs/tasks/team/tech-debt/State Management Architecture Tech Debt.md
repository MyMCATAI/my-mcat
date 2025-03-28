# Technical Debt in State Management

## Inconsistent State Access Patterns

Our application currently has inconsistent patterns for accessing global state, which creates technical debt and potential for bugs:

### Current Approach

1. **Mixed State Management Sources**:
   - We have `selectors.ts` which provides proper Zustand hooks (`useUI`, `useUser`, `useAudio`, etc.)
   - But we also have a separate `hooks/useUserInfo.ts` that wraps `useUser` and adds additional functionality
   - Component `page.tsx` accesses state through both systems:
     ```typescript
     // From selectors.ts (Zustand)
     const { activePage, navigateHomeTab, updateSubSection } = useNavigation();
     
     // From hooks/useUserInfo.ts (wrapper over Zustand)
     const { userInfo, isLoading: isLoadingUserInfo, isSubscribed, setHasSeenIntroVideo } = useUserInfo();
     ```

2. **Redundant State Management**:
   - `useUserInfo` hook internally uses Zustand's `useUser` hook but adds caching, debouncing, and API interaction
   - This creates two sources of truth for user state:
     ```typescript
     // In useUserInfo.ts
     const { 
       userInfo,
       isSubscribed,
       setIsSubscribed,
       refreshUserInfo,
       setHasSeenIntroVideo
     } = useUser(); // Uses Zustand
     ```

3. **Legacy Context API Artifacts**:
   - The pattern suggests that the app migrated from React Context to Zustand, but didn't fully refactor all components and hooks
   - The `useUserInfo` hook appears to be a remnant from a Context-based approach

### Optimization Path

1. **Standardize State Access**:
   - Choose one approach for accessing global state (preferably through the Zustand selectors)
   - Move API interaction logic from `useUserInfo` to the Zustand store actions

2. **Separate Data Fetching from State Management**:
   - Data fetching logic (API calls) should be separate from state management
   - Consider using React Query alongside Zustand for data fetching

3. **Refactor Components to Use Direct Selectors**:
   - Update `page.tsx` and other components to use the selectors directly
   - Replace:
     ```typescript
     const { userInfo, isSubscribed } = useUserInfo();
     ```
     with:
     ```typescript
     const { userInfo, isSubscribed } = useUser();
     ```

## State Management Technical Debt Checklist

### Implementation Priorities (Recommended Order)

- [ ] **Phase 1: Audit & Documentation** (1-2 days)
- [ ] **Phase 2: Store Enhancement** (2-3 days)
- [ ] **Phase 3: Hook Migration** (3-5 days)
- [ ] **Phase 4: Component Refactoring** (3-7 days)
- [ ] **Phase 5: Legacy Code Removal** (1-2 days)

### Phase 1: Audit & Documentation

- [ ] **Audit Current State Management**
  - [ ] Create inventory of all custom hooks that wrap Zustand stores
    - [ ] `hooks/useUserInfo.ts`
    - [ ] `hooks/useCalendarActivities.ts`
    - [ ] `hooks/useExamActivities.ts`
    - [ ] Other similar hooks
  - [ ] Document dependencies between hooks and components
  - [ ] Identify components using mixed state access patterns

- [ ] **Document Preferred Pattern**
  - [ ] Create `README_Docs/architecture/state-management.md` with guidelines
  - [ ] Add examples of correct vs. incorrect state access
  - [ ] Include patterns for data fetching vs. state management

### Phase 2: Store Enhancement

- [ ] **Enhance Zustand Stores with API Logic**
  - [ ] Add API interaction methods to `userSlice.ts`
    ```typescript
    // Example enhancement to userSlice.ts
    fetchUserProfile: async () => {
      set({ isLoading: true });
      try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();
        set({ userInfo: data, isLoading: false });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        set({ error, isLoading: false });
      }
    }
    ```
  - [ ] Create new `store/slices/activitiesSlice.ts` (as outlined in optimization plan)
  - [ ] Add debouncing and caching mechanisms within the store actions

- [ ] **Update Selectors File**
  - [ ] Ensure all new store actions are exposed through selectors
  - [ ] Add JSDoc comments to document proper usage

### Phase 3: Hook Migration

- [ ] **Create Migration Strategy for Each Custom Hook**
  - [ ] Analyze `useUserInfo.ts` and extract unique functionality
  - [ ] Move core data fetching to React Query or store actions
  - [ ] Create deprecation warning in legacy hooks:
    ```typescript
    export const useUserInfo = () => {
      console.warn(
        'DEPRECATED: useUserInfo is deprecated. Use useUser() from @/store/selectors instead.'
      );
      // Legacy implementation...
    }
    ```

- [ ] **Create Bridge Hooks (Temporary)**
  - [ ] Implement hooks that use the new pattern but maintain old API
  - [ ] This allows gradual component migration without breaking changes

### Phase 4: Component Refactoring

- [ ] **Prioritize Components for Refactoring**
  - [ ] Start with core components like `app/(dashboard)/(routes)/home/page.tsx`
  - [ ] Then `components/chatgpt/ChatContainer.tsx`
  - [ ] Followed by other key components

- [ ] **Use Direct Selectors in High-Priority Components**
  - [ ] Replace `useUserInfo()` with `useUser()` from selectors
  - [ ] Replace calendar activity hooks with store selectors
  - [ ] Update component tests to reflect new data patterns

- [ ] **Track Completion Percentage**
  - [ ] Create list of all components that need updates
  - [ ] Track progress on migration (e.g., "65% of components migrated")

### Phase 5: Legacy Code Removal

- [ ] **Remove Deprecated Hooks**
  - [ ] Once all components are migrated, remove legacy hooks
  - [ ] Remove any adapter/bridge code created during migration

- [ ] **Cleanup and Finalization**
  - [ ] Run full test suite to ensure no regressions
  - [ ] Update documentation to reflect completed migration
  - [ ] Remove deprecation warnings and transitional code

## Next Steps

1. Begin with Phase 1 (Audit & Documentation) to fully understand the scope
2. Implement Phase 2 (Store Enhancement) to provide proper alternatives
3. Execute Phases 3-5 methodically, with proper testing between stages
4. Consider this work in parallel with the optimization checklist from `page-optimization.md`

## Synergy with Page Optimization

Many items in this technical debt cleanup align with the optimization plan already documented. Specifically:

1. Creating a dedicated activities store (#5 in page-optimization.md)
2. Centralizing data fetching (#1 in page-optimization.md)
3. Improving error handling (#6 in page-optimization.md)

When implementing these changes, reference both documents to ensure consistent approach.