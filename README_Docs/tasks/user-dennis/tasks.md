TODO: 
[ x ] lazy load remove
[] no prop drilling - okay take a note of page.tsx and all its children components, and note which global state values we store in the global zustand store and make sure we are not prop drilling any values into the child components. 
ResourcesMenu Component:
Already uses useGame() for streakDays
Should also use useGame() for userRooms, totalPatients, patientsPerDay
Should use useUser() for totalCoins (user's score)

FlashcardsDialog Component:
Already uses useGame() for some state
Should use it for all game-related state instead of receiving props

AfterTestFeed Component:
Should use useGame() for userResponses, correctCount, wrongCount
Should use useUser() for subscription status

updates and syncs with database?


## Cursor Notes

#### Prompts
` Do not apply code changes, just analyze the issue and respond to the question`

#### Add new branch to worktree
add new branch for Cursor to compare: 
`git worktree add localstate-compare`

remove it before pushing back up 
`git worktree remove localstate-compare`

#### Create diff file for Cursor

To create a detailed diff against `main` with context:
```
git diff --full-index main > branch-diff-full.diff
```

To feed the diff back into Cursor:
1. Create the diff file
2. Open the diff file in Cursor
3. Ask Cursor to analyze the changes