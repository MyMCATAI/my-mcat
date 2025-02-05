# TODO List

## Meeting Notes 

why is cursorrules important? 
 -hallucination - creating new files that shouldn't exist.
 -rescanning codebase doesn't always help esp in big monolithic repos
 -will save us alot of time and headache long term

# How to Prompt Cursor
Three pillars of effective AI Development
Clear System Architecture - AI needs to understand your system holistically
Structured Task Management -  break work into digestibile chunks
Explicit Development Rules - guide with with clear patterns and conventions

this is the most comprehensive cursor rules architecture ever 



### Go over PR 
  - [ ] README.md (anything missing)? 
  - [ ] explain how .cursorrules works
  - [ ].cursorrules, follows styling of technical.md
  - [ ] talk about cutoff cursor code applys
  - [ ].technical.md - open to change from the team
  - [ ] README_DEveloper-Instructions.md


## Basic Query Flow
1. **Always start with `@Codebase`**
   - This triggers .cursorrules to load:
     - Your tasks.md
     - Your status.md
     - technical.md standards
     - architecture.md patterns

2. **Best Practice Workflow**
  1. Check your current task first
  @Codebase
  What's my current task?
  2. Ask your implementation question
  @Codebase
  How should I implement the premium gate for the calendar component?
  3. Update your status after making progress
  @Codebase
  Update status: "Implementing premium gate using useSubscriptionStatus hook"


 