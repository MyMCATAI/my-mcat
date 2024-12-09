import { NextRequest, NextResponse } from 'next/server'

interface TavilyImage {
  url: string;
  title: string;
}

interface TavilyResponse {
  query: string;
  images: TavilyImage[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const tavilyResponse = await tavilyImageSearch(query);
    console.log('Tavily API Response:', tavilyResponse);
    
    const formattedResponse = {
      query: tavilyResponse.query,
      images: tavilyResponse.images?.map((img: any) => ({
        url: img.url || '',
        title: img.title || ''
      })) || []
    };
    
    console.log('Formatted Response:', formattedResponse);
    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('Tavily API Error:', error);
    return NextResponse.json(
      { error: `Failed to fetch images: ${error}` },
      { status: 500 }
    );
  }
}

async function tavilyImageSearch(query: string): Promise<TavilyResponse> {
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  if (!tavilyApiKey) {
    throw new Error('TAVILY_API_KEY is not set');
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      api_key: tavilyApiKey,
      query: query,
      max_results: 4,
      include_images: true,
      include_answer: false,
      include_raw_content: false,
      search_depth: 'basic',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Tavily API Error Response:', errorText);
    throw new Error(`Tavily API failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Raw Tavily API Response:', data);
  
  // Handle the case where images is an array of strings
  const formattedImages = data.images?.map((img: string | any) => {
    // If img is a string, it's a direct URL
    if (typeof img === 'string') {
      return {
        url: img,
        title: '' // No title available for direct URLs
      };
    }
    // If img is an object, use existing format
    return {
      url: img.url || '',
      title: img.title || ''
    };
  }) || [];

  return {
    query: data.query || query,
    images: formattedImages.slice(0, 4),
  };
} 