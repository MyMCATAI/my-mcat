import { TemplateConfig } from '../types';

export interface CoinLossEmailData {
  userName: string;
  remainingCoins: number;
  scheduleUrl?: string;
  settingsUrl?: string;
}

export const coinLossTemplate = (data: CoinLossEmailData): TemplateConfig => ({
  subject: `You've lost a coin due to inactivity! 🪙`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 37.5rem; margin: 0 auto; padding: 1.25rem;">
      <p style="color: #333333; line-height: 1.6;">
        Hi ${data.userName}! 🐱
      </p>
      
      <p style="color: #333333; line-height: 1.6;">
        Kalypso here! Just letting you know that you've lost a coin due to not logging in. You now have ${data.remainingCoins} coins left.
      </p>

      <p style="color: #333333; line-height: 1.6;">
        This is your only courtesy email - from now on, you'll silently lose one coin each day you don't log in until you reach zero. Remember, consistency is key in MCAT prep!
      </p>

      <p style="color: #333333; line-height: 1.6;">
        We're working on exciting features to help you manage your study schedule and breaks better. If you need immediate assistance, please email MCAT's CTO, Josh, at josh@mymcat.ai - I'd be happy to help you out!
      </p>

      <p style="color: #333333; line-height: 1.6;">
        You can always visit your dashboard to get back on track:
        <br><br>
        • <a href="${data.scheduleUrl || 'https://mymcat.ai/home'}" style="color: #2b6cb0; text-decoration: underline;">View your study schedule</a>
      </p>

      <p style="color: #333333; line-height: 1.6;">
        See you soon!<br>
        Kalypso 🐱<br>
        MyMCAT AI Tutor
      </p>

      <p style="color: #666666; font-size: 0.75rem; margin-top: 1.875rem;">
        Want to adjust your notification settings? <a href="${data.settingsUrl || 'https://mymcat.ai/preferences'}" style="color: #2b6cb0; text-decoration: underline;">Click here</a>
      </p>
    </div>
  `
});
