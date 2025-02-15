import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

// Helper function to extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categories = searchParams.get('categories')?.split(',') || [];
  const maxDuration = 4; // 4 minutes max

  try {
    const videos = await prisma.content.findMany({
      where: {
        category: {
          conceptCategory: {
            in: categories
          }
        },
        minutes_estimate: {
          lte: maxDuration
        },
        type: 'video'
      },
      take: 4,
      select: {
        id: true,
        title: true,
        link: true,
        minutes_estimate: true,
        category: {
          select: {
            conceptCategory: true
          }
        }
      }
    });

    // Add thumbnails to the response
    const videosWithThumbnails = videos.map(video => {
      const videoLink = getYouTubeVideoId(video.link);
      const videoId = videoLink?.split('andlist')[0]
      console.log(`http://img.youtube.com/vi/${videoId}/0.jpg`);
      return {
        ...video,
        thumbnail: videoId ? `http://img.youtube.com/vi/${videoId}/0.jpg` : null
      };
    });


    return NextResponse.json(videosWithThumbnails);
  } catch (error) {
    console.error('Error fetching video recommendations:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
} 