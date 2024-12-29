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
  testsCompleted: number;
  averageTestScore: number;
  completedActivities: number;
  studyCompletionRate: number;
  topPerformingSubject: string;
  topPerformingSubjects: string[];
}

export const weeklyReportTemplate = (data: WeeklyReportData): TemplateConfig => ({
  subject: `📊 Your MCAT Progress This Week`,
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media screen and (max-width: 600px) {
            .mobile-text {
              font-size: 16px !important;
            }
            .mobile-heading {
              font-size: 20px !important;
            }
            .mobile-stats {
              font-size: 24px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; background-color: #f4f4f5;">
          <tr>
            <td align="center" style="padding: 1.25rem;">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 37.5rem; background-color: #ffffff; border-radius: 1rem; overflow: hidden; margin: 0 auto;">
                <!-- Hero Section -->
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2.5rem 1.25rem;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 1.75rem; text-align: center;">Hey ${data.userName}! 🎯</h1>
                    <p style="margin: 0.75rem 0 0; color: #ffffff; font-size: 1.125rem; text-align: center;">Here's your weekly progress snapshot</p>
                  </td>
                </tr>

                <!-- Weekly Summary -->
                <tr>
                  <td style="padding: 2rem 1.25rem;">
                    <p class="mobile-text" style="margin: 0; color: #4a5568; font-size: 1.25rem; line-height: 1.7; text-align: left;">
                      This week, you completed ${data.completedActivities} learning activities, with a ${data.studyCompletionRate}% study plan completion rate. 
                      You tackled ${data.practiceProblems} practice problems, reviewed ${data.flashcardsReviewed} flashcards, 
                      and took ${data.testsCompleted} tests with an average score of ${Math.round(data.averageTestScore)}%. 
                      ${data.topPerformingSubject ? `You showed particularly strong performance in ${data.topPerformingSubject}.` : ''} 
                      ${data.totalPatientsCount ? `So far, you've treated ${data.totalPatientsCount} virtual patients in total.` : ''}
                      ${data.focusAreas.length > 0 ? ` Based on your performance, you should focus on: ${data.focusAreas.slice(0, 3).join(', ')}.` : ''}
                    </p>
                  </td>
                </tr>

                <!-- Stats Grid -->
                <tr>
                  <td style="padding: 2rem 1.25rem;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 1.5rem;">
                          <h2 style="margin: 0; color: #1a1a1a; font-size: 1.25rem;">This Week's Achievements</h2>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="25%" style="padding: 0.625rem;">
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                  <tr>
                                    <td align="center" style="padding: 1.5rem;">
                                      <div class="mobile-text" style="color: #4a5568; font-size: 1.125rem; margin-bottom: 0.5rem;">Total Coins</div>
                                      <div class="mobile-stats" style="color: #1a1a1a; font-size: 2.5rem; font-weight: bold;">
                                        ${data.currentCoins}
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td width="25%" style="padding: 0.625rem;">
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                  <tr>
                                    <td align="center" style="padding: 1.5rem;">
                                      <div class="mobile-text" style="color: #4a5568; font-size: 1.125rem; margin-bottom: 0.5rem;">Practice Problems</div>
                                      <div class="mobile-stats" style="color: #1a1a1a; font-size: 2.5rem; font-weight: bold;">${data.practiceProblems}</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td width="25%" style="padding: 0.625rem;">
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                  <tr>
                                    <td align="center" style="padding: 1.5rem;">
                                      <div class="mobile-text" style="color: #4a5568; font-size: 1.125rem; margin-bottom: 0.5rem;">Flashcards</div>
                                      <div class="mobile-stats" style="color: #1a1a1a; font-size: 2.5rem; font-weight: bold;">${data.flashcardsReviewed}</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td width="25%" style="padding: 0.625rem;">
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                  <tr>
                                    <td align="center" style="padding: 1.5rem;">
                                      <div class="mobile-text" style="color: #4a5568; font-size: 1.125rem; margin-bottom: 0.5rem;">Patients Treated</div>
                                      <div class="mobile-stats" style="color: #1a1a1a; font-size: 2.5rem; font-weight: bold;">${data.totalPatientsCount || 0}</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Weekly Performance -->
                <tr>
                  <td style="padding: 0 1.25rem 2rem;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                      <tr>
                        <td style="padding: 1.5rem;">
                          <h2 style="margin: 0 0 1rem 0; color: #1a1a1a; font-size: 1.25rem; text-align: center;">Weekly Performance</h2>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 0.5rem; text-align: center;">
                                <div style="color: #4a5568; font-size: 1.125rem; margin-bottom: 0.5rem;">Tests Completed</div>
                                <div style="color: #1a1a1a; font-size: 1.75rem; font-weight: bold;">${data.testsCompleted}</div>
                              </td>
                              <td style="padding: 0.5rem; text-align: center;">
                                <div style="color: #4a5568; font-size: 1.125rem; margin-bottom: 0.5rem;">Average Score</div>
                                <div style="color: #1a1a1a; font-size: 1.75rem; font-weight: bold;">${Math.round(data.averageTestScore)}%</div>
                              </td>
                              <td style="padding: 0.5rem; text-align: center;">
                                <div style="color: #4a5568; font-size: 1.125rem; margin-bottom: 0.5rem;">Study Plan Completion</div>
                                <div style="color: #1a1a1a; font-size: 1.75rem; font-weight: bold;">${data.studyCompletionRate}%</div>
                              </td>
                            </tr>
                          </table>
                          ${data.topPerformingSubjects.length > 0 ? `
                            <div style="margin-top: 1rem; text-align: center; padding: 0.75rem; background-color: #ebf4ff; border-radius: 0.5rem;">
                              <div style="color: #4a5568; margin-bottom: 0.5rem;">Top Performing Subjects:</div>
                              <div style="display: flex; justify-content: center; gap: 1rem;">
                                ${data.topPerformingSubjects.map((subject, index) => `
                                  <span style="color: #1a1a1a; font-weight: bold;">
                                    ${index + 1}. ${subject}
                                  </span>
                                `).join(' ')}
                              </div>
                            </div>
                          ` : ''}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Weekly Activity -->
                <tr>
                  <td style="padding: 0 1.25rem 2rem;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                      <tr>
                        <td style="padding: 1.5rem;">
                          <h2 style="margin: 0 0 1rem 0; color: #1a1a1a; font-size: 1.25rem; text-align: center;">Weekly Activity</h2>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              ${data.dailyActivity.map((day) => `
                                <td align="center" style="padding: 0.5rem;">
                                  <div style="font-size: 0.875rem; ${day.completed ? 'color: #48bb78; font-weight: bold;' : 'color: #e53e3e;'}">${day.name.slice(0, 3)}</div>
                                  <div style="margin-top: 0.5rem; font-size: 1.25rem;">${day.completed ? '✅' : '•'}</div>
                                </td>
                              `).join('')}
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${data.focusAreas.length > 0 ? `
                <!-- Focus Areas -->
                <tr>
                  <td style="padding: 0 1.25rem 2rem;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff8f8; border: 1px solid #fed7d7; border-radius: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                      <tr>
                        <td style="padding: 1.5rem;">
                          <h2 style="margin: 0 0 1rem 0; color: #c53030; font-size: 1.25rem; text-align: center;">Focus Areas</h2>
                          <ul style="margin: 0; padding-left: 1.5rem; color: #2d3748; font-size: 1.125rem;">
                            ${data.focusAreas.slice(0, 5).map(area => `
                              <li style="margin: 0.75rem 0;">${area}</li>
                            `).join('')}
                          </ul>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}

                <!-- Call to Action -->
                <tr>
                  <td align="center" style="padding: 1.25rem;">
                    <a href="${data.dashboardUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 1rem 2rem; text-decoration: none; font-weight: bold; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      View Detailed Report
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 2rem 1.25rem; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #4a5568; font-size: 1.125rem;">Keep crushing it! 💪<br>Kalypso 🐱</p>
                    <p style="margin-top: 1rem; font-size: 0.875rem; color: #718096;">
                      <a href="${data.settingsUrl}" style="color: #4a5568; text-decoration: underline;">Update notification settings</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}); 