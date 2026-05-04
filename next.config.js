/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  allowedDevOrigins: [
    "http://3000-firebase-studio-1754066778009.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev"
  ],

  images: {
    domains: ['picsum.photos'], // ✅ THIS FIXES YOUR ERROR
  },
};

export default nextConfig;