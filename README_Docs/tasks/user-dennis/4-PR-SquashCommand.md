# Squashing a Branch into a Single Commit

This guide explains how to squash multiple commits in a feature branch into a single clean commit before creating a pull request.

## Ready for PR: Squashing Your Feature Branch

Assuming you're on your feature branch and have completed your work, follow these steps to squash your commits:

1. First, make sure your branch is up to date with main:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. Resolve any conflicts if they occur, then continue with one of these methods:

## Method 1: Interactive Rebase (Recommended)

1. Find out how many commits you need to squash:
   ```bash
   git log --oneline origin/main..HEAD
   ```
   This shows all commits that are in your branch but not in main.

2. Start an interactive rebase:
   ```bash
   git rebase -i origin/main
   ```

3. In the text editor that opens, change all but the first "pick" to "squash" or "s":
   ```
   pick abc1234 First commit message
   s def5678 Second commit message
   s ghi9101 Third commit message
   ```

4. Save and close the editor. Another editor will open to combine the commit messages.

5. Edit the final commit message, save, and close.

6. Force push your branch:
   ```bash
   git push --force-with-lease origin your-feature-branch
   ```

## Method 2: Soft Reset and Recommit

If you find interactive rebase confusing, use this simpler method:

1. Reset to the main branch while keeping your changes:
   ```bash
   git reset origin/main
   ```

2. Stage all changes:
   ```bash
   git add .
   ```

3. Create a single commit with a descriptive message:
   ```bash
   git commit -m "Feature: Add comprehensive description of your changes"
   ```

4. Force push your branch:
   ```bash
   git push --force-with-lease origin your-feature-branch
   ```

## Method 3: GitHub UI (Easiest)

If you've already created a pull request:

1. Navigate to your pull request on GitHub
2. Click the "Merge pull request" button dropdown
3. Select "Squash and merge"
4. Edit the commit message if desired
5. Click "Confirm squash and merge"

## ⚠️ Important Warning

Force pushing rewrites git history. Only force push to your personal feature branches that aren't being used by others.

## Quick Reference

One-liner to squash all commits since branching from main:
```bash
git reset --soft origin/main && git commit -m "Feature: Your comprehensive commit message"
```