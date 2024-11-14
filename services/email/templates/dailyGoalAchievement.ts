import { TemplateConfig } from '../types';

export const dailyGoalAchievementTemplate = (data: any): TemplateConfig => ({
  subject: 'Pawsome Job on Achieving Your Daily Goals!',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Meow-velous work, ${data.name || 'there'}! 🐾</h1>
      <p>You've purred your way through all the tasks on your agenda today. I'm pawsitively proud of your dedication and focus!</p>
      <p>Keep up the claw-some effort, and remember, consistency is the cat's meow for success.</p>
      <p>If you have any questions or need a helping paw, feel free to reach out to our support team.</p>
      <p>Feline good wishes,<br>Kalypso, Your MCAT Study Buddy 🐱</p>
    </div>
  `
});
