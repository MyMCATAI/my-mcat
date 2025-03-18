### Branch TODO:

## Redirect Behavior Analysis: Current Branch vs Main Branch ✅

### Question: 
What should be the default behavior when a returning user (already registered) visits localhost:3000? Should it redirect to /onboarding, /home, or something else?

### Current Branch (with debug param preservation) ✅

In the current branch, when a previously registered user visits localhost:3000:

1. **Automatic Login Detection**: ✅
   - If the user was previously logged in and their session is still valid, Clerk will auto-authenticate them
   - The RouteTracker component detects this and processes redirection logic

2. **Redirection Flow**: ✅
   ```
   Root path (/) -> Check if signed in -> Check if onboarding complete -> Route accordingly
   ```

3. **Specific Logic**: ✅
   - If user is signed in but has no userInfo: Redirect to `/onboarding`
   - If user is signed in, has userInfo, and onboarding is complete:
     - Redirect to `/home` (see "Special case" for root path)
     - If user has no subscription: Will subsequently redirect to `/ankiclinic` 
     - If user has subscription but no study plan: Will redirect to `/examcalendar`

4. **Implementation**: ✅
   ```typescript
   // Special case: If on root path and signed in with completed onboarding, redirect to home
   if (effectiveOnboardingComplete && pathname === '/') {
     performRedirect('/home', 'On root with completed onboarding');
     return;
   }
   ```

5. **Debug Parameter Handling**: ✅
   - The current branch preserves `?debug=true` parameter across redirects
   - This is implemented with a dedicated utility function that checks for and appends the debug parameter to redirect URLs

### Main Branch Implementation Details ✅

In the main branch, the behavior is similar but with some implementation differences:

1. **Redirection Logic Structure**: ✅
   - Uses multiple separate useEffect hooks for different redirection scenarios
   - Has more verbose code with direct router calls rather than a unified redirect function

2. **Specific Logic**: ✅
   ```typescript
   // If user is signed in, has userInfo, and initial loading is complete
   if (!userInfo || !pathname || !initialLoadComplete || !isSignedIn) {
     return;
   }
   
   // Check redirect path...
   ```

3. **Fallback Redirects**: ✅
   - The main branch implements fallback redirects using setTimeout to force navigation:
   ```typescript
   const fallbackTimeout = setTimeout(() => {
     window.location.href = '/onboarding';
   }, 2000); // 2 second timeout
   ```

4. **Debug Parameter Handling**: ✅
   - The main branch does check for debug mode: `const isDebugMode = searchParams?.get('debug') === 'true';` 
   - However, it doesn't explicitly preserve this parameter during redirects
   - This explains why debug mode is lost during navigation in the main branch

### Key Differences: ✅

1. **Code Structure**: ✅
   - Current branch: More modular with clearer separation of concerns
   - Main branch: More sequential with separate effect hooks for different redirect scenarios

2. **Debug Parameter Persistence**: ✅
   - Current branch: Explicitly preserves debug parameter across redirects
   - Main branch: Detects debug parameter but doesn't preserve it during redirects

3. **Redirect Implementation**: ✅
   - Current branch: Uses a unified `performRedirect` function with throttling
   - Main branch: Uses direct router calls with setTimeout fallbacks

4. **Error Handling**: ✅
   - Main branch: More defensive with fallback redirects via window.location.href after timeouts
   - Current branch: Relies primarily on Next.js router for navigation

### Recommended Default Behavior: ✅

The current branch behavior seems more correct - when a returning user visits localhost:3000:
1. If they're already authenticated, redirect them to `/home` if onboarding is complete
2. If onboarding isn't complete, send them to `/onboarding` to finish setup
3. Then handle subscription checks for further redirection

The debug parameter persistence in the current branch is an improvement that helps maintain developer tools visibility across these redirects.

## Implementation Status ✅

### Completed Tasks:

- ✅ Updated RouteTracker to match main branch's behavior structure
- ✅ Implemented fallback redirects using setTimeout and window.location.href
- ✅ Split redirection logic into separate useEffect hooks for different scenarios
- ✅ Added proper cleanup for timeout handlers
- ✅ Preserved debug parameter functionality across all redirects
- ✅ Fixed TypeScript issues with proper null checks and typing for timeouts
- ✅ Maintained the same functional behavior for returning users as main branch

The implementation now provides the best of both branches:
1. Main branch's defensive approach with fallback redirects
2. Current branch's debug parameter persistence
3. Proper TypeScript type safety and null checks
