import { TemplateConfig } from '../types';

interface DailyActivity {
  name: string;
  completed: boolean;
}

interface WeeklyReportData {
  userName: string;
  dailyActivity: DailyActivity[];
  currentCoins: number;
  topicsCovered: string[];
  practiceProblems: number;
  flashcardsReviewed: number;
  topicsReviewed: number;
  improvements: string[];
  focusAreas: string[];
  dashboardUrl: string;
  settingsUrl: string;
  totalPatientsCount?: number;
}

export const weeklyReportTemplate = (data: WeeklyReportData): TemplateConfig => ({
  subject: `Your Weekly MCAT Prep Summary 📊`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 37.5rem; margin: 0 auto; padding: 1.25rem;">
      <p style="color: #333333; line-height: 1.6;">
        Hi ${data.userName}! 🐱
      </p>
      
      <p style="color: #333333; line-height: 1.6;">
        Kalypso here with your weekly MCAT prep summary! Let's see how you did this week:
      </p>

      <div style="background-color: #f7fafc; padding: 1.25rem; border-radius: 0.5rem; margin: 1.25rem 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Weekly Activity 📅</h2>
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
          ${data.dailyActivity.map((day: DailyActivity) => `
            <div style="text-align: center; margin: 0.5rem;">
              <div style="${day.completed ? 'color: #48bb78' : 'color: #e53e3e'}">${day.name}</div>
              <div>${day.completed ? '✅' : '❌'}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="background-color: #f7fafc; padding: 1.25rem; border-radius: 0.5rem; margin: 1.25rem 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Coins Balance 🪙</h2>
        <p style="color: #333333; margin: 0;">
          Current balance: ${data.currentCoins} coins
        </p>
      </div>

      <div style="background-color: #f7fafc; padding: 1.25rem; border-radius: 0.5rem; margin: 1.25rem 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Topics Covered 📚</h2>
        <ul style="color: #333333; padding-left: 1.25rem;">
          ${data.topicsCovered.map((topic: string) => `
            <li style="margin: 0.5rem 0;">${topic}</li>
          `).join('')}
        </ul>
      </div>

      <div style="background-color: #f7fafc; padding: 1.25rem; border-radius: 0.5rem; margin: 1.25rem 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Progress Report 📈</h2>
        <div style="color: #333333;">
          <p>Completed this week:</p>
          <ul style="padding-left: 1.25rem;">
            <li>Practice problems: ${data.practiceProblems}</li>
            <li>Flashcards reviewed: ${data.flashcardsReviewed}</li>
            <li>Topics reviewed: ${data.topicsReviewed}</li>
          </ul>
        </div>
      </div>

      ${data.totalPatientsCount !== undefined ? `
      <div style="background-color: #f7fafc; padding: 1.25rem; border-radius: 0.5rem; margin: 1.25rem 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Clinical Experience 👨‍⚕️</h2>
        <p style="color: #333333;">
          Total patients treated to date: ${data.totalPatientsCount}
        </p>
      </div>
      ` : ''}

      <div style="background-color: #f7fafc; padding: 1.25rem; border-radius: 0.5rem; margin: 1.25rem 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Areas of Growth 📝</h2>
        <div style="margin-bottom: 1rem;">
          <h3 style="color: #2d3748; font-size: 1rem;">Improvements:</h3>
          <ul style="color: #333333; padding-left: 1.25rem;">
            ${data.improvements.map((item: string) => `
              <li style="margin: 0.5rem 0;">${item}</li>
            `).join('')}
          </ul>
        </div>
        <div>
          <h3 style="color: #2d3748; font-size: 1rem;">Focus Areas:</h3>
          <ul style="color: #333333; padding-left: 1.25rem;">
            ${data.focusAreas.map((item: string) => `
              <li style="margin: 0.5rem 0;">${item}</li>
            `).join('')}
          </ul>
        </div>
      </div>

      <p style="color: #333333; line-height: 1.6;">
        <a href="${data.dashboardUrl}" style="display: inline-block; background-color: #2b6cb0; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.375rem; margin-top: 1rem;">
          View Full Report
        </a>
      </p>

      <p style="color: #333333; line-height: 1.6;">
        Keep up the amazing work!<br>
        Kalypso 🐱<br>
        MyMCAT AI Tutor
      </p>

      <p style="color: #666666; font-size: 0.75rem; margin-top: 1.875rem;">
        Want to adjust your notification settings? <a href="${data.settingsUrl}" style="color: #2b6cb0; text-decoration: underline;">Click here</a>
      </p>
    </div>
  `
}); 