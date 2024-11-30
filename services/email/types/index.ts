export type EmailTemplate = 'welcome' | 'reset-password' | 'notification' | 'daily-goal-achievement' | 'referral'

export interface SendEmailProps {
  to: string;
  template: EmailTemplate;
  data?: Record<string, any>;
}

export interface EmailResponse {
  success: boolean;
  error?: any;
}

export interface TemplateConfig {
  subject: string;
  html: string;
}