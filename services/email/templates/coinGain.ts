import { TemplateConfig } from '../types';

export interface CoinGainEmailData {
  userName: string;
  scheduleUrl?: string;
  settingsUrl?: string;
}

export const coinGainTemplate = (data: CoinGainEmailData): TemplateConfig => ({
  subject: `We Believe in You! 🌟 Your MCAT Journey Awaits`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 37.5rem; margin: 0 auto; padding: 1.25rem;">
      <p style="color: #333333; line-height: 1.6;">
        Hi ${data.userName}! 🐱
      </p>
      
      <p style="color: #333333; line-height: 1.6;">
        Remember when I "borrowed" your coins for that irresistible tuna? Well, I felt really bad about it, 
        so I spent all week doing extra tasks around MyMCAT HQ! I organized study materials, debugged some practice questions, 
        and even helped catch a few virtual mice. 🐭
      </p>

      <p style="color: #333333; line-height: 1.6;">
        And guess what? I earned enough to repay your coins! The team was so impressed with my hard work 
        that they even gave me a bonus to share with you. You're such a dedicated student, and I want to 
        be a better study buddy for you. 
      </p>

      <p style="color: #333333; line-height: 1.6;">
        Here's what I promise to help you with (no fish-related distractions this time!):
        <br>• Personalized study plans that fit your schedule
        <br>• AI-powered tutoring to tackle difficult concepts
        <br>• A supportive community of future doctors
        <br>• Direct access to our team for guidance
      </p>

      <p style="color: #333333; line-height: 1.6;">
        Ready to continue our journey together? I promise to be on my best behavior! 
        <br><br>
        • <a href="${data.scheduleUrl || 'https://mymcat.ai/home'}" style="color: #2b6cb0; text-decoration: underline; font-weight: bold;">Return to your personalized dashboard</a>
      </p>

      <p style="color: #333333; line-height: 1.6;">
        Your reformed study partner,<br>
        Kalypso 🐱<br>
        (Now with better impulse control!)
      </p>

      <p style="color: #666666; font-size: 0.75rem; margin-top: 1.875rem;">
        Need to adjust your notification settings? <a href="${data.settingsUrl || 'https://mymcat.ai/preferences'}" style="color: #2b6cb0; text-decoration: underline;">Click here</a>
      </p>
    </div>
  `
}); 