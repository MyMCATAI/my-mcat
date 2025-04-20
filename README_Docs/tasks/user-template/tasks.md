# New Game Workflow in AnkiClinic

## Game Initialization
1. When user presses `NewGameButton`, it checks if they have enough coins (1 required)
2. If they have enough coins, it decrements their score
3. It calls API to create a new user test (`createNewUserTest()`)
4. The button passes the test ID to parent via `onGameStart(userTestId)`

## Room Population
1. In the main page, `handleGameStart()` receives the test ID and:
   - Plays startup sound
   - Starts a new testing activity
   - Updates game state via Zustand store's `startGame(userTestId)`
   - Calls `populateRoomsFn()` to select rooms

2. The `populateRooms()` function in `OfficeContainer`:
   - Gets available rooms for current level (excluding tutorial room)
   - Randomly selects 1 room for flashcards
   - Also selects a room for CARS passages (may be the same room if only one available)
   - Selects a third room for Adaptive Tutoring Suite (ATS) access
   - Updates active rooms in store with `setActiveRooms()`
   - Stores the CARS room ID in `window.carsRoomId` and ATS room ID in `window.atsRoomId`
   - Returns selected room for display in toast message

## Room Display & Interaction
1. Three types of interactive sprites are displayed:

   a. Flashcard Room:
   - The active room receives a `QuestionPromptSprite` above it
   - The sprite pulses/glows to indicate interactivity

   b. CARS Room:
   - A separate `CarsPromptSprite` appears on the designated CARS room
   - This sprite has a blue glow and different animation pattern
   - It appears only if the room isn't already being used for flashcards

   c. ATS Room:
   - A separate `ATSPromptSprite` appears on the designated ATS room 
   - This sprite has a purple glow and distinct bouncing animation
   - It's positioned on the opposite side of the CARS sprite

2. Interaction with Sprites:

   a. When the flashcard sprite is clicked:
   - It sets `flashcardRoomId` to the room's ID
   - Plays door open sound effect
   - Sets `isFlashcardsOpen` to true after a short delay

   b. When the CARS sprite is clicked:
   - It plays door open sound effect
   - Redirects to `/test/testquestions?id=X` with the ID of an available CARS test
   - Uses tests retrieved from the API and stored in `window.availableTests`

   c. When the ATS sprite is clicked:
   - It plays door open sound effect
   - Toggles the AdaptiveTutoring component within the AnkiClinic page
   - Shows the full Adaptive Tutoring Suite without leaving the page

3. Content Display:
   - The `FlashcardsDialog` opens with content specific to the selected room
   - CARS tests load in a separate page with the CARS passage interface
   - ATS replaces the OfficeContainer with the Adaptive Tutoring Suite component

## Game Completion Flow
1. When all questions are answered, `completeAllRoom` is set to true
2. If completed, it fetches user responses and calculates score
3. After test completion, either `AfterTestFeed` dialog or new game state is shown
