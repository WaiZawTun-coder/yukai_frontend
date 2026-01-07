/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/yukai_backend/public/uploads/**",
      },
    ],
    localPatterns: [
      { pathname: "/api/images" },
      { pathname: "/Images/**" },
      { pathname: "/images/**" },
    ],
  },
};

export default nextConfig;
