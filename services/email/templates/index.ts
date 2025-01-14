import { welcomeTemplate } from './welcome';
import { resetPasswordTemplate } from './resetPassword';
import { notificationTemplate } from './notification';
import { referralLinkTemplate } from './referralLink';
import { weeklyReportTemplate } from './weeklyReport';
import { streakLossTemplate } from './streakLoss';
import { dailyReminderTemplate } from './dailyreminder';

export const templates = {
  welcome: welcomeTemplate,
  'reset-password': resetPasswordTemplate,
  notification: notificationTemplate,
  referral: referralLinkTemplate,
  'weekly-report': weeklyReportTemplate,
  'streak-loss': streakLossTemplate,
  'daily-reminder': dailyReminderTemplate
};
