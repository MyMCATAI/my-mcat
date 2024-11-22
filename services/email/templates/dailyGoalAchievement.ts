import { TemplateConfig } from '../types';

export const dailyGoalAchievementTemplate = (data: any): TemplateConfig => ({
  subject: 'Pawsome Job on Achieving Your Daily Goals!',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Meow-velous work, ${data.name || 'there'}! 🐾</h1>
      <p>You've purred your way through all the tasks on your agenda today. I'm pawsitively proud of your dedication and focus! Completing your daily study goals is a huge achievement and shows your commitment to success.</p>
      <p>Remember, consistency is key in your MCAT preparation journey. By studying diligently each day, you're building strong foundations and habits that will serve you well on test day and beyond.</p>
      <p>Keep up the claw-some effort! Your hard work and dedication are truly inspiring.</p>
      <p>If you have any questions or need assistance, our team is here to help:</p>
      <ul style="list-style-type: none; padding-left: 0;">
        <li>Josh (josh@mymcat.ai) - For any technical support or platform questions</li>
        <li>Prynce (prynce@mymcat.ai) - For MCAT content questions and study strategies</li>
      </ul>
      <p>Feline good wishes,</p>
      <p>Kalypso, Your MCAT Study Buddy 🐱<br>
      and the entire myMCAT.ai Team</p>
    </div>
  `
});
