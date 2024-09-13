// utils/fetchRedditPosts.ts
export const fetchRedditPosts = async (subreddit: string, query: string, sort: string) => {
    const response = await fetch(`/api/redditPosts?subreddit=${encodeURIComponent(subreddit)}&query=${encodeURIComponent(query)}&sort=${encodeURIComponent(sort)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch Reddit posts.');
    }
  
    const data = await response.json();
    return data.map((post: any) => ({
      ...post,
      selftext: post.selftext || '',
    }));
  };
