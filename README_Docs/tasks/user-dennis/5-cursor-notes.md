## Cursor Notes

#### Prompts
` Do not apply code changes, just analyze the codebase and write out your steps to 2-single-task-steps.md`

#### Compare functionality to main
To thoroughly evaluate whether our branch behaves functionally the same as main:

1. Add main branch to worktree for direct file comparison:
```bash
# Add main branch as a worktree for comparison
git worktree add main
# When finished with comparison
git worktree remove main
```

2. Working with Cursor:
Prompt to use for comparison

```
Carefully examine our `main` branch repo itself, which was added to our worktree @main 
Evaluate whether our branch behaves and acts functionally the SAME as main.
```

Having the worktree available provides:
- Direct access to main branch files for inspection
- The ability to verify functional equivalence with confidence



Take a look at this check container component that's in the branch to folder. This existed in a separate branch where we styled it differently. Please note any differences between this file and the one we have for our check container and match the styling of the branch to. So therefore refactor our check container to match the styling. It also attaches a photo of what it should look like.