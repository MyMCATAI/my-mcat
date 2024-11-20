import { TemplateConfig } from '../types';

export const notificationTemplate = (data: any): TemplateConfig => ({
  subject: data.subject || 'New Notification',
  html: data.html || ''
});
