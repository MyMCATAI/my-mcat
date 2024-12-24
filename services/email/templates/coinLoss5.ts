import { TemplateConfig } from '../types';

export interface CoinLossEmailData {
  userName: string;
  remainingCoins: number;
  scheduleUrl?: string;
  settingsUrl?: string;
}

export const coinLoss5Template = (data: CoinLossEmailData): TemplateConfig => ({
  subject: `⚠️ Five coins? You're telling me inactivity on MCAT Prep costed FIVE COINS? 🪙`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 37.5rem; margin: 0 auto; padding: 1.25rem;">
      <p style="color: #333333; line-height: 1.6;">
        Hi ${data.userName}! 🐱
      </p>
      
      <p style="color: #ff4444; line-height: 1.6; font-weight: bold;">
        I really, really miss you. You now have ${data.remainingCoins} coins remaining.
      </p>

      <p style="color: #333333; line-height: 1.6;">
        I'm getting worried about your MCAT prep journey! That amount of coins means you haven't logged in for several days, which could seriously impact your study momentum. Remember, consistent studying is crucial for MCAT success. You won't dip below 5 coins, but you can always get it back up!
      </p>

      <p style="color: #333333; line-height: 1.6;">
        If you're struggling with:
        <br>• Time management
        <br>• Study motivation
        <br>• Or feeling overwhelmed
        <br><br>
        Please reach out to Prynce at prynceh@mymcat.ai immediately. We're here to help you get back on track!
      </p>

      <p style="color: #333333; line-height: 1.6;">
        Take action now to protect your remaining coins:
        <br><br>
        • <a href="${data.scheduleUrl || 'https://mymcat.ai/home'}" style="color: #2b6cb0; text-decoration: underline; font-weight: bold;">Resume your study schedule immediately</a>
      </p>

      <p style="color: #333333; line-height: 1.6;">
        We're here to support you!<br>
        Kalypso 🐱<br>
        Your MCAT Study Buddy
      </p>

      <p style="color: #666666; font-size: 0.75rem; margin-top: 1.875rem;">
        Need to adjust your notification settings? <a href="${data.settingsUrl || 'https://mymcat.ai/preferences'}" style="color: #2b6cb0; text-decoration: underline;">Click here</a>
      </p>
    </div>
  `
});
