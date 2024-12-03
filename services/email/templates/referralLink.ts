import { TemplateConfig } from '../types';

export const referralLinkTemplate = (data: any): TemplateConfig => ({
  subject: `${data.referrerName} suggested I reach out about your MCAT prep`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 37.5rem; margin: 0 auto; padding: 1.25rem;">
      <p style="color: #333333; line-height: 1.6;">
        Hi there! 🐱
      </p>
      
      <p style="color: #333333; line-height: 1.6;">
        I'm Kalypso, the superkitty at MyMCAT. Your friend ${data.referrerName} thought you might be interested in studying with us. We're helping pre-med students like you achieve their target scores through personalized AI tutoring.
      </p>
      
      <p style="color: #333333; line-height: 1.6;">
        Our students have seen an average increase of 15 points, with a median score of 516. We're constantly improving our platform to help students like you succeed.
      </p>

      <p style="color: #333333; line-height: 1.6;">
        If you'd like to learn more, you can:
        <br><br>
        • Visit our platform: <a href="https://mymcat.ai" style="color: #2b6cb0; text-decoration: underline;">mymcat.ai</a>
        <br>
        • Join our study community: <a href="https://discord.gg/rTxN7wkh6e" style="color: #2b6cb0; text-decoration: underline;">Discord group</a>
      </p>

      <p style="color: #333333; line-height: 1.6;">
        Happy studying!<br>
        Kalypso 🐱<br>
        MyMCAT AI Tutor
      </p>

      <p style="color: #666666; font-size: 0.75rem; margin-top: 1.875rem;">
        Received this by mistake? Feel free to ignore this email - ${data.referrerName} invited you to MyMCAT.ai
      </p>
    </div>
  `
});