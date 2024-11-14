import { NextResponse } from 'next/server';
import { emailService } from '@/services/email/EmailService';
import { auth } from "@clerk/nextjs/server";
import { UserService } from '@/services/user/UserService';

/* 
This route is used to send an email to the user.
*/

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = await UserService.getUserEmail();
    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 404 });
    }

    const body = await req.json();
    const { template, data } = body;

    if (!template) {
      return NextResponse.json(
        { error: 'Template is required' },
        { status: 400 }
      );
    }

    const result = await emailService.sendEmail({
      to: userEmail,
      template: template,
      data: data
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in email API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 