'use server';

import { emailService } from "@/services/email/EmailService";

export async function sendWelcomeEmail(userName: string, userEmail: string): Promise<boolean> {
  try {
    const result = await emailService.sendEmail({
      to: userEmail,
      template: "welcome",
      data: { userName }
    });
    
    return result.success;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
}

export async function sendReferralEmail(referrerName: string, friendEmail: string): Promise<boolean> {
    try {
      const result = await emailService.sendEmail({
        to: friendEmail,
        template: 'referral',
        data: { referrerName }
      });
      
      return result.success;
    } catch (error) {
      console.error('Error sending referral email:', error);
      return false;
    }
  }

  