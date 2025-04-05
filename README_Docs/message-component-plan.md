# Message Component System Plan

## Current Solution
We're currently using HTML formatting with the `dangerouslySetInnerHtml` option in react-chatbotify to render formatted welcome messages. While this works, it's not ideal for the following reasons:

1. Using `dangerouslySetInnerHtml` is not considered a React best practice
2. HTML strings are harder to maintain and extend
3. It's difficult to add interactive elements
4. Styling is limited to inline styles

## Long-Term Component-Based Solution

### 1. Create Core Message Components

```tsx
// components/chatgpt/messageComponents/MessageContainer.tsx
export const MessageContainer = ({ children, className }) => {
  return (
    <div className={cn("message-container", className)}>
      {children}
    </div>
  );
};

// components/chatgpt/messageComponents/MessageSection.tsx
export const MessageSection = ({ title, icon, children }) => {
  return (
    <div className="message-section">
      <div className="message-section-header">
        {icon && <span className="message-section-icon">{icon}</span>}
        <h3 className="message-section-title">{title}</h3>
      </div>
      <div className="message-section-content">
        {children}
      </div>
    </div>
  );
};

// components/chatgpt/messageComponents/TaskList.tsx
export const TaskList = ({ tasks }) => {
  return (
    <ul className="task-list">
      {tasks.map((task, index) => (
        <li key={index} className="task-item">
          <span className="task-status">
            {task.isCompleted ? '✅' : '⏳'}
          </span>
          <span className="task-title">{task.title}</span>
          <span className="task-hours">({task.hours}h)</span>
        </li>
      ))}
    </ul>
  );
};
```

### 2. Create Specialized Message Components

```tsx
// components/chatgpt/messageComponents/WelcomeMessage.tsx
import { MessageContainer, MessageSection, TaskList } from './index';

export const WelcomeMessage = ({ context }) => {
  const { user, game, knowledge, calendar, time } = context;
  
  return (
    <MessageContainer>
      <div className="greeting">
        {time.greeting}, {user.firstName || 'there'}!
      </div>
      
      {calendar.todaysActivities?.length > 0 && (
        <MessageSection title="TODAY'S SCHEDULE" icon="📅">
          <p>
            You have {calendar.todaysActivities.length} activities 
            ({calendar.todaysActivities.filter(a => a.status === 'COMPLETED').length}/{calendar.todaysActivities.length} completed):
          </p>
          <TaskList tasks={calendar.todaysActivities} />
        </MessageSection>
      )}
      
      {/* Add other sections similarly */}
      
      <div className="closing-question">
        How can I help you today?
      </div>
    </MessageContainer>
  );
};
```

### 3. Update the Flow to Use Components

```tsx
const flow = generateChatbotFlow(
  handleSendMessage,
  async () => {
    if (welcomeMessage) {
      return <WelcomeMessage context={welcomeContext} />;
    }
    
    // Fallback plain text
    return `Hello ${userInfo?.firstName || 'there'}! Welcome to MyMCAT.ai.`;
  }
);
```

### 4. Implement in the ChatContainer Component

Update the `ChatContainer` component to:
1. Pass JSX elements instead of strings to react-chatbotify
2. Set up any message-specific event handlers or state
3. Handle interactive elements within messages

### Benefits of Component-Based Approach

1. **Maintainability**: Components are easier to update and maintain
2. **Reusability**: Components can be reused across different messages
3. **Interactivity**: Can include clickable elements and UI components
4. **Type Safety**: Better TypeScript integration
5. **Styling**: Can use CSS modules or styled-components
6. **Testing**: Easier to write unit tests for components

### Implementation Timeline

1. **Phase 1** (Current): Use HTML formatting for immediate visual improvement
2. **Phase 2** (Next Sprint): Create core message components
3. **Phase 3**: Convert welcome message to use component system
4. **Phase 4**: Add interactive elements to messages
5. **Phase 5**: Extend to all AI responses 