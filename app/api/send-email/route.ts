import { NextResponse } from 'next/server';
import { sendEmail } from '@/utils/email-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, template, data } = body;

    if (!email || !template) {
      return NextResponse.json(
        { error: 'Email and template are required' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: email,
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