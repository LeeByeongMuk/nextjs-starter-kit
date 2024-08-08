/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: 'build',
  env: {
    APP_API_URL: process.env.APP_API_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tailwindui.com',
      },
    ],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.resolve.alias['msw/browser'] = false;
    } else {
      config.resolve.alias['msw/node'] = false;
    }

    return config;
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/post',
        permanent: true,
      },
    ]
  },
};

module.exports = nextConfig;
