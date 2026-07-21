import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.goodsmile.com",
        port: "",
        pathname:
          "/gsc-webrevo-sdk-storage-prd/product/image/**",
      },
    ],
  },
  
  
};

export default nextConfig;
