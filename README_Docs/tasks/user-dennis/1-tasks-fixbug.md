# Onboarding Navigation Requirements



## Routing Requirement
**Routing should ONLY happen when users explicitly press the login button at the root URL**. The application should never automatically redirect users who navigate to localhost:3000 without clicking the login button.
When users explicitly press the login button at localhost:3000 (or mymcat.ai), the application should route them to the appropriate page based on their onboarding status:

When clicking the login button:
- If `onboardingComplete` is true (user has completed onboarding), they should go to `/home`
- If `onboardingComplete` is false (user hasn't completed onboarding), they should go to `/onboarding`

The solution must handle these specific edge cases:
1. **New User Flow**: When a new user who hasn't completed onboarding goes to the root URL and presses the login button, they should be redirected to `/onboarding`.

2. **Returning User Flow**: When a returning user who has completed onboarding goes to the root URL and presses the login button, they should be redirected to `/home`.

3. **Post-Login Root Navigation**: When a user who is already logged in navigates directly to the root path, they should remain at the root URL with no redirect.

4. **Post-Logout Flow**: When a user logs out and then returns to the site, they should remain at the root URL with no redirect until they press the login button again.



## Current onboardingComplete Explanation 

This section details how we currently implement onboarding...

- When a new user first interacts with the system, an `onboardingInfo` object is created in the database during the `handleNameSubmit` function in `useOnboardingInfo.ts`. This happens AFTER the user authenticates with Clerk and begins the onboarding process. Specifically, the creation occurs when they submit their name in the first onboarding step, which triggers a POST request to `/api/user-info`. 

- The `onboardingInfo` object is not created empty but is initialized with a complete set of default values in the POST endpoint:
  ```javascript
  onboardingInfo: {
    currentStep: 1,
    onboardingComplete: false,
    firstName: firstName || null,  // Uses the user-provided name
    college: null,
    isNonTraditional: null,
    isCanadian: null,
    gpa: null,
    currentMcatScore: null,
    hasNotTakenMCAT: null,
    mcatAttemptNumber: null,
    targetMedSchool: null,
    targetScore: null,
    referralEmail: null
  }
  ```
  This ensures all fields exist from the beginning, with `onboardingComplete` explicitly set to `false` and only the `firstName` and `currentStep` having non-null values initially.

- As the user progresses through each step of onboarding (name, college, academics, goals, Kalypso dialogue, referral), the `onboardingInfo` object is updated in the database via the `updateOnboardingInfo` function calling the PUT endpoint at `/api/user-info/onboarding`. Each step triggers a separate API call to update the database with:
  - The new data specific to that step
  - An updated `currentStep` value pointing to the next step
  - The same `onboardingComplete: false` flag (until the final step)


- The `onboardingComplete` flag is only toggled to true at the very end of the onboarding process, specifically in the `handleReferralComplete` function when the user completes the final step. This happens when:
  1. User has successfully completed all previous onboarding steps
  2. User reaches the referral step and clicks "Complete" or "Skip"
  3. The `handleReferralComplete` function is triggered
  
- Before setting `onboardingComplete` to true, the system performs several validation checks:
  1. Verifies that the onboardingInfo record exists in the database
  2. Validates that a non-zero target score has been set (critical check)
  3. Confirms that required fields like firstName and college are present
  4. If any of these checks fail, the system shows an error and does not proceed


- The actual update process follows a specific sequence:
  1. First, make a PUT request to update the database with `onboardingComplete: true`
  2. Wait for the database update to complete and verify it was successful
  3. Only if the database update was confirmed successful, update the local state with `setOnboardingComplete(true)`
  4. Then redirect the user to the appropriate page (/home or /redirect for mobile)


- This database-first approach ensures data integrity and prevents inconsistent states between the database and client.


- The system checks for `onboardingComplete` status in several key places:

  1. **In the `useOnboardingInfo` hook's `fetchOnboardingInfo` function**:
     - Runs when the onboarding page is first loaded in `app/(auth)/(routes)/onboarding/page.tsx`
     - Makes an API call to `/api/user-info/onboarding` to check current onboarding status
     - If `data?.onboardingComplete` is true from the API response, it updates local state and redirects immediately
     - Used to resume onboarding at the correct step if the user had partially completed it

  2. **In the `RouteTracker.tsx` component**:
     - The RouteTracker component is included in the root layout (`app/layout.tsx`) and runs on every page
     - It calculates `effectiveOnboardingComplete` by checking both the direct flag and the targetScore as a fallback
     - Uses this information to determine if redirects are needed when users log in or navigate between pages
     - Triggers different behavior based on explicit login clicks vs. regular navigation

  3. **In the `StoreInitializer` component**:
     - Also included in the root layout and runs on every page load 
     - Calls `refreshUserInfo()` to load all user data including onboarding status
     - Performs a second refresh after 1 second to ensure consistency
     - Ensures all components have access to the current onboarding state


## Database Synchronization Flow

This section details how data synchronization occurs between the database and local state:

1. **App Initialization**:
   - The `StoreInitializer` component is included in the root layout of the application (`app/layout.tsx`)
   - It runs on every page load, regardless of route
   - If a user is signed in, it calls `refreshUserInfo()` to sync all user data from the database
   - It performs a second `refreshUserInfo()` call after a 1-second delay to handle potential race conditions

2. **Login Flow**:
   - When a user clicks login at the root URL, the `explicit_login_click` flag is set in localStorage
   - After authentication, the `StoreInitializer` detects the user is signed in and fetches user data
   - The `RouteTracker` checks the user's `onboardingComplete` status and redirects accordingly

3. **Onboarding Process**:
   - When entering their name, a new userInfo record is created in the database via POST to `/api/user-info`
   - Each subsequent step updates the database via PUT to `/api/user-info/onboarding`
   - At the final step (`handleReferralComplete`), after setting `onboardingComplete: true`:
     - The database is updated first
     - The success of this update is explicitly verified
     - Only then is the local state updated with `setOnboardingComplete(true)`
     - A full `refreshUserInfo()` call is performed to ensure complete data synchronization
     - Finally, the user is redirected to the appropriate page (/home or /redirect for mobile)

4. **Home Page Load After Completion**:
   - When redirected to home, the `StoreInitializer` runs again on page load
   - This triggers another `refreshUserInfo()` which ensures local state is fully in sync with the database


## Recommended Improvements

This section outlines potential improvements to our current implementation that would enhance reliability, performance, and code maintainability:


### 2. Consistent State Synchronization

The following improvements have been implemented:
- Added a full `refreshUserInfo()` call immediately after setting `onboardingComplete: true` in `handleReferralComplete()`
- Implemented atomic updates for related state changes with the new `batchUpdateProfile` function
- Added error handling with rollback capabilities for failed API operations
- Replaced individual property updates with batch updates for related changes

### 3. Reduce API Calls
- Batch onboarding step updates where possible instead of making separate calls for each step
- Implement a debounce mechanism for frequent state changes
- Consider using GraphQL to fetch exactly what's needed in fewer requests
- Add proper caching strategies for user data

### 4. Improve Error Handling
- Add retry logic for failed API calls with exponential backoff
- Implement offline support with synchronization when connection is restored
- Provide clear recovery paths for users when operations fail
- Add more comprehensive error logging and monitoring

### 5. Streamline State Management
- Consolidate state management to reduce the mix of local and global state
- Implement proper state selectors to minimize rerenders (already partly done with the selector pattern)
- Consider using React Context + useReducer for more predictable state transitions
- Create a clear separation between UI state and data state

### 6. Auth Flow Improvements
- Implement a more robust auth state detection system than localStorage flags
- Add auth session persistence options to improve the returning user experience
- Consider a more streamlined onboarding flow with fewer steps and conditional form fields
- Add progress saving with the ability to resume onboarding from where users left off

These improvements would lead to a more reliable, responsive, and maintainable application while reducing the potential for data inconsistency issues.



