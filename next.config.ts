/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure we don't use Turbopack for the production build as it's incompatible with Cloudflare
  experimental: {
    turbo: {
      rules: {},
    },
  },
};

export default nextConfig;
