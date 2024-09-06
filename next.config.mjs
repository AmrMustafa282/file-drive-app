/** @type {import('next').NextConfig} */
const nextConfig = {
 images: {
  remotePatterns: [
   {
    // protocol: "https",
    hostname: "festive-gerbil-839.convex.cloud",
    // port: "",
    // pathname: "/my-bucket/**",
   },
  ],
 },
};

export default nextConfig;
