export type EmailTemplate = 'welcome' | 'reset-password' | 'notification' | 'daily-goal-achievement' | 'referral' | 'weekly-report' |'coin-loss' | 'streak-loss' | 'daily-reminder'

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