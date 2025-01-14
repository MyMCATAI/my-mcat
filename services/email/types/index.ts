export type EmailTemplate = 
  | 'welcome' 
  | 'reset-password' 
  | 'notification' 
  | 'referral' 
  | 'weekly-report' 
  | 'streak-loss' 
  | 'daily-reminder'
  | 'coin-loss-week'
  | 'coin-loss-day'
  | 'coin-gain'

export interface SendEmailProps {
  to: string;
  template: EmailTemplate;
  data?: Record<string, any>;
  useReminderEmail?: boolean;
}

export interface EmailResponse {
  success: boolean;
  error?: any;
}

export interface TemplateConfig {
  subject: string;
  html: string;
}