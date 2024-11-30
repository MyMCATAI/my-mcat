import sgMail from '@sendgrid/mail';
import { templates } from './templates/index';
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
      console.log('Sending:', this.fromEmail, template);

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
    } catch (error: any) {
      console.error('Error sending email:', {
        message: error.message,
        code: error.code,
        response: error.response?.body,
      });
      return { 
        success: false, 
        error: {
          message: error.message,
          code: error.code,
          details: error.response?.body
        }
      };
    }
  }
}

// Export a singleton instance
export const emailService = new EmailService();