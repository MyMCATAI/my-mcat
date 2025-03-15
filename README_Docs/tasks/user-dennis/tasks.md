TODO: 
[ ] add test to calendar (Tuesday)
[ ] ATS - 40 seconds in we ask "What defines an alpha carbon in an amino acid, and why is it important?"


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