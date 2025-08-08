/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  // Add trailing slashes to ensure consistent routing
  trailingSlash: true,
  // Strict route handling
  strict: true,
  // Redirect /login to /auth/login
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/register',
        permanent: true,
      }
    ];
  }
};

module.exports = nextConfig;
