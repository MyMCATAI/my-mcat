import { TemplateConfig } from '../types';

export const referralLinkTemplate = (data: any): TemplateConfig => ({
  subject: `Poke! ${data.referrerName} poked you to study with us at MyMCAT`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 37.5rem; margin: 0 auto; padding: 1.25rem;">
      <p style="color: #333333; line-height: 1.6;">
        Hi-ya,
      </p>
      
      <p style="color: #333333; line-height: 1.6;">
        I'm Kalypso, the superkitty. Your friend ${data.referrerName} thought you might want to study together on MyMCAT.
      </p>
      
      <p style="color: #333333; line-height: 1.6;">
        Our students typically improve by 15 points, reaching a median score of 516. ${data.referrerName} is already using our platform and wanted to let you know about it.
      </p>

      <p style="color: #333333; line-height: 1.6;">
        You can:
        <br><br>
        • Visit our platform: <a href="https://mymcat.ai" style="color: #2b6cb0;">mymcat.ai</a>
        <br>
        • Join our study group: <a href="https://discord.gg/rTxN7wkh6e" style="color: #2b6cb0;">Discord</a>
      </p>

      <p style="color: #333333; line-height: 1.6;">
        Best regards,<br>
        Kalypso
      </p>

      <p style="color: #666666; font-size: 0.75rem; margin-top: 1.875rem;">
        This invitation was sent by ${data.referrerName}. If this was a mistake, please disregard this message.
      </p>
    </div>
  `
});