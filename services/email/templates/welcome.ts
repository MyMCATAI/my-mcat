import { TemplateConfig } from '../types';

export const welcomeTemplate = (data: any): TemplateConfig => ({
    subject: 'Welcome to MyMCAT Study Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome ${data.name || 'there'}! 🎉</h1>
        <p>We're going to build the best MCAT study platform ever. We're thrilled to have you join our community of aspiring medical professionals and thrilled to help you get the score of your dreams.</p>
        <p>Our platform is an innovative, intelligent study platform that figures out your weaknesses and tailors your study plan like a personalized tutor would. Here's what you can do next:</p>
        <ul>
          <li><a href="https://mymcat.ai" style="color: #3B82F6; text-decoration: underline;">Continue studying on MyMCAT.ai</a> to prepare for your upcoming exam</li>
          <li>Read our <a href="https://mymcat.ai/blog" style="color: #3B82F6; text-decoration: underline;">MCAT study blog</a> written by Prynce, packed with proven strategies and tips</li>
          <li>Join our <a href="https://discord.gg/rTxN7wkh6e" style="color: #3B82F6; text-decoration: underline;">Discord community</a> to study with friends, tutoring sessions, webinars, and early insight into new features</li>
        </ul>
        <p>Be sure to go through onboarding. If you have any questions, feel free to reach out to this address or DM us on Discord!</p>
        <p>Let's get this med,<br>The Studyverse Medicine Team</p>
      </div>
    `
  });