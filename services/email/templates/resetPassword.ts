import { TemplateConfig } from '../types';

export const resetPasswordTemplate = (data: any): TemplateConfig => ({
  subject: 'Reset Your Password',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${data.resetLink}">Reset Password</a>
    </div>
  `
});
