import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { auth, currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Input validation schema
const messageSchema = z.object({
  message: z.string().trim().min(1).max(5000),
  recipient: z.string().email().optional(),
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const userEmail = user.emailAddresses[0].emailAddress;
    
    // Validate and parse the request body
    const body = await req.json();
    const validationResult = messageSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }
    
    const { message, recipient } = validationResult.data;
    
    // Sanitize message to prevent XSS
    const sanitizedMessage = DOMPurify.sanitize(message);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: userEmail,
      to: recipient || 'vivian@mymcat.ai',
      subject: `New message from ${user.firstName} ${user.lastName}`,
      text: `Name: ${user.firstName} ${user.lastName}\nEmail: ${userEmail}\n\nMessage:\n${sanitizedMessage}`,
      html: `<p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
             <p><strong>Email:</strong> ${userEmail}</p>
             <p><strong>Message:</strong></p>
             <p>${sanitizedMessage}</p>`,
    });

    return NextResponse.json({ message: 'Message sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
