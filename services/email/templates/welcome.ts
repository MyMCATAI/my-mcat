export const welcomeTemplate = (data: any) => ({
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
  });