
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure that process.env variables are available if needed by @google/genai SDK
  // when used in a way that Next.js might not automatically inline them.
  // However, API_KEY should ideally be used server-side (e.g. API routes)
  // and not exposed directly to the client bundle.
  // If @google/genai is used client-side and needs process.env.API_KEY,
  // this is a potential security risk and needs careful handling.
  // For now, adhering to SDK guidelines assuming it's available in execution context.
  env: {
    API_KEY: process.env.API_KEY,
  },
  images: {
    // If you plan to use external image URLs with next/image, configure domains here
    // domains: ['example.com'],
  },
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;
