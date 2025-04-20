const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

module.exports = withMDX({
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['b.thumbs.redditmedia.com', 'img.youtube.com', 'my-mcat.s3.us-east-2.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' https://*.clerk.io https://*.clerk.com https://*.clerk.accounts.dev https://*.stripe.com https://*.plausible.io https://*.vercel-scripts.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.io https://*.clerk.com https://*.clerk.accounts.dev https://js.stripe.com https://plausible.io https://va.vercel-scripts.com https://tally.so blob:; worker-src 'self' blob: https://*.clerk.io https://*.clerk.com https://*.clerk.accounts.dev; connect-src 'self' https://*.clerk.io https://*.clerk.com https://*.clerk.accounts.dev https://api.stripe.com https://plausible.io https://va.vercel-scripts.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://*.clerk.io https://*.clerk.com https://*.clerk.accounts.dev https://cdn.jsdelivr.net; img-src 'self' http://localhost:* https://img.youtube.com https://my-mcat.s3.us-east-2.amazonaws.com https://oaidalleapiprodscus.blob.core.windows.net https://b.thumbs.redditmedia.com https://*.clerk.io https://*.clerk.com https://*.clerk.accounts.dev data: blob:; font-src 'self' https://*.clerk.io https://*.clerk.com https://*.clerk.accounts.dev data:; frame-src 'self' https://js.stripe.com https://*.clerk.io https://*.clerk.com https://*.clerk.accounts.dev https://tally.so https://www.youtube.com; media-src 'self' http://localhost:* https://*.clerk.io https://*.clerk.com https://*.clerk.accounts.dev data: blob: https://my-mcat.s3.us-east-2.amazonaws.com; object-src 'none'; base-uri 'self';"
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
});