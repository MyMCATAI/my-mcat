// utils/redditAuth.ts

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getRedditAccessToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.token;
  }

    const clientId = process.env.REDDIT_CLIENT_ID!;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET!;
  
    const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'User-Agent': 'MyMCAT/1.0 (by kalypso@mymcat.ai)',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: 'grant_type=client_credentials',
    });
  
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      throw new Error(`Failed to obtain access token: ${tokenData.error}`);
    }
  
    const expiresIn = tokenData.expires_in * 1000; // Convert to milliseconds
    cachedToken = {
      token: tokenData.access_token,
      expiresAt: now + expiresIn,
    };
  
    return tokenData.access_token;
  }
  