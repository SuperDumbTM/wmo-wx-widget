import nextTranslate from "next-translate-plugin";

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "worldweather.wmo.int",
//       },
//     ],
//   },
//   output: "standalone",
// };
//
// export default nextConfig;

export default nextTranslate({
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "worldweather.wmo.int",
      },
    ],
  },
  output: "standalone",
});
