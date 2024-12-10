import { TemplateConfig } from '../types';

export interface CoinLossEmailData {
  userName: string;
  remainingCoins: number;
  scheduleUrl?: string;
  settingsUrl?: string;
}

export const coinLoss5Template = (data: CoinLossEmailData): TemplateConfig => ({
  subject: `⚠️ Alert: You've lost 5 coins! Urgent action needed 🪙`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 37.5rem; margin: 0 auto; padding: 1.25rem;">
      <p style="color: #333333; line-height: 1.6;">
        Hi ${data.userName}! 🐱
      </p>
      
      <p style="color: #ff4444; line-height: 1.6; font-weight: bold;">
        This is an urgent notice! You've lost 5 coins due to extended inactivity. You now have ${data.remainingCoins} coins remaining.
      </p>

      <p style="color: #333333; line-height: 1.6;">
        I'm getting worried about your MCAT prep journey! Losing 5 coins means you haven't logged in for several days, which could seriously impact your study momentum. Remember, consistent studying is crucial for MCAT success.
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

      <p style="color: #333333; line-height: 1.6; font-style: italic;">
        Remember: Each additional day of inactivity will result in further coin loss. Don't let your hard work go to waste!
      </p>

      <p style="color: #333333; line-height: 1.6;">
        We're here to support you!<br>
        Kalypso 🐱<br>
        MyMCAT AI Tutor
      </p>

      <p style="color: #666666; font-size: 0.75rem; margin-top: 1.875rem;">
        Need to adjust your notification settings? <a href="${data.settingsUrl || 'https://mymcat.ai/preferences'}" style="color: #2b6cb0; text-decoration: underline;">Click here</a>
      </p>
    </div>
  `
});
