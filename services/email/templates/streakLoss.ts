import { TemplateConfig } from '../types';

export const streakLossTemplate = (data: any): TemplateConfig => ({
  subject: `Oh no! Your study streak is at risk! 😿`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 37.5rem; margin: 0 auto; padding: 1.25rem;">
      <p style="color: #333333; line-height: 1.6;">
        Hi ${data.userName}! 🐱
      </p>
      
      <p style="color: #333333; line-height: 1.6;">
       Ahhhh! It's Kalypso! I noticed you didn't log in yesterday, and your study streak is at risk! But don't worry - you can still save it for 3 coins. 
      </p>

      <p style="color: #333333; line-height: 1.6;">
        <a href="${data.saveStreakUrl}" style="display: inline-block; background-color: #2b6cb0; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.375rem; margin-top: 1rem;">
          Save My Streak (3 coins)
        </a>
      </p>
      
      <p style="color: #333333; line-height: 1.6;">
        Remember: From this point forward, each day you don't log in will cost you 1 coin. We've designed this system to help you maintain consistency in your MCAT prep journey - because consistent practice is key to success!
      </p>

      <p style="color: #333333; line-height: 1.6;">
        If you're feeling overwhelmed or your schedule needs adjustment, we've got you covered:
        <br><br>
        • <a href="${data.scheduleUrl}" style="color: #2b6cb0; text-decoration: underline;">Regenerate your study schedule</a>
        <br>
        • <a href="${data.breakUrl}" style="color: #2b6cb0; text-decoration: underline;">Schedule a study break</a>
      </p>

      <p style="color: #333333; line-height: 1.6;">
        Keep up the great work!<br>
        Kalypso 🐱<br>
        MyMCAT AI Tutor
      </p>

      <p style="color: #666666; font-size: 0.75rem; margin-top: 1.875rem;">
        Want to adjust your notification settings? <a href="${data.settingsUrl}" style="color: #2b6cb0; text-decoration: underline;">Click here</a>
      </p>
    </div>
  `
});
