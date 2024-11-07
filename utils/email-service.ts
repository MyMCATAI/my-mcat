import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not defined in environment variables');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

type EmailTemplate = 'welcome' | 'reset-password' | 'notification';

interface SendEmailProps {
  to: string;
  template: EmailTemplate;
  data?: Record<string, any>;
}

const templates = {
  welcome: (data: any) => ({
    subject: 'Welcome to MCAT Study Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome ${data.name || 'there'}! 🎉</h1>
        <p>Thank you for joining our MCAT study platform. We're excited to help you on your journey to medical school!</p>
        <p>Here's what you can do next:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Take our diagnostic test</li>
          <li>Explore our study materials</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The MCAT Study Team</p>
      </div>
    `
  }),
  'reset-password': (data: any) => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${data.resetLink}">Reset Password</a>
      </div>
    `
  }),
  notification: (data: any) => ({
    subject: data.subject || 'New Notification',
    html: data.html || ''
  })
};

export async function sendEmail({ to, template, data = {} }: SendEmailProps) {
  try {
    if (!process.env.SENDGRID_FROM_EMAIL) {
      throw new Error('SENDGRID_FROM_EMAIL is not defined in environment variables');
    }

    const templateConfig = templates[template](data);
    
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: templateConfig.subject,
      html: templateConfig.html,
    };

    await sgMail.send(msg);
    console.log('Email sent successfully to:', to);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
} 