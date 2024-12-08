import { TemplateConfig } from '../types';

export const coinLossTemplate = (data: any): TemplateConfig => ({
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
        <a href="${data.loginUrl}" style="display: inline-block; background-color: #2b6cb0; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.375rem; margin-top: 1rem;">
          Log In Now
        </a>
      </p>

      <p style="color: #333333; line-height: 1.6;">
        Need to adjust your study plan?
        <br><br>
        • <a href="${data.scheduleUrl}" style="color: #2b6cb0; text-decoration: underline;">Regenerate your study schedule</a>
        <br>
        • <a href="${data.breakUrl}" style="color: #2b6cb0; text-decoration: underline;">Schedule a study break</a>
      </p>

      <p style="color: #333333; line-height: 1.6;">
        See you soon!<br>
        Kalypso 🐱<br>
        MyMCAT AI Tutor
      </p>

      <p style="color: #666666; font-size: 0.75rem; margin-top: 1.875rem;">
        Want to adjust your notification settings? <a href="${data.settingsUrl}" style="color: #2b6cb0; text-decoration: underline;">Click here</a>
      </p>
    </div>
  `
});
