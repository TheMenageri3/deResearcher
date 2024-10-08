/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["gateway.irys.xyz"],
  },
  /**
   * Critical: prevents ''import', and 'export' cannot be used outside of module code" error
   * See https://github.com/vercel/next.js/pull/66817
   */
  swcMinify: false,
};

export default nextConfig;
