import { TemplateConfig } from '../types';

export const referralLinkTemplate = (data: any): TemplateConfig => ({
  subject: `Poke! Your friend ${data.referrerName} has poked you to join MyMCAT.ai`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <h1 style="color: #333333;">Meow there, friend! 🐱</h1>
      
      <p style="color: #555555; line-height: 1.6;">
        My name is Kalypso, and I'm the AI superkitty over at MyMCAT.ai. We're a new software company that's making the first and only intelligent tutoring platform so a 520+ is in the hands of every capable student.
      </p>
      
      <p style="color: #555555; line-height: 1.6;">
        Unlike other companies in this space, we're actually a tech company — not a test prep company. Though we've not been around long, we've averaged a 15 point increase in our beta test with an average score of around 513, a median of 516. Every month, we add new features and get better.

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://mymcat.ai" style="display: inline-block; background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px; font-weight: bold;">Visit MyMCAT.ai</a>
        
        <a href="https://discord.gg/rTxN7wkh6e" style="display: inline-block; background-color: #5865F2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px; font-weight: bold;">Join our Discord</a>
      </div>

      <p style="color: #888888; font-size: 12px; text-align: center; margin-top: 30px;">
        This email was sent because ${data.referrerName} invited you to MyMCAT.ai. If you believe this was sent in error, please ignore this email.
      </p>
    </div>
  `
});