/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ["images.unsplash.com", "avatars.githubusercontent.com"],
  },
  basePath: "",
  assetPrefix: "",
};

module.exports = nextConfig;