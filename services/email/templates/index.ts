import { welcomeTemplate } from './welcome';
import { resetPasswordTemplate } from './resetPassword';
import { notificationTemplate } from './notification';
import { dailyGoalAchievementTemplate } from './dailyGoalAchievement';
import { referralLinkTemplate } from './referralLink';
import { weeklyReportTemplate } from './weeklyReport';
import { coinLossTemplate } from './coinLoss';
import { streakLossTemplate } from './streakLoss';
import { dailyReminderTemplate } from './dailyReminder';

export const templates = {
  welcome: welcomeTemplate,
  'reset-password': resetPasswordTemplate,
  notification: notificationTemplate,
  'daily-goal-achievement': dailyGoalAchievementTemplate,
  referral: referralLinkTemplate,
  'weekly-report': weeklyReportTemplate,
  'coin-loss': coinLossTemplate,
  'streak-loss': streakLossTemplate,
  'daily-reminder': dailyReminderTemplate
};
