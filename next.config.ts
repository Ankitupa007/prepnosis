import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  babel: {
    plugins: [
      ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
    ]
  },
  /* config options here */
};

export default nextConfig;
