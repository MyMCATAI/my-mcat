import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.mymcat.ai/'
  
  return [
    {
      url: baseUrl,
      priority: 1,
    },
    {
      url: `${baseUrl}intro`,
      priority: 0.8,
    },
    {
      url: `${baseUrl}acceptableuse`,
      priority: 0.5,
    },
    {
      url: `${baseUrl}termsandconditions`,
      priority: 0.5,
    },
    {
      url: `${baseUrl}privacypolicy`,
      priority: 0.5,
    },
    {
      url: `${baseUrl}blog`,
      priority: 0.8,
    }
  ]
}
