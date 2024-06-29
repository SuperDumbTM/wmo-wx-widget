/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["worldweather.wmo.int"],
  },
  output: "standalone",
};

export default nextConfig;
