/** @type {import('next').NextConfig} */
const nextConfig = {

  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  }
};

module.exports = nextConfig;
