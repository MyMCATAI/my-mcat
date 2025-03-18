## Cursor Notes

#### Prompts
` Do not apply code changes, just analyze the codebase and write out your steps to 2-single-task-steps.md`
`I added main branch to the worktree @main , evaluate whether or not our branch behaves and acts functionally the SAME as main.` 

#### Add new branch to worktree
add new branch for Cursor to compare: 
`git worktree add main`

remove it before pushing back up 
`git worktree remove main`

#### Create diff file for Cursor

To create a detailed diff against `main` with context:
```
git diff --full-index main > branch-diff-full.diff
```

To feed the diff back into Cursor:
1. Create the diff file
2. Open the diff file in Cursor
3. Ask Cursor to analyze the changes