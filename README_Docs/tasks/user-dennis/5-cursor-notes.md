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