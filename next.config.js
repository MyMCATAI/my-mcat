/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['b.thumbs.redditmedia.com', 'img.youtube.com'],
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
        ],
      },
    ];
  },
  env: {
    EUTILS_API_KEY: process.env.EUTILS_API_KEY,
  },
};

module.exports = nextConfig;