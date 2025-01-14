import { TemplateConfig } from '../types';

export interface CoinLossWeekEmailData {
  userName: string;
  remainingCoins: number;
  scheduleUrl?: string;
  settingsUrl?: string;
}

export const coinLossWeekTemplate = (data: CoinLossWeekEmailData): TemplateConfig => ({
  subject: `Okay, I'll admit it. I took 5 coins from you! 🪙`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 37.5rem; margin: 0 auto; padding: 1.25rem;">
      <p style="color: #333333; line-height: 1.6;">
        Hi ${data.userName}! 🐱
      </p>
      
      <p style="color: #333333; line-height: 1.6;">
        *whiskers twitching nervously* I have a small confession... while you were away this week, 
        I may have borrowed 5 coins from your account to buy some irresistible tuna from the fish market. 
        In my defense, you weren't using them, and I was really hungry! You now have ${data.remainingCoins} coins remaining.
      </p>

      <p style="color: #333333; line-height: 1.6;">
        But in all seriousness, I miss our study sessions! Even small daily progress adds up to 
        significant improvements over time. Plus, if you come back, I promise to be on my best behavior 
        (no more unauthorized fish purchases 😅).
      </p>

      <p style="color: #333333; line-height: 1.6;">
        If you're finding it challenging to return due to:
        <br>• Time management
        <br>• Study motivation
        <br>• Understanding difficult topics
        <br><br>
        I'm here to help! Email us at support@mymcat.ai and let's get you back on track.
      </p>

      <p style="color: #333333; line-height: 1.6;">
        Ready to jump back in?
        <br><br>
        • <a href="${data.scheduleUrl || 'https://mymcat.ai/home'}" style="color: #2b6cb0; text-decoration: underline;">Return to your study schedule</a>
      </p>

      <p style="color: #333333; line-height: 1.6;">
        You've got this!<br>
        Kalypso 🐱<br>
        Who Is Very Sorry
      </p>

      <p style="color: #666666; font-size: 0.75rem; margin-top: 1.875rem;">
        Want to adjust your notification settings? <a href="${data.settingsUrl || 'https://mymcat.ai/preferences'}" style="color: #2b6cb0; text-decoration: underline;">Click here</a>
      </p>
    </div>
  `
}); 