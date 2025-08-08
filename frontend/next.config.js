/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  webpack: (config, { dev }) => {
    // Keep cache enabled for faster rebuilds unless issues arise
    return config;
  },
  trailingSlash: false,
  async redirects() {
    return [
      { source: '/login', destination: '/auth/login', permanent: true },
      { source: '/register', destination: '/auth/register', permanent: true },
    ];
  },
};

module.exports = nextConfig;
