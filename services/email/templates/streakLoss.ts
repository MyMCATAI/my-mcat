import { TemplateConfig } from '../types';

export interface StreakLossEmailData {
  userName: string;
  scheduleUrl?: string;
  settingsUrl?: string;
}

export const streakLossTemplate = (data: StreakLossEmailData): TemplateConfig => ({
  subject: "You lost your study streak 😿",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 37.5rem; margin: 0 auto; padding: 1.25rem;">
      <p style="color: #333333; line-height: 1.6;">
        Hi ${data.userName}! 🐱
      </p>
      
      <p style="color: #333333; line-height: 1.6;">
        Ahhhh! It's Kalypso! I noticed you didn't log in yesterday, and your study streak was lost! We're working on exciting features to help you manage your streaks and study breaks better.
      </p>

      <p style="color: #333333; line-height: 1.6;">
        If you need immediate assistance with managing your study schedule or would like early access to these upcoming features, please reply to this email and we'll get you sorted out!
      </p>

      <p style="color: #333333; line-height: 1.6;">
        You can always visit your dashboard to get back on track:
        <br><br>
        • <a href="${data.scheduleUrl || 'https://mymcat.ai/home'}" style="color: #2b6cb0; text-decoration: underline;">View your study schedule</a>
      </p>

      <p style="color: #333333; line-height: 1.6;">
        Keep up the great work!<br>
        Kalypso 🐱<br>
      </p>

      <p style="color: #666666; font-size: 0.75rem; margin-top: 1.875rem;">
        Want to adjust your notification settings? <a href="${data.settingsUrl || 'https://mymcat.ai/home'}" style="color: #2b6cb0; text-decoration: underline;">Click here</a>
      </p>
    </div>
  `
});
