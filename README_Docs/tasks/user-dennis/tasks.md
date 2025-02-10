Goal: Speed up and optimize rendering time of route /home to /doctorsoffice transition
Status: In Progress

### Current Flow Analysis
1. User clicks "Enter Anki Clinic" in GameStats.tsx
2. Router pushes to /doctorsoffice
3. DoctorsOfficePage mounts with many state initializations (20+ useState hooks)
4. Immediate data fetching occurs in useEffect
5. Heavy component tree mounts (OfficeContainer + children)

### Core Performance Bottlenecks
1. Heavy Initial Mount
   - DoctorsOfficePage has 20+ useState initializations
   - OfficeContainer mounts with complex room configurations
   - Immediate mounting of all dialogs and UI components

2. Blocking Data Fetches
   - Multiple sequential API calls in useEffect
   - No data preloading between pages
   - Duplicate data fetches between /home and /doctorsoffice

### High-Impact Implementation Tasks

1. Critical Path Optimization
   - [ ] Move state initialization to useReducer for batch updates
   - [ ] Defer non-critical state initialization until after mount
   - [ ] Split OfficeContainer into lazy-loaded chunks
   - [ ] Implement proper loading.tsx for route transition

2. Data Strategy
   - [ ] Implement data prefetching on "Enter Anki Clinic" hover
   - [ ] Cache common data between /home and /doctorsoffice
   - [ ] Use parallel route patterns for simultaneous data loading

3. Component Loading Strategy
   - [ ] Lazy load non-critical components:
     - WelcomeDialog
     - ShoppingDialog
     - FlashcardsDialog
     - AfterTestFeed
   - [ ] Move non-critical state initialization to after initial render
   - [ ] Share common state through context between pages

### Success Metrics
- Initial render time < 1 second
- Time to Interactive < 2 seconds
- Zero loading jank during transition
- Smooth 60fps during initial load

### Monitoring
- [ ] Add performance metrics for page transition
- [ ] Monitor component mount times
- [ ] Track data fetch timings

### Notes
- Focus on critical path rendering first
- Defer non-essential features
- Measure impact of each optimization
