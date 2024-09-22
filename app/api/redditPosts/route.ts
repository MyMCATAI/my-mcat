// app/api/redditPosts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit');
  const query = searchParams.get('query');
  const sort = searchParams.get('sort') || 'month'; // Default sort if not provided

  console.log(`Received request: subreddit=${subreddit}, query=${query}, sort=${sort}`);

  if (!subreddit) {
    console.log('Error: Missing subreddit parameter.');
    return NextResponse.json({ error: 'Missing subreddit parameter.' }, { status: 400 });
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

  console.log(`Time range set to: ${timeRange}`);

  try {
    let redditUrl;
    if (query) {
      redditUrl = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=top&t=${timeRange}&limit=20`;
    } else {
      redditUrl = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/top.json?t=${timeRange}&limit=20`;
    }
    console.log(`Fetching from Reddit URL: ${redditUrl}`);

    const fetchWithRetry = async (url: string, options: RequestInit, retries = 1): Promise<Response> => {
      const response = await fetch(url, options);
      if (!response.ok && retries > 0) {
        console.log(`Fetch failed with status ${response.status}. Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchWithRetry(url, options, retries - 1);
      }
      return response;
    };

    const redditResponse = await fetchWithRetry(
      redditUrl,
      {
        headers: {
          'User-Agent': 'MyMCAT/1.0 (by kalypso@mymcat.ai)',
        },
      },
      3 // Three retry attempts
    );

    console.log(`Reddit API response status: ${redditResponse.status}`);

    if (!redditResponse.ok) {
      console.log(`Error: Failed to fetch data from Reddit. res: ${redditResponse}`);
      return NextResponse.json({ error: 'Failed to fetch data from Reddit.' }, { status: redditResponse.status });
    }

    const data = await redditResponse.json();
    console.log(`Received ${data.data.children.length} posts from Reddit`);

    const posts = data.data.children.map((child: any) => ({
      title: child.data.title,
      url: child.data.url,
      permalink: child.data.permalink,
      author: child.data.author,
      score: child.data.score,
      selftext: child.data.selftext || '',
    }));

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
