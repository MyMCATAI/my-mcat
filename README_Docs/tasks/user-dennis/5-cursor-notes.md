## Cursor Notes

#### Prompts
` Do not apply code changes, just analyze the codebase and write out your steps to 2-single-task-steps.md`

#### Compare functionality to main
To thoroughly evaluate whether our branch behaves functionally the same as main, use both approaches:
1. Add main branch to worktree for direct file comparison:
```bash
# Add main branch as a worktree for comparison
git worktree add main
# When finished with comparison
git worktree remove main
```

2. Create a diff file for Cursor analysis:
```bash
# Generate detailed diff against main
git diff --full-index main -- > README_Docs/tasks/user-dennis/3-pr-diff.txt
```

3. Working with Cursor:
Prompt to use for comparison

```
Carefully examine both the diff against main @3-pr-diff.txt and our `main` branch repo itself, which was added to our worktree @main 
Evaluate whether our branch behaves and acts functionally the SAME as main.
```

Having both the worktree and diff file available provides:
- Direct access to main branch files for inspection
- A comprehensive diff that Cursor can analyze
- The ability to verify functional equivalence with confidence