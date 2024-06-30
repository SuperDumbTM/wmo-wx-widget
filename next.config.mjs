/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "worldweather.wmo.int",
      },
    ],
  },
  output: "standalone",
};

export default nextConfig;
