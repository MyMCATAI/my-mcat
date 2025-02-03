# Dennis Questions


# Questions 
- create a cursorrules file
- try using https://www.codesee.io/ for architecture
- https://www.codesee.io/ai#waitlist
- whats your .cusorrules file? 
- https://www.eraser.io/ai
- Calendar integrate someones google calendar
- https://docs.google.com/document/d/1QWxLXbj-NmT_pJZ9GqPJqgKsLeBH8nxnqJX0YmA0Ohk/edit?tab=t.1zsw5lqmccqu#heading=h.wh80sgh5c3rd

- https://docs.google.com/document/d/14ykNyXB5FBQjxazurzM5vLPXhbxDjny4z01e7nrIqr0/edit?tab=t.0




- vscode-mermAId - needs Github Copilot?
- why not pull in a particular google calendar related to the mcat that they might have personal? 
- mock user account (not only for mymcat but also jack westin / practice tests - example medical student)
- add me to Discord?
- ComfyUI workflows - how to edit a photo with comfyUI

-Suggestion - update the blog student module architecture


## Environment Setup
1. What are all the required environment variables? I see references to:
   - DATABASE_URL (PlanetScale)
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   - CLERK_SECRET_KEY
   - OPENAI_API_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - NEXT_PUBLIC_APP_URL
   Are there any others?

2. Is there a sample .env file I can use as a template?

## Database
1. What's the current database schema? Where can I find the schema.prisma file?
2. Are there any existing database seeds I should run?
3. What's the process for proposing database changes?

## Feature Questions
1. How does the feature gating system work technically?
   - How are premium features detected?
   - Where is the useSubscriptionStatus hook defined?

2. What's the relationship between:
   - Tests
   - Questions
   - TestQuestions
   - Passages
   In the database schema?

3. How does the Doctor's Office game integrate with the rest of the platform?

## Development Workflow
1. What's the branching strategy?
2. Are there any automated tests?
3. What's the deployment process?
4. How do we handle database migrations in production?

## Content Management
1. How are MCAT questions organized in the database?
2. What's the process for adding new content?
3. How do we validate question content?

## AI Integration
1. How is the OpenAI API being used?
2. What's the role of Kalypso (the AI cat assistant)?
3. Are there rate limits or usage tracking for AI features?

## Testing Suite
1. How are full-length tests structured?
2. How is scoring implemented?
3. How does the adaptive tutoring system work?

## Authentication
1. How is Clerk.dev integrated?
2. What user roles exist?
3. How are admin users identified?

## Payment Processing
1. How is Stripe integrated?
2. What's the subscription model?
3. How are webhooks handled?

## Scripts
I see several scripts in package.json. What do these do:
- create-categories
- merge-tests
- create-questions
- create-content
- create-passages
- create-diagnostic-test
etc.

## Deployment
1. What's the current deployment setup on Vercel?
2. How are database migrations handled in production?
3. What's the process for deploying updates?

## Known Issues/Limitations
1. Are there any known bugs I should be aware of?
2. Are there any performance bottlenecks?
3. What areas of the codebase need improvement?

## Contact
1. Who should I contact for:
   - Database questions (Josh?)
   - Feature implementation questions
   - Content management
   - Deployment issues

## Additional Resources
1. Are there any additional documentation resources?
2. Where can I find design documents/wireframes?
3. Is there a staging environment? 