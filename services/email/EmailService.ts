import sgMail from '@sendgrid/mail';
import { templates } from './templates';
import { EmailTemplate, SendEmailProps, EmailResponse } from './types/index';
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not defined in environment variables');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export class EmailService {
  private fromEmail: string;

  constructor() {
    if (!process.env.SENDGRID_FROM_EMAIL) {
      throw new Error('SENDGRID_FROM_EMAIL is not defined in environment variables');
    }
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL;
  }

  async sendEmail({ to, template, data = {} }: SendEmailProps): Promise<EmailResponse> {
    try {
      const templateConfig = templates[template](data);
      
      const msg = {
        to,
        from: this.fromEmail,
        subject: templateConfig.subject,
        html: templateConfig.html,
      };

      await sgMail.send(msg);
      console.log('Email sent successfully to:', to);
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }
  }
}

// Export a singleton instance
export const emailService = new EmailService();