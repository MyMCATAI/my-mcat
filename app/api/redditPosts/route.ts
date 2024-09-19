// app/api/redditPosts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit');
  const query = searchParams.get('query');
  const sort = searchParams.get('sort') || 'month'; // Default sort if not provided

  if (!subreddit || !query) {
    return NextResponse.json({ error: 'Missing subreddit or query parameters.' }, { status: 400 });
  }

  // Map the sort parameter to Reddit's 't' parameter
  let timeRange = 'month'; // Default
  if (sort === 'week') {
    timeRange = 'week';
  } else if (sort === 'all') {
    timeRange = 'all';
  } else {
    timeRange = 'month'; // default to month for any other value
  }

  try {
    const redditResponse = await fetch(
      `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=top&t=${timeRange}&limit=100`,
      {
        headers: {
          'User-Agent': 'MyMCAT/1.0 (by kalypso@mymcat.ai)',
        },
      }
    );

    if (!redditResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch data from Reddit.' }, { status: redditResponse.status });
    }

    const data = await redditResponse.json();
    const posts = data.data.children.map((child: any) => ({
      title: child.data.title,
      url: child.data.url,
      permalink: child.data.permalink,
      author: child.data.author,
      score: child.data.score,
      selftext: child.data.selftext || '', // Add this line
    }));

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
