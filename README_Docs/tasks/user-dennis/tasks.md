TODO: 


## Store Migration Progress
[✓] Implemented audioSlice (complete)
[✓] Implemented uiSlice (complete)
[ ] Implement userSlice (files created but not implemented)
[✓ ] Implement gameSlice (files created but not implemented)
[ ] Implement vocabSlice (files created but not implemented)
[ ] CARS Suite - take out sound when you select answer. (Prynce bug)


----
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