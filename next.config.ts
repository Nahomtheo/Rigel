/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-dee5e51759aa412886a3cde0e158fd71.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;