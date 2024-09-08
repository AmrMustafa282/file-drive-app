/** @type {import('next').NextConfig} */
const nextConfig = {
 images: {
  remotePatterns: [
   {
    hostname: "festive-gerbil-839.convex.cloud",
   },
   {
    hostname: "img.clerk.com",
   },
  ],
 },
};

export default nextConfig;
