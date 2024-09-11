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
