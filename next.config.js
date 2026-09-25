/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // output: 'export',
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3008",
        pathname: "/uploads/images/**",
      },
      {
        protocol: "http",
        hostname: "vedic.qdegrees.com",
        port: "3008",
        pathname: "/uploads/images/**",
      },
    ],
  },
}

module.exports = nextConfig