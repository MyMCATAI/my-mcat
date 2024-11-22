import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  console.log('Webhook received'); // Debug log

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers');
    return new Response('Missing svix headers', {
      status: 400
    });
  }

  try {
    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);
    console.log('Webhook payload:', payload); // Debug log

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

    // Verify the webhook
    const evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    
    console.log('Webhook verified, event type:', evt.type); // Debug log

    // Handle the webhook
    if (evt.type === 'user.created') {
      const { id, email_addresses, first_name } = evt.data;
      const email = email_addresses[0]?.email_address;
      console.log('Processing user.created event for email:', email); // Debug log

      if (email) {
        try {
          const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL!,
            subject: 'Welcome to MCAT Study Platform!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>Welcome ${first_name || 'there'}! 🎉</h1>
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
          };

          console.log('Attempting to send email with config:', {
            to: msg.to,
            from: msg.from,
            subject: msg.subject
          }); // Debug log

          await sgMail.send(msg);
          console.log('Welcome email sent successfully'); // Debug log
        } catch (error) {
          console.error('Error sending welcome email:', error);
          // We log the error but don't return an error response
          // This ensures Clerk doesn't retry the webhook
        }
      }
    }

    // Return a 200 status code
    return new Response('Webhook processed successfully', {
      status: 200
    });

  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response('Error processing webhook', {
      status: 400
    });
  }
}
