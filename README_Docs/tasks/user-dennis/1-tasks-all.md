# Features:
[ ] Talking to kalypso - better UI - waveform shows - when talking to Kalypso AI 
[ ] 



---

# Tech Debt:

## Update Cursor Rules
[ ] .mdc - cursor rules - update to always use zustand not context API - also consider rules when creating a new state in a component? should multiple components have access to it? consider global state. 
[ ] when creating new global state - make sure our DebugPanel renders it too.

### Unmigrated Content from .cursorrules
Content from .cursorrules that hasn't been migrated to .mdc files yet:

#### Documentation Hierarchy
```markdown
# Documentation Hierarchy
1. Primary Documentation:
   - technical.md: Source of truth for coding standards
   - architecture.md: System design and patterns
   - tasks/${DEVELOPER_NAME}/tasks.md: Current tasks
   - tasks/${DEVELOPER_NAME}/status.md: Progress tracking

2. Implementation Requirements:
   - Follow section headers from technical.md
   - Use animation patterns from technical.md
   - Implement feature gates per architecture.md
   - Follow component organization rules

3. Before ANY Code Changes:
   - PARSE technical.md for relevant patterns
   - VERIFY against architecture.md
   - CHECK current task context
   - VALIDATE component structure
```

#### Premium Features / Feature Gates
```markdown
# Feature Gate Implementation
1. Source of Truth:
   - Load feature definitions from "Feature Control" section in technical.md
   - Follow implementation patterns from "Feature Gates" section
   - Reference component examples from technical.md

2. Validation Requirements:
   - Verify component against documented feature gate patterns
   - Ensure proper hook usage (useSubscriptionStatus) as shown in examples
   - Confirm implementation matches technical.md specifications
   
3. Documentation Requirements:
   - Reference "Free Features" and "Premium Features" sections in technical.md
   - Link to relevant implementation examples
   - Keep implementation aligned with documentation
```

#### Architecture Understanding
```markdown
# Architecture Understanding
Required parsing:
1. Load and parse Mermaid diagram focusing on:
   - Auth -> Onboarding flow
   - Feature Gates system
   - Free vs Premium features
   - Game systems
   - Data collection flow
2. Extract and understand:
   - Premium vs Free feature boundaries
   - Clerk Auth integration points
   - Data flow patterns
   - Component dependencies
3. Validate changes against architectural constraints
4. Ensure proper feature gating
```

#### Package Management
```markdown
# Package Management Rules
- Never manually edit package-lock.json
- Use npm install for adding new packages
- Commit both package.json and package-lock.json together
- Report conflicts in package-lock.json to team lead
- Run npm ci for clean installs
- Contact Josh for dependency updates
```

#### Error Prevention & Documentation Standards
```markdown
# Error Prevention
Before responding to any query:
1. Load and parse technical.md completely
2. Check section dividers (100 dashes)
3. Validate heading hierarchy
4. Ensure code blocks follow documentation rules
5. Verify file paths in examples

# Documentation Standards
For all .md files:
1. Verify proper markdown link syntax
2. Check code block formatting
3. Validate section dividers
4. Ensure proper heading hierarchy
5. Check for complete examples in guidelines
```

#### File Management Rules
```markdown
# File Management Rules
Required actions after code changes:
1. VERIFY premium feature gates implementation
2. CHECK README_Docs/architecture/architecture.md compliance
3. UPDATE personal status.md with:
   - Current progress
   - Any blockers
   - Completed items
4. VALIDATE against technical.md specifications
5. VERIFY task progress
```

[x] Create component-guidelines.mdc and state-management.mdc files
[ ] Migrate remaining content from .cursorrules to appropriate .mdc files
[ ] Delete .cursorrules file after migration is complete

## Bugs
[ ] CARS Suite - take out sound when you select answer. (Prynce bug)

