/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@pallet-pros/core", "@pallet-pros/db"]
};

export default nextConfig;
