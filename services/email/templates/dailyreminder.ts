import { TemplateConfig } from '../types';

export interface DailyReminderEmailData {
  name: string;
  pendingGoals?: string;
}

export const dailyReminderTemplate = (data: DailyReminderEmailData): TemplateConfig => ({
  subject: "MCAT Prep reminder 🐱",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 37.5rem; margin: 0 auto;">
      <h1>Meow there, ${data.name}! 😺</h1>
      <p>I couldn't help but notice you haven't checked in with your study goals today. ${data.pendingGoals ? `Specifically, you still need to complete: ${data.pendingGoals.split('\n').join(', ')}` : 'As your dedicated MCAT study buddy, I\'m getting a bit worried!'}</p>
      <p>Remember, even doing just 1 task can keep your streak alive! Every small step counts towards your MCAT success. Don't break that momentum!</p>
      <p>Ready to turn this day around? Click below to jump back in:</p>
      <p style="text-align: center;">
        <a href="https://mymcat.ai" style="background-color: #2563eb; color: white; padding: 0.75rem 1.25rem; text-decoration: none; border-radius: 0.5rem; display: inline-block; margin: 1rem 0; font-family: 'Inter', system-ui, sans-serif; font-weight: 500; box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);">Let's Study Now! 📚</a>
      </p>
      <p>Need any help getting back on track? Our team is here for you: </p>
      <ul style="list-style-type: none; padding-left: 0;">
        <li>Josh (josh@mymcat.ai) - For any technical support</li>
        <li>Prynce (prynce@mymcat.ai) - For anything else</li>
      </ul>
      <p>Waiting eagerly for your return,</p>
      <p>Kalypso, Your Concerned MCAT Study Buddy 🐱</p>
      <hr style="margin: 1.5rem 0; border: 0; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 0.875rem; color: #6b7280;">
        Want to change how often you receive these reminders? <a href="https://mymcat.ai/preferences" style="color: #2563eb; text-decoration: underline;">Update your notification settings</a>
      </p>
    </div>
  `
});
