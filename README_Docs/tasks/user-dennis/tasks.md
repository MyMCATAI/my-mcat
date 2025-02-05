## FEAT-001: Implement Calendar Premium Gate
Status: Not Started
Priority: High
Dependencies: None

### Requirements
- Implement premium feature gate for Calendar component
- Add upgrade prompt for non-premium users
- Handle loading states
- Ensure mobile responsiveness

### Acceptance Criteria
1. Non-premium users redirected to upgrade page
2. Premium users can access calendar
3. Loading state shown during check
4. Proper error handling
5. Mobile responsive design

### Technical Notes
- Use useSubscriptionStatus hook
- Follow technical.md component structure
- Implement proper loading states
- Add error boundaries
