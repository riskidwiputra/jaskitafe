/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
        pathname: "/ulasan/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
