# Cursor AI Development Guide

> **IMPORTANT**: This guide is essential reading for all developers. It outlines how to effectively use Cursor AI as a pair programmer rather than just a code generator. 
> Following these patterns will significantly improve code quality and reduce AI-generated bugs.

> Cursor acts as an intelligent pair programmer that:
>- Understands your project architecture
>- Follows established patterns
>- Maintains development context
>- Tracks individual developer progress

[Inspired by original blog post](https://medium.com/@vrknetha/the-ultimate-guide-to-ai-powered-development-with-cursor-from-chaos-to-clean-code-fc679973bbc4)

## Directory
- [Quick Start](#quick-start)
  - [Set Developer Name](#1-set-your-developer-name)
  - [Create Workspace](#2-create-your-workspace)
  - [Create First Task](#3-create-your-first-task)
- [Working with Cursor](#working-with-cursor)
  - [Example Interactions](#example-interactions)
  - [Task & Status Templates](#task--status-templates)
    - [tasks.md Template](#tasksmd-template)
    - [status.md Template](#statusmd-template)
- [Project Structure](#project-structure)
- [Best Practices](#best-practices)
- [Example Workflow](#example-workflow)
  - [1. Ask for Help](#1-ask-cursor-to-help-with-a-new-feature)
  - [2. Create Task](#2-create-task-tasksmd)
  - [3. Track Progress](#3-track-progress-statusmd)
  - [4. Get Implementation Help](#4-get-implementation-help)

## Quick Start
1. Set your developer name:
```bash
# Create config directory if it doesn't exist
mkdir -p README_Docs/config

# Create your developer config (replace "your-name" with your name, e.g., "dennis")
echo '{"DEVELOPER_NAME": "your-name"}' > README_Docs/config/developer.json
```

2. Create your workspace:
```bash
# This will create your personal workspace using the name from your config
mkdir -p README_Docs/tasks/user-$(jq -r .DEVELOPER_NAME README_Docs/config/developer.json)
touch README_Docs/tasks/user-$(jq -r .DEVELOPER_NAME README_Docs/config/developer.json)/tasks.md
touch README_Docs/tasks/user-$(jq -r .DEVELOPER_NAME README_Docs/config/developer.json)/status.md
```

3. Create your first task using the templates below

> 💡 **Pro Tip**: Keep your status.md updated as you work - it helps Cursor maintain context

## Working with Cursor

### Example Interactions
```bash
# Check your current task
@Codebase
What's my current task?

# Update your status
@Codebase
Update my status: "Implementing landing page animations"

# Get technical guidance
@Codebase
How should I structure the new landing page component?
```

### Task & Status Templates

#### tasks.md Template
```bash
## Task: Feature Name
Status: Not Started
Priority: High
Dependencies: None

### Requirements
- Key requirement 1
- Key requirement 2
- Key requirement 3

### Acceptance Criteria
1. Measurable outcome 1
2. Measurable outcome 2
3. Measurable outcome 3

### Notes
- Any specific considerations
- Special cases to handle
```

#### status.md Template
```markdown
# Status Updates - [Developer Name]

## Current Progress
- Working on: [Task ID + Name]
- Phase: [Planning/Implementation/Testing/Review]
- Blockers: None

## Recent Activity
- [Latest progress item 1]
- [Latest progress item 2]
- [Latest progress item 3]

## Technical Notes
- [Technical decisions made]
- [Implementation approach]
- [Architectural considerations]

## Questions/Concerns
- [Open questions]
- [Potential issues]
- [Need clarification on...]
```

> 💡 **Pro Tip**: Technical Notes and Questions/Concerns sections are optional but valuable for complex features

## Project Structure
```bash
my-mcat/
├── README.md                # Project overview & quickstart
├── .cursorrules            # AI behavior configuration
├── README_Docs/            # Cursor AI workspace & documentation
│   ├── config/            # Developer configuration
│   │   └── developer.json # Your personal settings
│   ├── architecture/      # System design & patterns
│   └── tasks/            # Developer workspaces
│       └── user-[name]/  # Personal workspace (created from config)
│           ├── tasks.md  # Your current tasks
│           └── status.md # Progress tracking
```

## Best Practices
1. Always keep your status.md updated
2. Reference specific files when asking questions
3. Follow the templates for consistency
4. Check technical.md before implementing features

## Example Workflow

### 1. Ask Cursor to Help with a New Feature
```bash
@Codebase
I need to implement a premium feature gate for the calendar component. How should I structure this?
```

### 2. Create Task (tasks.md)
```bash
## Task: Calendar Premium Gate
Status: Not Started
Priority: High
Dependencies: None

### Requirements
- Implement premium feature gate for Calendar component
- Add upgrade prompt for non-premium users
- Handle loading states

### Acceptance Criteria
1. Non-premium users see upgrade prompt
2. Premium users access calendar
3. Loading state during check
4. Mobile responsive design

### Notes
- Check existing premium gates
- Consider upgrade flow UX
```

### 3. Track Progress (status.md)
```bash
## Current Progress
- Working on: Calendar Premium Gate
- Phase: Implementation
- Blockers: None

## Recent Activity
- Reviewed existing premium gates
- Studied useSubscriptionStatus hook
- Started component implementation

## Notes
- Following pattern from testing suite gate
- Need to handle edge cases
```

### 4. Get Implementation Help
```bash
@Codebase
Can you help me implement the premium gate check using useSubscriptionStatus?
```

> 💡 **Pro Tip**: Using @Codebase lets Cursor access all relevant files through .cursorrules configuration

@Codebase
Update status: "Completed premium gate implementation with useSubscriptionStatus hook"