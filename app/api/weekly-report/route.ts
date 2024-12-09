import { NextResponse } from 'next/server';
import { sendStreakLossEmail, sendCoinLossEmail } from '@/lib/server-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Send demo streak loss email
    await sendStreakLossEmail(
      'josh@mymcat.ai',
      'Demo User'
    );

    // Send demo coin loss email
    await sendCoinLossEmail(
      'prynce@mymcat.ai',
      'Demo User',
      8
    );

    return NextResponse.json({
      success: true,
      message: 'Demo emails sent successfully'
    });
  } catch (error) {
    console.error('Weekly report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send demo emails' },
      { status: 500 }
    );
  }
} 