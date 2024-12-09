import sgMail from '@sendgrid/mail';
import { templates } from './templates/index';
import { SendEmailProps, EmailResponse } from './types/index';
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not defined in environment variables');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export class EmailService {
  private fromEmail: string;
  private reminderEmail: string;

  constructor() {
    if (!process.env.SENDGRID_FROM_EMAIL) {
      throw new Error('SENDGRID_FROM_EMAIL is not defined in environment variables');
    }
    if (!process.env.SENDGRID_REMINDER_EMAIL) {
      throw new Error('SENDGRID_REMINDER_EMAIL is not defined in environment variables');
    }
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL;
    this.reminderEmail = process.env.SENDGRID_REMINDER_EMAIL;
  }

  async sendEmail({ to, template, data = {}, useReminderEmail = false }: SendEmailProps): Promise<EmailResponse> {
    try {
      const fromAddress = useReminderEmail ? this.reminderEmail : this.fromEmail;
      console.log('Sending:', fromAddress, template);

      const templateConfig = templates[template](data);
      
      const msg = {
        to,
        from: fromAddress,
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

export const emailService = new EmailService();