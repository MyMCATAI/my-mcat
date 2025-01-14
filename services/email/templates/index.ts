import { welcomeTemplate } from './welcome';
import { resetPasswordTemplate } from './resetPassword';
import { notificationTemplate } from './notification';
import { referralLinkTemplate } from './referralLink';
import { weeklyReportTemplate } from './weeklyReport';
import { streakLossTemplate } from './streakLoss';
import { dailyReminderTemplate } from './dailyreminder';
import { coinLossWeekTemplate } from './coinLossWeek';
import { coinLossDayTemplate } from './coinLossDay';
import { coinGainTemplate } from './coinGain';

export const templates = {
  welcome: welcomeTemplate,
  'reset-password': resetPasswordTemplate,
  notification: notificationTemplate,
  referral: referralLinkTemplate,
  'weekly-report': weeklyReportTemplate,
  'streak-loss': streakLossTemplate,
  'daily-reminder': dailyReminderTemplate,
  'coin-loss-week': coinLossWeekTemplate,
  'coin-loss-day': coinLossDayTemplate,
  'coin-gain': coinGainTemplate
};
