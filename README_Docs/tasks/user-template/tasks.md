# AnkiClinic Sidebar Enhancement - Step by Step Implementation

## Task Overview
I want to enhance the AnkiClinic sidebar to dynamically change the main content area (left side) based on the tab selected, similar to how the HoverSidebar works on the home page. Specifically:

1. Understand how the home page nests components and switches between views
2. Understand how the AnkiClinic page is structured
3. Modify the AnkiClinic SideBar to:
   - Change tab labels appropriately
   - Make the sidebar tabs control the left content area
   - Replace "Tasks" with "Learn" to open the Adaptive Tutoring Suite

## Step 1: Analyze Home Page Component Structure
1. Examine the `app/(dashboard)/(routes)/home/page.tsx` component
2. Identify how it manages multiple content components (KalypsoAI, Summary, AdaptiveTutoring, etc.)
3. Understand the state management for active page/tab selection
4. Note how content is conditionally rendered based on the `activePage` state
5. Observe how the HoverSidebar interacts with the main content area

## Step 2: Study AnkiClinic Page Structure
1. Analyze `app/(dashboard)/(routes)/ankiclinic/page.tsx`
2. Understand how `OfficeContainer` is implemented as the main content
3. Identify the state management pattern used
4. Note the relationship between the sidebar and the main content
5. Understand how components are organized and rendered

## Step 3: Identify Required Components
1. Locate the ChatContainer component for Kalypso AI functionality
2. Locate the AdaptiveTutoring component for the "Learn" tab
3. Identify any other components needed for different tabs
4. Determine what state needs to be managed to switch between these components

## Step 4: Modify AnkiClinic SideBar Component
1. In `app/(dashboard)/(routes)/ankiclinic/page.tsx`, add state management for the active content type:
   ```tsx
   const [activeContent, setActiveContent] = useState<'game' | 'kalypso' | 'learn' | 'friends'>('game');
   ```

2. Update the sidebar tab definitions to include:
   - Kalypso (cat icon)
   - Learn (instead of Tasks) 
   - Friends
   - Tutors

3. Modify the tab click handler to update both the active tab and active content:
   ```tsx
   const handleTabChange = (tabId: string) => {
     setActiveTab(tabId);
     
     // Convert tab ID to content type
     if (tabId === 'tab1') {
       setActiveContent('kalypso');
     } else if (tabId === 'tab2') {
       setActiveContent('learn');
     } else if (tabId === 'tab5') {
       setActiveContent('friends');
     } else if (tabId === 'tab3') {
       setActiveContent('tutors');
     }
   };
   ```

## Step 5: Update Content Rendering Logic
1. In the main render function of `app/(dashboard)/(routes)/ankiclinic/page.tsx`, modify the content area to conditionally render based on `activeContent`:
   ```tsx
   <div className="w-3/4 font-krungthep relative z-20 rounded-l-lg">
     {activeContent === 'game' && (
       <OfficeContainer
         ref={officeContainerRef}
         onNewGame={handleSetPopulateRooms}
         visibleImages={visibleImages}
         imageGroups={imageGroups}
         updateVisibleImages={updateVisibleImages}
       />
     )}
     
     {activeContent === 'kalypso' && (
       <ChatContainer 
         chatbotRef={chatbotRef}
         activities={activities}
       />
     )}
     
     {activeContent === 'learn' && (
       <AdaptiveTutoring
         toggleChatBot={() => setActiveContent('kalypso')}
         setChatbotContext={updateChatbotContext}
         chatbotRef={chatbotRef}
         onActivityChange={handleActivityChange}
       />
     )}
     
     {activeContent === 'friends' && (
       <div className="h-full p-4 bg-[--theme-mainbox-color] rounded-lg">
         <Leaderboard 
           variant="fullpage"
           showAddFriend={true}
           className="h-full"
           compact={false}
         />
       </div>
     )}
     
     {activeContent === 'tutors' && (
       <div className="h-full p-4 bg-[--theme-mainbox-color] rounded-lg overflow-auto">
         {/* Render tutors content here */}
         <h2 className="text-2xl font-bold mb-4">Tutors</h2>
         {/* Add tutors content from SideBar component */}
       </div>
     )}
   </div>
   ```

## Step 6: Add Required Imports and Props
1. Add imports for all components:
   ```tsx
   import ChatContainer from "@/components/chatgpt/ChatContainer";
   import AdaptiveTutoring from "../home/AdaptiveTutoring";
   import Leaderboard from "@/components/leaderboard/Leaderboard";
   ```

2. Ensure necessary props and contexts are passed to new components:
   - For AdaptiveTutoring: toggleChatBot, setChatbotContext, chatbotRef, onActivityChange
   - For ChatContainer: chatbotRef, activities

## Step 7: Update Responsive Design
1. Update responsive design to handle mobile views:
   ```tsx
   {isMobile ? (
     // Mobile layout - modify this to handle all content types
     <div className="w-full h-full relative">
       {activeContent === 'game' && (
         <OfficeContainer
           ref={officeContainerRef}
           onNewGame={handleSetPopulateRooms}
           visibleImages={visibleImages}
           imageGroups={imageGroups}
           updateVisibleImages={updateVisibleImages}
         />
       )}
       {activeContent === 'kalypso' && (
         <ChatContainer 
           chatbotRef={chatbotRef}
           activities={activities}
         />
       )}
       {/* Add other content types here */}
     </div>
   ) : (
     // Desktop layout - already updated above
   )}
   ```

## Step 8: Add Necessary State Management and Functions
1. Add a function to update the chatbot context:
   ```tsx
   const [chatbotContext, setChatbotContext] = useState<any>(null);
   
   const updateChatbotContext = useCallback((context: any) => {
     setChatbotContext(context);
   }, []);
   ```

2. Add a function to handle activity changes:
   ```tsx
   const handleActivityChange = useCallback(async (type: string, location: string, metadata?: any) => {
     if (currentStudyActivityId) {
       try {
         await endActivity(currentStudyActivityId);
       } catch (error) {
         console.error('Error ending previous activity:', error);
       }
     }

     try {
       const activity = await startActivity({
         type,
         location,
         metadata: {
           ...metadata,
           timestamp: new Date().toISOString()
         }
       });

       if (activity) {
         setCurrentStudyActivityId(activity.id);
       }
     } catch (error) {
       console.error('Error starting new activity:', error);
     }
   }, [endActivity, startActivity, currentStudyActivityId]);
   ```

## Step 9: Update Sidebar Labels and Icons
1. In SideBar component, update the tabs array:
   ```tsx
   const tabs: { id: string; label: string; content: TabContent }[] = [
     { id: "tab2", label: "Learn", content: { type: 'tasks' } },
     { id: "tab5", label: "Friends", content: { type: 'leaderboard' } },
     { id: "tab3", label: "Tutors", content: { type: 'tutors', schools: tutors } },
   ];
   ```

## Step 10: Testing
1. Test all tab transitions to ensure content changes correctly
2. Verify that switching between tabs preserves proper state
3. Test on both desktop and mobile views
4. Ensure activity tracking works across all content types
5. Verify that all components receive necessary props and function correctly

## Implementation Notes
- The approach uses conditional rendering based on the activeContent state
- Keep all the existing game functionality intact
- Mobile view may require special handling for different content types
- Ensure smooth transitions between different content views
- Make sure to pass all required props to components