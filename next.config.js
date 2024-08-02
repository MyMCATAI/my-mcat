/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
     
        domains: ['img.youtube.com'],
    
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'oaidalleapiprodscus.blob.core.windows.net',
          port: '',
          pathname: '/**',
        },
      ],
    },
  }
  
  module.exports = nextConfig