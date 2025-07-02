import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.jsdelivr.net', // Matches any subdomain of example.com
                port: '',
                pathname: '/gh/AnkitUpa007/medical-images@main/**', // Matches any path under /images
            },
        ],
    },
};

export default nextConfig;
