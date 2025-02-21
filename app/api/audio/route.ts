//app/api/audio/routs.ts

import { NextResponse } from 'next/server';

// Cache for 1 hour
const CACHE_CONTROL = 'public, max-age=3600';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    
    return new NextResponse(Buffer.from(arrayBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': CACHE_CONTROL,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch audio' }, { status: 500 });
  }
}